import { takeLatest, call, all, put } from 'redux-saga/effects';
import apiProxy from '../../utils/apiProxy';
import {
	CHANGE_PICTURE,
	LOGIN_ERROR,
	USER_LOGGED_IN,
	SEND_LOGIN_FORM,
	SIGNUP_ERROR,
	SEND_SIGNUP_FORM,
	SEND_PASSWORD_RESET,
	SOCIAL_MEDIA_LOGIN,
	SOCIAL_MEDIA_LOGIN_SUCCESS,
	DELETE_USER,
	RESET_PASSWORD,
	UPDATE_EMAIL,
	RESET_PASSWORD_SUCCESS,
	RESET_PASSWORD_ERROR,
	UPDATE_USER_INFORMATION,
	DELETE_USER_SUCCESS,
	DELETE_USER_ERROR,
} from './constants';

export function* sendSignUpForm({
	password,
	email,
	firstName,
	lastName,
	wantsUpdates,
}) {
	const data = new FormData();

	data.append('email', email);
	data.append('password', password);
	data.append('name', lastName);
	data.append('first_name', firstName);
	data.append('subscribed', wantsUpdates ? '1' : '0');
	data.append('avatar', '');
	data.append('project_id', process.env.NOTES_PROJECT_ID);

	const options = {
		body: data,
	};

	try {
		const response = yield call(apiProxy.post, '/users', options, {
			pretty: true,
			project_id: process.env.NOTES_PROJECT_ID,
		});

		if (response.data) {
			yield put({
				type: USER_LOGGED_IN,
				userId: response.data.id,
				userProfile: response.data,
			});
			sessionStorage.setItem('bible_is_user_id', response.data.id);
			sessionStorage.setItem('bible_is_user_email', response.data.email);
			sessionStorage.setItem('bible_is_user_name', response.data.name);
			sessionStorage.setItem('bible_is_user_nickname', response.data.nickname);
		} else if (response.error) {
			const message = Object.values(response.error.message).reduce(
				(acc, cur) => acc.concat(cur),
				'',
			);
			yield put({ type: SIGNUP_ERROR, message });
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
	}
}

export function* sendLoginForm({ password, email, stay }) {
	const formData = new FormData();

	formData.append('password', password);
	formData.append('email', email);

	const options = {
		body: formData,
	};

	try {
		const response = yield call(apiProxy.post, '/login', options, {
			pretty: true,
			project_id: process.env.NOTES_PROJECT_ID,
		});
		if (response.error) {
			yield put({ type: LOGIN_ERROR, message: response.error.message });
		} else {
			yield put({
				type: USER_LOGGED_IN,
				userId: response.id,
				userProfile: response,
			});

			if (stay) {
				localStorage.setItem('bible_is_user_id', response.id);
				localStorage.setItem('bible_is_user_email', response.email);
				localStorage.setItem('bible_is_user_name', response.name);
				localStorage.setItem('bible_is_user_nickname', response.nickname);
			} else {
				sessionStorage.setItem('bible_is_user_id', response.id);
				sessionStorage.setItem('bible_is_user_email', response.email);
				sessionStorage.setItem('bible_is_user_name', response.name);
				sessionStorage.setItem('bible_is_user_nickname', response.nickname);
			}
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
		yield put({
			type: LOGIN_ERROR,
			message: 'Invalid credentials, please try again.',
		});
	}
}

export function* updateEmail({ userId, email }) {
	const formData = new FormData();

	formData.append('email', email);

	const options = {
		body: formData,
	};

	try {
		const response = yield call(apiProxy.put, `/users/${userId}`, options, {
			project_id: process.env.NOTES_PROJECT_ID,
		});
		yield put({ type: 'UPDATE_EMAIL_SUCCESS', response });
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
	}
}

export function* updateUserInformation({ userId, profile }) {
	const formData = new FormData();
	Object.entries(profile).forEach(
		(entry) => entry[1] && formData.set(entry[0], entry[1]),
	);

	const options = {
		body: formData,
	};

	try {
		const response = yield call(apiProxy.put, `/users/${userId}`, options, {
			project_id: process.env.NOTES_PROJECT_ID,
		});
		yield put({ type: 'UPDATE_EMAIL_SUCCESS', response });
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
	}
}

// Route: /users/{id}
// Method: POST
// Extra Header: _method: PUT
// Content Type: form-data
export function* changePicture({ userId, avatar }) {
	const requestData = new FormData();
	requestData.append('avatar', avatar);
	requestData.append('_method', 'PUT');

	const requestOptions = {
		_method: 'PUT',
		body: requestData,
	};

	try {
		const response = yield call(apiProxy.post, `/users/${userId}`, requestOptions);

		if (response.success) {
			// console.log('picture was saved successfully');
		} else {
			// console.log('picture was not saved', response);
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			/* eslint-disable no-console */
			console.error('Error saving picture: ', err);
			/* eslint-enable no-console */
		}
	}
}

export function* sendResetPassword({ password, userAccessToken, email }) {
	const formData = new FormData();
	formData.append('email', email);
	formData.append('project_id', process.env.NOTES_PROJECT_ID);
	formData.append('new_password', password);
	formData.append('new_password_confirmation', password);
	formData.append('token_id', userAccessToken);

	const options = {
		body: formData,
	};

	try {
		const response = yield call(
			apiProxy.post,
			'/users/password/reset',
			options,
			{
				project_id: process.env.NOTES_PROJECT_ID,
			},
		);

		yield put({
			type: USER_LOGGED_IN,
			userId: response.id,
			userProfile: response,
		});
		document.cookie = `bible_is_email=${response.email};path=/`;
		document.cookie = `bible_is_name=${response.name};path=/`;
		document.cookie = `bible_is_first_name=${response.first_name};path=/`;
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.warn('error in reset password', err); // eslint-disable-line no-console
		}
		yield put({
			type: RESET_PASSWORD_ERROR,
			message:
				'There was a problem resetting your password. Please try again or contact support.',
		});
	}
}

export function* resetPassword({ email }) {
	const { href, protocol, hostname, pathname } = window.location;
	const resetPath = href || `${protocol}//${hostname}${pathname}`;
	// Probably want to somehow get the language of the currently active text or something to use here as a fallback
	const browserLanguage =
		window && window.navigator ? window.navigator.language : 'en';

	const formData = new FormData();
	formData.append('email', email);
	formData.append('project_id', process.env.NOTES_PROJECT_ID);
	formData.append('iso', browserLanguage);
	formData.append('reset_path', resetPath);

	const options = {
		body: formData,
	};

	try {
		const response = yield call(
			apiProxy.post,
			'/users/password/email',
			options,
			{
				project_id: process.env.NOTES_PROJECT_ID,
			},
		);

		if (response.error) {
			yield put({
				type: RESET_PASSWORD_ERROR,
				message: response.error.message,
			});
		} else {
			yield put({
				type: RESET_PASSWORD_SUCCESS,
				message:
					'Thank you! An email with instructions has been sent to your account.',
			});
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
		yield put({
			type: RESET_PASSWORD_ERROR,
			message: 'There was a problem sending your email. Please try again. ',
		});
	}
}

export function* deleteUser({ userId }) {
	try {
		const response = yield call(apiProxy.delete, `/users/${userId}`, {
			project_id: process.env.NOTES_PROJECT_ID,
		});

		yield put({ type: DELETE_USER_SUCCESS, response });
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
		yield put({
			type: DELETE_USER_ERROR,
			message: 'There was an error deleting your account.',
		});
	}
}

export function* socialMediaLogin({ driver }) {
	const params = {
		project_id: process.env.NOTES_PROJECT_ID,
	};

	if (process.env.NODE_ENV === 'development') {
		params.alt_url = process.env.NODE_ENV === 'development';
	}

	try {
		const response = yield call(apiProxy.get, `/login/${driver}`, params);

		if (response) {
			yield put({ type: SOCIAL_MEDIA_LOGIN_SUCCESS, url: response });
		}
	} catch (err) {
		if (err && process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
	}
}

// Individual exports for testing
export default function* defaultSaga() {
	yield all([
		takeLatest(SEND_SIGNUP_FORM, sendSignUpForm),
		takeLatest(SEND_LOGIN_FORM, sendLoginForm),
		takeLatest(SEND_PASSWORD_RESET, sendResetPassword),
		takeLatest(RESET_PASSWORD, resetPassword),
		takeLatest(DELETE_USER, deleteUser),
		takeLatest(UPDATE_USER_INFORMATION, updateUserInformation),
		takeLatest(UPDATE_EMAIL, updateEmail),
		takeLatest(SOCIAL_MEDIA_LOGIN, socialMediaLogin),
		takeLatest(CHANGE_PICTURE, changePicture),
	]);
}
