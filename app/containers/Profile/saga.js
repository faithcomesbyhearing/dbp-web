import { takeLatest, call, put } from 'redux-saga/effects';
import request from 'utils/request';
import {
	// GET_USER_DATA,
	// LOAD_USER_DATA,
	LOGIN_ERROR,
	USER_LOGGED_IN,
	SEND_LOGIN_FORM,
	SIGNUP_ERROR,
	SEND_SIGNUP_FORM,
	SOCIAL_MEDIA_LOGIN,
	SOCIAL_MEDIA_LOGIN_SUCCESS,
	DELETE_USER,
	// RESET_PASSWORD,
	UPDATE_EMAIL,
	// UPDATE_PASSWORD,
	UPDATE_USER_INFORMATION,
} from './constants';

export function* sendSignUpForm({ password, email, firstName, lastName }) {
	const requestUrl = `https://api.bible.build/users?key=${process.env.DBP_API_KEY}&v=4&pretty`;
	const data = new FormData();

	data.append('email', email);
	data.append('password', password);
	data.append('name', lastName);
	data.append('nickname', firstName);
	data.append('avatar', '');

	const options = {
		method: 'POST',
		body: data,
	};
	// Todo: Make sure that the api is returning the appropriate data when this call is successful
	try {
		const response = yield call(request, requestUrl, options);

		if (response.success) {
			// console.log('res', response);

			yield put({ type: USER_LOGGED_IN, userId: response.id, userProfile: response });
		} else if (response.error) {
			// console.log('res error', response);
			const message = Object.values(response.error.message).reduce((acc, cur) => acc.concat(cur), '');
			yield put({ type: SIGNUP_ERROR, message });
			// yield put('user-login-failed', response.error.message);
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		} else if (process.env.NODE_ENV === 'production') {
			// const options = {
			// 	header: 'POST',
			// 	body: formData,
			// };
			// fetch('https://api.bible.build/error_logging', options);
		}
	}
}

export function* sendLoginForm({ password, email, stay }) {
	const requestUrl = `https://api.bible.build/users/login?key=${process.env.DBP_API_KEY}&v=4&pretty`;
	const formData = new FormData();

	formData.append('password', password);
	formData.append('email', email);

	const options = {
		method: 'POST',
		body: formData,
	};

	try {
		const response = yield call(request, requestUrl, options);

		if (response.error) {
			yield put({ type: LOGIN_ERROR, message: response.error.message });
		} else {
			yield put({ type: USER_LOGGED_IN, userId: response.id, userProfile: response });
			// May add an else that will save the id to the session so it is persisted through a page refresh
			if (stay) {
				localStorage.setItem('bible_is_user_id', response.id);
			} else {
				sessionStorage.setItem('bible_is_user_id', response.id);
			}
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		} else if (process.env.NODE_ENV === 'production') {
			// const options = {
			// 	header: 'POST',
			// 	body: formData,
			// };
			// fetch('https://api.bible.build/error_logging', options);
		}
	}
}

export function* updateEmail({ userId, email }) {
	// console.log('in update email with ', userId, email);
	const requestUrl = `https://api.bible.build/users/${userId}?key=${process.env.DBP_API_KEY}&v=4&pretty`;
	const formData = new FormData();

	formData.append('email', email);

	const options = {
		method: 'PUT',
		body: formData,
	};

	try {
		const response = yield call(request, requestUrl, options);
		// console.log('update email response', response);
		yield put({ type: 'UPDATE_EMAIL_SUCCESS', response });
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		} else if (process.env.NODE_ENV === 'production') {
			// const options = {
			// 	header: 'POST',
			// 	body: formData,
			// };
			// fetch('https://api.bible.build/error_logging', options);
		}
	}
}

