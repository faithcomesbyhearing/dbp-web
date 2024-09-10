// import React from 'react';
// import Enzyme from 'enzyme';
// import Adapter from '@cfaester/enzyme-adapter-react-18';
// import renderer from 'react-test-renderer';
// import PlainTextVerse from '../index';

// Enzyme.configure({ adapter: new Adapter() });

// jest.mock('../../IconsInText', () => function iconsInTextMock() {
//   return <div id="mockIcons">mockIcons</div>;
// });

// const onMouseUp = jest.fn();
// const onMouseDown = jest.fn();
// const onHighlightClick = jest.fn();
// const onNoteClick = jest.fn();
// const verse = {
// 	book_id: 'GEN',
// 	book_name: 'Genesis',
// 	book_name_alt: 'Genesis',
// 	chapter: 1,
// 	chapter_alt: '1',
// 	verse_end: 1,
// 	verse_end_alt: '1',
// 	verse_start: 1,
// 	verse_start_alt: '1',
// 	verse_text: 'In the beginning God created the heavens and the earth.',
// 	wholeVerseHighlighted: true,
// };
// const activeVerse = 0;
// const verseIsActive = false;
// const oneVerse = false;

// describe('PlainTextVerse', () => {
// 	it('should return correct component', () => {
// 		const wrapper = Enzyme.mount(
// 			<PlainTextVerse
// 				onMouseUp={onMouseUp}
// 				onMouseDown={onMouseDown}
// 				onHighlightClick={onHighlightClick}
// 				onNoteClick={onNoteClick}
// 				verse={verse}
// 				activeVerse={activeVerse}
// 				verseIsActive={verseIsActive}
// 				oneVerse={oneVerse}
// 			/>,
// 		);

// 		expect(wrapper.find('#mockIcons').length).toEqual(1);
// 		expect(wrapper.contains(verse.verse_text)).toEqual(true);
// 	});
// 	it('Should match the old snapshot', () => {
// 		const tree = renderer
// 			.create(
// 				<PlainTextVerse
// 					onMouseUp={onMouseUp}
// 					onMouseDown={onMouseDown}
// 					onHighlightClick={onHighlightClick}
// 					onNoteClick={onNoteClick}
// 					verse={verse}
// 					activeVerse={activeVerse}
// 					verseIsActive={verseIsActive}
// 					oneVerse={oneVerse}
// 				/>,
// 			)
// 			.toJSON();
// 		expect(tree).toMatchSnapshot();
// 	});
// 	it('Should match the old snapshot for oneVerse option', () => {
// 		const tree = renderer
// 			.create(
// 				<PlainTextVerse
// 					onMouseUp={onMouseUp}
// 					onMouseDown={onMouseDown}
// 					onHighlightClick={onHighlightClick}
// 					onNoteClick={onNoteClick}
// 					verse={verse}
// 					activeVerse={activeVerse}
// 					verseIsActive={verseIsActive}
// 					oneVerse
// 				/>,
// 			)
// 			.toJSON();
// 		expect(tree).toMatchSnapshot();
// 	});
// 	it('Should render one verse per line if oneVerse is true', () => {
// 		const wrapper = Enzyme.mount(
// 			<PlainTextVerse
// 				onMouseUp={onMouseUp}
// 				onMouseDown={onMouseDown}
// 				onHighlightClick={onHighlightClick}
// 				onNoteClick={onNoteClick}
// 				verse={verse}
// 				activeVerse={activeVerse}
// 				verseIsActive={verseIsActive}
// 				oneVerse
// 			/>,
// 		);
// 		expect(wrapper.props().oneVerse).toBe(true);
// 		expect(wrapper.find('#mockIcons').length).toEqual(1);
// 		expect(wrapper.contains(verse.verse_text)).toEqual(true);
// 		expect(wrapper.find('br').length).toEqual(1);
// 	});
// });

/** eslint-env jest */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // For better matchers like toBeInTheDocument
import PlainTextVerse from '../index';

jest.mock('../../IconsInText', () => function iconsInTextMock() {
  return <div id="mockIcons">mockIcons</div>;
});

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
		render(
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
		expect(screen.getByText(verse.verse_text)).toBeInTheDocument();
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
		expect(screen.getByText(verse.verse_text)).toBeInTheDocument();
		expect(screen.getByText('mockIcons')).toBeInTheDocument();
		// Check if <br /> is rendered when oneVerse is true
		expect(container.querySelector('br')).toBeInTheDocument();
	});
});
