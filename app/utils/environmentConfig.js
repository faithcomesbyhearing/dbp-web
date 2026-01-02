/**
 * Environment configuration utilities
 * Provides helpers for determining deployment environment and cache behavior
 */

// Environment value constants
const ENV = {
	DEVELOPMENT: 'development',
	NEWDATA: 'newdata',
	PRODUCTION: 'production',
};

// Cache TTL constants (in milliseconds)
const CACHE_TTL_1_SECOND = 1000; // 1 second
const CACHE_TTL_5_MINUTES = 1000 * 60 * 5; // 5 minutes

/**
 * Gets the appropriate cache TTL based on environment
 * Development | newdata: 1 second (fast iteration)
 * Production: 5 minutes
 *
 * @returns {number} - Cache TTL in milliseconds
 */
function getCacheTTL() {
	if (
		process.env.APP_ENV === ENV.DEVELOPMENT ||
		process.env.APP_ENV === ENV.NEWDATA
	) {
		return CACHE_TTL_1_SECOND;
	}

	return CACHE_TTL_5_MINUTES;
}

module.exports = {
	ENV,
	CACHE_TTL_1_SECOND,
	CACHE_TTL_5_MINUTES,
	getCacheTTL,
};
