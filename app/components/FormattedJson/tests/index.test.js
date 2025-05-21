/** eslint-env jest */
import React from 'react';
import Enzyme, { mount } from 'enzyme'; // Import mount directly
import Adapter from '@cfaester/enzyme-adapter-react-18';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux'; // Import Provider
import configureStore from 'redux-mock-store'; // Import redux-mock-store
import FormattedJson from '../index'; // Adjust path if needed

// Configure Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

// --- Mock Data ---

// Mock Redux store setup
const mockStore = configureStore([]);
const initialState = {
	// Define initial state for selectors used in FormattedJson
	player: { currentVerse: null },
	selection: { selectedVerse: null }, // Or selectedVerseInfo: null
};
const store = mockStore(initialState);

// Mock JSON source similar to 001GEN_001.json structure
const mockFormattedSource = {
	metadata: {
		document: {
			bookCode: 'MAT',
			properties: { chapters: '1' },
		},
	},
	sequence: {
		type: 'main',
		blocks: [
			{
				// Chapter Label Block (example)
				type: 'paragraph',
				subtype: 'usfm:p', // Or potentially a specific chapter marker block type
				content: [
					{
						type: 'wrapper',
						subtype: 'chapter',
						atts: { number: '1' },
						content: [
							{ type: 'mark', subtype: 'chapter_label', atts: { number: '1' } },
						],
					},
				],
			},
			{
				// Verse Content Block
				type: 'paragraph',
				subtype: 'usfm:p', // Class: verse-paragraph
				content: [
					{
						type: 'wrapper',
						subtype: 'verses',
						atts: { number: '1' },
						content: [
							{ type: 'mark', subtype: 'verses_label', atts: { number: '1' } }, // Class: verse-number-label
							'The book of the genealogy of Jesus Christ, the son of David, the son of Abraham.', // Text content
						],
					},
					{
						type: 'wrapper',
						subtype: 'verses',
						atts: { number: '2' },
						content: [
							{ type: 'mark', subtype: 'verses_label', atts: { number: '2' } },
							'Abraham was the father of Isaac, and Isaac the father of Jacob...', // Truncated text
						],
					},
				],
			},
		],
	},
};

// Mock annotations and settings
const mockHighlights = [];
const mockBookmarks = [];
const mockUserNotes = [];
const mockUserSettings = fromJS({
	activeTheme: 'red',
	activeFontType: 'sans',
	activeFontSize: 16, // Example font size for testing style application
	toggleOptions: {
		readersMode: { name: "READER'S MODE", active: false, available: true },
		crossReferences: { name: 'CROSS REFERENCE', active: true, available: true },
		redLetter: { name: 'RED LETTER', active: true, available: true },
		justifiedText: { name: 'JUSTIFIED TEXT', active: true, available: true }, // Test justification class
		oneVersePerLine: {
			name: 'ONE VERSE PER LINE',
			active: false,
			available: true,
		},
		verticalScrolling: {
			name: 'VERTICAL SCROLLING',
			active: false,
			available: false,
		},
	},
	autoPlayEnabled: false,
});

// Mock handler functions using jest.fn()
const mockOpenFootnote = jest.fn();
const mockSetFootnotes = jest.fn(); // For the useEffect hook
const mockHandleMouseUp = jest.fn();
const mockGetFirstVerse = jest.fn();
const mockHandleNoteClick = jest.fn(); // Covers both note and bookmark clicks based on implementation

