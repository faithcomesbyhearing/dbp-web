import {
	createSelectorCreator,
	defaultMemoize,
	createSelector,
} from 'reselect';
import { fromJS, is, isImmutable } from 'immutable';
// TODO: If there seems to be some state missing check to make sure the equality check isn't failing
// create a "selector creator" that uses lodash.isEqual instead of ===
const createDeepEqualSelector = createSelectorCreator(defaultMemoize, is);
const selectHomePageDomain = (state) => state.get('homepage');
const selectSettingsDomain = (state) => state.get('settings');
const selectHomepageText = (state) => state.getIn(['homepage', 'chapterText']);
const selectProfilePageDomain = (state) => state.get('profile');
const selectFormattedTextSource = (state) =>
	state.getIn(['homepage', 'formattedSource']);
const selectChapterDataFromState = (state) =>
	state.getIn(['homepage', 'formattedJsonSource']);
const selectCrossReferenceState = (state) =>
	state.getIn([
		'settings',
		'userSettings',
		'toggleOptions',
		'crossReferences',
		'active',
	]);
const selectAudioType = () =>
	createSelector(selectHomePageDomain, (home) => home.get('audioType'));
const selectAvailableAudioTypes = () =>
	createSelector(selectHomePageDomain, (home) => {
		const availableAudioTypes = home.get('availableAudioTypes');
		return Array.isArray(availableAudioTypes)
			? availableAudioTypes
			: availableAudioTypes.toJS();
	});
const selectNotes = (state) => state.get('notes');
const selectActiveNotesView = () =>
	createSelector(selectNotes, (notes) => notes?.get('activeChild'));
const selectUserNotes = () =>
	createDeepEqualSelector(
		[selectNotes, selectHomePageDomain, selectProfilePageDomain],
		(notes, home, profile) => {
			const activeTextId = home.get('activeTextId');
			const bookId = home.get('activeBookId');
			const chapter = home.get('activeChapter');
			let text = home.get('chapterText');
			text = text.toJS ? text : fromJS(text);
			const profAuth = profile.get('userAuthenticated');
			const profUser = profile.get('userId');
			// TODO: Fix this once the api is functioning properly
			// Should not need to filter because I am requesting only the notes/bookmarks for this chapter
			const filteredNotes = notes
				? notes
						.get('userNotes')
						.filter(
							(note) =>
								note.get('book_id') === bookId &&
								note.get('chapter') === chapter &&
								note.get('bible_id') === activeTextId,
						)
				: null;

			const filteredBookmarks = notes
				? notes
						.get('chapterBookmarks')
						.filter(
							(note) =>
								note.get('book_id') === bookId &&
								note.get('chapter') === chapter &&
								note.get('bible_id') === activeTextId,
						)
				: null;
			const bookmarks = filteredBookmarks?.toJS
				? filteredBookmarks.toJS()
				: filteredBookmarks;
			const userNotes = filteredNotes?.toJS
				? filteredNotes.toJS()
				: filteredNotes;

			if (!text) {
				return {
					text: [],
					userNotes,
					bookmarks,
				};
			}
			// If the user isn't authorized then there will not be any notes or bookmarks and I can just end the function here
			if (!profAuth && !profUser) {
				return {
					text: Array.isArray(text) ? text : text.toJS(),
					userNotes,
					bookmarks,
				};
			}
			let newText = [];
			const versesWithNotes = {};

			filteredNotes?.forEach((n, ni) => {
				let iToSet = 0;
				const verse = text.find((t, i) => {
					const textVerseStart = t.get ? t.get('verse_start') : t.verse_start;
					const noteVerseStart = n.get ? n.get('verse_start') : n.verse_start;

					if (parseInt(textVerseStart, 10) === noteVerseStart) {
						iToSet = i;
					}
					return parseInt(textVerseStart, 10) === noteVerseStart;
				});
				if (verse) {
					// Need to change this since the notes will be allowed to be null
					// Eventually there will be two separate calls so I can have two piece of state
					const verseTextStart = isImmutable(verse)
						? verse.get('verse_start')
						: verse.verse_start;
					if (n.get('notes') && !versesWithNotes[verseTextStart]) {
						newText = newText.size
							? newText.setIn([iToSet, 'hasNote'], true)
							: text.setIn([iToSet, 'hasNote'], true);
						newText = newText.size
							? newText.setIn([iToSet, 'noteIndex'], ni)
							: text.setIn([iToSet, 'noteIndex'], ni);
						versesWithNotes[verseTextStart] = true;
					}
				}
			});
			filteredBookmarks?.forEach((bookmark, ni) => {
				let iToSet = 0;
				const verse = text.find((t, i) => {
					const textVerseStart = t.get ? t.get('verse_start') : t.verse_start;
					const bookmarkVerseStart = bookmark.get
						? bookmark.get('verse')
						: n.verse;

					if (parseInt(textVerseStart, 10) === bookmarkVerseStart) {
						iToSet = i;
					}
					return parseInt(textVerseStart, 10) === bookmarkVerseStart;
				});
				if (verse) {
					newText = newText.size
						? newText.setIn([iToSet, 'hasBookmark'], true)
						: text.setIn([iToSet, 'hasBookmark'], true);
					newText = newText.size
						? newText.setIn([iToSet, 'bookmarkIndex'], ni)
						: text.setIn([iToSet, 'bookmarkIndex'], ni);
				}
			});

			const textFinal = text.toJS ? text.toJS() : text;

			return {
				text: newText.size ? newText.toJS() : textFinal,
				userNotes,
				bookmarks,
			};
		},
	);

