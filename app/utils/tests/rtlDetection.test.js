/** eslint-env jest */
import {
	detectRTLFromText,
	detectRTLFromVerses,
	getTextDirection,
	getTextDirectionFromVerses,
	detectRTLFromFormattedJson,
	getTextDirectionWithFallback,
} from '../rtlDetection';

describe('RTL Detection Utility', () => {
	describe('detectRTLFromText', () => {
		it('detects Hebrew text as RTL', () => {
			const hebrewText = 'בראשית ברא אלהים';
			expect(detectRTLFromText(hebrewText)).toBe(true);
		});

		it('detects Arabic text as RTL', () => {
			const arabicText = 'كتاب ميلاد يسوع المسيح';
			expect(detectRTLFromText(arabicText)).toBe(true);
		});

		it('detects English text as LTR', () => {
			const englishText = 'The book of the genealogy';
			expect(detectRTLFromText(englishText)).toBe(false);
		});

		it('handles empty string', () => {
			expect(detectRTLFromText('')).toBe(false);
		});

		it('handles null input', () => {
			expect(detectRTLFromText(null)).toBe(false);
		});

		it('handles undefined input', () => {
			expect(detectRTLFromText(undefined)).toBe(false);
		});

		it('handles non-string input', () => {
			expect(detectRTLFromText(123)).toBe(false);
		});

		it('detects mixed content with RTL characters', () => {
			const mixedText = 'Hello שלום';
			expect(detectRTLFromText(mixedText)).toBe(true);
		});
	});

	describe('detectRTLFromVerses', () => {
		const hebrewVerses = [
			{ verse_text: 'בראשית ברא אלהים את השמים ואת הארץ' },
			{ verse_text: 'והארץ היתה תהו ובהו' },
			{ verse_text: 'ויאמר אלהים יהי אור' },
		];

		const englishVerses = [
			{ verse_text: 'In the beginning God created' },
			{ verse_text: 'The earth was without form' },
			{ verse_text: 'And God said, Let there be light' },
		];

		it('detects RTL from Hebrew verses', () => {
			expect(detectRTLFromVerses(hebrewVerses)).toBe(true);
		});

		it('detects LTR from English verses', () => {
			expect(detectRTLFromVerses(englishVerses)).toBe(false);
		});

		it('handles empty array', () => {
			expect(detectRTLFromVerses([])).toBe(false);
		});

		it('handles null input', () => {
			expect(detectRTLFromVerses(null)).toBe(false);
		});

		it('handles verses without verse_text', () => {
			const versesWithoutText = [{ verse_start: 1 }, { verse_start: 2 }];
			expect(detectRTLFromVerses(versesWithoutText)).toBe(false);
		});

		it('samples only first N verses', () => {
			const mixedVerses = [
				...hebrewVerses,
				...englishVerses,
				...englishVerses,
			];
			// Should detect RTL from first 3 verses (which are Hebrew)
			expect(detectRTLFromVerses(mixedVerses, 3)).toBe(true);
		});
	});

	describe('getTextDirection', () => {
		it('returns "rtl" for Hebrew text', () => {
			expect(getTextDirection('בראשית ברא אלהים')).toBe('rtl');
		});

		it('returns "ltr" for English text', () => {
			expect(getTextDirection('The book of the genealogy')).toBe('ltr');
		});

		it('returns "ltr" for empty string', () => {
			expect(getTextDirection('')).toBe('ltr');
		});
	});

	describe('getTextDirectionFromVerses', () => {
		it('returns "rtl" for Hebrew verses', () => {
			const hebrewVerses = [{ verse_text: 'בראשית ברא אלהים' }];
			expect(getTextDirectionFromVerses(hebrewVerses)).toBe('rtl');
		});

		it('returns "ltr" for English verses', () => {
			const englishVerses = [{ verse_text: 'In the beginning' }];
			expect(getTextDirectionFromVerses(englishVerses)).toBe('ltr');
		});
	});

	describe('detectRTLFromFormattedJson', () => {
		const mockExtractTextFn = (content) => {
			if (Array.isArray(content)) {
				return content.map((item) => item.text || '').join('');
			}
			return '';
		};

		const hebrewJson = {
			sequence: {
				blocks: [
					{ type: 'para', content: [{ text: 'בראשית ברא אלהים' }] },
					{ type: 'para', content: [{ text: 'והארץ היתה תהו' }] },
				],
			},
		};

		const englishJson = {
			sequence: {
				blocks: [
					{ type: 'para', content: [{ text: 'In the beginning' }] },
					{ type: 'para', content: [{ text: 'God created' }] },
				],
			},
		};

		it('detects RTL from Hebrew formatted JSON', () => {
			expect(
				detectRTLFromFormattedJson(hebrewJson, mockExtractTextFn),
			).toBe(true);
		});

		it('detects LTR from English formatted JSON', () => {
			expect(
				detectRTLFromFormattedJson(englishJson, mockExtractTextFn),
			).toBe(false);
		});

		it('handles missing sequence.blocks', () => {
			expect(detectRTLFromFormattedJson({}, mockExtractTextFn)).toBe(false);
		});

		it('handles null JSON', () => {
			expect(detectRTLFromFormattedJson(null, mockExtractTextFn)).toBe(
				false,
			);
		});

		it('handles graft type blocks', () => {
			// For graft blocks, the utility extracts from block.sequence.blocks
			// So we need a mock function that handles this properly
			const mockExtractForGraft = (content) => {
				if (Array.isArray(content)) {
					return content
						.map((block) => {
							if (block.type === 'para' && block.content) {
								return block.content.map((item) => item.text || '').join('');
							}
							return '';
						})
						.join('');
				}
				return '';
			};

			const graftJson = {
				sequence: {
					blocks: [
						{
							type: 'graft',
							sequence: {
								blocks: [
									{ type: 'para', content: [{ text: 'בראשית' }] },
								],
							},
						},
					],
				},
			};
			expect(
				detectRTLFromFormattedJson(graftJson, mockExtractForGraft),
			).toBe(true);
		});
	});

	describe('getTextDirectionWithFallback', () => {
		it('uses provided direction when not empty', () => {
			expect(getTextDirectionWithFallback('rtl', 'English text')).toBe('rtl');
			expect(getTextDirectionWithFallback('ltr', 'בראשית')).toBe('ltr');
		});

		it('auto-detects from string when direction is empty', () => {
			expect(getTextDirectionWithFallback('', 'בראשית')).toBe('rtl');
			expect(getTextDirectionWithFallback('', 'English text')).toBe('ltr');
		});

		it('auto-detects from verses when direction is empty', () => {
			const hebrewVerses = [{ verse_text: 'בראשית ברא אלהים' }];
			const englishVerses = [{ verse_text: 'In the beginning' }];

			expect(getTextDirectionWithFallback('', hebrewVerses)).toBe('rtl');
			expect(getTextDirectionWithFallback('', englishVerses)).toBe('ltr');
		});

		it('defaults to ltr when no text provided', () => {
			expect(getTextDirectionWithFallback('', null)).toBe('ltr');
			expect(getTextDirectionWithFallback('', undefined)).toBe('ltr');
		});

		it('handles whitespace-only provided direction as empty', () => {
			expect(getTextDirectionWithFallback('  ', 'בראשית')).toBe('rtl');
		});
	});
});
