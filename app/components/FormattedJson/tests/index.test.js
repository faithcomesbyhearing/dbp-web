/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import {
	render,
	screen,
	fireEvent,
	waitFor,
	cleanup,
} from '@testing-library/react';

import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import FormattedJson from '../index';

// Polyfill structuredClone in Jest
global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));

// --- Mock Data & Store ---
const mockStore = configureStore([]);
const initialState = {
	// minimal shape for useSelector inside FormattedJson
	audioPlayer: {
		/* ... */
	},
	settings: {
		userSettings: {
			/* ... */
		},
	},
	notes: {
		/* ... */
	},
};
const store = mockStore(initialState);

const mockFormattedSource = {
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
						subtype: 'chapter',
						atts: { number: '1' },
						content: [
							{ type: 'mark', subtype: 'chapter_label', atts: { number: '1' } },
						],
					},
				],
			},
			{
				type: 'paragraph',
				subtype: 'usfm:p',
				content: [
					{
						type: 'wrapper',
						subtype: 'verses',
						atts: { number: '1' },
						content: [
							{ type: 'mark', subtype: 'verses_label', atts: { number: '1' } },
							'The book of the genealogy of Jesus Christ, the son of David, the son of Abraham.',
						],
					},
					{
						type: 'wrapper',
						subtype: 'verses',
						atts: { number: '2' },
						content: [
							{ type: 'mark', subtype: 'verses_label', atts: { number: '2' } },
							'Abraham was the father of Isaac, and Isaac the father of Jacob...',
						],
					},
				],
			},
		],
	},
};

const mockHighlights = [];
const mockBookmarks = [];
const mockUserNotes = [];
const mockUserSettings = {
	activeTheme: 'red',
	activeFontType: 'sans',
	activeFontSize: 16,
	toggleOptions: {
		readersMode: { name: "READER'S MODE", active: false, available: true },
		crossReferences: { name: 'CROSS REFERENCE', active: true, available: true },
		redLetter: { name: 'RED LETTER', active: true, available: true },
		justifiedText: { name: 'JUSTIFIED TEXT', active: true, available: true },
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
};

// jest.fn() handlers
const mockOpenFootnote = jest.fn();
const mockSetFootnotes = jest.fn();
const mockHandleMouseUp = jest.fn();
const mockGetFirstVerse = jest.fn();
const mockHandleNoteClick = jest.fn();

describe('<FormattedJson /> (RTL refactor)', () => {
	afterEach(() => {
		cleanup();
		jest.clearAllMocks();
	});

	const renderComponent = (overrides = {}) => render(
			<Provider store={store}>
				<FormattedJson
					formattedSource={overrides.formattedSource ?? mockFormattedSource}
					userNotes={overrides.userNotes ?? mockUserNotes}
					bookmarks={overrides.bookmarks ?? mockBookmarks}
					highlights={overrides.highlights ?? mockHighlights}
					userSettings={overrides.userSettings ?? mockUserSettings}
					openFootnote={mockOpenFootnote}
					handleMouseUp={mockHandleMouseUp}
					getFirstVerse={mockGetFirstVerse}
					handleNoteClick={mockHandleNoteClick}
					setFootnotes={mockSetFootnotes}
					activeChapter={1}
					activeBookId="MAT"
				/>
			</Provider>,
		);

	it('renders without crashing', () => {
		const { container } = renderComponent();
		expect(container.querySelector('.bible-chapter-view')).toBeInTheDocument();
	});

	it('shows the chapter number label', () => {
		renderComponent();
		const chapterLabel = screen.getByText('1', {
			selector: '.chapter-number-label',
		});
		expect(chapterLabel).toBeInTheDocument();
	});

	it('renders verse 1 and 2 with correct text', () => {
		const { container } = renderComponent();
		const verse1 = screen.getByText(/genealogy of Jesus Christ/i);
		const verse2 = screen.getByText(/Isaac, and Isaac the father of Jacob/i);
		expect(verse1).toBeInTheDocument();
		expect(verse2).toBeInTheDocument();

		// verify the number labels using querySelector
		expect(
			container.querySelector('span.verse-number-label[data-verse-number="1"]'),
		).toBeInTheDocument();
		expect(
			container.querySelector('span.verse-number-label[data-verse-number="2"]'),
		).toBeInTheDocument();
	});

	it('applies fontSize from userSettings', () => {
		const { container } = renderComponent();
		const wrapperDiv = container.querySelector('.bible-chapter-view');
		expect(wrapperDiv).toHaveStyle(
			`font-size: ${mockUserSettings.activeFontSize}pt`,
		);
	});

	it('calls getFirstVerse on mousedown of verse #1', () => {
		const { container } = renderComponent();
		const verse1Label = container.querySelector('span.verse-number-label[data-verse-number="1"]');
		fireEvent.mouseDown(verse1Label);
		expect(mockGetFirstVerse).toHaveBeenCalledTimes(1);
		expect(mockGetFirstVerse).toHaveBeenCalledWith(expect.any(Object), 1);
	});

	it('calls handleMouseUp on mouseup of verse #1', () => {
		const { container } = renderComponent();
		const verse1Label = container.querySelector('span.verse-number-label[data-verse-number="1"]');
		fireEvent.mouseUp(verse1Label);
		expect(mockHandleMouseUp).toHaveBeenCalledTimes(1);
		expect(mockHandleMouseUp).toHaveBeenCalledWith(expect.any(Object));
	});

	it('uses setFootnotes useEffect when footnotes are present', async () => {
		// build a source with an inline footnote block
		const sourceWithFootnote = {
			...mockFormattedSource,
			sequence: {
				main: mockFormattedSource.sequence.main,
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
									'Hello ',
									{
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
																		content: ['*'],
																	},
																],
															},
														},
														{
															type: 'wrapper',
															subtype: 'usfm:ft',
															content: ['Footnote text'],
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

		renderComponent({ formattedSource: sourceWithFootnote });

		await waitFor(() => {
			expect(mockSetFootnotes).toHaveBeenCalledTimes(1);
		});

		// We don't know the exact key algorithm here, just that it got invoked
		const arg = mockSetFootnotes.mock.calls[0][0];
		expect(typeof arg).toBe('object');
		expect(Object.values(arg)[0]).toContain('Footnote text');
	});
});
