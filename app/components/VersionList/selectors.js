import { createSelector } from 'reselect';

const getHomepageState = (state) => state['homepage'];

const selectActiveBookId = () =>
	createSelector(getHomepageState, (homepage) => homepage['activeBookId']);

const selectActiveChapter = () =>
	createSelector(getHomepageState, (homepage) => homepage['activeChapter']);

export { selectActiveBookId, selectActiveChapter };
