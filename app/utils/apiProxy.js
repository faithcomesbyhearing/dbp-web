/**
 * API Utility
 *
 * This utility wraps API calls to go through the server-side middleware at /api
 * instead of making direct calls to the DBP API. This ensures the API key is
 * never exposed to the browser.
 *
 * Usage:
 *   import apiProxy from './apiProxy';
 *
 *   // Instead of:
 *   // const url = `${process.env.BASE_API_ROUTE}/bibles?key=${process.env.DBP_API_KEY}&v=4`;
 *   // const data = await request.get(url);
 *
 *   // Use:
 *   const data = await apiProxy.get('/bibles');
 *   const data = await apiProxy.get('/bibles/EN1ESV/chapters');
 *   const data = await apiProxy.get('/countries', { has_filesets: true });
 */

import request from './request';

const API_PREFIX = '/api';

/**
 * Construct a query string from an object
 * @param {Object} params - Query parameters
 * @returns {string} - Query string (with leading ?)
 */
const buildQueryString = (params) => {
	if (!params || Object.keys(params).length === 0) {
		return '';
	}

	const queryParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			queryParams.append(key, value);
		}
	});

	const qs = queryParams.toString();
	return qs ? `?${qs}` : '';
};

/**
 * Extract filepath from a full URL, removing domain and /api prefix
 * E.g. http://10.240.1.177:8080/api/bible/filesets/... → /bible/filesets/...
 * @param {string} url - Full URL or relative path
 * @returns {string} - Filepath without domain or /api prefix
 */
const extractFilepath = (url) => {
	try {
		const urlObj = new URL(url);
		let path = urlObj.pathname + urlObj.search + urlObj.hash;
		return path || '/';
	} catch {
		// If it's already a relative URL, just return it as is
		return url;
	}
};

/**
 * Build proxy URL - absolute on client-side, relative on server-side
 * On client (browser): converts /api/endpoint to http://localhost:port/api/endpoint
 * On server: keeps /api/endpoint as relative URL
 * @param {string} path - The API path (e.g., '/api/bibles')
 * @returns {string} - Absolute URL for client-side, relative URL for server-side
 */
const buildProxyUrl = (path) => {
	// Check if running on client-side
	if (typeof window !== 'undefined') {
		// console.log('Building proxy URL client side on:', path);
		const protocol = window.location.protocol;
		const host = window.location.host;
		return `${protocol}//${host}${path}`;
	}
	// Server-side: return relative URL
	return path;
};

/**
 * Make a GET request through the API proxy
 * @param {string} endpoint - API endpoint (e.g., '/bibles', '/countries')
 * @param {Object} params - Query parameters (optional)
 * @returns {Promise<*>} - Response data
 */
const get = async (endpoint, params = {}) => {
	try {
		const queryString = buildQueryString(params);
		const relativePath = `${API_PREFIX}${endpoint}${queryString}`;
		const url = buildProxyUrl(relativePath);

		return request(url);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`[API] Error requesting ${endpoint}:`, error);
		throw error;
	}
};

/**
 * Make a POST request through the API proxy
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data (can be FormData, object, etc.)
 * @param {Object} params - Query parameters (optional)
 * @returns {Promise<*>} - Response data
 */
const post = async (endpoint, data = {}, params = {}) => {
	try {
		const queryString = buildQueryString(params);
		const relativePath = `${API_PREFIX}${endpoint}${queryString}`;
		const url = buildProxyUrl(relativePath);

		if (process.env.NODE_ENV === 'development') {
			// eslint-disable-next-line no-console
			console.log('[API] POST request:', relativePath);
		}

		const response = await request(url, { ...data, method: 'POST' });
		return response;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`[API] Error posting to ${endpoint}:`, error);
		throw error;
	}
};

/**
 * Make a PUT request through the API proxy
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body data
 * @param {Object} params - Query parameters (optional)
 * @returns {Promise<*>} - Response data
 */
const put = async (endpoint, data = {}, params = {}) => {
	try {
		const queryString = buildQueryString(params);
		const relativePath = `${API_PREFIX}${endpoint}${queryString}`;
		const url = buildProxyUrl(relativePath);

		if (process.env.NODE_ENV === 'development') {
			// eslint-disable-next-line no-console
			console.log('[API] PUT request:', relativePath);
		}

		const response = await request(url, { ...data, method: 'PUT' });
		return response;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`[API] Error putting to ${endpoint}:`, error);
		throw error;
	}
};

/**
 * Make a DELETE request through the API proxy
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters (optional)
 * @returns {Promise<*>} - Response data
 */
const remove = async (endpoint, params = {}) => {
	try {
		const queryString = buildQueryString(params);
		const relativePath = `${API_PREFIX}${endpoint}${queryString}`;
		const url = buildProxyUrl(relativePath);

		if (process.env.NODE_ENV === 'development') {
			// eslint-disable-next-line no-console
			console.log('[API] DELETE request:', relativePath);
		}

		const response = await request(url, { method: 'DELETE' });
		return response;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(`[API] Error deleting ${endpoint}:`, error);
		throw error;
	}
};

export default {
	get,
	post,
	put,
	delete: remove,
	extractFilepath,
	buildProxyUrl,
};
