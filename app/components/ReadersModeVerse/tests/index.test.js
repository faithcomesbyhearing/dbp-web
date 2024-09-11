import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // for additional matchers like toHaveAttribute
import ReadersModeVerse from '../index';

const highlightMessage = 'clicked highlight';

describe('ReadersModeVerse tests', () => {
	let onMouseUp;
	let onMouseDown;
	let onHighlightClick;
	let verse;
	let activeVerse;
	let verseIsActive;

	beforeEach(() => {
		onMouseUp = jest.fn();
		onMouseDown = jest.fn();
		onHighlightClick = jest.fn(() => highlightMessage);
		verse = {
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
		activeVerse = 0;
		verseIsActive = false;
	});

	it('Should match the snapshot', () => {
		const { asFragment } = render(
			<ReadersModeVerse
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onHighlightClick={onHighlightClick}
				verse={verse}
				activeVerse={activeVerse}
				verseIsActive={verseIsActive}
			/>,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('It should render the verse with class align-left', () => {
		const { container } = render(
			<ReadersModeVerse
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onHighlightClick={onHighlightClick}
				verse={verse}
				activeVerse={activeVerse}
				verseIsActive={verseIsActive}
			/>,
		);
		const verseElement = container.querySelector('.align-left');
		expect(verseElement).toHaveClass('align-left');
	});

	it('It should render the text of the verse', () => {
		const { container } = render(
			<ReadersModeVerse
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onHighlightClick={onHighlightClick}
				verse={verse}
				activeVerse={activeVerse}
				verseIsActive={verseIsActive}
			/>,
		);
		const verseElement = container.querySelector('.align-left');
		expect(verseElement).toHaveTextContent(
			'In the beginning God created the heavens and the earth.',
		);
	});

	it('It should call onHighlightClick when the verse span is clicked', () => {
		const { container } = render(
			<ReadersModeVerse
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onHighlightClick={onHighlightClick}
				verse={verse}
				activeVerse={activeVerse}
				verseIsActive={verseIsActive}
			/>,
		);
		const verseElement = container.querySelector('.align-left');
		fireEvent.click(verseElement);
		expect(onHighlightClick).toHaveBeenCalledTimes(1);
		expect(onHighlightClick).toHaveReturnedWith(highlightMessage);
	});

	it('It should trigger keyboard interaction on Enter key press', () => {
		const { container } = render(
			<ReadersModeVerse
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onHighlightClick={onHighlightClick}
				verse={verse}
				activeVerse={activeVerse}
				verseIsActive={verseIsActive}
			/>,
		);
		const verseElement = container.querySelector('.align-left');
		fireEvent.keyDown(verseElement, { key: 'Enter' });
		expect(onHighlightClick).toHaveBeenCalledTimes(1);
	});

	it('It should trigger keyboard interaction on Space key press', () => {
		const { container } = render(
			<ReadersModeVerse
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onHighlightClick={onHighlightClick}
				verse={verse}
				activeVerse={activeVerse}
				verseIsActive={verseIsActive}
			/>,
		);
		const verseElement = container.querySelector('.align-left');
		fireEvent.keyDown(verseElement, { key: ' ' });
		expect(onHighlightClick).toHaveBeenCalledTimes(1);
	});
});
