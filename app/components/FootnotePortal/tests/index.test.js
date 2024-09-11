import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // for additional matchers like toHaveAttribute
import FootnotePortal from '..';

// Mocks
Object.defineProperty(document, 'getElementById', {
	value: (input) => {
		const el = document.createElement('div');
		el.id = input;
		document.body.appendChild(el);
		return el;
	},
});

const props = {
	message: 'Please Login.',
	coords: { x: 15, y: 15 },
	closeFootnote: jest.fn(),
};

describe('FootnotePortal component', () => {
	beforeEach(() => {
		// Make sure to have the portal target available in the DOM
		document.body.innerHTML = '<div id="__next"></div>';
	});

	afterEach(() => {
		// Clean up the DOM after each test
		document.body.innerHTML = '';
	});

	it('should match snapshot with expected props', () => {
		const { asFragment } = render(<FootnotePortal {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should display the correct message', () => {
		render(<FootnotePortal {...props} />);
		expect(screen.getByText('Please Login.')).toBeInTheDocument();
	});

	it('should call closeFootnote when the close button is clicked', () => {
		render(<FootnotePortal {...props} />);
		const closeButton = screen.getByRole('button', { name: /x/i });
		fireEvent.click(closeButton);
		expect(props.closeFootnote).toHaveBeenCalledTimes(1);
	});
});
