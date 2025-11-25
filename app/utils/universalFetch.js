/**
 * Universal Fetch Utility
 * Automatically uses the appropriate method based on execution context:
 * - Server-side: Uses serverCachedFetch with full URL
 * - Client-side: Uses apiProxy with relative endpoint
 *
 * Supports both relative and absolute paths:
 * - Relative: '/bibles/EN1ESV/chapters' (prepends BASE_API_ROUTE on server)
 * - Absolute: 'http://localhost:3051/api/bible/filesets/...' (used as-is)
 *
 * Usage:
 *   // Instead of:
 *   // if (typeof window === 'undefined') {
 *   //   await cachedFetch(fullUrl);
 *   // } else {
 *   //   await apiProxy.get(endpoint, params);
 *   // }
 *
 *   // Use:
 *   await universalFetch.get('/bibles/EN1ESV/chapters', { param: 'value' });
 *   await universalFetch.get('http://localhost:3051/api/bible/filesets/ENGESHP2DV/MAT-1-1-17/playlist.m3u8');
 */
import request from './request';

const isServer = typeof window === 'undefined';

let serverCachedFetch;
let apiProxy;

if (isServer) {
	// Server-side - use dynamic import
	import('./serverCachedFetch.js').then((module) => {
		serverCachedFetch = module.serverCachedFetch;
	});
} else {
	// Client-side
	import('./apiProxy.js').then((module) => {
		apiProxy = module.default;
	});
}

/**
 * Check if a path is an absolute URL
 * @param {string} path - Path to check
 * @returns {boolean} - True if path is absolute URL
 */
function isAbsoluteUrl(path) {
	return /^https?:\/\//.test(path);
}

/**
 * Build query string from params object
 * @param {object} params - Query parameters
 * @returns {string} - Query string (with leading ?)
 */
function buildQueryString(params) {
	if (!params || Object.keys(params).length === 0) {
		return '';
	}
	const queryString = new URLSearchParams(params).toString();
	return queryString ? `?${queryString}` : '';
}

/**
 * Append query string to URL, handling existing query params
 * @param {string} url - The base URL
 * @param {string} queryString - The query string to append
 * @returns {string} - Full URL with query string
 */
function appendQueryString(url, queryString) {
	if (!queryString) return url;
	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}${queryString.substring(1)}`;
}

/**
 * Build full URL for server-side requests with API key
 * @param {string} endpoint - The endpoint (relative path)
 * @param {object} params - Query parameters
 * @returns {string} - Full URL with API key
 */
function buildFullServerUrl(endpoint, params = {}) {
	const baseUrl = process.env.BASE_API_ROUTE;
	const apiKey = process.env.DBP_API_KEY;

	if (!baseUrl || !apiKey) {
		throw new Error('Missing BASE_API_ROUTE or DBP_API_KEY environment variables');
	}

	const queryString = buildQueryString(params);
	// Build URL with params first, then add API key
	const urlWithParams = queryString ? `${endpoint}${queryString}` : endpoint;
	const separator = urlWithParams.includes('?') ? '&' : '?';
	return `${baseUrl}${urlWithParams}${separator}key=${apiKey}&v=4`;
}

/**
 * Universal GET request
 * @param {string} endpoint - API endpoint (e.g., '/bibles', '/bibles/EN1ESV/chapters' or absolute URL)
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - Response data
 */
async function get(endpoint, params = {}) {
	if (isServer) {
		try {
			const fullUrl = isAbsoluteUrl(endpoint)
				? appendQueryString(endpoint, buildQueryString(params))
				: buildFullServerUrl(endpoint, params);

			const response = await serverCachedFetch({ url: fullUrl }, true);
			return response.data;
		} catch (error) {
			console.error(`[universalFetch] GET error for ${endpoint}:`, error.message);
			throw error;
		}
	} else {
		try {
			if (isAbsoluteUrl(endpoint)) {
				// For absolute URLs on client-side, use fetch directly
				const fullUrl = appendQueryString(endpoint, buildQueryString(params));
				return request(fullUrl);
			}
			return apiProxy.get(endpoint, params);
		} catch (error) {
			console.error(`[universalFetch] GET error for ${endpoint}:`, error.message);
			throw error;
		}
	}
}

/**
 * Universal POST request
 * @param {string} endpoint - API endpoint or absolute URL
 * @param {object} data - Request body data
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - Response data
 */
async function post(endpoint, data = {}, params = {}) {
	if (isServer) {
		try {
			const fullUrl = isAbsoluteUrl(endpoint)
				? appendQueryString(endpoint, buildQueryString(params))
				: buildFullServerUrl(endpoint, params);

			const response = await serverCachedFetch({ ...data, url: fullUrl }, true);
			return response.data;
		} catch (error) {
			console.error(`[universalFetch] POST error for ${endpoint}:`, error.message);
			throw error;
		}
	} else {
		try {
			return apiProxy.post(endpoint, data, params);
		} catch (error) {
			console.error(`[universalFetch] POST error for ${endpoint}:`, error.message);
			throw error;
		}
	}
}

/**
 * Universal PUT request
 * @param {string} endpoint - API endpoint or absolute URL
 * @param {object} data - Request body data
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - Response data
 */
async function put(endpoint, data = {}, params = {}) {
	if (isServer) {
		try {
			const fullUrl = isAbsoluteUrl(endpoint)
				? appendQueryString(endpoint, buildQueryString(params))
				: buildFullServerUrl(endpoint, params);

			const response = await serverCachedFetch({ ...data, url: fullUrl }, true);
			return response.data;
		} catch (error) {
			console.error(`[universalFetch] PUT error for ${endpoint}:`, error.message);
			throw error;
		}
	} else {
		try {
			return apiProxy.put(endpoint, data, params);
		} catch (error) {
			console.error(`[universalFetch] PUT error for ${endpoint}:`, error.message);
			throw error;
		}
	}
}

/**
 * Universal DELETE request
 * @param {string} endpoint - API endpoint or absolute URL
 * @param {object} params - Query parameters
 * @returns {Promise<object>} - Response data
 */
async function remove(endpoint, params = {}) {
	if (isServer) {
		try {
			const fullUrl = isAbsoluteUrl(endpoint)
				? appendQueryString(endpoint, buildQueryString(params))
				: buildFullServerUrl(endpoint, params);

			const response = await serverCachedFetch({ url: fullUrl }, true);
			return response.data;
		} catch (error) {
			console.error(`[universalFetch] DELETE error for ${endpoint}:`, error.message);
			throw error;
		}
	} else {
		try {
			return apiProxy.delete(endpoint, params);
		} catch (error) {
			console.error(`[universalFetch] DELETE error for ${endpoint}:`, error.message);
			throw error;
		}
	}
}

export default {
	get,
	post,
	put,
	delete: remove,
};

export {
	get,
	post,
	put,
	remove as delete,
};
