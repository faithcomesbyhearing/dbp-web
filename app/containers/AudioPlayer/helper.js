import queryString from 'query-string';

export const isFileSet = (source) => source && source.includes('.m3u8');

export const addFilesetQueryParams = (source) => {
	const { url, query } = queryString.parseUrl(source);
	if (url && url.includes('.m3u8')) {
		return queryString.stringifyUrl({
			url,
			query: {
				...query,
				v: 4,
				key: process.env.DBP_API_KEY,
			},
		});
	}
	return source;
};
