import axios from 'axios';
import { takeLatest, call, all, put, fork } from 'redux-saga/effects';
import some from 'lodash/some';
import get from 'lodash/get';
import uniqWith from 'lodash/uniqWith';
import Router from 'next/router';
import apiProxy from '../../utils/apiProxy';
import geFilesetsForBible from '../../utils/geFilesetsForBible';
import {
	getNotesForChapter,
	getBookmarksForChapter,
	getUserHighlights,
	getHighlights,
} from '../Notes/saga';
import {
	getCountries,
	getLanguageAltNames,
	getTexts,
} from '../TextSelection/saga';
import { ADD_BOOKMARK } from '../Notes/constants';
import {
	FILESET_TYPE_TEXT_PLAIN,
	FILESET_TYPE_TEXT_FORMAT,
	FILESET_TYPE_TEXT_JSON,
	FILESET_TYPE_AUDIO_DRAMA,
	FILESET_TYPE_AUDIO,
	FILESET_TYPE_VIDEO_STREAM,
	FILESET_SIZE_COMPLETE,
	FILESET_SIZE_NEW_TESTAMENT,
	FILESET_SIZE_NEW_TESTAMENT_PORTION,
	FILESET_SIZE_NEW_TESTAMENT_PORTION_OLD_TESTAMENT_PORTION,
	FILESET_SIZE_OLD_TESTAMENT,
	FILESET_SIZE_OLD_TESTAMENT_PORTION,
} from '../../constants/bibleFileset';
import {
	ADD_HIGHLIGHTS,
	GET_NOTES_HOMEPAGE,
	GET_COPYRIGHTS,
	INIT_APPLICATION,
	DELETE_HIGHLIGHTS,
	ADD_BOOKMARK_SUCCESS,
	ADD_BOOKMARK_FAILURE,
	CREATE_USER_WITH_SOCIAL_ACCOUNT,
} from './constants';
import { codes } from './sagaUtils';

export function* deleteHighlights({
	ids,
	userId,
	bible,
	book,
	chapter,
	limit,
	page,
}) {
	const deleteRequests = ids.map((id) =>
		// eslint-disable-next-line redux-saga/yield-effects
		call(apiProxy.delete, `/users/${userId}/highlights/${id}`, {
			pretty: true,
			project_id: process.env.NOTES_PROJECT_ID,
		}),
	);
	try {
		yield all(deleteRequests);
		yield fork(getHighlights, { bible, book, chapter, userId });
		yield fork(getUserHighlights, { userId, params: { limit, page } });
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error('There was an error deleting the highlights', err); // eslint-disable-line no-console
		}
	}
}

export function* getCountriesAndLanguages() {
	yield fork(getCountries);
	yield fork(getLanguageAltNames);
}

export function* initApplication(props) {
	const languageIso = props.languageIso;
	const languageCode = props.languageCode;
	// Set a timeout for 24 hours so that if the user does not refresh the page
	// within that time the languages and countries will be re-fetched
	const timeoutDuration = 1000 * 60 * 60 * 24;
	setTimeout(function runTimeout() {
		getCountriesAndLanguages();
		setTimeout(runTimeout, timeoutDuration);
	}, timeoutDuration);
	// Forking each of these sagas here on the init of the application so that they all run in parallel
	yield all([
		fork(getCountries),
		fork(getLanguageAltNames),
		fork(getTexts, { languageIso, languageCode }),
	]);
}

export function* addBookmark(props) {
	const formData = new FormData();

	Object.entries(props.data).forEach((item) => formData.set(item[0], item[1]));
	formData.append('tags', `reference::: ${props.data.reference}`);

	const options = {
		body: formData,
	};
	try {
		const response = yield call(
			apiProxy.post,
			`/users/${props.data.user_id}/bookmarks`,
			options,
			{
				pretty: true,
				project_id: process.env.NOTES_PROJECT_ID,
			},
		);
		if (response) {
			yield fork(getBookmarksForChapter, {
				userId: props.data.user_id,
				params: {
					bible_id: props.data.bible_id,
					book_id: props.data.book_id,
					chapter: props.data.chapter,
					limit: 150,
					page: 1,
				},
			});
			yield put({
				type: ADD_BOOKMARK_SUCCESS,
				userId: props.data.user_id,
				params: {
					bible_id: props.data.bible_id,
					book_id: props.data.book_id,
					chapter: props.data.chapter,
					limit: 150,
					page: 1,
				},
			});
		} else {
			yield put({ type: ADD_BOOKMARK_FAILURE });
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error('There was an error saving the bookmark', err); // eslint-disable-line no-console
		}
		yield put({ type: ADD_BOOKMARK_FAILURE });
	}
}

