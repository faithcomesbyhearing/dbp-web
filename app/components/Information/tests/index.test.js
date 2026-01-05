import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Information } from '..';
import {
	copyrights,
	invalidCopyrights,
	invalidCopyrights2,
} from '../../../utils/testUtils/copyrightData';

jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));

describe('<Information /> component tests', () => {
	it('should match default snapshot', () => {
		const { container } = render(<Information copyrights={copyrights} />);
		expect(container).toMatchSnapshot();
	});

	it('should match snapshot with missing information', () => {
		const { container } = render(
			<Information copyrights={invalidCopyrights} />,
		);
		expect(container).toMatchSnapshot();
	});

	it('should match snapshot with missing organizations', () => {
		const { container } = render(
			<Information copyrights={invalidCopyrights2} />,
		);
		expect(container).toMatchSnapshot();
	});

	test('should open and close the information section when the button is clicked', () => {
		// Render the Information component
		const { container } = render(<Information copyrights={copyrights} />);

		// Query the toggle button by its text (provided by FormattedMessage)
		const toggleButton = screen.getByRole('button', { name: /learn more/i });

		const contentSection = container.querySelector('.copyrights-section');
		expect(contentSection).toHaveStyle('max-height: 0');

		// Click the button to open the section
		fireEvent.click(toggleButton);

		// Assert that the content section is now visible with the appropriate height
		expect(contentSection).toHaveStyle('max-height: 515px');

		// Assert that the arrow icon rotates
		const icon = container.querySelector('svg');
		expect(icon).toBeInTheDocument();

		expect(icon).toHaveClass('rotate');

		// Click the button again to close the section
		fireEvent.click(toggleButton);

		// Assert that the content section is closed again
		expect(contentSection).toHaveStyle('max-height: 0');

		// Ensure the icon no longer has the 'rotate' class
		expect(icon).not.toHaveClass('rotate');
	});

	test('should always have LTR direction regardless of parent text direction', () => {
		const { container } = render(<Information copyrights={copyrights} />);

		// Get the section element (root of Information component)
		const section = container.querySelector('section.information');

		// Assert that it has dir="ltr" attribute
		expect(section).toHaveAttribute('dir', 'ltr');
	});
});
