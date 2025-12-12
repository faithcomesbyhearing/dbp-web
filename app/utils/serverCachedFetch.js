/**
 * Server-side cached fetch with retry logic
 * Designed for use in nextServer.js API proxy middleware
 * Returns full response object including headers
 * Uses shared retry logic from retryableRequest.js
 */

const { LRUCache } = require('lru-cache');
const { retryAxiosCall } = require('./retryableRequest.js');

// Server-side cache with 24hr TTL in prod, 5min in dev
const cache = new LRUCache({
	max: 500,
	ttl: process.env.NODE_ENV !== 'production' ? 1000 : 1000 * 60 * 60 * 24, // 1 second for development/newdata environments
});

/**
 * Server-side cached fetch that returns full response object
 * @param {string} url - The URL to fetch
 * @param {object} options - Axios options
 * @param {boolean} useCache - Whether to use caching (default: true)
 * @returns {Promise<object>} - Full axios response object with data, headers, status, etc.
 */
async function serverCachedFetch(options = {}, useCache = true) {
	const url = options.url;

	if (useCache) {
		const cachedResponse = cache.get(url);
		if (cachedResponse) {
			return cachedResponse;
		}
	}

	try {
		const response = await retryAxiosCall(options);
		if (useCache) {
			cache.set(url, response);
		}
		return response;
	} catch (error) {
		// If request fails, throw error
		if (process.env.NODE_ENV === 'development') {
			// eslint-disable-next-line no-console
			console.error('[API Error]', url, error.message);
		}
		throw error;
	}
}

/**
 * Clear cache for a specific URL
 * @param {string} url - The URL cache key to clear
 */
function clearCache(url) {
	if (url) {
		cache.delete(url);
	} else {
		cache.clear();
	}
}

module.exports = {
	serverCachedFetch,
	clearCache,
};