export function* getBookMetadata({ bibleId }) {
	try {
		const response = yield call(apiProxy.get, `/bibles/${bibleId}/book`);
		const testaments = response.data.reduce(
			(a, c) => ({ ...a, [c.id]: c.book_testament }),
			{},
		);

		yield put({ type: 'book_metadata', testaments });
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Caught in get book metadata request', error); // eslint-disable-line no-console
		}
	}
}

export function* addHighlight({
	bible,
	book,
	chapter,
	userId,
	verseStart,
	verseEnd,
	highlightStart,
	highlightedWords,
	color,
	reference,
}) {
	const formData = new FormData();
	if (!userId || color === 'none') {
		return;
	}
	formData.append('book_id', book);
	formData.append('user_id', userId);
	formData.append('bible_id', bible);
	formData.append('fileset_id', bible);
	formData.append('chapter', chapter);
	formData.append('verse_start', verseStart);
	formData.append('verse_end', verseEnd);
	if (color !== 'none') {
		formData.append('highlighted_color', color);
	}
	formData.append('highlight_start', highlightStart);
	formData.append('highlighted_words', highlightedWords);
	formData.append('project_id', process.env.NOTES_PROJECT_ID);
	formData.append('reference', reference);

	const options = {
		body: formData,
	};
	try {
		const response = yield call(
			apiProxy.post,
			`/users/${userId}/highlights`,
			options,
			{
				bible_id: bible,
				book_id: book,
				chapter,
				project_id: process.env.NOTES_PROJECT_ID,
				limit: 1000,
			},
		);
		// Need to get the highlights here because they are not being returned
		if (response.meta && response.meta.success) {
			yield call(getHighlights, { bible, book, chapter, userId });
		} else if (response.error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Error creating highlight', response.error); // eslint-disable-line no-console
			}
		} else if (response.errors) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Error creating highlight', response.errors); // eslint-disable-line no-console
			}
		} else if (!response.meta) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Missing meta property in highlight creation response', response); // eslint-disable-line no-console
			}
		}
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Caught in highlights request', error); // eslint-disable-line no-console
		}
	}
}

