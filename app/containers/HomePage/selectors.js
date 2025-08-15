import { createSelector } from 'reselect';

// Basic domain selectors
const selectHomePageDomain = (state) => state.homepage;

// individual domain selectors
export const selectActiveTextId = createSelector(
	selectHomePageDomain,
	(state) => state.activeTextId,
);
export const selectActiveBookId = createSelector(
	selectHomePageDomain,
	(state) => state.activeBookId,
);
export const selectActiveChapter = createSelector(
	selectHomePageDomain,
	(state) => state.activeChapter,
);
export const selectActiveBookName = createSelector(
	selectHomePageDomain,
	(state) => state.activeBookName,
);
export const selectActiveFilesets = createSelector(
	selectHomePageDomain,
	(state) => state.activeFilesets,
);
export const selectActiveTextName = createSelector(
	selectHomePageDomain,
	(state) => state.activeTextName,
);
export const selectActiveFilesetId = createSelector(
	selectHomePageDomain,
	(state) => state.activeFilesetId,
);
export const selectIsProfileActive = createSelector(
	selectHomePageDomain,
	(state) => state.isProfileActive,
);
export const selectBooks = createSelector(
	selectHomePageDomain,
	(state) => state.books,
);
export const selectAudioPlayerState = createSelector(
	selectHomePageDomain,
	(state) => state.audioPlayerState,
);
export const selectIsNotesModalActive = createSelector(
	selectHomePageDomain,
	(state) => state.isNotesModalActive,
);
export const selectIsSearchModalActive = createSelector(
	selectHomePageDomain,
	(state) => state.isSearchModalActive,
);
export const selectIsSettingsModalActive = createSelector(
	selectHomePageDomain,
	(state) => state.isSettingsModalActive,
);
export const selectIsVersionSelectionActive = createSelector(
	selectHomePageDomain,
	(state) => state.isVersionSelectionActive,
);
export const selectIsChapterSelectionActive = createSelector(
	selectHomePageDomain,
	(state) => state.isChapterSelectionActive,
);
export const selectUserAgent = createSelector(
	selectHomePageDomain,
	(state) => state.userAgent,
);
export const selectLoadingAudio = createSelector(
	selectHomePageDomain,
	(state) => state.loadingAudio,
);
export const selectLoadingNewChapterText = createSelector(
	selectHomePageDomain,
	(state) => state.loadingNewChapterText,
);
export const selectChapterTextLoadingState = createSelector(
	selectHomePageDomain,
	(state) => state.chapterTextLoadingState,
);
export const selectChangingVersion = createSelector(
	selectHomePageDomain,
	(state) => state.changingVersion,
);
export const selectVideoPlayerOpen = createSelector(
	selectHomePageDomain,
	(state) => state.videoPlayerOpen,
);
export const selectHasVideo = createSelector(
	selectHomePageDomain,
	(state) => state.hasVideo,
);
export const selectTextDirection = createSelector(
	selectHomePageDomain,
	(state) => state.textDirection,
);
export const selectMatch = createSelector(
	selectHomePageDomain,
	(state) => state.match,
);
export const selectFirstLoad = createSelector(
	selectHomePageDomain,
	(state) => state.firstLoad,
);
export const selectAddBookmarkSuccess = createSelector(
	selectHomePageDomain,
	(state) => state.addBookmarkSuccess,
);
export const selectDefaultLanguageIso = createSelector(
	selectHomePageDomain,
	(state) => state.defaultLanguageIso,
);
export const selectInitialIsoCode = createSelector(
	selectHomePageDomain,
	(state) => state.initialIsoCode,
);
export const selectInitialLanguageName = createSelector(
	selectHomePageDomain,
	(state) => state.initialLanguageName,
);
export const selectDefaultLanguageCode = createSelector(
	selectHomePageDomain,
	(state) => state.defaultLanguageCode,
);
export const selectBibleFontAvailable = createSelector(
	selectHomePageDomain,
	(state) => state.bibleFontAvailable,
);
export const selectAudioSource = createSelector(
	selectHomePageDomain,
	(state) => state.audioSource,
);
//

const selectSettingsDomain = (state) => state.settings;
const selectProfilePageDomain = (state) => state.profile;
const selectNotesDomain = (state) => state.notes;

// Simple property selectors
const selectChapterDataFromState = (state) =>
	state.homepage.formattedJsonSource;

// Audio selectors
const selectAudioType = createSelector(
	selectHomePageDomain,
	(home) => home.audioType,
);
const selectAvailableAudioTypes = createSelector(
	selectHomePageDomain,
	(home) => home.availableAudioTypes,
);

