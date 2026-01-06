/*
 *
 * HomePage reducer
 *
 * Use userSettings.toggleOptions.available for determining which
 * options a user has available within their settings.
 */

import { SET_AUDIO_TYPE } from '../AudioPlayer/constants';
import { USER_LOGGED_IN, LOG_OUT } from '../Profile/constants';
import {
	CLOSE_VIDEO_PLAYER,
	OPEN_VIDEO_PLAYER,
	SET_HAS_VIDEO,
} from '../VideoPlayer/constants';
import {
	ACTIVE_TEXT_ID,
	CHANGING_VERSION,
	LOAD_AUDIO,
	LOAD_HIGHLIGHTS,
	SET_USER_AGENT,
	SET_ACTIVE_CHAPTER,
	SET_ACTIVE_BOOK_NAME,
	SET_ACTIVE_NOTES_VIEW,
	SET_SELECTED_BOOK_NAME,
	SET_AUDIO_PLAYER_STATE,
	SET_CHAPTER_TEXT_LOADING_STATE,
	TOGGLE_PROFILE,
	TOGGLE_NOTES_MODAL,
	TOGGLE_SEARCH_MODAL,
	TOGGLE_SETTINGS_MODAL,
	TOGGLE_INFORMATION_MODAL,
	TOGGLE_VERSION_SELECTION,
	CLOSE_VERSION_SELECTION,
	TOGGLE_CHAPTER_SELECTION,
	TOGGLE_FIRST_LOAD_TEXT_SELECTION,
	SET_ACTIVE_NOTE,
	UPDATE_SELECTED_TEXT,
	GET_BOOKS,
	GET_COPYRIGHTS,
	RESET_BOOKMARK_STATE,
	ADD_BOOKMARK_SUCCESS,
	ADD_BOOKMARK_FAILURE,
	SET_TEXT_DIRECTION,
} from './constants';

const initialState = structuredClone({
	books: [],
	chapterText: [],
	audioObjects: [],
	activeFilesets: [],
	highlights: [],
	previousAudioPaths: [],
	nextAudioPaths: [],
	audioPaths: [],
	availableAudioTypes: [],
	note: {},
	filesetTypes: {},
	userProfile: {},
	testaments: {},
	copyrights: {
		newTestament: {
			audio: {},
			text: {},
		},
		oldTestament: {
			audio: {},
			text: {},
		},
	},
	activeChapter: 1,
	hasAudio: false,
	hasVideo: false,
	videoChapterState: false,
	videoPlayerOpen: false,
	userAuthenticated: false,
	isChapterSelectionActive: false,
	isProfileActive: false,
	isSettingsModalActive: false,
	isSearchModalActive: false,
	isNotesModalActive: false,
	isVersionSelectionActive: false,
	isInformationModalActive: false,
	isFromServer: true,
	changingVersion: false,
	invalidBibleId: false,
	hasTextInDatabase: true,
	firstLoad: true,
	audioPlayerState: true,
	chapterTextLoadingState: false,
	loadingNewChapterText: false,
	loadingCopyright: true,
	loadingAudio: false,
	loadingBooks: false,
	userId: '',
	audioType: '',
	match: {
		params: {
			bibleId: 'engesv',
			bookId: 'mat',
			chapter: '1',
			verse: '',
			token: '',
		},
	},
	activeFilesetId: '',
	audioFilesetId: '',
	plainTextFilesetId: '',
	formattedTextFilesetId: '',
	formattedJsonFilesetId: '',
	activeBookName: '',
	activeTextName: '',
	activeNotesView: 'notes',
	activeTextId: '',
	defaultLanguageIso: 'eng',
	defaultLanguageCode: 17045,
	defaultLanguageName: 'English: USA',
	activeBookId: '',
	selectedText: '',
	selectedBookName: '',
	audioSource: '',
	formattedSource: '',
	previousAudioFilesetId: '',
	previousAudioSource: '',
	nextAudioFilesetId: '',
	nextAudioSource: '',
	activeVerse: '',
	textDirection: 'ltr',
});

