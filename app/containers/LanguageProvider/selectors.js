import { createSelector } from 'reselect';

/**
 * Direct selector to the languageToggle state domain
 */
const selectLanguage = (state) => state?.get ? state.get('language') : null;

/**
 * Select the language locale
 */

const makeSelectLocale = () => createSelector(
  selectLanguage,
  (languageState) => languageState?.get ? languageState.get('locale') : null
);

export {
  selectLanguage,
  makeSelectLocale,
};