export function* getBibleFromUrl({
	bibleId: oldBibleId,
	bookId: oldBookId,
	chapter,
	authenticated,
	userId,
	verse,
}) {
	// This function needs to return the data listed below
	// Books
	// Active or first chapter text
	// Active or first chapter audio
	// Bible name
	// Bible id
	const bibleId = oldBibleId.toUpperCase();
	const bookId = oldBookId.toUpperCase();

	// Probably need to do stuff here to get the audio and text for this new bible
	try {
		const response = yield call(apiProxy.get, `/bibles/${bibleId}`, {
			include_font: false,
		});

		if (response.data && Object.keys(response.data).length) {
			// Creating new objects for each set of data needed to ensure I don't forget something
			// I probably will want to use 'yield all' for getting the audio and text so they can be run async
			const bible = response.data;
			const books = bible.books; // Need to ensure that I have the books here
			const textDirection =
				response.data.alphabet && response.data.alphabet.direction;
			let hasMatt = false;
			const activeBook = books.find((b) => {
				if (b.book_id === 'MAT') {
					hasMatt = true;
				}
				return b.book_id === bookId;
			});
			// Not exactly sure why I am checking for an active book here
			let activeChapter = activeBook ? parseInt(chapter, 10) || 1 : 1;
			if (activeBook) {
				const lastChapterIndex = activeBook.chapters.length - 1;
				if (!isNaN(parseInt(chapter, 10))) {
					const parsedC = parseInt(chapter, 10);

					// Checks if the entered number is greater than the last chapter
					if (activeBook.chapters[lastChapterIndex] < parsedC) {
						activeChapter = activeBook.chapters[lastChapterIndex];
						// Checks if the entered number is less than the starting number
					} else if (activeBook.chapters[0] > parsedC) {
						activeChapter = activeBook.chapters[0];
					} else {
						activeChapter = parsedC;
					}
				} else {
					// If a non number was entered then it will start at the first chapter in the book
					activeChapter = activeBook.chapters[0];
				}
			}
			// Nesting a ternary here because it keeps me from needing more variables and an if statement
			// If there wasn't an activeBook for the bookId given then check for if the resource has Matthew
			// If it has Matthew then use the bookId for that, otherwise just use the first bookId available
			const defaultBook = hasMatt ? 'MAT' : get(books, [0, 'book_id'], '');
			const activeBookId = activeBook ? activeBook.book_id : defaultBook;
			const activeBookName = activeBook
				? activeBook.name_short
				: get(books, [0, 'name_short'], '');

			const bibleFilesets =
				response.data && response.data.filesets
					? geFilesetsForBible(response.data.filesets)
					: [];
			const filesets = bibleFilesets.filter(
				(f) =>
					f.type === FILESET_TYPE_AUDIO ||
					f.type === FILESET_TYPE_AUDIO_DRAMA ||
					f.type === FILESET_TYPE_TEXT_PLAIN ||
					f.type === FILESET_TYPE_TEXT_FORMAT ||
					f.type === FILESET_TYPE_TEXT_JSON ||
					f.type === FILESET_TYPE_VIDEO_STREAM,
			);

			// Requesting copyrights for the filesets
			yield put({ type: GET_COPYRIGHTS, filesetIds: filesets });

			const chapterData = yield call(getChapterFromUrl, {
				filesets,
				bibleId,
				bookId: activeBookId,
				chapter: activeChapter,
				authenticated,
				userId,
				verse,
			});
			// still need to include to active book name so that iteration happens here
			yield put({
				type: 'loadbible',
				filesets,
				name: bible.vname ? bible.vname : bible.name || bible.abbr,
				iso: bible.iso,
				languageCode: bible.language_id,
				textDirection,
				languageName: bible.language,
				books,
				chapterData,
				bibleId,
				activeBookId,
				activeChapter,
				activeBookName,
			});
		}
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Caught in get bible', error); // eslint-disable-line no-console
		}
		yield put({ type: 'loadbibleerror' });
	}
}

