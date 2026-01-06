/**
 * Extract chapter header from formattedJsonSource or formattedSource
 *
 * This utility extracts the chapter title/header from either:
 * - formattedJsonSource: JSON structure with blocks containing usfm:s headers
 * - formattedSource: HTML/XML structure with h3 tags following class="c" chapter markers
 *
 * @param {Object|undefined} source - Either formattedJsonSource or formattedSource object
 * @returns {string} - The extracted header text, or empty string if not found
 */
export default function extractChapterHeader(source) {
	if (!source) {
		return '';
	}

	// Try JSON structure first (formattedJsonSource)
	if (source.sequence && source.sequence.blocks) {
		return extractHeaderFromJson(source);
	}

	// Try HTML structure (formattedSource)
	if (source.main && typeof source.main === 'string') {
		return extractHeaderFromHtml(source.main);
	}

	// Unknown structure
	return '';
}

/**
 * Extract header from JSON structure (formattedJsonSource)
 * Looks for first block with subtype "usfm:s" (section heading)
 * Also checks inside "graft" blocks with sequence.type === "heading"
 *
 * @param {Object} jsonSource - The formattedJsonSource object
 * @returns {string} - The extracted header text
 */
function extractHeaderFromJson(jsonSource) {
	const blocks = jsonSource.sequence?.blocks || [];

	// Find the first block with a section heading subtype
	const headerSubtypes = [
		'usfm:s',
		'usfm:s1',
		'usfm:s2',
		'usfm:ms',
		'usfm:mt',
		'usfm:mt1',
		'usfm:mt2',
		'usfm:mt3',
	];

	for (const block of blocks) {
		// Check direct header blocks
		if (headerSubtypes.includes(block.subtype)) {
			return extractTextFromContent(block.content);
		}

		// Check graft blocks with heading sequence
		if (block.type === 'graft' && (block.sequence?.type === 'heading' || block.sequence?.type === 'title')) {
			const graftBlocks = block.sequence.blocks || [];

			for (const graftBlock of graftBlocks) {
				if (headerSubtypes.includes(graftBlock.subtype)) {
					return extractTextFromContent(graftBlock.content);
				}
			}
		}
	}

	return '';
}

/**
 * Recursively extract text from content array
 * Content can be strings or objects with nested content
 *
 * @param {Array} content - The content array from a block
 * @param {boolean} isTopLevel - Whether this is the top-level call (default: true)
 * @returns {string} - The concatenated text content
 */
function extractTextFromContent(content, isTopLevel = true) {
	if (!Array.isArray(content)) {
		return '';
	}

	const textParts = [];

	for (const item of content) {
		if (typeof item === 'string') {
			textParts.push(item);
		} else if (item && typeof item === 'object') {
			// Recursively extract from nested content
			if (item.content) {
				const nestedText = extractTextFromContent(item.content, false);
				if (nestedText) {
					textParts.push(nestedText);
				}
			}
			// Also check for sequence.blocks (in case of grafts)
			if (item.sequence && item.sequence.blocks) {
				for (const block of item.sequence.blocks) {
					if (block.content) {
						const blockText = extractTextFromContent(block.content, false);
						if (blockText) {
							textParts.push(blockText);
						}
					}
				}
			}
		}
	}

	const joined = textParts.join('');

	// Only trim and normalize spaces at the top level to preserve intentional spacing
	return isTopLevel ? joined.trim().replace(/\s+/g, ' ') : joined;
}

/**
 * Extract header from HTML structure (formattedSource)
 * Looks for h3 tags following <div class="c"> chapter marker
 *
 * @param {string} html - The HTML string from formattedSource.main
 * @returns {string} - The extracted header text
 */
function extractHeaderFromHtml(html) {
	if (typeof html !== 'string') {
		return '';
	}

	// Create a temporary DOM parser (works in browser)
	if (typeof window !== 'undefined' && window.DOMParser) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');

		// Find the chapter marker (class="c")
		const chapterMarker = doc.querySelector('.c');

		if (!chapterMarker) {
			return '';
		}

		// Look for h3 tags after the chapter marker
		let currentElement = chapterMarker.nextElementSibling;
		const headerTexts = [];

		while (currentElement) {
			// Check if it's an h3 tag
			if (currentElement.tagName === 'H3') {
				const text = currentElement.textContent.trim();
				if (text) {
					headerTexts.push(text);
				}
			}
			// Stop when we hit a paragraph (verses start)
			else if (currentElement.tagName === 'P') {
				break;
			}

			currentElement = currentElement.nextElementSibling;
		}

		return headerTexts.join(' ');
	}

	// Fallback for server-side: Use regex to extract h3 content
	// Find the chapter marker first
	const chapterRegex = /<div[^>]*class="c"[^>]*>(\d+)<\/div>/i;
	const chapterMatch = html.match(chapterRegex);

	if (!chapterMatch) {
		return '';
	}

	// Extract the portion after the chapter marker
	const afterChapter = html.substring(html.indexOf(chapterMatch[0]) + chapterMatch[0].length);

	// Extract h3 tags until we hit a <p> tag
	const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;
	const pTagIndex = afterChapter.search(/<p[^>]*>/i);
	const searchArea = pTagIndex !== -1 ? afterChapter.substring(0, pTagIndex) : afterChapter;

	const headerTexts = [];
	let match;

	while ((match = h3Regex.exec(searchArea)) !== null) {
		const text = match[1].replace(/<[^>]+>/g, '').trim(); // Strip HTML tags
		if (text) {
			headerTexts.push(text);
		}
	}

	return headerTexts.join(' ');
}
