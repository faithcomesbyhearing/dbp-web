/*
 *
 * Notes reducer
 *
 */

import {
	SET_ACTIVE_CHILD,
	LOAD_USER_HIGHLIGHTS,
	TOGGLE_VERSE_TEXT,
	SET_ACTIVE_PAGE_DATA,
	SET_PAGE_SIZE,
	LOAD_USER_NOTES,
	TOGGLE_PAGE_SELECTOR,
	LOAD_CHAPTER_FOR_NOTE,
	LOAD_NOTEBOOK_DATA,
	LOAD_USER_BOOKMARK_DATA,
	ADD_NOTE_SUCCESS,
	LOAD_BOOKMARKS_FOR_CHAPTER,
	READ_SAVED_NOTE,
	ADD_NOTE_FAILED,
	CLEAR_NOTES_ERROR_MESSAGE,
	CLEAN_NOTEBOOK,
	GET_CHAPTER_FOR_NOTE,
} from './constants';
// Should cache some of this in local storage for faster reloads
const initialState = structuredClone({
	activeChild: 'notes',
	notesErrorMessage: '',
	paginationPageSize: 10,
	pageSize: 10,
	activePage: 1,
	totalPages: 1,
	pageSizeBookmark: 10,
	totalPagesBookmark: 1,
	activePageBookmark: 1,
	pageSizeHighlight: 10,
	totalPagesHighlight: 1,
	activePageHighlight: 1,
	chapterForNote: [],
	listData: [],
	userNotes: [],
	userHighlights: [],
	bookmarkList: [],
	chapterBookmarks: [],
	isVerseTextVisible: true,
	loadingChapterForNote: true,
	pageSelectorState: false,
	savedTheNote: false,
	errorSavingNote: false,
});

function notesReducer(state = initialState, action = { type: null }) {
	switch (action.type) {
		case GET_CHAPTER_FOR_NOTE:
			return {
				...state,
				loadingChapterForNote: true,
			};
		case CLEAN_NOTEBOOK:
			return {
				...state,
				listData: [],
				userNotes: [],
				userHighlights: [],
				bookmarkList: [],
				chapterBookmarks: [],
			};
		case LOAD_USER_HIGHLIGHTS:
			return {
				...state,
				totalPagesHighlight: action.totalPages,
				userHighlights: structuredClone(action.highlights),
			};
		case CLEAR_NOTES_ERROR_MESSAGE:
			return {
				...state,
				errorSavingNote: false,
				notesErrorMessage: '',
			};
		case READ_SAVED_NOTE:
			return {
				...state,
				savedTheNote: false,
			};
		case ADD_NOTE_SUCCESS:
			return {
				...state,
				savedTheNote: true,
			};
		case ADD_NOTE_FAILED:
			return {
				...state,
				errorSavingNote: true,
				notesErrorMessage: action.message,
				savedTheNote: false,
			};
		case LOAD_BOOKMARKS_FOR_CHAPTER:
			return {
				...state,
				chapterBookmarks: structuredClone(action.listData),
			};
		case LOAD_USER_BOOKMARK_DATA:
			return {
				...state,
				totalPagesBookmark: action.totalPages,
				bookmarkList: structuredClone(action.listData),
			};
		case LOAD_CHAPTER_FOR_NOTE:
			return {
				...state,
				loadingChapterForNote: false,
				chapterForNote: structuredClone(action.text),
			};
		case SET_ACTIVE_CHILD:
			return {
				...state,
				activeChild: action.child,
			};
		case SET_ACTIVE_PAGE_DATA:
			if (action.params.sectionType === 'notes') {
				return {
					...state,
					activePage: action.params.page,
				};
			} else if (action.params.sectionType === 'highlights') {
				return {
					...state,
					activePageHighlight: action.params.page,
				};
			}
			return {
				...state,
				activePageBookmark: action.params.page,
			};
		case SET_PAGE_SIZE:
			if (action.params.sectionType === 'notes') {
				return {
					...state,
					activePage: 1,
					pageSize: action.params.limit,
				};
			} else if (action.params.sectionType === 'highlights') {
				return {
					...state,
					activePageHighlight: 1,
					pageSizeHighlight: action.params.limit,
				};
			}
			return {
				...state,
				activePage: 1,
				pageSizeBookmark: action.params.limit,
			};
		case TOGGLE_VERSE_TEXT:
			return {
				...state,
				isVerseTextVisible: !state['isVerseTextVisible'],
			};
		case TOGGLE_PAGE_SELECTOR:
			return {
				...state,
				pageSelectorState: !state['pageSelectorState'],
			};
		case LOAD_USER_NOTES:
			return {
				...state,
				userNotes: structuredClone(action.listData),
			};
		case LOAD_NOTEBOOK_DATA:
			return {
				...state,
				totalPages: action.totalPages,
				listData: structuredClone(action.listData),
			};
		default:
			return state;
	}
}

export default notesReducer;
