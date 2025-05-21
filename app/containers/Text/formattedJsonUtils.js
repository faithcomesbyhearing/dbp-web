/**
 * utils.js
 *
 * Utility functions for FormattedText component.
 */

/**
 * Checks if a verse number falls within a given range (start/end).
 */
export const isVerseInRange = (start, targetVerse, end) => {
	// Ensure inputs are valid numbers before comparison
	if (typeof start !== 'number' || typeof targetVerse !== 'number') return false;
	// If end is not a number or null/undefined, treat the range as a single verse (start)
	const endVerse = typeof end === 'number' ? end : start;
	return targetVerse >= start && targetVerse <= endVerse;
};

/**
 * Calculates display properties for a verse based on annotations and player state.
 */
export const calculateVerseProps = (
	verseNumber,
	currentPlayingVerse,
	currentSelectedVerse, // Can be number or { verseStart, verseEnd }
	annotations,
) => {
	if (typeof verseNumber !== 'number') {
		// Not within a verse scope
		return {
			isSelectable: false,
			isPlaying: false,
			isSelected: false,
			hasNote: false,
			hasBookmark: false,
			highlightData: null,
		};
	}

	const isPlaying = currentPlayingVerse === verseNumber;

	// Handle different shapes of currentSelectedVerse
	const selectionStart =
		currentSelectedVerse?.verseStart ?? currentSelectedVerse?.verse ?? null;
	const selectionEnd = currentSelectedVerse?.verseEnd ?? null; // Use null if no end provided
	const isSelected = isVerseInRange(
		selectionStart,
		verseNumber,
		selectionEnd, // Pass null if single verse selection
	);

	const notes = annotations?.notes || [];
	const bookmarks = annotations?.bookmarks || [];
	const highlights = annotations?.highlights || [];

	// Use find with isVerseInRange for consistency
	const note = notes.find((n) =>
		isVerseInRange(n.verse_start, verseNumber, n.verse_end),
	);
	const bookmark = bookmarks.find((b) => b.verse === verseNumber); // Bookmarks often single verse
	const highlight = highlights.find((hl) =>
		isVerseInRange(hl.verse_start, verseNumber, hl.verse_end),
	);

	return {
		isSelectable: true, // Verses are selectable
		isPlaying,
		isSelected,
		hasNote: !!note,
		hasBookmark: !!bookmark,
		highlightData: highlight || null, // Pass highlight object or null
	};
};

// Helper to find a specific subtype recursively using array methods
export const findSubtypeRecursively = (content, subtypeToFind) => {
	if (!Array.isArray(content)) return null;

	// Find directly in the current array
	const directMatch = content.find(
		(item) =>
			typeof item === 'object' &&
			item !== null &&
			item.subtype === subtypeToFind,
	);
	if (directMatch) {
		return directMatch;
	}

	// If not found directly, search recursively in children
	// Use reduce to find the first match in any child's content
	return content.reduce((found, item) => {
		if (found) return found; // Already found in a previous item's children
		if (typeof item === 'object' && item !== null && item.content) {
			return findSubtypeRecursively(item.content, subtypeToFind);
		}
		return null; // Not found in this item's children
	}, null);
};

// Extracts text using array methods
export function extractTextRecursive(contentArray) {
	if (!Array.isArray(contentArray)) return '';

	const text = contentArray.reduce((acc, item) => {
		if (typeof item === 'string') {
			return acc + item;
		} else if (typeof item === 'object' && item !== null) {
			// Recurse into content, avoid adding marker text like note_caller itself
			let childText = '';
			if (item.content && item.subtype !== 'note_caller') {
				childText = extractTextRecursive(item.content);
			} else if (
				item.sequence?.blocks?.[0]?.content &&
				item.subtype !== 'note_caller'
			) {
				// Handle grafts (excluding note_caller itself)
				childText = extractTextRecursive(item.sequence.blocks[0].content);
			}
			return acc + childText;
		}
		return acc; // Ignore other types
	}, '');

	// Clean up spacing after accumulating all text
	return text.replace(/\s+/g, ' ').trim();
}

/**
 * Traverses content arrays to find footnote grafts and extract data.
 * Uses array methods and returns the updated index.
 */
