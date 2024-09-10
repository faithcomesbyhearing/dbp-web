import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountSettings from '../index';

/* eslint-disable react/prop-types */
jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));
jest.mock('../../PopupMessage', () => function accountSettingsPopupMessageMock({ message }) {
  	return <span id={'popup-message'}>{message}</span>;
});
/* eslint-enable react/prop-types */

const logout = jest.fn(() => 'Logging out');
const changePicture = jest.fn(() => 'Changing Picture');
const completeProps = {
	logout,
	changePicture,
	profile: {
		email: 'jesse@dbs.org',
		nickname: 'J',
		name: 'Jesse',
		avatar: '',
		popupOpen: false,
	},
};
const incompleteProps = {
	logout,
	changePicture,
	profile: {
		email: '',
		nickname: '',
		name: '',
		avatar: '',
		popupOpen: false,
	},
};

describe('AccountSettings component', () => {
	it('should match the snapshot with a full profile', () => {
		const { container } = render(<AccountSettings {...completeProps} />);
		expect(container).toMatchSnapshot();
	});

	it('should match the snapshot without a full profile', () => {
		const { container } = render(<AccountSettings {...incompleteProps} />);
		expect(container).toMatchSnapshot();
	});

	it('should match the snapshot with the popup open', () => {
		const { container } = render(<AccountSettings {...completeProps} popupOpen />);
		expect(container).toMatchSnapshot();
	});

	it('should handle email change', () => {
		render(<AccountSettings {...completeProps} />);

		const input = screen.getByPlaceholderText('emailaddress@mail.com');
		const newEmail = 'testemail@change.org';

		// Simulate changing the input value
		fireEvent.change(input, { target: { value: newEmail } });

		// Check if the input value has changed
		expect(input.value).toBe(newEmail);
	});

	it('should trigger logout function on button click', () => {
		render(<AccountSettings {...completeProps} />);

		const logoutButton = screen.getByText('Logout'); // Assuming 'Logout' is the button text in your FormattedMessage

		// Simulate a click on the logout button
		fireEvent.click(logoutButton);

		// Assert that the logout function was called
		expect(logout).toHaveBeenCalled();
	});
});
