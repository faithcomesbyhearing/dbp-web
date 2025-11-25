import { takeLatest, call, fork, put, cancelled } from 'redux-saga/effects';
import { GET_HIGHLIGHTS, LOAD_HIGHLIGHTS } from '../HomePage/constants';
import removeStoriesFilesets from '../../../app/utils/removeStoriesFilesets';
import getBookMetaData from '../../../app/utils/getBookMetaData';
import getValidFilesetsByBook from '../../../app/utils/getValidFilesetsByBook';

import apiProxy from '../../utils/apiProxy';
import geFilesetsForBible from '../../utils/geFilesetsForBible';
import { FILESET_TYPE_TEXT_PLAIN } from '../../constants/bibleFileset';
import {
	ADD_NOTE,
	ADD_NOTE_SUCCESS,
	ADD_NOTE_FAILED,
	UPDATE_NOTE,
	DELETE_NOTE,
	LOAD_USER_NOTES,
	GET_USER_NOTES,
	GET_CHAPTER_FOR_NOTE,
	LOAD_CHAPTER_FOR_NOTE,
	LOAD_NOTEBOOK_DATA,
	GET_USER_NOTEBOOK_DATA,
	LOAD_BOOKMARKS_FOR_CHAPTER,
	LOAD_USER_BOOKMARK_DATA,
	GET_BOOKMARKS_FOR_CHAPTER,
	GET_USER_BOOKMARK_DATA,
	GET_USER_HIGHLIGHTS,
	LOAD_USER_HIGHLIGHTS,
	UPDATE_HIGHLIGHT,
} from './constants';

export function* getChapterForNote({ note }) {
	// const chapter =
	//   typeof note.get === 'function' ? note['chapter'] : note.chapter;
	// const bibleId =
	//   typeof note.get === 'function' ? note['bible_id'] : note.bible_id;
	// const bookId =
	//   typeof note.get === 'function' ? note['book_id'] : note.book_id;
	// const noteVerseEnd =
	//   typeof note.get === 'function' ? note['verse_end'] : note.verse_end;
	// const noteVerseStart =
	//   typeof note.get === 'function' ? note['verse_start'] : note.verse_start;
	const chapter = note.chapter;
	const bibleId = note.bible_id;
	const bookId = note.book_id;
	const noteVerseEnd = note.verse_end;
	const noteVerseStart = note.verse_start;

	// TODO: The bibleId here is undefined a lot of the time, find where it gets passed in and fix the issue
	// Need to get the bible filesets
	try {
		const response = yield call(apiProxy.get, `/bibles/${bibleId}`);
		const bibleFilesets = response.data.filesets
			? geFilesetsForBible(response.data.filesets)
			: [];

		const setTypes = {
			audio_drama: true,
			audio: true,
			text_plain: true,
			text_format: true,
			video_stream: true,
		};

		const filesetsWithoutStories = removeStoriesFilesets(
			bibleFilesets,
			setTypes,
		);

		const idsForBookMetadata = filesetsWithoutStories.map((fileset) => [
			fileset.type,
			fileset.id,
			fileset.size,
		]);
		const [bookMetaData, bookMetaResponse] = yield getBookMetaData({
			idsForBookMetadata,
		});

		const foundBook = bookMetaData.find(
			(book) => bookId && book.book_id === bookId.toUpperCase(),
		);

		const filesets = foundBook
			? getValidFilesetsByBook(
					foundBook,
					idsForBookMetadata,
					filesetsWithoutStories,
					bookMetaResponse,
				)
			: [];

		// Gets only one of the text_plain filesets
		const activeFilesetId = filesets
			? filesets
					.filter((f) => f.type === FILESET_TYPE_TEXT_PLAIN)
					.reduce((a, c) => c.id, '')
			: '';

		const hasText = !!activeFilesetId;

		let text = [];

		if (hasText) {
			const res = yield call(
				apiProxy.get,
				`/bibles/filesets/${activeFilesetId}/${bookId}/${chapter}`,
				{
					book_id: bookId,
					chapter_id: chapter,
				},
			);

			text = res.data;
		}

		yield put({
			type: LOAD_CHAPTER_FOR_NOTE,
			text: text.filter(
				(verse) =>
					verse.verse_start <= noteVerseEnd &&
					verse.verse_start >= noteVerseStart,
			),
		});
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error('error getting chapter for note', err); // eslint-disable-line no-console
		}
	}
}

