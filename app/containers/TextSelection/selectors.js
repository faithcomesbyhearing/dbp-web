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
		const countryMap = substate['countries'];
		const languages = substate['languages'];
		const activeCountry = substate['activeCountryName'];
		const activeCountryLanguages = countryMap?.[activeCountry]?.['languages'];

		if (activeCountryLanguages && activeCountry !== 'ANY') {
			return languages
				.filter((language) => activeCountryLanguages.includes(language['iso']))
				.sort((a, b) => {
					if (
						activeCountryLanguages.indexOf(a['iso']) <
						activeCountryLanguages.indexOf(b['iso'])
					) {
						return -1;
					} else if (
						activeCountryLanguages.indexOf(a['iso']) >
						activeCountryLanguages.indexOf(b['iso'])
					) {
						return 1;
					} else {
						return 0;
					}
				});
		}
		// If any language then keep default sort order
		return languages;
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
