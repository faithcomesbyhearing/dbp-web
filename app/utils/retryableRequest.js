/**
 * Shared retry logic for axios calls with exponential backoff
 * Used by both server-side and client-side caching utilities
 */

import axios from 'axios';

// Retry-able error codes
const RETRYABLE_ERROR_CODES = ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'];

/**
 * Shared axios configuration for all requests
 * @param {object} options - Additional axios options
 * @returns {object} - Complete axios config
 */
export function getAxiosConfig(options = {}) {
	return {
		...options,
		method: options.method || 'GET',
		timeout: 60000,
		headers: {
			'User-Agent': 'Mozilla/5.0 (compatible; Node.js)',
			'Accept': 'application/json, text/plain, */*',
			'Accept-Encoding': 'gzip, deflate, br',
			'Connection': 'keep-alive',
			...options?.headers,
		},
		httpsAgent: typeof require !== 'undefined'
			? new (require('https').Agent)({
					keepAlive: true,
					timeout: 60000,
					family: 4, // Force IPv4
				})
			: undefined,
	};
}

/**
 * Determines if an error should trigger a retry
 * @param {Error} error - The axios error
 * @returns {boolean} - True if error is transient
 */
export function isRetryableError(error) {
	return RETRYABLE_ERROR_CODES.includes(error.code);
}

/**
 * Retry axios GET request with exponential backoff
 * Retries on transient errors only
 * @param {object} options - Axios options with url, method, data, headers, etc.
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<object>} - Full axios response object or throws error
 */
export async function retryAxiosCall(options = {}, maxRetries = 3) {
	const url = options.url || 'unknown';

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const axiosConfig = getAxiosConfig(options);
			return await axios(axiosConfig);
		} catch (error) {
			const isTransient = isRetryableError(error);

			if (process.env.NODE_ENV === 'development') {
				// eslint-disable-next-line no-console
				console.error(
					`[retryableRequest] Attempt ${attempt} failed for URL: ${url}`,
					'code:',
					error.code,
					'message:',
					error.message,
				);
			}

			// If max retries reached or not a transient error, throw
			if (attempt === maxRetries || !isTransient) {
				if (process.env.NODE_ENV === 'development') {
					// eslint-disable-next-line no-console
					console.error(
						`[retryableRequest] Final error for URL: ${url}`,
						'code:',
						error.code,
						'message:',
						error.message,
					);
				}
				throw error;
			}

			// Exponential backoff: wait 2s, 4s, 8s
			await new Promise((resolve) =>
				setTimeout(resolve, 2000 * Math.pow(2, attempt - 1)),
			);
		}
	}
}
