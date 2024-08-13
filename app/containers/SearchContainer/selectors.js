import { createSelector } from 'reselect';

/**
 * Direct selector to the searchContainer state domain
 */
const selectSearchContainerDomain = (state) => state?.['searchContainer'];

/**
 * Other specific selectors
 */
const selectSearchResults = () =>
	createSelector(selectSearchContainerDomain, (search) => {
		const results = search['searchResults'];
		return (
			results &&
			results.reduce((acc, cur) => {
				// each different book_id needs to have an array of its results
				const cbook = cur['book_id'];
				if (acc[cbook]) {
					return {
						...acc,

						cbook: {
							...acc.cbook,
							results: acc?.[cbook]?.['results'].push(cur),
						},
					};
				}
				return {
					...acc,

					cbook: {
						...acc.cbook,
						results: structuredClone([cur]),
						name: cur['book_name_alt'],
					},
				};
			}, structuredClone({}))
		);
	});

/**
 * Default selector used by SearchContainer
 */

const makeSelectSearchContainer = selectSearchContainerDomain;

export default makeSelectSearchContainer;
export { selectSearchContainerDomain, selectSearchResults };