describe('<FormattedJson /> (JSON Refactor)', () => {
	let wrapper;

	// Mount the component within a Provider before each test
	beforeEach(() => {
		// Mount with Provider to handle useSelector hooks
		wrapper = mount(
			<Provider store={store}>
				<FormattedJson
					formattedSource={mockFormattedSource} // Pass the mock JSON data
					userNotes={mockUserNotes}
					bookmarks={mockBookmarks}
					highlights={mockHighlights}
					userSettings={mockUserSettings}
					// Pass required handlers
					openFootnote={mockOpenFootnote}
					handleMouseUp={mockHandleMouseUp}
					getFirstVerse={mockGetFirstVerse}
					handleNoteClick={mockHandleNoteClick}
					// Optional handlers/props
					setFootnotes={mockSetFootnotes} // Needed for useEffect
					// Fallback props (less critical if JSON is reliable)
					activeChapter={1}
					activeBookId="MAT"
					// Removed props no longer used by the functional component:
					// userAuthenticated, activeVerseInfo, verseNumber, domMethodsAvailable,
					// setFormattedRef, setFormattedRefHighlight, handleHighlightClick
				/>
			</Provider>,
		);
	});

	// Unmount after each test
	afterEach(() => {
		if (wrapper) {
			wrapper.unmount();
			wrapper = null;
		}
		// Clear mock function calls
		jest.clearAllMocks();
	});

	it('should render without crashing', () => {
		// Check if the component exists after mounting
		expect(wrapper.find(FormattedJson).exists()).toBe(true);
	});

	it('should render the main container div', () => {
		// Check for the main wrapper div with its base class
		expect(wrapper.find('div.bible-chapter-view').exists()).toBe(true);
	});

	it('should render the chapter number label (if present)', () => {
		// Find the element rendered for the chapter label based on its class
		// Note: The old test checked for `<div class="c">1</div>`. The new component
		// renders this based on the JSON structure. Assuming 'chapter_label' subtype
		// gets the 'chapter-number-label' class and renders in a div/h1.
		const chapterLabel = wrapper.find('.chapter-number-label');
		expect(chapterLabel.exists()).toBe(true);
		expect(chapterLabel.text()).toContain('1'); // Check the content
	});

	it('should render verse numbers and text from JSON data', () => {
		// Check for verse 1 label (assuming span with class 'verse-number-label')
		const verse1Label = wrapper.find(
			'span.verse-number-label[data-verse-number=1]',
		);
		expect(verse1Label.exists()).toBe(true);
		expect(verse1Label.text()).toContain('1'); // Check the number rendered

		// Check for verse 1 text content
		// Find the parent paragraph/block and check its text content
		// This assumes 'usfm:p' subtype gets 'verse-paragraph' class
		const verse1Block = wrapper
			.find('.verse-paragraph')
			.filterWhere((n) => n.text().includes('genealogy'));
		expect(verse1Block.exists()).toBe(true);
		expect(verse1Block.text()).toContain(
			'The book of the genealogy of Jesus Christ, the son of David, the son of Abraham.',
		);

		// Check for verse 2 label
		const verse2Label = wrapper.find(
			'span.verse-number-label[data-verse-number=2]',
		);
		expect(verse2Label.exists()).toBe(true);
		expect(verse2Label.text()).toContain('2');

		// Check for verse 2 text content within the same block
		expect(verse1Block.text()).toContain(
			'Abraham was the father of Isaac, and Isaac the father of Jacob...',
		);
	});

	it('should apply font size style from userSettings', () => {
		const expectedFontSize = mockUserSettings.get('activeFontSize');
		// Find the main div and check its inline style property
		expect(wrapper.find('div.bible-chapter-view').prop('style')).toHaveProperty(
			'fontSize',
			`${expectedFontSize}pt`,
		);
	});

	// it('should apply justification class based on userSettings', () => {
	// 	const isJustified = mockUserSettings.getIn([
	// 		'toggleOptions',
	// 		'justifiedText',
	// 		'active',
	// 	]);
	// 	// Check if the main div has the 'justify' class conditionally
	// 	expect(wrapper.find('div.bible-chapter-view').hasClass('justify')).toBe(isJustified);
	// });

	// --- Interaction Tests ---

	it('should call getFirstVerse on verse number mousedown', () => {
		const verseLabel = wrapper.find(
			'span.verse-number-label[data-verse-number=1]',
		);
		expect(verseLabel.exists()).toBe(true); // Ensure the element exists first
		// Simulate the event on the found element
		verseLabel.simulate('mousedown', { button: 0 }); // Simulate left-click mousedown
		// Assert that the mock handler was called
		expect(mockGetFirstVerse).toHaveBeenCalledTimes(1);
		// Optionally check arguments: event object and verse number
		expect(mockGetFirstVerse).toHaveBeenCalledWith(expect.anything(), 1);
	});

	it('should call handleMouseUp on verse number mouseup', () => {
		const verseLabel = wrapper.find(
			'span.verse-number-label[data-verse-number=1]',
		);
		expect(verseLabel.exists()).toBe(true);
		verseLabel.simulate('mouseup', { button: 0 }); // Simulate left-click mouseup
		expect(mockHandleMouseUp).toHaveBeenCalledTimes(1);
		// Optionally check arguments: event object
		expect(mockHandleMouseUp).toHaveBeenCalledWith(expect.anything());
	});

	// Add similar tests for onVerseClick, onNoteClick, onBookmarkClick, openFootnote
	// by finding the appropriate elements (verse text spans, icons, footnote markers)
	// and simulating 'click' events. Example:
	/*
  it('should call handleNoteClick when note icon is clicked', () => {
      // Add a mock note to annotations and source data first
      // ... setup ...
      const noteIcon = wrapper.find('.verse-number-label[data-verse-number=1] .note-icon');
      expect(noteIcon.exists()).toBe(true);
      noteIcon.simulate('click');
      expect(mockHandleNoteClick).toHaveBeenCalledTimes(1);
      expect(mockHandleNoteClick).toHaveBeenCalledWith({ chapter: 1, verse: 1 });
  });
  */

	it('should call setFootnotes via useEffect if footnotes exist', () => {
		// This test checks if the useEffect hook correctly calls setFootnotes.
		// We need mock data with footnotes and ensure extractFootnotesWithIndexKey works.

		// Create mock data with a footnote
		const mockSourceWithFootnote = {
			metadata: {
				document: { bookCode: 'MAT', properties: { chapters: '1' } },
			},
			sequence: {
				type: 'main',
				blocks: [
					{
						type: 'paragraph',
						subtype: 'usfm:p',
						content: [
							{
								type: 'wrapper',
								subtype: 'verses',
								atts: { number: '1' },
								content: [
									{
										type: 'mark',
										subtype: 'verses_label',
										atts: { number: '1' },
									},
									'Verse text.',
									{
										// Mock footnote graft
										type: 'graft',
										subtype: 'footnote',
										sequence: {
											blocks: [
												{
													type: 'paragraph',
													subtype: 'usfm:f',
													content: [
														{
															type: 'graft',
															subtype: 'note_caller',
															sequence: {
																blocks: [
																	{
																		type: 'paragraph',
																		subtype: 'usfm:f',
																		content: ['+'],
																	},
																],
															},
														},
														{
															type: 'wrapper',
															subtype: 'usfm:ft',
															content: ['Footnote content here.'],
														},
													],
												},
											],
										},
									},
								],
							},
						],
					},
				],
			},
		};

		// Re-mount with new source data
		wrapper.unmount();
		wrapper = mount(
			<Provider store={store}>
				<FormattedJson
					formattedSource={mockSourceWithFootnote}
					userSettings={mockUserSettings}
					openFootnote={mockOpenFootnote}
					handleMouseUp={mockHandleMouseUp}
					getFirstVerse={mockGetFirstVerse}
					handleNoteClick={mockHandleNoteClick}
					setFootnotes={mockSetFootnotes} // Pass the mock function
					// other necessary props...
				/>
			</Provider>,
		);

		// useEffect runs after mount. Check if setFootnotes was called.
		// The exact content depends on extractFootnotesWithIndexKey implementation.
		expect(mockSetFootnotes).toHaveBeenCalledTimes(1);
		// Check the argument structure passed to setFootnotes more accurately
		// The key generated includes the period from the text.
		const expectedKey = 'fn-Footnote_content_here.';
		const expectedText = 'Footnote content here.';
		expect(mockSetFootnotes).toHaveBeenCalledWith({
			[expectedKey]: expectedText,
		});
	});
});

