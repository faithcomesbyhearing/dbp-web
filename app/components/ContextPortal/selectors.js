import { createSelector } from 'reselect';
const selectHomepage = (state) => state['homepage'];
const selectIeState = createSelector(
	selectHomepage,
	(homepage) => homepage['isIe'],
);

export { selectIeState };
