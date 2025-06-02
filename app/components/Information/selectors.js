import { createSelector } from 'reselect';

const selectHomepage = (state) => state['homepage'];

const selectCopyrights = () =>
	createSelector(selectHomepage, (home) => home['copyrights']);

export { selectCopyrights };
