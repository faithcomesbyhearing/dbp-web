/*
 *
 * Notes reducer
 *
 */

import { fromJS } from 'immutable';
import {
	SET_ACTIVE_CHILD,
	TOGGLE_VERSE_TEXT,
	SET_ACTIVE_PAGE_DATA,
	SET_PAGE_SIZE,
	LOAD_USER_NOTES,
	TOGGLE_PAGE_SELECTOR,
	LOAD_CHAPTER_FOR_NOTE,
	LOAD_NOTEBOOK_DATA,
	LOAD_USER_BOOKMARK_DATA,
	LOAD_BOOKMARKS_FOR_CHAPTER,
} from './constants';

const initialState = fromJS({
	activeChild: 'notes',
	isVerseTextVisible: true,
	pageSelectorState: false,
	paginationPageSize: 10,
	chapterForNote: [],
	pageSize: 10,
	activePage: 1,
	listData: [],
	totalPages: 1,
	userNotes: [],
	bookmarkList: [],
	chapterBookmarks: [],
});

function notesReducer(state = initialState, action) {
	switch (action.type) {
	case LOAD_BOOKMARKS_FOR_CHAPTER:
		return state.set('chapterBookmarks', action.listData);
	case LOAD_USER_BOOKMARK_DATA:
		return state
			.set('totalPages', action.totalPages)
			.set('bookmarkList', action.listData);
	case LOAD_CHAPTER_FOR_NOTE:
		return state.set('chapterForNote', action.text);
	case SET_ACTIVE_CHILD:
		return state.set('activeChild', action.child);
		// Todo: Move this to local state
	case TOGGLE_VERSE_TEXT:
		return state.set('isVerseTextVisible', !state.get('isVerseTextVisible'));
	case SET_ACTIVE_PAGE_DATA:
		// console.log('Setting page data', action);
		return state.set('activePage', action.params.page);
	case SET_PAGE_SIZE:
		// console.log('Setting page size', action);
		return state.set('pageSize', action.params.limit);
		// Todo: Move this to local state
	case TOGGLE_PAGE_SELECTOR:
		return state.set('pageSelectorState', !state.get('pageSelectorState'));
	case LOAD_USER_NOTES:
		return state
			.set('userNotes', action.listData);
	case LOAD_NOTEBOOK_DATA:
		// console.log('Loading notebook data with active page: ', action.activePage);
		return state
			.set('totalPages', action.totalPages)
			.set('listData', action.listData);
	default:
		return state;
	}
}

export default notesReducer;
