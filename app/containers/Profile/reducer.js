/*
 *
 * Profile reducer
 *
 */

import {
	SELECT_ACCOUNT_OPTION,
	USER_LOGGED_IN,
	LOG_OUT,
	SIGNUP_ERROR,
	LOGIN_ERROR,
	SOCIAL_MEDIA_LOGIN_SUCCESS,
	SOCIAL_MEDIA_LOGIN,
	ERROR_MESSAGE_VIEWED,
	CLEAR_ERROR_MESSAGE,
	RESET_PASSWORD_ERROR,
	RESET_PASSWORD_SUCCESS,
	DELETE_USER_SUCCESS,
	DELETE_USER_ERROR,
	OAUTH_ERROR,
	READ_OAUTH_ERROR,
} from './constants';

const initialState = structuredClone({
	activeOption: 'login',
	userAuthenticated: false,
	userId: '',
	loginErrorMessage: '',
	socialLoginLink: '',
	signupErrorMessage: '',
	activeDriver: '',
	userProfile: {
		email: '',
		nickname: '',
		name: '',
		avatar: '',
		verified: false,
		accounts: [],
	},
	errorMessageViewed: true,
	passwordResetError: '',
	passwordResetMessage: '',
	deleteUserError: false,
	deleteUserMessage: '',
	passwordWasReset: false,
});

function profileReducer(state = initialState, action = { type: null }) {
	switch (action.type) {
		case SOCIAL_MEDIA_LOGIN:
			return {
				...state,
				activeDriver: action.driver,
			};
		case OAUTH_ERROR:
			return {
				...state,
				oauthError: true,
				oauthErrorMessage: action.message,
			};
		case READ_OAUTH_ERROR:
			return {
				...state,
				oauthError: false,
			};
		case SELECT_ACCOUNT_OPTION:
			return {
				...state,
				activeOption: action.option,
			};
		case USER_LOGGED_IN:
			if (typeof window !== 'undefined') {
				sessionStorage.setItem(
					'bible_is_user_email',
					action.userProfile.email || '',
				);
				sessionStorage.setItem(
					'bible_is_user_nickname',
					action.userProfile.nickname || '',
				);
				sessionStorage.setItem(
					'bible_is_user_name',
					action.userProfile.name || '',
				);
			}

			return {
				...state,
				userId: action.userId,
				userProfile: action.userProfile,
				userAuthenticated: true,
			};
		case LOG_OUT:
			// Need to remove the user's id from storage when they log out
			localStorage.removeItem('bible_is_user_id');
			localStorage.removeItem('bible_is_user_email');
			localStorage.removeItem('bible_is_user_name');
			localStorage.removeItem('bible_is_user_nickname');
			sessionStorage.removeItem('bible_is_user_id');
			sessionStorage.removeItem('bible_is_user_email');
			sessionStorage.removeItem('bible_is_user_name');
			sessionStorage.removeItem('bible_is_user_nickname');
			return {
				...state,
				userId: '',
				userAuthenticated: false,
			};
		case SIGNUP_ERROR:
			return {
				...state,
				errorMessageViewed: false,
				signupErrorMessage: action.message,
			};
		case LOGIN_ERROR:
			return {
				...state,
				errorMessageViewed: false,
				loginErrorMessage: action.message,
			};
		case SOCIAL_MEDIA_LOGIN_SUCCESS:
			return {
				...state,
				socialLoginLink: action.url,
			};
		case RESET_PASSWORD_ERROR:
			return {
				...state,
				passwordResetError: action.message,
			};
		case ERROR_MESSAGE_VIEWED:
			return {
				...state,
				errorMessageViewed: true,
				deleteUserError: false,
				deleteUserMessage: '',
			};
		case RESET_PASSWORD_SUCCESS:
			return {
				...state,
				passwordResetMessage: action.message,
			};
		case CLEAR_ERROR_MESSAGE:
			return {
				...state,
				errorMessageViewed: true,
				signupErrorMessage: '',
				passwordResetError: '',
				loginErrorMessage: '',
			};
		case DELETE_USER_SUCCESS:
			localStorage.removeItem('bible_is_user_id');
			localStorage.removeItem('bible_is_user_email');
			localStorage.removeItem('bible_is_user_name');
			localStorage.removeItem('bible_is_user_nickname');
			sessionStorage.removeItem('bible_is_user_id');
			sessionStorage.removeItem('bible_is_user_email');
			sessionStorage.removeItem('bible_is_user_name');
			sessionStorage.removeItem('bible_is_user_nickname');
			return {
				...state,
				userAuthenticated: false,
				userId: '',
			};
		case DELETE_USER_ERROR:
			return {
				...state,
				deleteUserError: true,
				deleteUserMessage: action.message,
			};
		case 'GET_INITIAL_ROUTE_STATE_PROFILE':
			// return state.merge(action.profile);
			return {
				...state,
				...action.profile,
			};
		case 'persist/REHYDRATE':
			// TODO: Ask for Sam's input on this to see if I can get around it
			if (state['userId']) {
				return {
					...action.payload.profile,
					userProfile: state['userProfile'],
					userAuthenticated: state['userAuthenticated'],
					userId: state['userId'],
				};
			}
			return state;
		default:
			return state;
	}
}

export default profileReducer;
