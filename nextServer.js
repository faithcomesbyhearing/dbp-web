// Has the test variable for if I run the project locally without newrelic
if (
	(process.env.NODE_ENV === 'production' ||
		process.env.NODE_ENV === 'staging') &&
	process.env.TEST !== 'test'
) {
	require('newrelic');
}
require('core-js');
require('regenerator-runtime');
const lscache = require('lscache');
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
const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV === 'development';
const bugsnag = require('./app/utils/bugsnagServer');
const manifestJson = require('./public/manifest.json');
const checkBookId = require('./app/utils/checkBookName');
const isoOneToThree = require('./app/utils/isoOneToThree.json');
const app = next({ dev });
const handle = app.getRequestHandler();

const ssrCache = new LRUCache({
	max: 1000,
	maxAge: dev ? 1000 * 60 * 5 : 1000 * 60 * 60 * 24,
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
				languageIso = langArray[0];
			}
			if (languageIso !== 'eng') {
				const biblesData = await fetch
					.get(
						`${
							process.env.BASE_API_ROUTE
						}/bibles?language_code=${languageIso}&key=${
							process.env.DBP_API_KEY
						}&v=4&include_font=false`,
					)
					.then((body) => body.data)
					.catch((err) => {
						if (process.env.NODE_ENV === 'development') {
							/* eslint-disable no-console */
							console.error(
								'Error in get initial props bible for language: ',
								err,
							);
							/* eslint-enable no-console */
						}
						return { data: [] };
					});
				// Get list of bibles that match language
				const biblesInLanguage = biblesData.data;
				// Check for first bible
				if (biblesInLanguage[0]) {
					const bibleId = biblesInLanguage[0].abbr;
					redirectPath = `/bible/${bibleId}/MAT/1`;
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
					301,
					`${redirectPath}?user_id=${userArray[0]}&user_email=${
						userArray[1]
					}&user_name=${userArray[2]}`,
				);
			} else {
				res.redirect(301, `${redirectPath}`);
			}
		});

		server.get('/clean-the-cash', (req, res) => {
			ssrCache.clear();
			lscache.flush();
			res.send('Cleaned the cache');
		});

		server.get('/oauth', (req, res) => {
			const userString = Buffer.from(req.query.code, 'base64').toString(
				'ascii',
			);
			const userArray = userString.split(',');
			res.redirect(
				301,
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
			res.status(200).sendFile('sitemap-index.xml', sitemapOptions),
		);
		server.get('/robots.txt', (req, res) => {
			res.set('Content-Type', 'text/plain');
			res.status(200).send(`User-agent: Googlebot
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
					res.status(500).send('Could not get the revision head');
				} else {
					res.status(200).json({ head: stdout.replace('\n', '') });
				}
			});
		});

		server.get('/status', async (req, res) => {
			const ok = await fetch
				.get(`${process.env.BASE_API_ROUTE}/status`)
				.then((r) => r.status >= 200 && r.status < 300)
				.catch(() => false);

			if (ok) {
				res.sendStatus(200);
			} else {
				res.sendStatus(500);
			}
		});

		server.get('/manifest.json', (req, res) =>
			res.status(200).json(manifestJson),
		);

		server.get(/^\/dev-sitemap(.*)$/, (req, res) => {
			const fileName = req.params[0]; // the “(.*)” capture
			res.sendFile(fileName, sitemapOptions);
		});

		const faviconOptions = {
			root: `${__dirname}/public/`,
		};
		server.get('/favicon.ico', (req, res) =>
			res.status(200).sendFile('favicon.ico', faviconOptions),
		);

		// Jesus Film Page
		server.get('/jesus-film', (req, res) => {
			res.redirect(301, '/jesus-film/eng');
		});

		server.get('/jesus-film/:iso', (req, res) => {
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
				res.redirect(301, `/bible/${req.params.bibleId}/${bookId}/${chapter}`);
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
					301,
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
				res.redirect(301, `/bible/${req.params.bibleId}/${bookId}/1`);
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