// Notes/selectors
const selectActiveNotesView = createSelector(
	selectNotesDomain,
	(notes) => notes?.activeChild,
);

const selectChapterText = createSelector(selectHomePageDomain, (dm) => {
	const arr = Array.isArray(dm.chapterText) ? dm.chapterText : [];
	return arr.map((verse) => ({
		...verse,
		verse_text: String(verse.verse_text),
	}));
});

const selectUserNotes = createSelector(
	[
		selectNotesDomain,
		selectActiveTextId,
		selectActiveBookId,
		selectActiveChapter,
		selectChapterText, // use the memoized chapterText
		(state) => state.profile.userAuthenticated,
		(state) => state.profile.userId,
	],
	(notesState, textId, bookId, chapter, chapterText, profAuth, profUser) => {
		// Ensure we have valid chapterText
		const rawNotes = Array.isArray(notesState?.userNotes)
			? notesState.userNotes
			: [];
		const rawBookmarks = Array.isArray(notesState?.chapterBookmarks)
			? notesState.chapterBookmarks
			: [];

		const filteredNotes = rawNotes.filter(
			(n) =>
				n.book_id === bookId && n.chapter === chapter && n.bible_id === textId,
		);
		const filteredBookmarks = rawBookmarks.filter(
			(b) =>
				b.book_id === bookId && b.chapter === chapter && b.bible_id === textId,
		);

		// if no text or no auth
		if (!chapterText.length || (!profAuth && !profUser)) {
			return {
				text: chapterText,
				userNotes: filteredNotes,
				bookmarks: filteredBookmarks,
			};
		}

		const annotated = chapterText.map((verse) => {
			const idxN = filteredNotes.findIndex(
				(n) => n.verse_start === verse.verse_start,
			);
			const idxB = filteredBookmarks.findIndex(
				(b) => b.verse === verse.verse_start,
			);
			return {
				...verse,
				hasNote: idxN > -1,
				noteIndex: idxN > -1 ? idxN : undefined,
				hasBookmark: idxB > -1,
				bookmarkIndex: idxB > -1 ? idxB : undefined,
			};
		});

		return {
			text: annotated,
			userNotes: filteredNotes,
			bookmarks: filteredBookmarks,
		};
	},
);

// UI state selector
const selectMenuOpenState = createSelector(
	selectHomePageDomain,
	(home) =>
		home.isChapterSelectionActive ||
		home.isProfileActive ||
		home.isSettingsModalActive ||
		home.isNotesModalActive ||
		home.isSearchModalActive ||
		home.isVersionSelectionActive,
);

// Profile selectors
const selectUserId = createSelector(
	selectProfilePageDomain,
	(profile) => profile.userId,
);
const selectAuthenticationStatus = createSelector(
	selectProfilePageDomain,
	(profile) => profile.userAuthenticated,
);

// Chapter JSON parsing
const selectChapterJson = createSelector(
	selectChapterDataFromState,
	(rawData) => {
		if (!rawData) return null;
		try {
			const jsonData =
				typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
			if (!jsonData.sequence || !Array.isArray(jsonData.sequence.blocks)) {
				console.error('Invalid chapter JSON structure:', jsonData); // eslint-disable-line no-console
				return null;
			}
			return jsonData;
		} catch (error) {
			console.error('Failed to parse chapter JSON:', error); // eslint-disable-line no-console
			return null;
		}
	},
);

// Formatted source extraction
const selectFormattedSource = createSelector(
	[
		(state) => state.homepage.formattedSource,
		(state) => state.settings.userSettings.toggleOptions.crossReferences.active,
	],
	(source = '', hasCrossRefs) => {
		const clean = source.replace(/[\n\r]/g, '');
		const mainMatch = clean.match(
			/<div class="chapter[\s\S]*?<div class="footnotes">/,
		);
		const footnotesMatch = clean.match(
			/<div class="footnotes">([\s\S]*?)<div class="footer">/,
		);
		const main = mainMatch ? mainMatch[0] : '';
		const footnoteSource = footnotesMatch ? footnotesMatch[1] : '';
		const finalMain = hasCrossRefs
			? main
			: main.replace(/<span class=['"]note['"](.*?)<\/span>/g, '');
		return { main: finalMain, footnotes: {}, footnoteSource };
	},
);

// Settings selector
const selectSettings = createSelector(
	selectSettingsDomain,
	(settings) => settings.userSettings,
);

// Default selector
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
