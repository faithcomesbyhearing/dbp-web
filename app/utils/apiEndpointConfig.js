/**
 * API Endpoint Configuration
 *
 * Defines which endpoints are allowed to be accessed through the /api proxy
 * and their caching behavior. This implements a deny-by-default security model.
 *
 * Pattern syntax:
 *   - Exact match: '/languages'
 *   - Wildcard segment: '/bibles/:id/chapters' (matches /bibles/EN1ESV/chapters)
 *   - Multiple wildcards: '/bibles/:id/:book/:chapter'
 *
 * Cache configuration:
 *   - cacheable: true/false - whether to enable browser caching
 *   - cacheTime: seconds - how long to cache (only if cacheable: true)
 */

const ENDPOINT_CONFIG = [
	{
		pattern: '/users/:user_id/notes',
		method: 'GET',
		cacheable: false,
		description: 'Get user notes',
	},
	{
		pattern: '/users/:user_id/highlights',
		method: 'GET',
		cacheable: false,
		description: 'Get user highlights',
	},
	{
		pattern: '/users/:user_id/bookmarks',
		method: 'GET',
		cacheable: false,
		description: 'Get user bookmarks',
	},
];

/**
 * Check if an endpoint path matches a pattern
 * Pattern format: /bibles/:id/chapters -> matches /bibles/EN1ESV/chapters
 * @param {string} pattern - Pattern with :placeholder segments
 * @param {string} path - Actual path to match
 * @returns {boolean} - True if path matches pattern
 */
function matchesPattern(pattern, path) {
	// Normalize paths
	const normalizedPattern = pattern.startsWith('/') ? pattern : `/${pattern}`;
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	// Convert pattern to regex
	// Replace :id, :book, etc. with regex that matches any segment
	const regexPattern = normalizedPattern
		.replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, '[^/?]+')
		.replace(/\//g, '\\/')
		.replace(/\?/g, '\\?');

	const regex = new RegExp(`^${regexPattern}$`);
	return regex.test(normalizedPath);
}

/**
 * Check if an endpoint is allowed and get its configuration
 * @param {string} path - The API path (e.g., '/languages', '/bibles/EN1ESV/chapters')
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @returns {object|null} - Endpoint config if allowed, null if denied
 */
function isEndpointNoCache(path, method) {
	const upperMethod = (method || 'GET').toUpperCase();

	for (const endpoint of ENDPOINT_CONFIG) {
		if (
			matchesPattern(endpoint.pattern, path) &&
			endpoint.method === upperMethod
		) {
			return endpoint;
		}
	}

	return null;
}

export default {
	ENDPOINT_CONFIG,
	isEndpointNoCache,
	matchesPattern,
};
