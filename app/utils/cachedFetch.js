import lscache from 'lscache';
import axios from 'axios';
import { LRUCache } from 'lru-cache';

// Define TTL for the server and client separately
const SERVER_TTL_MINUTES =
	process.env.NODE_ENV === 'development' ? 1000 * 60 : 1000 * 60 * 60 * 24; // 24 hours in production, 1 minute in development
const CLIENT_TTL_MINUTES =
	process.env.NODE_ENV === 'development' ? 1000 * 60 * 5 : 1000 * 60 * 60 * 24; // 24 hours in production, 5 minutes in development

// Server-side cache using LRUCache
const cache = new LRUCache({ max: 500, ttl: SERVER_TTL_MINUTES }); // Server-side TTL

// Retry function for axios calls with exponential backoff
async function retryAxiosCall(url, options, maxRetries = 3) {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const response = await axios.get(url, {
				...options,
				timeout: 60000,
				headers: {
					'User-Agent': 'Mozilla/5.0 (compatible; Node.js)',
					'Accept': 'application/json, text/plain, */*',
					'Accept-Encoding': 'gzip, deflate, br',
					'Connection': 'keep-alive',
					...options?.headers,
				},
				httpsAgent: new (require('https').Agent)({
					keepAlive: true,
					timeout: 60000,
					family: 4, // Force IPv4
				}),
			});
			return response.data;
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error(`Attempt ${attempt} failed for URL: ${url}`, error.message, 'code:', error.code);
			}

			if (attempt === maxRetries || (error.code !== 'ETIMEDOUT' && error.code !== 'ECONNRESET' && error.code !== 'ENOTFOUND')) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Final error in server-side cachedFetch:', error.message, 'code:', error.code, 'url:', url);
				}
				return { data: [] };
			}

			// Exponential backoff: wait 2s, 4s, 8s
			await new Promise((resolve) => setTimeout(resolve, 2000 * Math.pow(2, attempt - 1)));
		}
	}
}

export default async function cachedFetch(url, options, expires) {
	// On the first load we flush any expired values
	lscache.flushExpired();
	// Makes the expiry time unit milliseconds
	lscache.setExpiryMilliseconds(1);
	// Server-side logic: use in-memory cache
	if (typeof window === 'undefined') {
		const cachedResponse = cache.get(url);
		if (cachedResponse) {
			return cachedResponse; // Return from memory cache
		}

		// If not in cache, make API call and store it in memory cache
		const apiResponse = await retryAxiosCall(url, options);
		cache.set(url, apiResponse, expires || SERVER_TTL_MINUTES);
		return apiResponse;
	}

	let cachedResponse = lscache.get(url);
	// If there is no cached response,
	// do the actual call and store the response
	if (cachedResponse === null) {
		cachedResponse = await axios
			.get(url, options)
			.then((response) => response.data);
		lscache.set(url, cachedResponse, expires || CLIENT_TTL_MINUTES);
	}

	return cachedResponse;
}

export function overrideCache(key, val, expires) {
	if (typeof window === 'undefined') {
		cache.set(key, val, expires || SERVER_TTL_MINUTES);
	} else {
		lscache.set(key, val, expires || CLIENT_TTL_MINUTES);
	}
}

export function logCache(itemUrl) {
	if (typeof window === 'undefined') {
		return cache.get(itemUrl);
	}
	return lscache.get(itemUrl);
}
