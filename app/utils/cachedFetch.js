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
		const apiResponse = await axios
			.get(url, options)
			.then((response) => response.data);
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
