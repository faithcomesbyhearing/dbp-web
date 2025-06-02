import React from 'react';
import { render } from '@testing-library/react';
import PasswordReset from '..';

const props = {
	popupOpen: false,
	message: 'Success!',
	openPopup: jest.fn(),
	resetPassword: jest.fn(),
	popupCoords: {
		x: 150,
		y: 150,
	},
};

describe('<PasswordReset /> Component', () => {
	it('Should match the previous snapshot', () => {
		const { asFragment } = render(<PasswordReset {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
