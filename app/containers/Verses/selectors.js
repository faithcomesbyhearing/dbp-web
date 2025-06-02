import { createSelector } from 'reselect';
import { selectHomePageDomain } from '../HomePage/selectors';
/**
 * Direct selector to the verses state domain
 */
const selectVersesDomain = (state) => state['verses'];
const selectSettingsDomain = (state) => state['settings'];
const selectProfilePageDomain = (state) => state['profile'];

/**
 * Other specific selectors
 * TODO: The calls below are perfect for testing a partially applied function creator
 */
// Homepage State
const selectHighlights = () =>
	createSelector(selectHomePageDomain, (home) => home['highlights']);
const selectActiveTextId = () =>
	createSelector(selectHomePageDomain, (home) => home['activeTextId']);
const selectActiveBookId = () =>
	createSelector(selectHomePageDomain, (home) => home['activeBookId']);
const selectActiveBookName = () =>
	createSelector(selectHomePageDomain, (home) => home['activeBookName']);
const selectActiveChapter = () =>
	createSelector(selectHomePageDomain, (home) => home['activeChapter']);
const selectVerseNumber = () =>
	createSelector(selectHomePageDomain, (home) => home['verseNumber']);
const selectNotesMenuState = () =>
	createSelector(selectHomePageDomain, (home) => home['isNotesModalActive']);
const selectTextDirection = () =>
	createSelector(selectHomePageDomain, (home) => home['textDirection']);
// Settings State
const selectUserSettings = () =>
	createSelector(selectSettingsDomain, (settings) => settings['userSettings']);
// Profile State
const selectUserId = () =>
	createSelector(selectProfilePageDomain, (profile) => profile['userId']);
const selectUserAuthenticated = () =>
	createSelector(
		selectProfilePageDomain,
		(profile) => profile['userAuthenticated'],
	);
/**
 * Default selector used by Verses
 */

const makeSelectVerses = selectVersesDomain;

export default makeSelectVerses;
export {
	selectVersesDomain,
	// Homepage
	selectHighlights,
	selectActiveTextId,
	selectActiveBookId,
	selectActiveBookName,
	selectActiveChapter,
	selectVerseNumber,
	selectNotesMenuState,
	selectTextDirection,
	// Settings
	selectUserSettings,
	// Profile
	selectUserId,
	selectUserAuthenticated,
};
