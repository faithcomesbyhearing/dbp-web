/** eslint-env jest */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For better matchers like toBeInTheDocument
import PlainTextVerse from '../index';

jest.mock(
	'../../IconsInText',
	() =>
		function iconsInTextMock() {
			return <div id="mockIcons">mockIcons</div>;
		},
);

const onMouseUp = jest.fn();
const onMouseDown = jest.fn();
const onHighlightClick = jest.fn();
const onNoteClick = jest.fn();
const verse = {
	book_id: 'GEN',
	book_name: 'Genesis',
	book_name_alt: 'Genesis',
	chapter: 1,
	chapter_alt: '1',
	verse_end: 1,
	verse_end_alt: '1',
	verse_start: 1,
	verse_start_alt: '1',
	verse_text: 'In the beginning God created the heavens and the earth.',
	wholeVerseHighlighted: true,
};
const activeVerse = 0;
const verseIsActive = false;
const oneVerse = false;

describe('PlainTextVerse Component', () => {
	it('should render the component and display verse text', () => {
		const { container } = render(
			<PlainTextVerse
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onHighlightClick={onHighlightClick}
				onNoteClick={onNoteClick}
				verse={verse}
				activeVerse={activeVerse}
				verseIsActive={verseIsActive}
				oneVerse={oneVerse}
			/>,
		);

		// Check for IconsInText and verse text
		expect(screen.getByText('mockIcons')).toBeInTheDocument();
		// Verse text now includes directional marker, so check using container
		const verseTextElement = container.querySelector(
			'span[data-verseid="1"]:not(sup)',
		);
		expect(verseTextElement).toBeInTheDocument();
		expect(verseTextElement.textContent).toContain(verse.verse_text);
	});

	it('should match the old snapshot', () => {
		const { asFragment } = render(
			<PlainTextVerse
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onHighlightClick={onHighlightClick}
				onNoteClick={onNoteClick}
				verse={verse}
				activeVerse={activeVerse}
				verseIsActive={verseIsActive}
				oneVerse={oneVerse}
			/>,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should match the old snapshot when oneVerse option is true', () => {
		const { asFragment } = render(
			<PlainTextVerse
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onHighlightClick={onHighlightClick}
				onNoteClick={onNoteClick}
				verse={verse}
				activeVerse={activeVerse}
				verseIsActive={verseIsActive}
				oneVerse
			/>,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should render one verse per line when oneVerse is true', () => {
		const { container } = render(
			<PlainTextVerse
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onHighlightClick={onHighlightClick}
				onNoteClick={onNoteClick}
				verse={verse}
				activeVerse={activeVerse}
				verseIsActive={verseIsActive}
				oneVerse
			/>,
		);

		// Check if oneVerse prop is applied properly
		expect(screen.getByText('mockIcons')).toBeInTheDocument();
		// Verse text now includes directional marker, so check using container
		const verseTextElement = container.querySelector(
			'span[data-verseid="1"]:not(sup)',
		);
		expect(verseTextElement).toBeInTheDocument();
		expect(verseTextElement.textContent).toContain(verse.verse_text);
		// Check if <br /> is rendered when oneVerse is true
		expect(container.querySelector('br')).toBeInTheDocument();
	});

});
