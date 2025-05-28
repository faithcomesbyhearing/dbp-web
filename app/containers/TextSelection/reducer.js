/*
 *
 * TextSelection reducer
 *
 */

import { INIT_APPLICATION } from '../HomePage/constants';
import {
	LOAD_TEXTS,
	LOAD_COUNTRY,
	LOAD_COUNTRIES,
	SET_COUNTRY_NAME,
	SET_LANGUAGES,
	SET_ISO_CODE,
	SET_VERSION_LIST_STATE,
	SET_LANGUAGE_LIST_STATE,
	SET_COUNTRY_LIST_STATE,
	GET_DBP_TEXTS,
	GET_LANGUAGES,
	GET_COUNTRIES,
	LOAD_COUNTRIES_ERROR,
	LOAD_VERSION_FOR_LANGUAGE,
} from './constants';

const initialState = structuredClone({
	country: {},
	countries: {},
	texts: [],
	languages: [],
	countryLanguages: [],
	initialBookId: 'GEN',
	activeIsoCode: 'eng',
	activeLanguageName: '',
	activeCountryName: 'ANY',
	activeLanguageCode: 17045,
	versionListActive: true,
	loadingVersions: false,
	loadingCountries: false,
	loadingLanguages: false,
	countryListActive: false,
	languageListActive: false,
	loadingLanguageVersion: false,
	finishedLoadingCountries: false,
});

function textSelectionReducer(state = initialState, action = { type: null }) {
	switch (action.type) {
		case LOAD_VERSION_FOR_LANGUAGE:
			return {
				...state,
				loadingLanguageVersion: action.state,
			};
		case LOAD_COUNTRIES_ERROR:
			return {
				...state,
				finishedLoadingCountries: true,
			};
		case INIT_APPLICATION:
			return {
				...state,
				loadingCountries: true,
				loadingLanguages: true,
				loadingVersions: true,
			};
		case LOAD_COUNTRY:
			return {
				...state,
				country: structuredClone(action.country),
			};
		case GET_COUNTRIES:
			return {
				...state,
				loadingCountries: true,
				finishedLoadingCountries: false,
			};
		case GET_LANGUAGES:
			return {
				...state,
				loadingLanguages: true,
			};
		case GET_DBP_TEXTS:
			return {
				...state,
				loadingVersions: true,
			};
		case SET_LANGUAGE_LIST_STATE:
			return {
				...state,
				countryListActive: false,
				versionListActive: false,
				languageListActive: !state['languageListActive'],
			};
		case SET_VERSION_LIST_STATE:
			return {
				...state,
				countryListActive: false,
				languageListActive: false,
				versionListActive: !state['versionListActive'],
			};
		case SET_COUNTRY_LIST_STATE:
			return {
				...state,
				versionListActive: false,
				languageListActive: false,
				countryListActive: !state['countryListActive'],
			};
		case LOAD_TEXTS:
			return {
				...state,
				loadingVersions: false,
				texts: structuredClone(action.texts),
			};
		case LOAD_COUNTRIES:
			return {
				...state,
				loadingCountries: false,
				countries: structuredClone(action.countries),
			};
		case SET_LANGUAGES:
			return {
				...state,
				loadingLanguages: false,
				languages: structuredClone(action.languages),
			};
		case SET_COUNTRY_NAME:
			return {
				...state,
				countryLanguages: action.languages,
				activeCountryName: action.name,
			};
		case SET_ISO_CODE:
			return {
				...state,
				activeLanguageName: action.name,
				activeIsoCode: action.iso,
				activeLanguageCode: action.languageCode,
			};
		default:
			return state;
	}
}

export default textSelectionReducer;
