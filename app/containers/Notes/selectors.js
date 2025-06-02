import { createSelector } from 'reselect';

/**
 * Direct selector to the notes state domain
 */
const selectNotesDomain = (state) => state['notes'];
const selectProfileDomain = (state) => state['profile'];
const selectHomepageDomain = (state) => state['homepage'];

/**
 * Other specific selectors
 */

const selectActiveBookName = () =>
	createSelector(selectHomepageDomain, (home) => home['activeBookName']);

const selectUserId = () =>
	createSelector(selectProfileDomain, (substate) =>
		substate ? substate['userId'] : '',
	);

const selectUserAuthenticationStatus = () =>
	createSelector(selectProfileDomain, (substate) =>
		substate ? substate['userAuthenticated'] : false,
	);

const selectHighlightedText = () =>
	createSelector(selectHomepageDomain, (homepage) => homepage['selectedText']);

const selectBooks = () =>
	createSelector(selectHomepageDomain, (substate) => substate['books']);

const selectActiveTextId = () =>
	createSelector(selectHomepageDomain, (substate) => substate['activeTextId']);

const selectActiveNote = () =>
	createSelector(selectHomepageDomain, (substate) => substate['note']);

const selectNotePassage = () =>
	createSelector([selectHomepageDomain, selectNotesDomain], (home, notes) => {
		if (notes['chapterForNote'].length > 0) {
			return notes['chapterForNote'].reduce(
				(passageText, verse) => passageText.concat(verse['verse_text']),
				'',
			);
		}
		let text = home['chapterText'];
		text = text.toJS ? text : structuredClone(text);
		const note = home['note'];
		const chapterNumber = note['chapter'];
		const verseStart = note['verse_start'];
		const verseEnd = note['verse_end'];
		const bookId = note['book_id'];

		if (!bookId || !chapterNumber || !verseStart) {
			return '';
		}

		const verses = text.filter(
			(verse) =>
				chapterNumber === verse['chapter'] &&
				verseStart <= verse['verse_start'] &&
				verseEnd >= verse['verse_end'],
		);
		const passage = verses.reduce(
			(passageText, verse) => passageText.concat(verse['verse_text']),
			'',
		);

		if (!passage) {
			return notes['chapterForNote'].reduce(
				(passageText, verse) => passageText.concat(verse.verse_text),
				'',
			);
		}

		return passage;
	});

const vernacularBookNameObject = () =>
	createSelector(selectBooks(), (books) =>
		books.reduce(
			(names, book) => ({
				...names,
				[book.book_id]: book.name ? [book.name] : [book.name_short],
			}),
			{},
		),
	);

/**
 * Default selector used by Notes
 */

const makeSelectNotes = selectNotesDomain;

export default makeSelectNotes;
export {
	selectBooks,
	selectUserId,
	selectActiveNote,
	selectNotesDomain,
	selectNotePassage,
	selectActiveTextId,
	selectHighlightedText,
	selectUserAuthenticationStatus,
	vernacularBookNameObject,
	selectActiveBookName,
};
