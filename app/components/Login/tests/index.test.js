import React from 'react';
import { render } from '@testing-library/react';
import Login from '../index';

jest.mock(
	'../../../containers/GoogleAuthentication',
	() =>
		function googleAuthenticationMock(props) {
			return (
				<div
					role={'button'}
					id={'google-login'}
					tabIndex={0}
					className={'google'}
					onClick={props.handleSocialLogin}
				>
					Sign in with Google
				</div>
			);
		},
);
jest.mock(
	'../../../containers/FacebookAuthentication',
	() =>
		function facebookAuthenticationMock(props) {
			return (
				<div
					role={'button'}
					id={'facebook-login'}
					tabIndex={0}
					className={'facebook'}
					onClick={props.handleSocialLogin}
				>
					Sign in with Facebook
				</div>
			);
		},
);

const props = {
	sendLoginForm: jest.fn(),
	socialMediaLogin: jest.fn(),
	viewErrorMessage: jest.fn(),
	selectAccountOption: jest.fn(),
	readOauthError: jest.fn(),
	socialLoginLink: 'google',
	oauthErrorMessage: '',
	errorMessage: '',
	activeDriver: 'google',
	oauthError: false,
	errorMessageViewed: false,
};

describe('<Login /> component', () => {
	it('should match snapshot with expected props', () => {
		const { asFragment } = render(<Login {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