export function* updateHighlight({
	userId,
	id,
	color,
	bible,
	book,
	chapter,
	limit,
	page,
}) {
	try {
		const response = yield call(
			apiProxy.put,
			`/users/${userId}/highlights/${id}`,
			{},
			{
				pretty: true,
				project_id: process.env.NOTES_PROJECT_ID,
				highlighted_color: color,
			},
		);

		if (response.meta && response.meta.success) {
			yield fork(getHighlights, { userId, bible, book, chapter });
			yield fork(getUserHighlights, { userId, params: { limit, page } });
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
	}
}

export function* getUserHighlights({ userId, params }) {
	try {
		const response = yield call(apiProxy.get, `/users/${userId}/highlights`, {
			pretty: true,
			project_id: process.env.NOTES_PROJECT_ID,
			limit: params.limit,
			page: params.page,
		});

		if (response.data && response.meta) {
			yield put({
				type: LOAD_USER_HIGHLIGHTS,
				highlights: response.data,
				activePage: response.meta.pagination.current_page,
				totalPages: response.meta.pagination.total_pages,
				pageSize: response.meta.pagination.per_page,
			});
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error getting user highlights', err); // eslint-disable-line no-console
		}
	}
}

export function* updateNote({ userId, data, noteId }) {
	const params = {
		pretty: true,
		project_id: process.env.NOTES_PROJECT_ID,
		...data,
	};

	try {
		const response = yield call(
			apiProxy.put,
			`/users/${userId}/notes/${noteId}`,
			{},
			params,
		);

		if (response.success) {
			yield put({ type: ADD_NOTE_SUCCESS, response });
			yield fork(getNotesForChapter, {
				userId,
				params: {
					bible_id: data.bible_id,
					book_id: data.book_id,
					chapter: data.chapter,
					limit: 150,
					page: 1,
				},
			});
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
		yield put({
			type: ADD_NOTE_FAILED,
			message: 'An error has occurred. Please try again later.',
		});
	}
}

export function* deleteNote({
	userId,
	noteId,
	pageSize,
	activePage,
	bibleId,
	bookId,
	chapter,
	isBookmark,
}) {
	if (isBookmark) {
		try {
			// Do not need the response since it will throw an error if the request was unsuccessful
			yield call(apiProxy.delete, `/users/${userId}/bookmarks/${noteId}`, {
				pretty: true,
				note_id: noteId,
				project_id: process.env.NOTES_PROJECT_ID,
			});

			yield fork(getUserBookmarks, {
				userId,
				params: { limit: pageSize, page: activePage },
			});
			yield fork(getBookmarksForChapter, {
				userId,
				params: {
					bible_id: bibleId,
					book_id: bookId,
					chapter,
					limit: 150,
					page: 1,
				},
			});
		} catch (err) {
			if (process.env.NODE_ENV === 'development') {
				console.error(err); // eslint-disable-line no-console
			}
			yield put({
				type: ADD_NOTE_FAILED,
				message: 'An error has occurred. Please try again later.',
			});
		}
	} else {
		try {
			const response = yield call(
				apiProxy.delete,
				`/users/${userId}/notes/${noteId}`,
				{
					pretty: true,
					note_id: noteId,
					project_id: process.env.NOTES_PROJECT_ID,
				},
			);

			if (response.success) {
				yield fork(getNotesForNotebook, {
					userId,
					params: { limit: pageSize, page: activePage },
				});
				yield fork(getNotesForChapter, {
					userId,
					params: {
						bible_id: bibleId,
						book_id: bookId,
						chapter,
						limit: 150,
						page: 1,
					},
				});
			}
		} catch (err) {
			if (process.env.NODE_ENV === 'development') {
				console.error(err); // eslint-disable-line no-console
			}
			yield put({
				type: ADD_NOTE_FAILED,
				message: 'An error has occurred. Please try again later.',
			});
		}
	}
}
// Probably need a getBookmarks function
export function* getNotesForChapter({ userId, params = {} }) {
	// Need to adjust how I paginate the notes here and in other places as well
	try {
		const response = yield call(apiProxy.get, `/users/${userId}/notes`, {
			pretty: true,
			project_id: process.env.NOTES_PROJECT_ID,
			...params,
		});

		yield put({
			type: LOAD_USER_NOTES,
			listData: response.data || [],
		});
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error getting the notes', err); // eslint-disable-line no-console
		}
	} finally {
		if (process.env.NODE_ENV === 'development') {
			// eslint-disable-next-line no-console
			console.log('getHighlights generator function has completed execution');

			if (yield cancelled()) {
				// eslint-disable-next-line no-console
				console.log('Saga was cancelled');
			}
		}
	}
}

export function* getNotesForNotebook({ userId, params = {} }) {
	// Need to adjust how I paginate the notes here and in other places as well
	try {
		const response = yield call(apiProxy.get, `/users/${userId}/notes`, {
			pretty: true,
			project_id: process.env.NOTES_PROJECT_ID,
			...params,
		});

		if (response.data && response.meta) {
			yield put({
				type: LOAD_NOTEBOOK_DATA,
				listData: response.data,
				activePage: response.meta.pagination.current_page,
				totalPages: response.meta.pagination.total_pages,
				pageSize: response.meta.pagination.per_page,
			});
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
	}
}

// Add bookmark is separate and is in the homepage saga file
export function* addNote({ userId, data }) {
	const formData = new FormData();

	Object.entries(data).forEach((item) => formData.set(item[0], item[1]));

	const options = {
		body: formData,
	};

	try {
		const response = yield call(apiProxy.post, `/users/${userId}/notes`, options, {
			pretty: true,
			project_id: process.env.NOTES_PROJECT_ID,
		});

		if (
			(response.meta && response.meta.success) ||
			(response.meta && !response.meta.error)
		) {
			yield put({ type: ADD_NOTE_SUCCESS, response });
			yield fork(getNotesForChapter, {
				userId: data.user_id,
				params: {
					bible_id: data.bible_id,
					book_id: data.book_id,
					chapter: data.chapter,
					limit: 150,
					page: 1,
				},
			});
		} else if (response.error) {
			yield put({ type: ADD_NOTE_FAILED, message: response.error.notes[0] });
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
		yield put({
			type: ADD_NOTE_FAILED,
			message: 'An error has occurred. Please try again later.',
		});
	}
}

export function* getBookmarksForChapter({ userId, params = {} }) {
	try {
		const response = yield call(apiProxy.get, `/users/${userId}/bookmarks`, {
			pretty: true,
			project_id: process.env.NOTES_PROJECT_ID,
			...params,
		});

		if (response.data) {
			yield put({
				type: LOAD_BOOKMARKS_FOR_CHAPTER,
				listData: response.data || [],
			});
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error getting the notes', err); // eslint-disable-line no-console
		}
	} finally {
		if (process.env.NODE_ENV === 'development') {
			// eslint-disable-next-line no-console
			console.log(
				'getBookmarksForChapter generator function has completed execution',
			);

			if (yield cancelled()) {
				// eslint-disable-next-line no-console
				console.log('Saga was cancelled');
			}
		}
	}
}

export function* getUserBookmarks({ userId, params = {} }) {
	try {
		const response = yield call(apiProxy.get, `/users/${userId}/bookmarks`, {
			pretty: true,
			project_id: process.env.NOTES_PROJECT_ID,
			...params,
		});

		if (response.data && response.meta) {
			yield put({
				type: LOAD_USER_BOOKMARK_DATA,
				listData: response.data,
				activePage: response.meta.pagination.current_page,
				totalPages: response.meta.pagination.total_pages,
				pageSize: response.meta.pagination.per_page,
			});
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error(err); // eslint-disable-line no-console
		}
	}
}

export function* getHighlights({ bible, book, chapter, userId }) {
	let highlights = [];

	try {
		const response = yield call(
			apiProxy.get,
			`/users/${userId || 'no_user_id'}/highlights`,
			{
				project_id: process.env.NOTES_PROJECT_ID,
				bible_id: bible,
				book_id: book,
				chapter,
				limit: 1000,
			},
		);

		if (response.data) {
			highlights = response.data;
		}

		yield put({ type: LOAD_HIGHLIGHTS, highlights });
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Caught in highlights request', error); // eslint-disable-line no-console
		}
	} finally {
		if (process.env.NODE_ENV === 'development') {
			// eslint-disable-next-line no-console
			console.log('getHighlights generator function has completed execution');

			if (yield cancelled()) {
				// eslint-disable-next-line no-console
				console.log('Saga was cancelled');
			}
		}
	}
}

// Individual exports for testing
export default function* notesSaga() {
	yield takeLatest(ADD_NOTE, addNote);
	yield takeLatest(GET_USER_NOTES, getNotesForChapter);
	yield takeLatest(UPDATE_NOTE, updateNote);
	yield takeLatest(UPDATE_HIGHLIGHT, updateHighlight);
	yield takeLatest(DELETE_NOTE, deleteNote);
	yield takeLatest(GET_CHAPTER_FOR_NOTE, getChapterForNote);
	yield takeLatest(GET_USER_NOTEBOOK_DATA, getNotesForNotebook);
	yield takeLatest(GET_USER_HIGHLIGHTS, getUserHighlights);
	yield takeLatest(GET_BOOKMARKS_FOR_CHAPTER, getBookmarksForChapter);
	yield takeLatest(GET_USER_BOOKMARK_DATA, getUserBookmarks);
	yield takeLatest(GET_HIGHLIGHTS, getHighlights);
}