function homePageReducer(state = initialState, action = { type: null }) {
	switch (action.type) {
		// Audio play actions
		case SET_AUDIO_TYPE:
			return {
				...state,
				audioType: action.audioType,
			};
		// Video player actions
		case OPEN_VIDEO_PLAYER:
			return {
				...state,
				videoPlayerOpen: true,
			};
		case CLOSE_VIDEO_PLAYER:
			return {
				...state,
				videoPlayerOpen: false,
			};
		case SET_HAS_VIDEO:
			return {
				...state,
				hasVideo: action.state,
				videoChapterState: action.videoChapterState,
				videoPlayerOpen: action.videoPlayerOpen,
			};
		// Homepage Actions
		case CHANGING_VERSION:
			return {
				...state,
				changingVersion: action.state,
			};
		case USER_LOGGED_IN:
			return {
				...state,
				userId: action.userId,
				userAuthenticated: true,
			};
		case LOG_OUT:
			localStorage.removeItem('bible_is_user_id');
			localStorage.removeItem('bible_is_user_email');
			localStorage.removeItem('bible_is_user_name');
			localStorage.removeItem('bible_is_user_nickname');
			sessionStorage.removeItem('bible_is_user_id');
			sessionStorage.removeItem('bible_is_user_email');
			sessionStorage.removeItem('bible_is_user_name');
			sessionStorage.removeItem('bible_is_user_nickname');
			return {
				...state,
				userId: '',
				userAuthenticated: false,
			};
		case 'book_metadata':
			return {
				...state,
				testaments: action.testaments,
			};
		case TOGGLE_FIRST_LOAD_TEXT_SELECTION:
			return {
				...state,
				firstLoad: false,
			};
		case GET_BOOKS:
			return {
				...state,
				loadingNewChapterText: true,
				loadingBooks: true,
			};
		case SET_USER_AGENT:
			return {
				...state,
				userAgent: 'ms',
				isIe: true,
			};
		case ADD_BOOKMARK_FAILURE:
			return {
				...state,
				addBookmarkFailure: true,
			};
		case ADD_BOOKMARK_SUCCESS:
			return {
				...state,
				addBookmarkSuccess: true,
			};
		case RESET_BOOKMARK_STATE:
			return {
				...state,
				addBookmarkFailure: false,
				addBookmarkSuccess: false,
			};
		case LOAD_AUDIO:
			return {
				...state,
				audioObjects: structuredClone(action.audioObjects),
			};
		case SET_ACTIVE_NOTE:
			return {
				...state,
				note: structuredClone(action.note),
			};
		case TOGGLE_PROFILE:
			return {
				...state,
				isProfileActive: !state['isProfileActive'],
			};
		case TOGGLE_CHAPTER_SELECTION:
			return {
				...state,
				isChapterSelectionActive: !state['isChapterSelectionActive'],
			};
		case TOGGLE_SETTINGS_MODAL:
			return {
				...state,
				isSettingsModalActive: !state['isSettingsModalActive'],
			};
		case TOGGLE_SEARCH_MODAL:
			return {
				...state,
				isSearchModalActive: !state['isSearchModalActive'],
			};
		case TOGGLE_NOTES_MODAL:
			return {
				...state,
				isNotesModalActive: !state['isNotesModalActive'],
			};
		case TOGGLE_VERSION_SELECTION:
			return {
				...state,
				isVersionSelectionActive: !state['isVersionSelectionActive'],
			};
		case CLOSE_VERSION_SELECTION:
			return {
				...state,
				isVersionSelectionActive: false,
			};
		case TOGGLE_INFORMATION_MODAL:
			return {
				...state,
				isInformationModalActive: !state['isInformationModalActive'],
			};
		case SET_ACTIVE_BOOK_NAME:
			return {
				...state,
				activeBookId: action.id,
				activeBookName: action.book,
			};
		case SET_ACTIVE_CHAPTER:
			return {
				...state,
				activeChapter: action.chapter,
			};
		case SET_TEXT_DIRECTION:
			return {
				...state,
				textDirection: action.textDirection,
			};
		case ACTIVE_TEXT_ID:
			return {
				...state,
				activeTextName: action.textName,

				userSettings: {
					...state.userSettings,
					autoPlayEnabled: false,
				},

				activeTextId: action.textId,
			};
		case SET_AUDIO_PLAYER_STATE:
			if (typeof window !== 'undefined') {
				document.cookie = `bible_is_audio_open=${action.state};path=/`;
			}
			return {
				...state,
				audioPlayerState: action.state,
			};
		case LOAD_HIGHLIGHTS:
			return {
				...state,
				highlights: structuredClone(action.highlights),
			};
		case SET_ACTIVE_NOTES_VIEW:
			return {
				...state,
				activeNotesView: action.view,
			};
		case UPDATE_SELECTED_TEXT:
			return {
				...state,
				selectedText: action.text,
			};
		case SET_SELECTED_BOOK_NAME:
			return {
				...state,
				selectedBookName: action.book,
			};
		case 'loadbible':
			return {
				...state,
				activeTextId: structuredClone(action.bibleId),
				activeBookId: structuredClone(action.activeBookId),
				activeChapter: structuredClone(action.activeChapter),
				activeTextName: structuredClone(action.name),
				defaultLanguageIso: structuredClone(action.iso),
				defaultLanguageName: structuredClone(action.languageName),
				defaultLanguageCode: structuredClone(action.languageCode),
				activeBookName: structuredClone(action.activeBookName),
				invalidBibleId: false,
				audioPlayerState: action.chapterData.hasAudio,
				activeVerse: action.chapterData.verse,
				textDirection: action.textDirection,
				books: structuredClone(action.books),
				activeFilesets: structuredClone(action.filesets),
			};
		case 'loadnewchapter':
			return {
				...state,
				hasFormattedText: structuredClone(action.hasFormattedText),
				hasFormattedJson: structuredClone(action.hasFormattedJson),
				hasTextInDatabase: structuredClone(action.hasPlainText),
				hasAudio: structuredClone(action.hasAudio),
				chapterText: structuredClone(action.plainText),
				loadingNewChapterText: false,

				userSettings: {
					...state.userSettings,

					toggleOptions: {
						...state.userSettings.toggleOptions,

						crossReferences: {
							...state.userSettings.toggleOptions.crossReferences,

							available:
								action.hasFormattedText &&
								(action.formattedText.includes('class="ft"') ||
									action.formattedText.includes('class="xt"')),
						},

						redLetter: {
							...state.userSettings.toggleOptions.redLetter,

							available:
								action.hasFormattedText &&
								(action.formattedText.includes('class="wj"') ||
									action.formattedText.includes("class='wj'")),
						},

						readersMode: {
							...state.userSettings.toggleOptions.readersMode,
							available: action.hasPlainText,
						},

						oneVersePerLine: {
							...state.userSettings.toggleOptions.oneVersePerLine,
							available: action.hasPlainText,
						},
					},
				},

				formattedTextFilesetId: action.formattedTextFilesetId,
				formattedJsonFilesetId: action.formattedJsonFilesetId,
				plainTextFilesetId: action.plainTextFilesetId,
				activeVerse: action.verse,
				formattedSource: structuredClone(action.formattedText),
				formattedJsonSource: structuredClone(action.formattedJson),
			};
		case 'loadaudio':
			return {
				...state,
				hasAudio: !!action.audioPaths[0],
				audioPaths: action.audioPaths.slice(1),
				audioFilesetId: action.audioFilesetId,
				loadingAudio: false,
				audioSource: action.audioPaths[0] || '',
			};
		case 'getchapter':
			return {
				...state,
				loadingAudio: true,
				loadingNewChapterText: true,
			};
		case 'loadbibleerror':
			return {
				...state,
				invalidBibleId: true,
				loadingCopyright: false,
				loadingAudio: false,
				loadingNewChapterText: false,
			};
		case GET_COPYRIGHTS:
			return {
				...state,
				loadingCopyright: true,
			};
		case 'loadcopyright':
			return {
				...state,
				loadingCopyright: false,
				copyrights: action.copyrights,
			};
		case 'GET_INITIAL_ROUTE_STATE_HOMEPAGE':
			// return state.merge(action.homepage);
			return {
				...state,
				...action.homepage,
			};
		case SET_CHAPTER_TEXT_LOADING_STATE:
			return {
				...state,
				chapterTextLoadingState: action.state,
			};
		default:
			return state;
	}
}

export default homePageReducer;