export function* getChapterFromUrl({
	filesets,
	bibleId: oldBibleId,
	bookId: oldBookId,
	chapter,
	authenticated,
	userId,
	verse,
}) {
	const bibleId = oldBibleId.toUpperCase();
	const bookId = oldBookId.toUpperCase();
	const hasFormattedText = some(
		filesets,
		(f) => f.type === FILESET_TYPE_TEXT_FORMAT,
	);
	const hasFormattedJson = some(
		filesets,
		(f) => f.type === FILESET_TYPE_TEXT_JSON,
	);
	// checking for audio but not fetching it as a part of this saga
	const hasAudio = some(
		filesets,
		(f) => f.type === FILESET_TYPE_AUDIO || f.type === FILESET_TYPE_AUDIO_DRAMA,
	);

	try {
		let formattedText = '';
		let formattedTextFilesetId = '';
		let formattedJson = '';
		let formattedJsonFilesetId = '';
		let plainTextFilesetId = '';
		let plainText = [];
		let hasPlainText = some(
			filesets,
			(f) => f.type === FILESET_TYPE_TEXT_PLAIN,
		);

		if (authenticated) {
			yield fork(getHighlights, {
				bible: bibleId,
				book: bookId,
				chapter,
				userId,
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
		}

		yield fork(getChapterAudio, { filesets, bookId, chapter });
		yield fork(getBookMetadata, { bibleId });
		// Try to get the formatted text if it is available
		if (hasFormattedText) {
			try {
				// Gets the last fileset id for a formatted text
				const filesetId =
					filesets.reduce(
						(a, c) => (c.type === FILESET_TYPE_TEXT_FORMAT ? c.id : a),
						'',
					) || bibleId;
				if (filesetId) {
					const formattedChapterObject = yield call(
						apiProxy.get,
						`/bibles/filesets/${filesetId}`,
						{
							book_id: bookId,
							chapter_id: chapter,
							type: FILESET_TYPE_TEXT_FORMAT,
						},
					);
					const path = get(formattedChapterObject.data, [0, 'path']);
					formattedText = yield path
						? axios.get(path).then((res) => res.data)
						: '';

					formattedTextFilesetId = filesetId;
				}
			} catch (error) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Caught in get formatted text block', error); // eslint-disable-line no-console
				}
			}
		}

		if (hasFormattedJson) {
			try {
				// Gets the last fileset id for a formatted text
				const filesetId =
					filesets.reduce(
						(a, c) => (c.type === FILESET_TYPE_TEXT_JSON ? c.id : a),
						'',
					) || bibleId;
				if (filesetId) {
					const formattedChapterObject = yield call(
						apiProxy.get,
						`/bibles/filesets/${filesetId}`,
						{
							book_id: bookId,
							chapter_id: chapter,
							type: FILESET_TYPE_TEXT_JSON,
						},
					);
					const path = get(formattedChapterObject.data, [0, 'path']);
					formattedJson = yield path
						? axios.get(path).then((res) => res.data)
						: '';

					formattedJsonFilesetId = filesetId;
				}
			} catch (error) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Caught in get formatted text block', error); // eslint-disable-line no-console
				}
			}
		}

		// Try to get the plain text every time
		// When this fails it should fail gracefully and not cause anything to break
		try {
			let filesetId = '';
			if (
				filesets.filter((set) => set.type === FILESET_TYPE_TEXT_PLAIN).length >
				1
			) {
				filesetId = filesets.reduce(
					(a, c) => (c.type === FILESET_TYPE_TEXT_PLAIN ? a.concat(c.id) : a),
					[],
				);
			} else {
				filesetId = filesets.reduce(
					(a, c) => (c.type === FILESET_TYPE_TEXT_PLAIN ? c.id : a),
					'',
				);
			}

			if (Array.isArray(filesetId) && filesetId.length > 1) {
				// Discuss the issues with having multiple filesets for text
				// Will probably need to build out a list of checks like for the audio
				const results = yield call(tryNext, {
					urls: filesetId,
					index: 0,
					bookId,
					chapter,
				});

				plainText = results.plainText;
				plainTextFilesetId = results.plainTextFilesetId;
			} else if (filesetId) {
				const res = yield call(
					apiProxy.get,
					`/bibles/filesets/${filesetId}/${bookId}/${chapter}`,
					{
						book_id: bookId,
						chapter_id: chapter,
					},
				);
				plainText = res.data;

				plainTextFilesetId = plainText ? bibleId : '';
			}
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in get plain text block', error); // eslint-disable-line no-console
			}
			hasPlainText = false;
		}

		// Building response with all the needed data for a chapter to be usable
		yield put({
			type: 'loadnewchapter',
			plainText,
			plainTextFilesetId,
			formattedText,
			formattedTextFilesetId,
			formattedJson,
			formattedJsonFilesetId,
			hasPlainText,
			hasFormattedText,
			hasFormattedJson,
			hasAudio,
			bookId,
			chapter,
			verse,
		});

		return {
			plainText,
			formattedText,
			formattedJson,
			hasPlainText,
			hasFormattedText,
			hasFormattedJson,
			hasAudio,
		};
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Caught in get chapter from url', error); // eslint-disable-line no-console
		}
	}

	// Return a default object in the case that none of the api calls work
	return {
		plainText: [],
		formattedText: '',
		hasFormattedText: false,
		hasFormattedJson: false,
		hasPlainText: false,
		hasAudio: false,
	};
}

// Utility function for getting the plain text
function* tryNext({ urls, index, bookId, chapter }) {
	let plainText = [];
	let plainTextFilesetId = '';
	try {
		const res = yield call(
			apiProxy.get,
			`/bibles/filesets/${urls[index]}/${bookId}/${chapter}`,
			{
				book_id: bookId,
				chapter_id: chapter,
			},
		);

		plainText = res.data;
		plainTextFilesetId = urls[index];

		return {
			plainText,
			plainTextFilesetId,
		};
	} catch (err) {
		if (err) {
			console.warn('Error in try next function', err); // eslint-disable-line no-console
		}

		try {
			const res = yield call(
				apiProxy.get,
				`/bibles/filesets/${urls[index + 1]}/${bookId}/${chapter}`,
				{
					book_id: bookId,
					chapter_id: chapter,
				},
			);
			plainText = res.data;

			plainTextFilesetId = urls[index];

			return {
				plainText,
				plainTextFilesetId,
			};
		} catch (error) {
			if (error) {
				console.warn('Error in try next function', error); // eslint-disable-line no-console
			}
			return {
				plainText,
				plainTextFilesetId,
			};
		}
	}
}

