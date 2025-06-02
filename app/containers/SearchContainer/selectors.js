import { createSelector } from 'reselect';

/**
 * Direct selector to the searchContainer state domain
 */
const selectSearchContainerDomain = (state) => state.searchContainer;

/**
 * Other specific selectors
 */
const selectSearchResults = () =>
	createSelector(
		selectSearchContainerDomain,
		(search) => {
			const results = Array.isArray(search.searchResults)
				? search.searchResults
				: [];

			return results.reduce((acc, cur) => {
				const bookId = cur.book_id;
				// ensure we have an entry for this book
				if (!acc[bookId]) {
					acc[bookId] = {
						name: cur.book_name_alt,
						results: [],
					};
				}
				// push onto the _existing_ array
				acc[bookId].results.push(cur);
				return acc;
			}, {});
		},
	);

/**
 * Default selector used by SearchContainer
 */

const makeSelectSearchContainer = selectSearchContainerDomain;

export default makeSelectSearchContainer;
export { selectSearchContainerDomain, selectSearchResults };
