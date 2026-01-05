/**
 * RTL Detection Utility
 *
 * Provides utility functions to detect Right-to-Left (RTL) text content
 * and determine text direction based on Unicode character ranges.
 */

const RTL = 'rtl';
const LTR = 'ltr';

/**
 * Detects if text uses RTL script by checking for RTL Unicode ranges
 *
 * Supported RTL scripts:
 * - Hebrew: \u0590-\u05FF
 * - Arabic: \u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF
 * - Arabic Presentation Forms: \uFB50-\uFDFF, \uFE70-\uFEFF
 *
 * @param {string} text - The text to check for RTL characters
 * @returns {boolean} - True if text contains RTL characters, false otherwise
 */
export const detectRTLFromText = (text) => {
	if (!text || typeof text !== 'string') return false;
	// Check for Hebrew, Arabic, or other RTL characters
	return /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
		text,
	);
};

/**
 * Detects RTL from an array of verse objects by sampling the first few verses
 *
 * @param {Array} verses - Array of verse objects with verse_text property
 * @param {number} sampleSize - Number of verses to sample (default: 3)
 * @returns {boolean} - True if sampled text contains RTL characters
 */
export const detectRTLFromVerses = (verses, sampleSize = 3) => {
	if (!Array.isArray(verses) || verses.length === 0) return false;

	const sampleText = verses
		.slice(0, sampleSize)
		.map((verse) => verse.verse_text || '')
		.join('');

	return detectRTLFromText(sampleText);
};

/**
 * Gets text direction ('rtl' or 'ltr') based on text content
 *
 * @param {string} text - The text to analyze
 * @returns {string} - 'rtl' if text contains RTL characters, 'ltr' otherwise
 */
export const getTextDirection = (text) => (detectRTLFromText(text) ? RTL : LTR);

/**
 * Gets text direction from verse array
 *
 * @param {Array} verses - Array of verse objects
 * @param {number} sampleSize - Number of verses to sample (default: 3)
 * @returns {string} - 'rtl' if verses contain RTL characters, 'ltr' otherwise
 */
export const getTextDirectionFromVerses = (verses, sampleSize = 3) =>
	detectRTLFromVerses(verses, sampleSize) ? RTL : LTR;

/**
 * Detects RTL from formatted JSON blocks by extracting and sampling text
 *
 * @param {Object} chapterJson - Chapter JSON with sequence.blocks structure
 * @param {Function} extractTextFn - Function to extract text from content (e.g., extractTextRecursive)
 * @param {number} sampleSize - Number of blocks to sample (default: 3)
 * @returns {boolean} - True if sampled text contains RTL characters
 */
export const detectRTLFromFormattedJson = (
	chapterJson,
	extractTextFn,
	sampleSize = 3,
) => {
	if (!chapterJson?.sequence?.blocks?.length) return false;

	// Sample text from first few blocks to detect script direction
	const sampleText = chapterJson.sequence.blocks
		.slice(0, sampleSize)
		.map((block) => {
			const content =
				block.type === 'graft' ? block.sequence?.blocks : block.content;
			return extractTextFn ? extractTextFn(content || []) : '';
		})
		.join('');

	return detectRTLFromText(sampleText);
};

/**
 * Gets text direction with fallback
 * If providedDirection is not empty, returns it.
 * Otherwise, detects direction from text.
 *
 * @param {string} providedDirection - The direction provided (may be empty)
 * @param {string|Array} textOrVerses - Text string or array of verses to analyze
 * @returns {string} - 'rtl' or 'ltr'
 */
export const getTextDirectionWithFallback = (
	providedDirection,
	textOrVerses,
) => {
	// If direction is already provided and not empty, use it
	if (providedDirection && providedDirection.trim() !== '') {
		return providedDirection;
	}

	// Auto-detect from text or verses
	if (typeof textOrVerses === 'string') {
		return getTextDirection(textOrVerses);
	} else if (Array.isArray(textOrVerses)) {
		return getTextDirectionFromVerses(textOrVerses);
	}

	// Default to LTR
	return LTR;
};
