import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChapterSelection } from '..';

jest.mock(
	'../../../components/BooksTable',
	() =>
		function booksTableMock() {
			return (
				<div data-testid="books-table">
					<button type="button">Genesis</button>
				</div>
			);
		},
);

// Mock the redux actions
jest.mock('../../HomePage/actions', () => ({
	setActiveChapter: jest.fn(),
	setActiveBookName: jest.fn(),
	toggleChapterSelection: jest.fn(),
}));

const dispatch = jest.fn();

const activeProps = {
	dispatch,
	active: true,
	activeBookName: 'Genesis',
};
const inactiveProps = {
	dispatch,
	active: false,
	activeBookName: 'Genesis',
};

describe('<ChapterSelection />', () => {
	it('should render with default active props', () => {
		const { container } = render(<ChapterSelection {...activeProps} />);
		expect(screen.getByTestId('books-table')).toBeInTheDocument();
		const contentSection = container.querySelector('.chapter-text-dropdown');
		expect(contentSection).toHaveStyle('display: flex');
		expect(container).toMatchSnapshot();
	});

	it('should render with default inactive props', () => {
		const { container } = render(<ChapterSelection {...inactiveProps} />);
		expect(screen.getByTestId('books-table')).toBeInTheDocument();
		// Since active is false, BooksTable should not be rendered
		const contentSection = container.querySelector('.chapter-text-dropdown');
		expect(contentSection).toHaveStyle('display: none');
		expect(container).toMatchSnapshot();
	});

	it('should update component when props change', () => {
		const { container, rerender } = render(
			<ChapterSelection {...activeProps} />,
		);
		expect(dispatch).not.toHaveBeenCalled();
		const contentActive = container.querySelector('.chapter-text-dropdown');
		expect(contentActive).toHaveStyle('display: flex');

		// Rerender with updated props (active to inactive)
		rerender(<ChapterSelection {...inactiveProps} />);
		const contentInactive = container.querySelector('.chapter-text-dropdown');
		expect(contentInactive).toHaveStyle('display: none');
	});
});
