// nextServer.js
require('core-js');
require('regenerator-runtime');
const dotenv = require('dotenv');
if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}
const cp = require('child_process');
const express = require('express');
const next = require('next');
const compression = require('compression');
const { LRUCache } = require('lru-cache');
const fetch = require('axios');
const Busboy = require('busboy');
const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV === 'development';
const bugsnag = require('./app/utils/bugsnagServer');
const manifestJson = require('./public/manifest.json');
const checkBookId = require('./app/utils/checkBookName');
const isoOneToThree = require('./app/utils/isoOneToThree.json');
const { isM3U8Content } = require('./app/utils/parseM3U8.js');
const { serverCachedFetch } = require('./app/utils/serverCachedFetch.js');
const { isEndpointNoCache } = require('./app/utils/apiEndpointConfig.js');
const app = next({ dev });
const handle = app.getRequestHandler();

const ssrCache = new LRUCache({
	max: 1000,
	maxAge: process.env.NODE_ENV !== 'production' ? 1000 : 1000 * 60 * 60 * 24, // 1 second for development/newdata environments
});

async function renderAndCache(req, res, pagePath, queryParams) {
	// Stop caching individual routes as it is causing inconsistencies with the audio types
	app.render(req, res, pagePath, queryParams);
}

app
	.prepare()
	.then(() => {
		const server = express();

		server.use(compression());

		// Body parser middleware for JSON and URL-encoded requests
		server.use(express.json());
		server.use(express.urlencoded({ extended: true }));

		// API Middleware - Injects API key server-side
		// This prevents the API key from being exposed to the browser
		server.use('/api', async (req, res) => {
			try {
				const { pathname, search } = new URL(
					req.url,
					`http://${req.headers.host}`,
				);

				// Extract the path after /api
				const apiPath = pathname.replace(/^\/api/, '');

				// Build the full API URL with the secret key (server-side only)
				const apiKey = process.env.DBP_API_KEY;
				const baseUrl = process.env.BASE_API_ROUTE;

				if (!apiKey || !baseUrl) {
					return res.status(fetch.HttpStatusCode.InternalServerError).json({
						error: 'Server configuration error',
						message: 'Missing API credentials',
					});
				}

				// Clean up query parameters to avoid duplication
				// Remove v=4 if it's already in the query string (browser shouldn't send it)
				let cleanSearch = search;
				if (cleanSearch) {
					const params = new URLSearchParams(cleanSearch);
					params.delete('v');
					cleanSearch = params.toString();
					cleanSearch = cleanSearch ? `?${cleanSearch}` : '';
				}

				// Append API key and version (v=4) server-side only
				const separator = cleanSearch ? '&' : '?';
				const fullUrl = `${baseUrl}${apiPath}${cleanSearch}${separator}key=${apiKey}&v=4`;

				if (process.env.NODE_ENV === 'development') {
					/* eslint-disable no-console */
					console.log('[API Proxy] Forwarding to:', fullUrl);
					/* eslint-enable no-console */
				}

				 // Prepare axios config based on HTTP method
				// Use normalized headers to ensure consistent API responses for both SSR and client-side requests
                const axiosConfig = {
					method: req.method.toLowerCase(),
					url: fullUrl,
					headers: {
						'User-Agent': 'Mozilla/5.0 (compatible; Node.js)',
						'Accept': 'application/json, text/plain, */*',
						'Accept-Encoding': 'gzip, deflate, br',
						'Connection': 'keep-alive',
					},
                };
        
                // Handle request body for POST, PUT, PATCH requests
                if (['post', 'put', 'patch'].includes(req.method.toLowerCase())) {
					const contentType = req.headers['content-type'] || '';

					if (contentType.includes('application/json')) {
						// Forward JSON body
						axiosConfig.data = req.body;
						axiosConfig.headers['Content-Type'] = 'application/json';
					} else if (contentType.includes('application/x-www-form-urlencoded')) {
						// Forward URL-encoded form data
						axiosConfig.data = req.body;
						axiosConfig.headers['Content-Type'] = contentType;
					} else if (contentType.includes('multipart/form-data')) {
						// Parse multipart form data to extract fields and files
						const fields = {};
						const files = {};
						const busboy = Busboy({ headers: req.headers });

						// Parse form fields
						busboy.on('field', (fieldname, val) => {
							fields[fieldname] = val;
						});

						// Parse file uploads
						busboy.on('file', (fieldname, file, info) => {
							files[fieldname] = { file, info };
						});

						// When parsing is complete, forward the request
						await new Promise((resolve, reject) => {
							busboy.on('close', () => {
								// Reconstruct FormData with extracted fields
								const FormData = require('form-data');
								const formData = new FormData();

								// Add all fields to the new FormData
								Object.entries(fields).forEach(([key, value]) => {
									formData.append(key, value);
								});

								// Add all files to the new FormData
								Object.entries(files).forEach(([key, { file, info }]) => {
									formData.append(key, file, info.filename);
								});

								axiosConfig.data = formData;
								// Merge form-data headers with axios config headers
								Object.assign(axiosConfig.headers, formData.getHeaders());

								resolve();
							});

							busboy.on('error', reject);
							req.pipe(busboy);
						});
					}
                }

				let useCache = req.method.toUpperCase() === 'GET';

				endpointConfig = isEndpointNoCache(req.path, req.method);
				if (endpointConfig && useCache && endpointConfig.cacheable === false) {
					useCache = false;
				}

				const response = await serverCachedFetch(axiosConfig, useCache);

				if (useCache) {
					const cacheTime = process.env.NODE_ENV !== 'production' ? 1000 : 1000 * 60 * 60 * 24;
					res.setHeader('Cache-Control', `public, max-age=${cacheTime}`);
				}

				// Forward appropriate headers from the API response
				const contentType = response.headers['content-type'] || 'application/json';
				const contentDisposition = response.headers['content-disposition'] || '';

				res.setHeader('Content-Type', contentType);
				res.setHeader('Content-Disposition', contentDisposition);

				// Check if this is M3U8 playlist content
				if (isM3U8Content(contentType)) {
					// Return M3U8 as plain text, properly decoding escaped newlines
					let m3u8Content = response.data;
					// Convert escaped newlines to actual newlines if needed
					if (typeof m3u8Content === 'string') {
						m3u8Content = m3u8Content.replace(/\\n/g, '\n');
					}
					res.status(response.status).send(m3u8Content);
				} else {
					// Return the response data as JSON
					res.status(response.status).json(response.data);
				}
			} catch (error) {
				/* eslint-disable no-console */
				if (process.env.NODE_ENV === 'development') {
					console.error('[API Proxy Error]', error.message);
				}
				/* eslint-enable no-console */

				// Return appropriate error status
				const statusCode = error.response?.status || fetch.HttpStatusCode.InternalServerError;
				const errorMessage =
					error.response?.data?.message ||
					error.message ||
					'API request failed';

				res.status(statusCode).json({
					error: 'API proxy error',
					message: errorMessage,
				});
			}
		});

		// TODO: Ask api team for the redirect for oauth be to /oauth instead of just /
		// Then I can move all of the extra logic out of this route which is really gross
		server.get('/', async (req, res) => {
			let languageIso = 'eng';
			let redirectPath = '/bible/EN1ESV/MAT/1';

			if (req.headers['accept-language']) {
				const languages = req.headers['accept-language'];
				const langArray = languages
					.split(',')
					.map((lang) => {
						const newLang = lang.includes('-')
							? lang.split(';')[0].split('-')[0]
							: lang.split(';')[0];
						return isoOneToThree[newLang];
					})
					.filter((lang) => !!lang);
				// Ensure languageIso is never undefined - default to 'eng' if parsing fails
				languageIso = langArray[0] || 'eng';
			}
			if (languageIso && languageIso !== 'eng') {
				const url = `${
					process.env.BASE_API_ROUTE
				}/bibles?language_code=${languageIso}&key=${
					process.env.DBP_API_KEY
				}&v=4&include_font=false`;
				try {
					const response = await serverCachedFetch({ url }, true);
					// Get list of bibles that match language
					const biblesInLanguage = response.data?.data;
					// Check for first bible
					if (biblesInLanguage && biblesInLanguage[0]) {
						const bibleId = biblesInLanguage[0].abbr;
						redirectPath = `/bible/${bibleId}/MAT/1`;
					}
				} catch (error) {
					if (process.env.NODE_ENV === 'development') {
						/* eslint-disable no-console */
						console.error('Error fetching bibles for language:', error.message);
						/* eslint-enable no-console */
					}
					// Continue with default path on error
				}
			}

			if (req.query.code) {
				// Get encrypted string of user data
				const encryptedData = req.query.code;
				const userString = Buffer.from(encryptedData, 'base64').toString(
					'ascii',
				);
				const userArray = userString.split(',');

				res.redirect(
					302,
					`${redirectPath}?user_id=${userArray[0]}&user_email=${
						userArray[1]
					}&user_name=${userArray[2]}`,
				);
			} else {
				res.redirect(302, redirectPath);
			}
		});

		server.get('/clean-the-cash', (req, res) => {
			ssrCache.clear();
			res.send('Cleaned the cache');
		});

		server.get('/oauth', (req, res) => {
			const userString = Buffer.from(req.query.code, 'base64').toString(
				'ascii',
			);
			const userArray = userString.split(',');
			res.redirect(
				302,
				`/bible/ENGESV/MAT/1?user_id=${userArray[0]}&user_email=${
					userArray[1]
				}&user_name=${userArray[2]}`,
			);
		});

		const sitemapOptions = {
			root: `${__dirname}/public/sitemaps/`,
			headers: {
				'Content-Type': 'text/xml;charset=UTF-8',
			},
		};
		server.get('/sitemap.xml', (req, res) =>
			res.status(fetch.HttpStatusCode.Ok).sendFile('sitemap-index.xml', sitemapOptions),
		);
		server.get('/robots.txt', (req, res) => {
			res.set('Content-Type', 'text/plain');
			res.status(fetch.HttpStatusCode.Ok).send(`User-agent: Googlebot
Disallow:
User-agent: Bingbot
Disallow:
User-agent: Slurp
Disallow:
User-agent: DuckDuckBot
Disallow:
User-agent: Baiduspider
Disallow:
User-agent: YandexBot
Disallow:
User-agent: Exabot
Disallow:
User-agent: facebot
Disallow:
User-agent: ia_archiver
Disallow:
User-agent: Sogou
Disallow:
User-agent: *
Disallow: /
`);
		});

		server.get('/git/version', async (req, res) => {
			cp.exec('git rev-parse HEAD', (err, stdout) => {
				if (err) {
					res.status(fetch.HttpStatusCode.InternalServerError).send('Could not get the revision head');
				} else {
					res.status(fetch.HttpStatusCode.Ok).json({ head: stdout.replace('\n', '') });
				}
			});
		});

		server.get('/status', async (req, res) => {
			const ok = await fetch
				.get(`${process.env.BASE_API_ROUTE}/status`)
				.then((r) => r.status >= 200 && r.status < 300)
				.catch(() => false);

			if (ok) {
				res.sendStatus(fetch.HttpStatusCode.Ok);
			} else {
				res.sendStatus(fetch.HttpStatusCode.InternalServerError);
			}
		});

		server.get('/manifest.json', (req, res) =>
			res.status(fetch.HttpStatusCode.Ok).json(manifestJson),
		);

		server.get(/^\/dev-sitemap(.*)$/, (req, res) => {
			const fileName = req.params[0]; // the “(.*)” capture
			res.sendFile(fileName, sitemapOptions);
		});

		const faviconOptions = {
			root: `${__dirname}/public/`,
		};
		server.get('/favicon.ico', (_, res) =>
			res.status(fetch.HttpStatusCode.Ok).sendFile('favicon.ico', faviconOptions),
		);

		// Jesus Film Page
		server.get('/jesus-film', (_, res) => {
			res.redirect(fetch.HttpStatusCode.Found, '/jesus-film/eng');
		});

		server.get('/jesus-film/:iso', (req, res, nextP) => {
			const actualPage = '/jesusFilm';
			const iso = req.params.iso;

			if (iso !== 'style.css' && !req.originalUrl.includes('/public')) {
				renderAndCache(req, res, actualPage, { iso });
			} else {
				nextP();
			}
		});

		// Static Information Pages
		server.get('/terms', (req, res) => handle(req, res));
		server.get('/privacy', (req, res) => handle(req, res));
		server.get('/about', (req, res) => handle(req, res));

		// Main App Page
		server.get('/reset/password/:token', (req, res) => {
			const actualPage = '/app';
			const queryParams = {
				token: req.params.token,
			};

			app.render(req, res, actualPage, queryParams);
		});

		server.get('/bible/:bibleId/:bookId/:chapter', (req, res, nextP) => {
			const actualPage = '/app';
			const bookId = checkBookId(req.params.bookId);
			const chapter =
				isNaN(parseInt(req.params.chapter, 10)) || !req.params.chapter
					? '1'
					: req.params.chapter;
			const queryParams = {
				bibleId: req.params.bibleId,
				bookId,
				chapter,
			};
			const userParams = {};

			if (bookId !== req.params.bookId) {
				res.redirect(302, `/bible/${req.params.bibleId}/${bookId}/${chapter}`);
			} else if (
				req.query.user_id &&
				req.query.user_email &&
				req.query.user_name
			) {
				userParams.userId = req.query.user_id;
				userParams.userEmail = req.query.user_email;
				userParams.userName = req.query.user_name;

				// Remove all the query data so it doesn't appear in the url
				req.query = {};
			}

			if (
				queryParams.verse !== 'style.css' &&
				!req.originalUrl.includes('/public') &&
				!queryParams.verse
			) {
				renderAndCache(req, res, actualPage, { ...queryParams, ...userParams });
			} else {
				nextP();
			}
		});

		server.get('/bible/:bibleId/:bookId/:chapter/:verse', (req, res, nextP) => {
			const actualPage = '/app';
			const bookId = checkBookId(req.params.bookId);
			const chapter =
				isNaN(parseInt(req.params.chapter, 10)) || !req.params.chapter
					? '1'
					: req.params.chapter;
			const verse =
				isNaN(parseInt(req.params.verse, 10)) || !req.params.verse
					? '1'
					: req.params.verse;

			// Params may not actually be passed using this method
			const queryParams = {
				bibleId: req.params.bibleId,
				bookId,
				chapter,
				verse,
			};

			if (bookId !== req.params.bookId) {
				res.redirect(
					302,
					`/bible/${req.params.bibleId}/${bookId}/${chapter}/${verse}`,
				);
			} else if (
				queryParams.verse !== 'style.css' &&
				!req.originalUrl.includes('/public')
			) {
				renderAndCache(req, res, actualPage, queryParams);
			} else {
				nextP();
			}
		});

		server.get('/bible/:bibleId/:bookId', (req, res, nextP) => {
			const actualPage = '/app';
			const bookId = checkBookId(req.params.bookId);
			// Params may not actually be passed using this method
			const queryParams = {
				bibleId: req.params.bibleId,
				bookId,
				chapter: '1',
			};

			if (bookId !== req.params.bookId) {
				res.redirect(302, `/bible/${req.params.bibleId}/${bookId}/1`);
			} else if (
				queryParams.verse !== 'style.css' &&
				!req.originalUrl.includes('/public')
			) {
				renderAndCache(req, res, actualPage, queryParams);
			} else {
				nextP();
			}
		});

		server.get('/bible/:bibleId', (req, res, nextP) => {
			const actualPage = '/app';
			// Params may not actually be passed using this method
			const queryParams = {
				bibleId: req.params.bibleId,
			};

			if (
				queryParams.verse !== 'style.css' &&
				!req.originalUrl.includes('/public')
			) {
				renderAndCache(req, res, actualPage, queryParams);
			} else {
				nextP();
			}
		});

		server.get(/.*/, (req, res) => handle(req, res));

		// catch-all for Next (including HMR, Fast Refresh, assets)
		// everything under /_next
		server.all(/^\/_next\/.*$/, (req, res) => handle(req, res));

		// everything else (including “/”)
		server.all(/^\/.*$/, (req, res) => handle(req, res));

		server.listen(port, (err) => {
			if (
				err &&
				(process.env.NODE_ENV === 'production' ||
					process.env.NODE_ENV === 'staging')
			) {
				bugsnag.notify(err);
			}
			if (err) throw err;
			console.log(`> Ready on http://localhost:${port}`); // eslint-disable-line no-console
		});
	})
	.catch((ex) => {
		/* eslint-disable no-console */
		console.error(
			'------------------------^_^---*_*--$_$--------------------------------\n',
			ex,
		);
		if (process.env.NODE_ENV !== 'development') {
			bugsnag.notify(ex);
		}
		/* eslint-enable no-console */
		process.exit(1);
	});
