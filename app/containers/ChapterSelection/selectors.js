import { createSelector } from 'reselect';

/**
 * Other specific selectors
 */
const selectHomepageDomain = (state) => state['homepage'];

const selectActiveBookName = () =>
	createSelector(
		selectHomepageDomain,
		(substate) => substate['activeBookName'],
	);

const selectActiveChapter = () =>
	createSelector(selectHomepageDomain, (substate) => substate['activeChapter']);

export { selectActiveChapter, selectActiveBookName };
