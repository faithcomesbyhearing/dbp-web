import { createSelector } from 'reselect';

/**
 * Direct selector to the textSelection state domain
 */
const selectTextSelectionDomain = (state) => state['textSelection'];
const selectHomepageDomain = (state) => state['homepage'];
/**
 * Other specific selectors
 */
const selectHomepageData = () =>
	createSelector(selectHomepageDomain, (homepage) => ({
		activeBookName: homepage['activeBookName'],
		activeTextId: homepage['activeTextId'],
		initialIsoCode: homepage['defaultLanguageIso'],
		initialLanguageName: homepage['defaultLanguageName'],
		initialLanguageCode: homepage['defaultLanguageCode'],
	}));

const selectCountries = () =>
	createSelector(
		selectTextSelectionDomain,
		(substate) => substate['countries'],
	);

const selectTexts = () =>
	createSelector(selectTextSelectionDomain, (substate) => substate['texts']);

const selectLanguages = () =>
	createSelector(selectTextSelectionDomain, (substate) => {
		const countryMap = Array.isArray(substate.countries)  ? substate.countries   : [];
		const languages = Array.isArray(substate.languages)  ? substate.languages  : [];
		const activeCountry = substate.activeCountryName || '';
		// If there is no “active” country or it’s literally “ANY”, don’t filter—just return entire list:
		if (activeCountry === 'ANY') {
			return languages;
		}

		// 1) Find the entry in countryMap whose name matches activeCountry:
		const countryEntry = countryMap.find((c) => c.name === activeCountry);
		if (!countryEntry || !Array.isArray(countryEntry.languages)) {
			// No matching country or no .languages array → just return the full languages array:
			return languages;
		}

		const activeIsos = countryEntry.languages;
		// 2) Build a quick lookup table to remember each ISO’s position:
		//    e.g. { 'en': 0, 'es': 1, 'fr': 2, … }
		const isoIndex = activeIsos.reduce((acc, iso, idx) => {
			acc[iso] = idx;
			return acc;
		}, {});

		// 3) Filter out any language whose .iso isn’t in the “activeIsos” list,
		//    then sort by that same ordering.
		return languages
			.filter((lang) => Object.hasOwn(isoIndex, lang.iso))
			.sort((a, b) => isoIndex[a.iso] - isoIndex[b.iso]);
	});

/**
 * Default selector used by TextSelection
 */

const makeSelectTextSelection = selectTextSelectionDomain;

export default makeSelectTextSelection;
export {
	selectTextSelectionDomain,
	selectTexts,
	selectLanguages,
	selectCountries,
	selectHomepageData,
};
