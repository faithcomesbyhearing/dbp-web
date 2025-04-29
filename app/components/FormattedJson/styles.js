// styles.js (Adapted for Web / CSS Classes - Refined based on JSON)

export const blockTypeClasses = {
	// Paragraphs & Text blocks
	'usfm:p': 'verse-paragraph', // Standard paragraph
	'usfm:m': 'verse-paragraph-noindent', // Margin paragraph (no indent)
	'usfm:pi': 'verse-paragraph-indent', // Indented paragraph
	'usfm:q': 'verse-poetry', // Poetry/Quote line 1
	'usfm:q1': 'verse-poetry verse-poetry-level1', // Poetry/Quote line 1 explicit
	'usfm:q2': 'verse-poetry verse-poetry-level2', // Poetry/Quote line 2
	'usfm:b': 'verse-blank-line', // Blank line (often for poetry spacing)
	'usfm:ib': 'verse-inline-break', // Inline break (use <br> or specific styling)
	orphanTokens: 'verse-orphan-tokens', // Orphan tokens (e.g., copyright) - style as needed

	// Headings & Titles (map based on desired HTML/styling)
	'usfm:mt1': 'verse-main-title-1', // Main title level 1
	'usfm:mt': 'verse-main-title-1', // Alias for mt1 if needed
	'usfm:mt2': 'verse-main-title-2', // Main title level 2
	'usfm:mt3': 'verse-main-title-3', // Main title level 2
	'usfm:s': 'verse-section-heading', // Section heading
	'usfm:s1': 'verse-section-heading', // Alias for s
	'usfm:ms': 'verse-major-section-heading', // Major section heading

	// Markers & Labels
	verses_label: 'verse-number-label', // The verse number itself
	chapter_label: 'chapter-number-label', // Chapter number label (seen in JSON)
	footnote: 'verse-footnote-marker', // Footnote marker ([F])
	xref: 'verse-crossref-marker', // Cross-reference marker ([X])

	// Wrappers (might not need direct classes, or use for specific styling)
	wrapper: 'verse-wrapper', // General wrapper
	'usfm:add': 'verse-added-text', // Added text wrapper (e.g., for "Я даю" in v30)
	chapter: 'verse-chapter-wrapper', // Wrapper around chapter content within a block
	verses: 'verse-verses-wrapper', // Wrapper around verses content within a block

	// Other types
	title: 'verse-title-generic', // Generic title (from graft sequence type)
	heading: 'verse-heading-generic', // Generic heading
	remark: 'verse-remark', // Remark block (e.g., copyright)
};

export const functionalClasses = {
	verseSelectable: 'verse-selectable',
	verseHighlighted: 'verse-highlighted',
	versePlaying: 'verse-playing',
	hasNote: 'verse-has-note',
	hasBookmark: 'verse-has-bookmark',
	verseIsActive: 'active-verse',
};

export const getItemClasses = (item, verseProps = {}) => {
	const classes = ['verse-content-item'];
	const subtype =
		item?.subtype || (item?.type === 'graft' ? item?.sequence?.type : null);
	const typeClass = blockTypeClasses[subtype];

	if (typeClass) {
		classes.push(typeClass);
	}

	if (verseProps.isSelectable) classes.push(functionalClasses.verseSelectable);
	if (verseProps.highlightColor) {
		classes.push(functionalClasses.verseHighlighted);
	}
	if (verseProps.isPlaying) classes.push(functionalClasses.versePlaying);
	if (verseProps.hasNote) classes.push(functionalClasses.hasNote);
	if (verseProps.hasBookmark) classes.push(functionalClasses.hasBookmark);
	if (verseProps.isActive) classes.push(functionalClasses.verseIsActive);

	return classes.join(' ');
};
