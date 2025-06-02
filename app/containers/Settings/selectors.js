import { createSelector } from 'reselect';

/**
 * Direct selector to the settings state domain
 */
const selectSettingsDomain = (state) => state?.['settings'];

/**
 * Other specific selectors
 */
const selectActiveTheme = () =>
	createSelector(
		selectSettingsDomain,
		(settings) => settings?.['userSettings']?.['activeTheme'],
	);

/**
 * Default selector used by Settings
 */

const makeSelectSettings = selectSettingsDomain;

export default makeSelectSettings;
export { selectSettingsDomain, selectActiveTheme };
