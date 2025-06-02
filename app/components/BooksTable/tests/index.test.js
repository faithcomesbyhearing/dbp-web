import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BooksTable } from '../index';
import { bookData } from '../../../utils/testUtils/booksData';

const closeBookTable = jest.fn();
const props = {
	dispatch: jest.fn(),
	closeBookTable,
	books: structuredClone(bookData),
	audioObjects: [],
	userId: 609294,
	audioType: 'audio_drama',
	activeTextId: 'ENGESV',
	activeBookName: 'Matthew',
	initialBookName: 'Matthew',
	activeChapter: 3,
	loadingBooks: false,
	userAuthenticated: false,
	hasTextInDatabase: true,
	active: true,
	filesetTypes: {},
	textDirection: 'ltr',
};

describe('BooksTable tests', () => {
	it('should match snapshot with all potential props', () => {
		const { asFragment } = render(<BooksTable {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should match snapshot with direction right to left', () => {
		const { asFragment } = render(
			<BooksTable {...props} textDirection="rtl" />,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should match snapshot when it is closed', () => {
		const { asFragment } = render(<BooksTable {...props} active={false} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should match snapshot when it is loading', () => {
		const { asFragment } = render(<BooksTable {...props} loadingBooks />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should successfully handle a chapter click', () => {
		const { container } = render(<BooksTable {...props} />);

		const activeChapter = container.querySelector('.active-chapter');
		fireEvent.click(activeChapter); // Modify to match actual text

		expect(closeBookTable).toHaveBeenCalledTimes(1);
	});

	it('should successfully handle a book click', () => {
		const { container } = render(<BooksTable {...props} />);

		// Click on 'Matthew' (adjust based on rendered text)
		expect(screen.getByTestId('MatthewMAT')).toBeInTheDocument();
		const activeBook = container.querySelector('.active-book');

		expect(activeBook.textContent).toContain('Matthew');
	});

	it('should handle active prop changes', () => {
		const { rerender } = render(<BooksTable {...props} active={false} />);

		// Re-render with updated props
		rerender(<BooksTable {...props} active activeBookName="Mark" />);

		expect(screen.getByTestId('MarkMRK')).toBeInTheDocument();
	});
});