export function* updateUserInformation({ userId, profile }) {
	// console.log('in update profile with ', userId, profile);
	const requestUrl = `https://api.bible.build/users/${userId}?key=${process.env.DBP_API_KEY}&v=4&pretty`;
	const formData = new FormData();
	Object.entries(profile).forEach((entry) => entry[1] && formData.set(entry[0], entry[1]));

	const options = {
		method: 'PUT',
		body: formData,
	};

	try {
		const response = yield call(request, requestUrl, options);
		// console.log('update profile response', response);
		yield put({ type: 'UPDATE_EMAIL_SUCCESS', response });
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		} else if (process.env.NODE_ENV === 'production') {
			// const options = {
			// 	header: 'POST',
			// 	body: formData,
			// };
			// fetch('https://api.bible.build/error_logging', options);
		}
	}
}

// export function* updatePassword({ userId, password }) {
// 	// console.log('in update password with ', userId, password);
// 	const requestUrl = `https://api.bible.build/users/${userId}?key=${process.env.DBP_API_KEY}&v=4&pretty`;
// 	const formData = new FormData();
//
// 	formData.append('password', password);
//
// 	const options = {
// 		method: 'PUT',
// 		body: formData,
// 	};
//
// 	try {
// 		const response = yield call(request, requestUrl, options);
// 		// console.log('update password response', response);
// 		yield put({ type: 'UPDATE_EMAIL_SUCCESS', response });
// 	} catch (err) {
// 		if (process.env.NODE_ENV === 'development') {
// 			console.error(err); // eslint-disable-line no-console
// 		} else if (process.env.NODE_ENV === 'production') {
// 			// const options = {
// 			// 	header: 'POST',
// 			// 	body: formData,
// 			// };
// 			// fetch('https://api.bible.build/error_logging', options);
// 		}
// 	}
// }

// export function* resetPassword() {
// 	const requestUrl = `https://api.bible.build/?key=${process.env.DBP_API_KEY}&v=4&pretty`;

// 	try {
// 		// const response = yield call(request, requestUrl);
// 		//
// 		// yield put('action', response);
// 	} catch (err) {
// 		if (process.env.NODE_ENV === 'development') {
// 			console.error(err); // eslint-disable-line no-console
// 		}
// 	}
// }

export function* deleteUser({ userId }) {
	// console.log('in delete user with id', userId);
	const requestUrl = `https://api.bible.build/users/${userId}?key=${process.env.DBP_API_KEY}&v=4&pretty`;
	const options = {
		method: 'DELETE',
	};

	try {
		const response = yield call(request, requestUrl, options);

		// console.log(response);
		yield put({ type: 'DELETE_USER_SUCCESS', response });
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		} else if (process.env.NODE_ENV === 'production') {
			// const options = {
			// 	header: 'POST',
			// 	body: formData,
			// };
			// fetch('https://api.bible.build/error_logging', options);
		}
	}
}

export function* socialMediaLogin({ driver }) {
	// const {
	// 	name,
	// 	email,
	// 	picture,
	// 	id,
	// 	accessToken,
	// } = res;
	const requestUrl = `https://api.bible.build/users/login/${driver}?key=${process.env.DBP_API_KEY}&v=4`;

	try {
		const response = yield call(request, requestUrl);
		// console.log('social response', response);
		if (response) {
			yield put({ type: SOCIAL_MEDIA_LOGIN_SUCCESS, url: response });
		}
	} catch (err) {
		if (err && process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		} else if (process.env.NODE_ENV === 'production') {
			// const options = {
			// 	header: 'POST',
			// 	body: formData,
			// };
			// fetch('https://api.bible.build/error_logging', options);
		}
	}
}

// Individual exports for testing
export default function* defaultSaga() {
	// yield takeLatest(GET_USER_DATA, getUserData);
	yield takeLatest(SEND_SIGNUP_FORM, sendSignUpForm);
	yield takeLatest(SEND_LOGIN_FORM, sendLoginForm);
	// yield takeLatest(UPDATE_PASSWORD, updatePassword);
	// yield takeLatest(RESET_PASSWORD, resetPassword);
	yield takeLatest(DELETE_USER, deleteUser);
	yield takeLatest(UPDATE_USER_INFORMATION, updateUserInformation);
	yield takeLatest(UPDATE_EMAIL, updateEmail);
	yield takeLatest(SOCIAL_MEDIA_LOGIN, socialMediaLogin);
}
