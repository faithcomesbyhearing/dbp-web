import queryString from 'query-string';

export const isFileSet = (source) => source && source.includes('.m3u8');

/**
 * Adds required query parameters to HLS fileset URLs
 * Note: API key should be added server-side (in sagas or getInitialProps)
 * This function is for client-side use and only adds v=4 if missing
 * @param {string} source - The source URL
 * @param {string} apiKey - Optional API key (should be provided from server-side context)
 * @returns {string} - URL with query parameters
 */
export const addFilesetQueryParams = (source, apiKey = null) => {
	const { url, query } = queryString.parseUrl(source);
	if (isFileSet(url)) {
		const newQuery = {
			...query,
			v: query.v || 4,
		};

		// Only add API key if explicitly provided (from server-side)
		if (apiKey) {
			newQuery.key = apiKey;
		}

		return queryString.stringifyUrl({
			url,
			query: newQuery,
		});
	}
	return source;
};
