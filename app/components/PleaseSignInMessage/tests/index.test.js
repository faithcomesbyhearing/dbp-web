import React from 'react';
import { render } from '@testing-library/react';
import { PleaseSignInMessage } from '..';

jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));

const props = {
	dispatch: jest.fn(),
	message: 'accessNotebook',
};

describe('<PleaseSignInMessage /> Component', () => {
	it('Should match the previous snapshot', () => {
		const { asFragment } = render(<PleaseSignInMessage {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