const selectMenuOpenState = () =>
	createDeepEqualSelector(
		selectHomePageDomain,
		(home) =>
			home.get('isChapterSelectionActive') ||
			home.get('isProfileActive') ||
			home.get('isSettingsModalActive') ||
			home.get('isNotesModalActive') ||
			home.get('isSearchModalActive') ||
			home.get('isVersionSelectionActive'),
	);

const selectUserId = () =>
	createDeepEqualSelector(selectProfilePageDomain, (profile) =>
		profile.get('userId'),
	);

const selectAuthenticationStatus = () =>
	createDeepEqualSelector(selectProfilePageDomain, (profile) =>
		profile.get('userAuthenticated'),
	);

const selectChapterJson = () =>
	createDeepEqualSelector(selectChapterDataFromState, (rawData) => {
		// ... (Parsing and validation logic as in previous responses)
		if (!rawData) return null;
		try {
			const jsonData =
				typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
			// Add validation if needed
			if (!jsonData?.sequence || !Array.isArray(jsonData.sequence.blocks)) {
				console.error('Invalid chapter JSON structure:', jsonData); // eslint-disable-line no-console
				return null;
			}
			return jsonData;
		} catch (error) {
			console.error('Failed to parse chapter JSON:', error); // eslint-disable-line no-console
			return null;
		}
	});
// TODO: Reduce the number of times the below function is called
// I will likely want to put all manipulations to the formatted text into this selector
const selectFormattedSource = () =>
	createDeepEqualSelector(
		[selectFormattedTextSource, selectCrossReferenceState],
		(source, hasCrossReferences) => {
			// Todo: Get rid of all dom manipulation in this selector because it is really gross
			// Todo: run all of the parsing in this function once the source is obtained
			// Todo: Keep the selection of the single verse and the footnotes here
			// Pushing update with the formatted text working but not the footnotes
			if (!source) {
				return { main: '', footnotes: {} };
			}

			const sourceWithoutNewlines = source.replace(/[\n\r]/g, '');
			const chapterStart = sourceWithoutNewlines.indexOf('<div class="chapter');
			const chapterEnd = sourceWithoutNewlines.indexOf(
				'<div class="footnotes">',
				chapterStart,
			);
			const footnotesStart = sourceWithoutNewlines.indexOf(
				'<div class="footnotes">',
			);
			const footnotesEnd = sourceWithoutNewlines.indexOf(
				'<div class="footer">',
				footnotesStart,
			);
			const footnoteSource = sourceWithoutNewlines.slice(
				footnotesStart,
				footnotesEnd,
			);
			const main = sourceWithoutNewlines
				.slice(chapterStart, chapterEnd)
				.replace(/v-num v-[0-9]+">/g, '$&&#160;');
			if (!hasCrossReferences) {
				const mainWithoutCRs = main.replace(
					/<span class=['"]note['"](.*?)<\/span>/g,
					'',
				);

				return { main: mainWithoutCRs, footnotes: {}, footnoteSource };
			}
			return { main, footnotes: {}, footnoteSource };
		},
	);

/**
 * Other specific selectors
 */

const selectSettings = () =>
	createDeepEqualSelector(selectSettingsDomain, (substate) =>
		substate.get('userSettings'),
	);
// TODO: May need to remove toJS if the application is showing signs of slowness
// I dont remember why I was doing this.......... ... .. ... ... -_-
const selectChapterText = () =>
	createDeepEqualSelector(selectHomepageText, (text) =>
		text
			.map((verse) => verse.set('verse_text', `${verse.get('verse_text')}`))
			.toJS(),
	);

/**
 * Default selector used by HomePage
 */

const makeSelectHomePage = () =>
	createDeepEqualSelector(selectHomePageDomain, (substate) => substate?.toJS());

export default makeSelectHomePage;
export {
	selectHomePageDomain,
	selectSettings,
	selectFormattedSource,
	selectChapterJson,
	selectMenuOpenState,
	selectAuthenticationStatus,
	selectUserId,
	selectChapterText,
	selectUserNotes,
	selectAudioType,
	selectActiveNotesView,
	selectAvailableAudioTypes,
};
