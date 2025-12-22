/**
 * Helper function to check if a source is an HLS fileset (m3u8)
 * @param {string} source - The source URL
 * @returns {boolean} - True if the source is an m3u8 file
 */
export const isFileSet = (source) => source && source.includes('.m3u8');
