import React from 'react';
import { render } from '@testing-library/react';
import EditNote from '..';

const props = {
	addNote: jest.fn(),
	updateNote: jest.fn(),
	deleteNote: jest.fn(),
	setActiveChild: jest.fn(),
	toggleVerseText: jest.fn(),
	readSavedMessage: jest.fn(),
	clearNoteErrorMessage: jest.fn(),
	note: structuredClone({
		notes: 'This is a test note!',
		bible_id: 'ENGESV',
		created_at: '2019-02-12 18:44:07',
		chapter: 3,
		book_id: 'ROM',
		verse_end: 23,
		updated_at: '2019-02-12 18:44:07',
		verse_start: 23,
		tags: [
			{
				id: 6,
				note_id: 403619,
				bookmark_id: null,
				highlight_id: null,
				type: 'title',
				value: 'My First Test Note',
			},
			{
				id: 7,
				note_id: 403619,
				bookmark_id: null,
				highlight_id: null,
				type: 'reference',
				value: 'Matthew 1:7',
			},
		],
		id: 403619,
	}),
	vernacularNamesObject: {},
	notePassage: 'For all have sinned and fallen short of the glory of God.',
	activeTextId: 'ENGESV',
	activeBookName: 'Romans',
	notesErrorMessage: '',
	isVerseTextVisible: true,
	savedTheNote: false,
	errorSavingNote: false,
};
const realDate = Date;
describe('EditNote component', () => {
	beforeAll(() => {
		global.Date = jest.fn(() => ({
			getDate: () => 20,
			getFullYear: () => 2019,
			getMonth: () => 1,
		}));
	});

	afterAll(() => {
		global.Date = realDate;
	});

	it('should match snapshot of edit note with default props', () => {
		const { asFragment } = render(<EditNote {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot of edit note when verse text is not visible', () => {
		const { asFragment } = render(
			<EditNote {...props} isVerseTextVisible={false} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot of edit note when it was saved successfully', () => {
		const { asFragment } = render(<EditNote {...props} savedTheNote />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot of edit note when there was an error saving it', () => {
		const { asFragment } = render(<EditNote {...props} errorSavingNote />);
		expect(asFragment()).toMatchSnapshot();
	});
});
