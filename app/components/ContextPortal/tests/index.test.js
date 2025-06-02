import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ContextPortal } from '..';

jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));

jest.mock(
	'../../PopupMessage',
	() =>
		function portalPopupMessageMock({ styles, message, x, y }) {
			return (
				<div
					style={{ top: y - 50, left: x - 87.5, ...styles }}
					className={'custom-popup'}
				>
					{message ? (
						<p>{message}</p>
					) : (
						<p>
							If you believe this to be an error please{' '}
							<a
								className={'logo'}
								href={'https://support.bible.is/contact'}
								title={'https://support.bible.is/contact'}
								target={'_blank'}
								rel={'noopener'}
							>
								contact support
							</a>
							.
						</p>
					)}
				</div>
			);
		},
);

const props = {
	selectedText: 'For all have sinned and fallen short of the glory of God.',
	coordinates: { x: 150, y: 150 },
	notesActive: false,
	isIe: false,
	addHighlight: jest.fn(),
	setActiveNote: jest.fn(),
	addFacebookLike: jest.fn(),
	toggleNotesModal: jest.fn(),
	closeContextMenu: jest.fn(),
	handleAddBookmark: jest.fn(),
	setActiveNotesView: jest.fn(),
};

describe('ContextPortal Component', () => {
	it('Should render and match snapshot', () => {
		const { container } = render(<ContextPortal {...props} />);
		expect(container).toMatchSnapshot();
	});

	it('Should render and match snapshot if IE is active', () => {
		const { container } = render(<ContextPortal {...props} isIe />);
		expect(container).toMatchSnapshot();
	});

	it('Should render and match snapshot if notes menu is active', () => {
		const { container } = render(<ContextPortal {...props} notesActive />);
		expect(container).toMatchSnapshot();
	});

	it('Should render and match snapshot if popup menu is active', () => {
		const { container } = render(<ContextPortal {...props} />);
		fireEvent.click(document); // Simulating the event that opens the popup
		expect(container).toMatchSnapshot();
	});

	it('Should render and match snapshot if highlight menu is open', () => {
		const { container } = render(<ContextPortal {...props} />);
		const highlightButton = container.querySelector('#add-highlight');
		fireEvent.click(highlightButton);
		expect(container).toMatchSnapshot();
	});

	it('Should handle click events correctly', () => {
		const { getByTitle } = render(<ContextPortal {...props} />);

		const notesButton = getByTitle('Add a note');
		fireEvent.click(notesButton);
		expect(props.setActiveNotesView).toHaveBeenCalledWith('edit');
		expect(props.toggleNotesModal).toHaveBeenCalled();
		expect(props.closeContextMenu).toHaveBeenCalled();

		const bookmarkButton = getByTitle('Add a bookmark');
		fireEvent.click(bookmarkButton);
		expect(props.setActiveNotesView).toHaveBeenCalledWith('bookmarks');
		expect(props.toggleNotesModal).toHaveBeenCalled();
		expect(props.handleAddBookmark).toHaveBeenCalled();
	});
});
