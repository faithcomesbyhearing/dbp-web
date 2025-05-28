import { fetchBibleData } from './fetchBibleData';
import Bugsnag from './bugsnagClient';

/**
 * Retrieves the primary font info (or fallback fonts object) from a Bible resource.
 *
 * @param {string} bibleId   The Bible identifier (e.g. "EN1ESV").
 * @returns {Promise<
 *   { name: string; type: string; data: any; } | null
 * >}  Either the primary font object, the `fonts` object, or null if none found.
 * @throws {Error} if bibleId is missing.
 */
export async function getFontFromBible(bibleId) {
	if (!bibleId) {
		throw new Error('getFontFromBible: bibleId is required');
	}

	let data;
	try {
		// fetchBibleData handles errors & returns {} on failure
		data = await fetchBibleData(bibleId, { includeFont: true });
	} catch (err) {
		// This should never happen (fetchBibleData swallows errors), but just in case:
		Bugsnag.notify(err);
		console.error('Unexpected error in getFontFromBible:', err); // eslint-disable-line no-console
		return null;
	}

	const pf = data.primary_font;
	if (
		pf &&
		typeof pf.font_name === 'string' &&
		typeof pf.type === 'string' &&
		pf.data != null
	) {
		return {
			name: pf.font_name,
			type: pf.type,
			data: pf.data,
		};
	}
	// If no primary font, check if the fonts object is present
	return data?.fonts ?? null;
}

export default getFontFromBible;
