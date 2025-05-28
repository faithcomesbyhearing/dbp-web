import { createSelector } from 'reselect';

const selectHomepageDomain = (state) => state['homepage'];

// TODO: Refactor from using toJS() to using immutable maps
const selectBooks = createSelector(selectHomepageDomain, (substate) => {
	const splitBooks = {};
	const books = substate['books'];
	const testamentMap = substate['testaments'];
	books.forEach((book) => {
		if (splitBooks[testamentMap[book.get ? book['book_id'] : book.book_id]]) {
			splitBooks[testamentMap[book.get ? book['book_id'] : book.book_id]].push(
				book,
			);
		} else {
			splitBooks[testamentMap[book.get ? book['book_id'] : book.book_id]] = [
				book,
			];
		}
	});

	if (Object.keys(splitBooks).length) {
		return structuredClone(splitBooks);
	}
	// Fallback to try and prevent app from breaking
	return books;
});

const selectActiveTextId = createSelector(
	selectHomepageDomain,
	(substate) => substate['activeTextId'],
);

const selectActiveBookName = createSelector(
	selectHomepageDomain,
	(substate) => substate['activeBookName'],
);

const selectActiveChapter = createSelector(
	selectHomepageDomain,
	(substate) => substate['activeChapter'],
);

const selectAudioObjects = createSelector(
	selectHomepageDomain,
	(substate) => substate['audioObjects'],
);

const selectHasTextInDatabase = createSelector(
	selectHomepageDomain,
	(substate) => substate['hasTextInDatabase'],
);

const selectFilesetTypes = createSelector(
	selectHomepageDomain,
	(substate) => substate['filesetTypes'],
);

const selectLoadingBookStatus = createSelector(
	selectHomepageDomain,
	(substate) => substate['loadingBooks'],
);

export {
	selectActiveTextId,
	selectBooks,
	selectActiveBookName,
	selectActiveChapter,
	selectAudioObjects,
	selectHasTextInDatabase,
	selectFilesetTypes,
	selectLoadingBookStatus,
};