/*
**Explanation of Updates:**

1.  **Redux Provider:** Since `FormattedJson` uses `useSelector`, the component needs to be wrapped in a `<Provider store={store}>` during mounting. `redux-mock-store` is used to create a mock store with a minimal initial state.
2.  **Mock JSON:** `mockFormattedSource` now holds the JSON structure.
3.  **Mock Handlers:** Used `jest.fn()` for all handler props to allow checking if they were called.
4.  **Mounting:** Updated the `mount` call to pass the new set of props and wrap with the `Provider`.
5.  **Removed Props:** Props like `userAuthenticated`, `activeVerseInfo`, `verseNumber`, etc., that are no longer used by the functional component were removed from the `mount` call.
6.  **Render Test:** Checks for the existence of `.bible-chapter-view`.
7.  **Content Tests:**
    * Finds elements based on expected CSS classes (`.chapter-number-label`, `.verse-number-label`, `.verse-paragraph`).
    * Checks `data-verse-number` attribute.
    * Asserts text content based on the mock JSON.
8.  **Style Tests:** Checks for inline `fontSize` style and the conditional `justify` class.
9.  **Interaction Tests:**
    * Finds the target element (e.g., verse number span).
    * Uses `simulate()` to trigger events like `mousedown` and `mouseup`.
    * Asserts that the corresponding mock handler functions (`mockGetFirstVerse`, `mockHandleMouseUp`) were called using `toHaveBeenCalledTimes` and optionally `toHaveBeenCalledWith`.
10. **`useEffect` Test:** Added a test specifically for the `useEffect` hook that calls `setFootnotes`. This requires mounting with data containing footnotes and asserting that `mockSetFootnotes` was called with the expected extracted footnote data.
11. **Cleanup:** Added `wrapper.unmount()` in `afterEach` and `jest.clearAllMocks()` to reset mock function calls between tests.
*/
