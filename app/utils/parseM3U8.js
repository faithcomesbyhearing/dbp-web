
/**
 * Check if content is M3U8 playlist format
 * @param {string} contentType - The Content-Type header value
 * @returns {boolean} - True if this is M3U8/HLS format
 */
function isM3U8Content(contentType) {
	if (!contentType) {
		return false;
	}
	const m3u8Types = [
		'application/x-mpegURL',
		'application/vnd.apple.mpegurl',
		'audio/mpegurl',
	];
	return m3u8Types.some((type) => contentType.includes(type));
}

module.exports = {
	isM3U8Content,
};