// I think it makes the most sense to start this running from within
// The getChapterFromUrl function. This may need to be adjusted when
// HLS streaming is implemented
export function* getChapterAudio({ filesets, bookId, chapter }) {
	// Send a loadaudio action for each fail in production so that there isn't a link loaded
	// This handles the case where a user already has a link but getting the next one fails
	// Parse filesets |▰╭╮▰|
	// TODO: Need to handle when there are multiple filesets for the same audio type
	const filteredFilesets = filesets.reduce((a, file) => {
		const newFile = { ...a };

		if (
			file.type === FILESET_TYPE_AUDIO ||
			file.type === FILESET_TYPE_AUDIO_DRAMA
		) {
			newFile[file.id] = file;
		}

		return newFile;
	}, {});
	// If there isn't any audio then I want to just load an empty string and stop the function
	if (!Object.keys(filteredFilesets).length) {
		yield put({ type: 'loadaudio', audioPaths: [''] });
		return;
	}
	const completeAudio = [];
	const ntAudio = [];
	const otAudio = [];
	const partialOtAudio = [];
	const partialNtAudio = [];
	const partialNtOtAudio = [];

	Object.entries(filteredFilesets)
		.sort((a, b) => {
			if (a[1].type === FILESET_TYPE_AUDIO_DRAMA) return 1;
			if (b[1].type === FILESET_TYPE_AUDIO_DRAMA) return 1;
			if (a[1].type > b[1].type) return 1;
			if (a[1].type < b[1].type) return -1;
			return 0;
		})
		.forEach((fileset) => {
			if (fileset[1].size === FILESET_SIZE_COMPLETE) {
				completeAudio.push({ id: fileset[0], data: fileset[1] });
			} else if (fileset[1].size === FILESET_SIZE_NEW_TESTAMENT) {
				ntAudio.push({ id: fileset[0], data: fileset[1] });
			} else if (fileset[1].size === FILESET_SIZE_OLD_TESTAMENT) {
				otAudio.push({ id: fileset[0], data: fileset[1] });
			} else if (fileset[1].size === FILESET_SIZE_OLD_TESTAMENT_PORTION) {
				partialOtAudio.push({ id: fileset[0], data: fileset[1] });
			} else if (fileset[1].size === FILESET_SIZE_NEW_TESTAMENT_PORTION) {
				partialNtAudio.push({ id: fileset[0], data: fileset[1] });
			} else if (
				fileset[1].size ===
				FILESET_SIZE_NEW_TESTAMENT_PORTION_OLD_TESTAMENT_PORTION
			) {
				partialNtOtAudio.push({ id: fileset[0], data: fileset[1] });
			}
		});
	const otLength = otAudio.length;
	const ntLength = ntAudio.length;

	let otHasUrl = false;
	let ntHasUrl = false;

	if (completeAudio.length) {
		try {
			const response = yield call(
				apiProxy.get,
				`/bibles/filesets/${get(completeAudio, [0, 'id'])}`,
				{
					book_id: bookId,
					chapter_id: chapter,
					type: get(completeAudio, [0, 'data', 'type']),
				},
			);
			const audioPaths = [get(response, ['data', 0, 'path'])];
			yield put({
				type: 'loadaudio',
				audioPaths,
				audioFilesetId: get(completeAudio, [0, 'id']),
			});
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio complete audio', error); // eslint-disable-line no-console
				yield put({ type: 'loadaudio', audioPaths: [''] });
			} else if (
				process.env.NODE_ENV === 'production' ||
				process.env.NODE_ENV === 'staging'
			) {
				yield put({ type: 'loadaudio', audioPaths: [''] });
			}
		}
		return;
	} else if (ntLength && !otLength) {
		try {
			const response = yield call(
				apiProxy.get,
				`/bibles/filesets/${get(ntAudio, [0, 'id'])}`,
				{
					book_id: bookId,
					chapter_id: chapter,
					type: get(ntAudio, [0, 'data', 'type']),
				},
			);
			const audioPaths = [get(response, ['data', 0, 'path'])];
			ntHasUrl = !!audioPaths[0];
			yield put({
				type: 'loadaudio',
				audioPaths,
				audioFilesetId: get(ntAudio, [0, 'id']),
			});
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio nt audio', error); // eslint-disable-line no-console
				yield put({ type: 'loadaudio', audioPaths: [''] });
			} else if (
				process.env.NODE_ENV === 'production' ||
				process.env.NODE_ENV === 'staging'
			) {
				yield put({ type: 'loadaudio', audioPaths: [''] });
			}
		}
	} else if (otLength && !ntLength) {
		try {
			const response = yield call(
				apiProxy.get,
				`/bibles/filesets/${get(otAudio, [0, 'id'])}`,
				{
					book_id: bookId,
					chapter_id: chapter,
					type: get(otAudio, [0, 'data', 'type']),
				},
			);
			const audioPaths = [get(response, ['data', 0, 'path'])];
			otHasUrl = !!audioPaths[0];
			yield put({
				type: 'loadaudio',
				audioPaths,
				audioFilesetId: get(otAudio, [0, 'id']),
			});
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio ot audio', error); // eslint-disable-line no-console
				yield put({ type: 'loadaudio', audioPaths: [''] });
			} else if (
				process.env.NODE_ENV === 'production' ||
				process.env.NODE_ENV === 'staging'
			) {
				yield put({ type: 'loadaudio', audioPaths: [''] });
			}
		}
	} else if (ntLength && otLength) {
		let ntPath = '';
		let otPath = '';

		try {
			const response = yield call(
				apiProxy.get,
				`/bibles/filesets/${get(ntAudio, [0, 'id'])}`,
				{
					book_id: bookId,
					chapter_id: chapter,
					type: get(ntAudio, [0, 'data', 'type']),
				},
			);
			const audioPaths = [get(response, ['data', 0, 'path'])];
			ntPath = audioPaths;
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio nt audio', error); // eslint-disable-line no-console
				yield put({ type: 'loadaudio', audioPaths: [''] });
			} else if (
				process.env.NODE_ENV === 'production' ||
				process.env.NODE_ENV === 'staging'
			) {
				yield put({ type: 'loadaudio', audioPaths: [''] });
			}
		}
		try {
			const response = yield call(
				apiProxy.get,
				`/bibles/filesets/${get(otAudio, [0, 'id'])}`,
				{
					book_id: bookId,
					chapter_id: chapter,
					type: get(otAudio, [0, 'data', 'type']),
				},
			);
			const audioPaths = [get(response, ['data', 0, 'path'])];
			otPath = audioPaths;
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio ot audio', error); // eslint-disable-line no-console
				yield put({ type: 'loadaudio', audioPaths: [''] });
			} else if (
				process.env.NODE_ENV === 'production' ||
				process.env.NODE_ENV === 'staging'
			) {
				yield put({ type: 'loadaudio', audioPaths: [''] });
			}
		}
		ntHasUrl = !!ntPath;
		otHasUrl = !!otPath;
		yield put({
			type: 'loadaudio',
			audioPaths: ntPath || otPath,
			audioFilesetId: ntPath
				? get(ntAudio, [0, 'id'])
				: get(otAudio, [0, 'id']),
		});
	}

	if (partialOtAudio.length && !otLength && !otHasUrl && !ntHasUrl) {
		// return a list of all of the s3 file paths since a chapter could have v1-v5 and v20-v25
		try {
			// Need to iterate over each object here to see if I can find the right chapter
			const response = yield call(
				apiProxy.get,
				`/bibles/filesets/${get(partialOtAudio, [0, 'id'])}`,
				{
					book_id: bookId,
					chapter_id: chapter,
					type: get(partialOtAudio, [0, 'data', 'type']),
				},
			);
			const audioPaths = [];
			if (response.data.length > 1) {
				response.data.forEach((file) => audioPaths.push(file.path));
			} else {
				audioPaths.push(get(response, ['data', 0, 'path']));
			}
			yield put({
				type: 'loadaudio',
				audioPaths,
				audioFilesetId: get(partialOtAudio, [0, 'id']),
			});
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio partial audio', error); // eslint-disable-line no-console
				yield put({ type: 'loadaudio', audioPaths: [''] });
			} else if (
				process.env.NODE_ENV === 'production' ||
				process.env.NODE_ENV === 'staging'
			) {
				yield put({ type: 'loadaudio', audioPaths: [''] });
			}
		}
	}

	if (partialNtAudio.length && !ntLength && !otHasUrl && !ntHasUrl) {
		// return a list of all of the s3 file paths since a chapter could have v1-v5 and v20-v25
		try {
			// Need to iterate over each object here to see if I can find the right chapter
			const response = yield call(
				apiProxy.get,
				`/bibles/filesets/${get(partialNtAudio, [0, 'id'])}`,
				{
					book_id: bookId,
					chapter_id: chapter,
					type: get(partialNtAudio, [0, 'data', 'type']),
				},
			);
			const audioPaths = [];
			if (response.data.length > 1) {
				response.data.forEach((file) => audioPaths.push(file.path));
			} else {
				audioPaths.push(get(response, ['data', 0, 'path']));
			}
			yield put({
				type: 'loadaudio',
				audioPaths,
				audioFilesetId: get(partialNtAudio, [0, 'id']),
			});
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio partial audio', error); // eslint-disable-line no-console
				yield put({ type: 'loadaudio', audioPaths: [''] });
			} else if (
				process.env.NODE_ENV === 'production' ||
				process.env.NODE_ENV === 'staging'
			) {
				yield put({ type: 'loadaudio', audioPaths: [''] });
			}
		}
	}

	if (
		partialNtOtAudio.length &&
		!otLength &&
		!ntLength &&
		!otHasUrl &&
		!ntHasUrl
	) {
		// return a list of all of the s3 file paths since a chapter could have v1-v5 and v20-v25
		try {
			// Need to iterate over each object here to see if I can find the right chapter
			const response = yield call(
				apiProxy.get,
				`/bibles/filesets/${get(partialNtOtAudio, [0, 'id'])}`,
				{
					book_id: bookId,
					chapter_id: chapter,
					type: get(partialNtOtAudio, [0, 'data', 'type']),
				},
			);
			const audioPaths = [];
			if (response.data.length > 1) {
				response.data.forEach((file) => audioPaths.push(file.path));
			} else {
				audioPaths.push(get(response, ['data', 0, 'path']));
			}
			yield put({
				type: 'loadaudio',
				audioPaths,
				audioFilesetId: get(partialNtOtAudio, [0, 'id']),
			});
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio partial audio', error); // eslint-disable-line no-console
				yield put({ type: 'loadaudio', audioPaths: [''] });
			} else if (
				process.env.NODE_ENV === 'production' ||
				process.env.NODE_ENV === 'staging'
			) {
				yield put({ type: 'loadaudio', audioPaths: [''] });
			}
		}
	}
}

