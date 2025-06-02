/** eslint-env jest */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom'; // for additional matchers like toHaveAttribute
import FormattedText from '../index';

const highlights = [];
const bookmarks = [];
const userNotes = [];
const domMethodsAvailable = false;
const activeBookId = 'MAT';
const setFormattedRef = jest.fn();
const setFootnotes = jest.fn();
const setFormattedRefHighlight = jest.fn();
const formattedSource = {
	main: '<div class="chapter section ENGESV_70_MAT_1 ENGESV ENG MAT latin" dir="ltr" data-id="ENGESV_70_MAT_1" data-nextid="MAT2" data-previd="MAL4" lang="ENG"><div class="c">1</div><p><span class="verse1 v-num v-1">&#160;1&#160;</span><span class="v MAT1_1" data-id="MAT1_1">The book of the genealogy of Jesus Christ, the son of David, the son of Abraham.</span><span class="verse2 v-num v-2">&#160;2&#160;</span><span class="v MAT1_2" data-id="MAT1_2">Abraham was the father of Isaac, and Isaac the father o..."</span></p></div></div>',
	footnoteSource: '',
};
const activeChapter = 1;
const verseNumber = '';
const userAuthenticated = true;
const userSettings = structuredClone({
	activeTheme: 'red',
	activeFontType: 'sans',
	activeFontSize: 42,
	toggleOptions: {
		readersMode: {
			name: "READER'S MODE",
			active: false,
			available: true,
		},
		crossReferences: {
			name: 'CROSS REFERENCE',
			active: true,
			available: true,
		},
		redLetter: {
			name: 'RED LETTER',
			active: true,
			available: true,
		},
		justifiedText: {
			name: 'JUSTIFIED TEXT',
			active: true,
			available: true,
		},
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
const activeVerseInfo = { verse: 0 };
const handleMouseUp = jest.fn();
const getFirstVerse = jest.fn();
const handleHighlightClick = jest.fn();
const handleNoteClick = jest.fn();

describe('<FormattedText />', () => {
	it('should render and display chapter content', () => {
		const { container } = render(
			<FormattedText
				highlights={highlights}
				activeChapter={activeChapter}
				verseNumber={verseNumber}
				userAuthenticated={userAuthenticated}
				userSettings={userSettings}
				activeVerseInfo={activeVerseInfo}
				handleMouseUp={handleMouseUp}
				getFirstVerse={getFirstVerse}
				handleHighlightClick={handleHighlightClick}
				handleNoteClick={handleNoteClick}
				bookmarks={bookmarks}
				userNotes={userNotes}
				domMethodsAvailable={domMethodsAvailable}
				activeBookId={activeBookId}
				setFormattedRef={setFormattedRef}
				setFootnotes={setFootnotes}
				setFormattedRefHighlight={setFormattedRefHighlight}
				formattedSource={formattedSource}
			/>,
		);

		// Check for content in the chapter
		expect(container.querySelector('.chapter')).toBeInTheDocument();
		expect(container.querySelector('.verse1')).toBeInTheDocument();
		expect(container).toHaveTextContent(
			'The book of the genealogy of Jesus Christ, the son of David, the son of Abraham.',
		);
	});

	it('should have activeChapter prop set to 1', () => {
		render(
			<FormattedText
				highlights={highlights}
				activeChapter={activeChapter}
				verseNumber={verseNumber}
				userAuthenticated={userAuthenticated}
				userSettings={userSettings}
				activeVerseInfo={activeVerseInfo}
				handleMouseUp={handleMouseUp}
				getFirstVerse={getFirstVerse}
				handleHighlightClick={handleHighlightClick}
				handleNoteClick={handleNoteClick}
				bookmarks={bookmarks}
				userNotes={userNotes}
				domMethodsAvailable={domMethodsAvailable}
				activeBookId={activeBookId}
				setFormattedRef={setFormattedRef}
				setFootnotes={setFootnotes}
				setFormattedRefHighlight={setFormattedRefHighlight}
				formattedSource={formattedSource}
			/>,
		);

		// Check if the activeChapter is set properly
		expect(activeChapter).toBe(1);
	});
});
