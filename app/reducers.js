/**
 * Combine all reducers without Immutable.js, using Redux Toolkit (which includes Immer internally)
 */
import { combineReducers } from '@reduxjs/toolkit';

import languageProviderReducer from './containers/LanguageProvider/reducer';
import profileReducer from './containers/Profile/reducer';
import homepageReducer from './containers/HomePage/reducer';
import videoPlayerReducer from './containers/VideoPlayer/reducer';
import settingsReducer from './containers/Settings/reducer';
import searchContainerReducer from './containers/SearchContainer/reducer';

// Initial routing state as plain JS object
const routeInitialState = { location: null };

/**
 * Merge route into the global application state
 */
function routeReducer(state = routeInitialState, action = { type: null }) {
	switch (action.type) {
		case 'persist/PERSIST':
			return { ...state, location: action.payload };
		default:
			return state;
	}
}

/**
 * Creates the main reducer with the dynamically injected ones.
 * Now uses plain JS objects, drops redux-immutable & immutable entirely.
 */
export default function createReducer(injectedReducers = {}) {
	return combineReducers({
		route: routeReducer,
		profile: profileReducer,
		language: languageProviderReducer,
		homepage: homepageReducer,
		videoPlayer: videoPlayerReducer,
		settings: settingsReducer,
		searchContainer: searchContainerReducer,
		...injectedReducers,
	});
}
