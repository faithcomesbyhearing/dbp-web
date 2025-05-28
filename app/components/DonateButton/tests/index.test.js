import React from 'react';
import { render } from '@testing-library/react';
import { DonateButton } from '..';

jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));

describe('<DonateButton /> component', () => {
	it('should match snapshot of paper theme', () => {
		const { asFragment } = render(<DonateButton theme={'paper'} />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot of red theme', () => {
		const { asFragment } = render(<DonateButton theme={'red'} />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot of dark theme', () => {
		const { asFragment } = render(<DonateButton theme={'dark'} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
