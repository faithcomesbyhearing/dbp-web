/*
 *
 * LanguageProvider reducer
 *
 */

import { CHANGE_LOCALE, DEFAULT_LOCALE } from './constants';

const initialState = structuredClone({
	locale: DEFAULT_LOCALE,
});

function languageProviderReducer(
	state = initialState,
	action = { type: null },
) {
	switch (action.type) {
		case CHANGE_LOCALE:
			return {
				...state,
				locale: action.locale,
			};
		default:
			return state;
	}
}

export default languageProviderReducer;
