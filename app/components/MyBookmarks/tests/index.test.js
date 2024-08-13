import React from 'react';
import { render } from '@testing-library/react';
import MyBookmarks from '..';
import {
	getFormattedNoteDate,
	getNoteReference,
	bookmarks,
} from '../../../utils/testUtils/notebookFunctions';

const props = {
	bookmarks,
	getFormattedNoteDate: jest.fn((params) => getFormattedNoteDate(params)),
	getNoteReference: jest.fn((params) => getNoteReference(params)),
	toggleNotesModal: jest.fn(),
	deleteNote: jest.fn(),
};

describe('<MyBookmarks /> component', () => {
	it('should match snapshot with expected props', () => {
		const { asFragment } = render(<MyBookmarks {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
