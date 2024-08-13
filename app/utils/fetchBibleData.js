import axios from 'axios';
import cachedFetch from './cachedFetch';
import Bugsnag from './bugsnagClient';

/**
 * Fetch Bible metadata by ID, with caching and error reporting.
 *
 * @param {string} bibleId         The Bible identifier (e.g. "EN1ESV").
 * @param {object} [options]       Optional settings.
 * @param {boolean} [options.includeFont=false]  Whether to include font info.
 * @returns {Promise<object>}      The `data` payload, or `{}` on error.
 * @throws {Error}                 If bibleId is missing.
 */
export async function fetchBibleData(bibleId, { includeFont = false } = {}) {
	if (!bibleId) {
		throw new Error('fetchBibleData: bibleId is required');
	}

	const baseUrl = process.env.BASE_API_ROUTE;
	const apiKey = process.env.DBP_API_KEY;
	const url =
		`${baseUrl}/bibles/${encodeURIComponent(bibleId)}` +
		`?key=${encodeURIComponent(apiKey)}` +
		`&v=4&include_font=${includeFont}`;

	try {
		const { data } = await cachedFetch(url);
		return data;
	} catch (error) {
		console.error(`fetchBibleData failed for ${bibleId}:`, error); // eslint-disable-line no-console

		if (axios.isAxiosError(error) && error.config) {
			console.error('  Request URL:', error.config.url); // eslint-disable-line no-console
			Bugsnag.notify(error, (event) => {
				event.addMetadata('API Request', {
					url: error.config.url,
					method: error.config.method,
					headers: error.config.headers,
					params: error.config.params,
					message: error.message,
				});
			});
		} else {
			Bugsnag.notify(error);
		}

		return {};
	}
}

export default fetchBibleData;