function findAndExtractFootnotesRecursiveWithIndex(
	contentArray,
	footnotesMap, // The map to add footnotes to
	startIndex, // The starting index for this level
) {
	if (!Array.isArray(contentArray)) return startIndex; // Return index unchanged

	let currentIndex = startIndex; // Use a local variable to track index

	contentArray.forEach((item) => {
		if (typeof item === 'object' && item !== null) {
			// Check if this item IS a footnote graft
			if (
				item.type === 'graft' &&
				item.subtype === 'footnote' &&
				item.sequence?.blocks?.[0]?.content
			) {
				const footnoteBlockContent = item.sequence.blocks[0].content;
				let marker = '?';
				let footnoteText = '';

				try {
					const callerGraft = footnoteBlockContent.find(
						(c) => c?.type === 'graft' && c?.subtype === 'note_caller',
					);
					marker = callerGraft?.sequence?.blocks?.[0]?.content?.[0] || marker;

					const textWrapper = footnoteBlockContent.find(
						(c) => c?.type === 'wrapper' && c?.subtype === 'usfm:ft',
					);
					if (textWrapper?.content) {
						footnoteText = extractTextRecursive(textWrapper.content);
					}
				} catch (e) {
					// Keep error log for parsing issues
					console.error('Error parsing footnote graft:', e, item); // eslint-disable-line no-console
				}

				// Generate key using a unique identifier (text-based is more stable than index)
				const generatedKey = `fn-${
					footnoteText.replace(/\s+/g, '_') || currentIndex
				}`;
				// Add data to the map object (passed by reference)
				// No no-param-reassign error here as we modify the object's properties, not the reference itself
				// eslint-disable-next-line no-param-reassign
				footnotesMap[generatedKey] = { text: footnoteText, caller: marker };
				// Increment local index tracker
				currentIndex += 1; // Replaced ++
			}

			// Standard recursion into 'content', passing the current index
			if (item.content) {
				currentIndex = findAndExtractFootnotesRecursiveWithIndex(
					item.content,
					footnotesMap,
					currentIndex, // Pass the potentially updated index
				);
			}
			// Standard recursion into 'sequence.blocks', passing the current index
			if (item.sequence?.blocks) {
				currentIndex = findAndExtractFootnotesFromBlocksWithIndex(
					item.sequence.blocks,
					footnotesMap,
					currentIndex, // Pass the potentially updated index
				);
			}
		}
	});
	return currentIndex; // Return the final index after processing this array
}

/**
 * Helper to iterate over blocks using array methods and start recursive search.
 */
function findAndExtractFootnotesFromBlocksWithIndex(
	blocks,
	footnotesMap, // Pass the map
	startIndex, // Pass the starting index
) {
	if (!Array.isArray(blocks)) return startIndex; // Return index unchanged

	// Use reduce to iterate and track the index accumulator
	return blocks.reduce((currentIndexAcc, block) => {
		let updatedIndex = currentIndexAcc; // Start with the index from previous block/initial call
		if (block.content) {
			updatedIndex = findAndExtractFootnotesRecursiveWithIndex(
				block.content,
				footnotesMap,
				updatedIndex, // Pass current index to recursive call
			);
		}
		if (block.type === 'graft' && block.sequence?.blocks) {
			// Recurse into graft blocks
			updatedIndex = findAndExtractFootnotesFromBlocksWithIndex(
				block.sequence.blocks,
				footnotesMap,
				updatedIndex, // Pass current index to recursive call
			);
		}
		return updatedIndex; // Return the index after processing this block
	}, startIndex); // Initial value for the accumulator is startIndex
}

/**
 * Main function to extract footnotes into a map.
 * Uses text-based keys for better stability.
 */
export function extractFootnotesWithIndexKey(chapterJson) {
	const footnotesMap = {};
	if (!chapterJson?.sequence?.blocks) {
		return footnotesMap;
	}
	// Start traversal from the main sequence blocks with initial index 0
	findAndExtractFootnotesFromBlocksWithIndex(
		chapterJson.sequence.blocks,
		footnotesMap, // Pass the map to be populated
		0, // Initial index (less critical now with text-based keys)
	);
	return footnotesMap;
}
