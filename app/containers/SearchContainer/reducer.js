/*
 *
 * SearchContainer reducer
 *
 */

import {
	ADD_SEARCH_TERM,
	GET_SEARCH_RESULTS,
	LOAD_SEARCH_RESULTS,
	SEARCH_ERROR,
	STOP_LOADING,
	VIEW_ERROR,
	START_LOADING,
} from './constants';

const initialState = structuredClone({
	searchResults: [],
	lastFiveSearches: [],
	trySearchOptions: [
		{ id: 1, searchText: 'Jesus' },
		{ id: 2, searchText: 'love' },
		{ id: 3, searchText: 'prayer' },
	],
	loadingResults: false,
	showError: false,
});

function searchContainerReducer(state = initialState, action = { type: null }) {
	switch (action.type) {
		case ADD_SEARCH_TERM: {
			const term = action.searchText.toLowerCase();

			if (state.lastFiveSearches.includes(term)) {
				return {
					...state,
					loadingResults: true,
				};
			}

			// build a brand-new array (never mutate state)
			const updated = [...state.lastFiveSearches, term];

			// keep only the last 9 entries
			if (updated.length > 9) {
				updated.shift();
			}

			return {
				...state,
				lastFiveSearches: updated,
				loadingResults: true,
			};
		}
		case GET_SEARCH_RESULTS:
			return {
				...state,
				loadingResults: true,
			};
		case LOAD_SEARCH_RESULTS:
			return {
				...state,
				loadingResults: false,
				showError: false,
				searchResults: structuredClone(action.searchResults),
			};
		case SEARCH_ERROR:
			return {
				...state,
				showError: true,
				loadingResults: false,
			};
		case VIEW_ERROR:
			return {
				...state,
				showError: false,
			};
		case STOP_LOADING:
			return {
				...state,
				loadingResults: false,
			};
		case START_LOADING:
			return {
				...state,
				loadingResults: true,
			};
		default:
			return state;
	}
}

export default searchContainerReducer;
