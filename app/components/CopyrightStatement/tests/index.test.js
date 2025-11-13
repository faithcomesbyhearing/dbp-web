import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Provides matchers like `toBeInTheDocument`
import CopyrightStatement from '..';
import { copyrights } from '../../../utils/testUtils/copyrightData';

jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));

const props = {
	organizations: copyrights.text[0].organizations,
	testament: copyrights.text[0].testament,
	type: 'text',
};

describe('CopyrightStatement component', () => {
	it('should match snapshot with valid text props', () => {
		const { container } = render(<CopyrightStatement {...props} />);
		expect(container).toMatchSnapshot();
	});

	it('should match snapshot with valid audio props', () => {
		const { container } = render(
			<CopyrightStatement
				organizations={copyrights.audio[0].organizations}
				testament={copyrights.audio[0].testament}
				type="audio"
			/>,
		);
		expect(container).toMatchSnapshot();
	});

	it('should render a logo if the organization has one', () => {
		// Render component
		render(<CopyrightStatement {...props} />);

		// Check that there is at least one image in the document
		const images = screen.queryAllByRole('img');
		expect(images.length).toBeGreaterThan(0);
	});

	it('should not render a logo if the organization does not have one', () => {
		const customProps = { ...props };
		delete customProps.organizations[0].logo;

		// Render component without logo
		render(<CopyrightStatement {...customProps} />);

		// Check that no images are rendered
		const images = screen.queryAllByRole('img');
		expect(images.length).toEqual(0);
	});
});
