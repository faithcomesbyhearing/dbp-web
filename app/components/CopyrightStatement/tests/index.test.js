import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Provides matchers like `toBeInTheDocument`
import CopyrightStatement from '..';
import { copyrights } from '../../../utils/testUtils/copyrightData';

/* eslint-disable react/prop-types */
jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));
/* eslint-enable react/prop-types */

const props = {
	organizations: copyrights.newTestament.text.organizations,
	testament: 'new_testament',
	type: 'text',
};

describe('CopyrightStatement component', () => {
	it('should match snapshot with valid new testament text props', () => {
		const { container } = render(<CopyrightStatement {...props} />);
		expect(container).toMatchSnapshot();
	});

	it('should match snapshot with valid new testament audio props', () => {
		const { container } = render(
			<CopyrightStatement
				organizations={copyrights.newTestament.audio.organizations}
				testament="new_testament"
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
