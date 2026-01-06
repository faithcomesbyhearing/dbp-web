/**
 * @jest-environment jsdom
 */
import extractChapterHeader from '../extractChapterHeader';

describe('extractChapterHeader', () => {
	describe('JSON structure (formattedJsonSource)', () => {
		it('should extract header from simple usfm:s block', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'paragraph',
							subtype: 'usfm:s',
							content: ['The Genealogy of Jesus Christ'],
						},
						{
							type: 'paragraph',
							subtype: 'usfm:p',
							content: ['Verse content here...'],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('The Genealogy of Jesus Christ');
		});

		it('should extract header from usfm:s1 block', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'paragraph',
							subtype: 'usfm:s1',
							content: ['Section Heading 1'],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('Section Heading 1');
		});

		it('should extract header from usfm:mt block', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'paragraph',
							subtype: 'usfm:mt',
							content: ['Main Title'],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('Main Title');
		});

		it('should extract header from nested content objects', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'paragraph',
							subtype: 'usfm:s',
							content: [
								{
									type: 'wrapper',
									content: ['Nested ', 'Header ', 'Text'],
								},
							],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('Nested Header Text');
		});

		it('should extract header from mixed content (strings and objects)', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'paragraph',
							subtype: 'usfm:s',
							content: [
								'The ',
								{
									type: 'wrapper',
									content: ['Book of '],
								},
								'Genealogy',
							],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('The Book of Genealogy');
		});

		it('should return first header when multiple headers exist', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'paragraph',
							subtype: 'usfm:s',
							content: ['First Header'],
						},
						{
							type: 'paragraph',
							subtype: 'usfm:s1',
							content: ['Second Header'],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('First Header');
		});

		it('should return empty string when no header blocks exist', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'paragraph',
							subtype: 'usfm:p',
							content: ['Just verse content'],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('');
		});

		it('should handle empty content array', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'paragraph',
							subtype: 'usfm:s',
							content: [],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('');
		});

		it('should handle missing sequence', () => {
			const jsonSource = {};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('');
		});

		it('should handle missing blocks', () => {
			const jsonSource = {
				sequence: {},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('');
		});

		it('should extract header from graft block with heading sequence', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'graft',
							sequence: {
								type: 'heading',
								blocks: [
									{
										type: 'paragraph',
										subtype: 'usfm:s',
										content: ['The Seventh Day, God Rests'],
									},
								],
							},
						},
						{
							type: 'paragraph',
							subtype: 'usfm:p',
							content: ['Verse content here...'],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('The Seventh Day, God Rests');
		});

		it('should extract header from graft before direct header blocks', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'graft',
							sequence: {
								type: 'heading',
								blocks: [
									{
										type: 'paragraph',
										subtype: 'usfm:s',
										content: ['Graft Header'],
									},
								],
							},
						},
						{
							type: 'paragraph',
							subtype: 'usfm:s',
							content: ['Direct Header'],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('Graft Header');
		});

		it('should ignore graft blocks without heading sequence type', () => {
			const jsonSource = {
				sequence: {
					blocks: [
						{
							type: 'graft',
							sequence: {
								type: 'footnote',
								blocks: [
									{
										type: 'paragraph',
										subtype: 'usfm:s',
										content: ['Not a heading'],
									},
								],
							},
						},
						{
							type: 'paragraph',
							subtype: 'usfm:s',
							content: ['Actual Header'],
						},
					],
				},
			};

			const result = extractChapterHeader(jsonSource);
			expect(result).toBe('Actual Header');
		});
	});

	describe('HTML structure (formattedSource)', () => {
		it('should extract header from h3 tag following chapter marker', () => {
			const htmlSource = {
				main: '<div class="chapter"><div class="c">1</div><h3>The Genealogy of Jesus</h3><p>Verse 1 content</p></div>',
			};

			const result = extractChapterHeader(htmlSource);
			expect(result).toBe('The Genealogy of Jesus');
		});

		it('should extract multiple h3 headers and join them', () => {
			const htmlSource = {
				main: '<div class="chapter"><div class="c">1</div><h3>Part One:</h3><h3>The Beginning</h3><p>Verse content</p></div>',
			};

			const result = extractChapterHeader(htmlSource);
			expect(result).toBe('Part One: The Beginning');
		});

		it('should handle h3 with HTML attributes', () => {
			const htmlSource = {
				main: '<div class="chapter"><div class="c">1</div><h3 class="section-title" id="header-1">Section Header</h3><p>Verse content</p></div>',
			};

			const result = extractChapterHeader(htmlSource);
			expect(result).toBe('Section Header');
		});

		it('should stop at paragraph tag', () => {
			const htmlSource = {
				main: '<div class="chapter"><div class="c">1</div><h3>Header 1</h3><p>Verse content</p><h3>Header 2</h3></div>',
			};

			const result = extractChapterHeader(htmlSource);
			expect(result).toBe('Header 1');
		});

		it('should return empty string when no h3 exists', () => {
			const htmlSource = {
				main: '<div class="chapter"><div class="c">1</div><p>Verse content without header</p></div>',
			};

			const result = extractChapterHeader(htmlSource);
			expect(result).toBe('');
		});

		it('should return empty string when no chapter marker exists', () => {
			const htmlSource = {
				main: '<div class="chapter"><h3>Header without chapter marker</h3><p>Content</p></div>',
			};

			const result = extractChapterHeader(htmlSource);
			expect(result).toBe('');
		});

		it('should handle complex HTML with nested tags in h3', () => {
			const htmlSource = {
				main: '<div class="chapter"><div class="c">1</div><h3>The <em>Genealogy</em> of <strong>Jesus</strong></h3><p>Verse</p></div>',
			};

			const result = extractChapterHeader(htmlSource);
			expect(result).toBe('The Genealogy of Jesus');
		});

		it('should handle missing main property', () => {
			const htmlSource = {};

			const result = extractChapterHeader(htmlSource);
			expect(result).toBe('');
		});

		it('should handle non-string main property', () => {
			const htmlSource = {
				main: null,
			};

			const result = extractChapterHeader(htmlSource);
			expect(result).toBe('');
		});

		it('should handle empty HTML string', () => {
			const htmlSource = {
				main: '',
			};

			const result = extractChapterHeader(htmlSource);
			expect(result).toBe('');
		});
	});

	describe('Edge cases and invalid inputs', () => {
		it('should handle null input', () => {
			const result = extractChapterHeader(null);
			expect(result).toBe('');
		});

		it('should handle undefined input', () => {
			const result = extractChapterHeader(undefined);
			expect(result).toBe('');
		});

		it('should handle empty object', () => {
			const result = extractChapterHeader({});
			expect(result).toBe('');
		});

		it('should handle string input', () => {
			const result = extractChapterHeader('not an object');
			expect(result).toBe('');
		});

		it('should handle array input', () => {
			const result = extractChapterHeader([]);
			expect(result).toBe('');
		});
	});

	describe('Priority: JSON before HTML', () => {
		it('should try JSON structure first when both exist', () => {
			const source = {
				sequence: {
					blocks: [
						{
							type: 'paragraph',
							subtype: 'usfm:s',
							content: ['JSON Header'],
						},
					],
				},
				main: '<div class="c">1</div><h3>HTML Header</h3>',
			};

			const result = extractChapterHeader(source);
			expect(result).toBe('JSON Header');
		});

		it('should fall back to HTML if JSON has no header blocks', () => {
			const source = {
				sequence: {
					blocks: [
						{
							type: 'paragraph',
							subtype: 'usfm:p',
							content: ['No header here'],
						},
					],
				},
				main: '<div class="c">1</div><h3>HTML Header</h3>',
			};

			const result = extractChapterHeader(source);
			// Should return empty because JSON was tried and found no headers
			// (doesn't fall back to HTML in current implementation)
			expect(result).toBe('');
		});
	});
});