// Removes duplicate copyright entries based on certain keys
const deduplicateCopyrights = (
	items,
	keys = ['message', 'testament'],
) => {
	const seen = new Set();
	return items.filter((item) => {
		const key = keys.map((k) => item[k]).join('|');
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
};

export function* getCopyrightSaga({ filesetIds }) {
	// TODO: Try to optimize at least a little bit
	const filteredFilesetIds = uniqWith(
		filesetIds.filter((f) => codes[f.type] && codes[f.size]),
		(a, b) => a.type === b.type && a.size === b.size,
	);
	const videoFileset = filesetIds.filter(
		(f) => f.type === FILESET_TYPE_VIDEO_STREAM && codes[f.size],
	)[0];
	const copyrightRequests = [];

	filteredFilesetIds.forEach((set) => {
		if (set.type !== FILESET_TYPE_VIDEO_STREAM) {
			copyrightRequests.push(
				// eslint-disable-next-line redux-saga/yield-effects
				call(apiProxy.get, `/bibles/filesets/${set.id}/copyright`, {
					type: set.type,
				}),
			);
		}
	});

	try {
		const response = yield all(copyrightRequests);
		const vidRes = [];
		if (videoFileset) {
			const r = yield call(
				apiProxy.get,
				`/bibles/filesets/${videoFileset.id}/copyright`,
				{
					type: videoFileset.type,
				},
			);
			vidRes.push(r);
		}
		// Takes the response and turns it into an array that is more easily used and that doesn't contain unnecessary fields
		const copyrights =
			response.map((cp) =>
				Object.keys(cp).length
					? {
							message: cp.copyright?.copyright,
							testament: cp.size || cp.set_size_code,
							type: cp.type || cp.set_type_code,
							organizations: cp.copyright?.organizations?.map((org) => {
								// Getting landscape instead of icons
								const icon = org.logos?.find((l) => !l.icon);
								if (org.translations.length) {
									return {
										name: org.translations[0].name,
										logo: icon || org.logos?.[0],
										isIcon: icon === undefined ? 1 : 0,
										url: org.url_website,
									};
								}
								return {
									name: '',
									logo: '',
									isIcon: 0,
									url: '',
								};
							}),
						}
					: {},
			) || [];
		const videoCopyright =
			vidRes.map((cp) =>
				Object.keys(cp).length
					? {
							message: cp.copyright?.copyright,
							testament: cp.size || cp.set_size_code,
							type: cp.type || cp.set_type_code,
							organizations: cp.copyright?.organizations?.map((org) => {
								// Getting landscape instead of icons
								const icon = org.logos.find((l) => !l.icon);
								if (org.translations.length) {
									return {
										name: org.translations[0].name,
										logo: icon || (org.logos && org.logos[0]),
										isIcon: icon === undefined ? 1 : 0,
										url: org.url_website,
									};
								}
								return {
									name: '',
									logo: '',
									isIcon: 0,
									url: '',
								};
							}),
						}
					: {},
			) || [];

		// Defensive code — helper function to deduplicate copyrights by type, message, and testament.
		// Since we retrieve copyrights by fileset, it’s possible to have multiple identical entries
		// across different filesets. This function removes those duplicates.
		// Currently, the copyright value does not depend on the testament (set_size_code),
		// and we will not have different copyrights per fileset, since it depends on license groups.
		// In general, we only need one copyright per mode (video, audio, text).
		const audioTypes = deduplicateCopyrights(
			copyrights.filter(
				(c) =>
					c.type === FILESET_TYPE_AUDIO || c.type === FILESET_TYPE_AUDIO_DRAMA,
			),
		);

		const textTypes = deduplicateCopyrights(
			copyrights.filter(
				(c) =>
					c.type === FILESET_TYPE_TEXT_PLAIN ||
					c.type === FILESET_TYPE_TEXT_FORMAT ||
					c.type === FILESET_TYPE_TEXT_JSON,
			),
		);
		const videoTypes = deduplicateCopyrights(
			videoCopyright.filter((c) => c.type === FILESET_TYPE_VIDEO_STREAM),
		);

		const copyrightObject = {
			audio: audioTypes,
			text: textTypes,
			video: videoTypes,
		};

		yield put({ type: 'loadcopyright', copyrights: copyrightObject });
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.warn('Caught in get copyright', err); // eslint-disable-line no-console
		}
	}
}

export function* createSocialUser({ provider }) {
	const params = {
		project_id: process.env.NOTES_PROJECT_ID,
	};
	if (process.env.NODE_ENV === 'development') {
		params.alt_url = true;
	}

	try {
		const response = yield call(apiProxy.get, `/login/${provider}`, params);
		if (response.data.redirect_url) {
			// only let provider cookie be set for 15 minutes
			const mins = 1000 * 60 * 15;
			document.cookie = `bible_is_provider=${
				response.data.provider_id
			}; expires=${new Date(
				new Date().getTime() + mins,
			).toUTCString()}; path=/`;
			Router.replace(response.data.redirect_url);
		}
	} catch (err) {
		console.log('create social error', err); // eslint-disable-line no-console
	}
}

// Individual exports for testing
export default function* defaultSaga() {
	yield takeLatest(INIT_APPLICATION, initApplication);
	yield takeLatest('getchapter', getChapterFromUrl);
	yield takeLatest(ADD_HIGHLIGHTS, addHighlight);
	yield takeLatest('getbible', getBibleFromUrl);
	yield takeLatest('getaudio', getChapterAudio);
	yield takeLatest(ADD_BOOKMARK, addBookmark);
	yield takeLatest(GET_NOTES_HOMEPAGE, getNotesForChapter);
	yield takeLatest(GET_COPYRIGHTS, getCopyrightSaga);
	yield takeLatest(DELETE_HIGHLIGHTS, deleteHighlights);
	yield takeLatest(CREATE_USER_WITH_SOCIAL_ACCOUNT, createSocialUser);
}
