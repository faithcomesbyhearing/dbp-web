import get from 'lodash/get';
import apiProxy from './apiProxy';
import {
	FILESET_TYPE_AUDIO_DRAMA,
	FILESET_TYPE_AUDIO,
	FILESET_SIZE_NEW_TESTAMENT,
	FILESET_SIZE_NEW_TESTAMENT_PORTION,
	FILESET_SIZE_NEW_TESTAMENT_PORTION_OLD_TESTAMENT_PORTION,
	FILESET_SIZE_OLD_TESTAMENT,
	FILESET_SIZE_OLD_TESTAMENT_PORTION,
	FILESET_FILE_CODEC_OPUS,
} from '../constants/bibleFileset';

// TODO: Rewrite handling of audio calls to intelligently determine whether
// the resource is NT or OT and reduce number of calls
export default async (filesets, bookId, chapter, audioType) => {
	const audioReturnObject = { type: 'loadaudio', audioPaths: [''] };

	const filteredFilesets = filesets.reduce((newFile, file) => {
		const { id: fileId } = file;
		if (
			(audioType && file.type === audioType) ||
			(!audioType &&
				[FILESET_TYPE_AUDIO, FILESET_TYPE_AUDIO_DRAMA].includes(file.type))
		) {
			return { ...newFile, [fileId]: file };
		}

		return newFile;
	}, {});

	// If there isn't any audio then I want to just load an empty string and stop the function
	if (!Object.keys(filteredFilesets).length) {
		return { type: 'loadaudio', audioPaths: [''] };
	}

	const completeAudio = [];
	const ntAudio = [];
	const otAudio = [];
	const partialOtAudio = [];
	const partialNtAudio = [];
	const partialNtOtAudio = [];

	Object.entries(filteredFilesets)
		.sort((a, b) => {
			if (a[1].codec === FILESET_FILE_CODEC_OPUS) return 1;
			if (b[1].codec === FILESET_FILE_CODEC_OPUS) return -1;
			if (a[1].type === audioType) return -1;
			if (b[1].type === audioType) return 1;
			if (a[1].type === FILESET_TYPE_AUDIO_DRAMA) return -1;
			if (b[1].type === FILESET_TYPE_AUDIO_DRAMA) return 1;
			if (a[1].type > b[1].type) return -1;
			if (a[1].type < b[1].type) return 1;
			return 0;
		})
		.forEach((fileset) => {
			if (fileset[1].size === 'C') {
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
			const response = await apiProxy.get(
				`/bibles/filesets/${get(completeAudio, [0, 'id'])}`,
				{
					book_id: bookId,
					chapter_id: chapter,
					type: get(completeAudio, [0, 'data', 'type']),
				},
			);
			audioReturnObject.audioPaths = [get(response, ['data', 0, 'path'])];
			audioReturnObject.audioFilesetId = get(completeAudio, [0, 'id']);
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				/* eslint-disable no-console */
				console.error(
					'Caught in getChapterAudio complete audio',
					error.message,
				);
				/* eslint-enable no-console */
			}
		}
	} else {
		if (ntLength) {
			try {
				const response = await apiProxy.get(
					`/bibles/filesets/${get(ntAudio, [0, 'id'])}`,
					{
						book_id: bookId,
						chapter_id: chapter,
						type: get(ntAudio, [0, 'data', 'type']),
					},
				);
				const audioPaths = [get(response, ['data', 0, 'path'])];
				ntHasUrl = !!audioPaths[0];
				audioReturnObject.audioPaths = audioPaths;
				audioReturnObject.audioFilesetId = get(ntAudio, [0, 'id']);
			} catch (error) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Caught in getChapterAudio nt audio', error.message); // eslint-disable-line no-console
				}
			}
		}

		if (otLength) {
			try {
				const response = await apiProxy.get(
					`/bibles/filesets/${get(otAudio, [0, 'id'])}`,
					{
						book_id: bookId,
						chapter_id: chapter,
						type: get(otAudio, [0, 'data', 'type']),
					},
				);
				const audioPaths = [get(response, ['data', 0, 'path'])];
				otHasUrl = !!audioPaths[0];
				audioReturnObject.audioPaths = audioPaths;
				audioReturnObject.audioFilesetId = get(otAudio, [0, 'id']);
			} catch (error) {
				if (process.env.NODE_ENV === 'development') {
					console.error('Caught in getChapterAudio ot audio', error.message); // eslint-disable-line no-console
				}
			}
		}
	}

	if (partialOtAudio.length && !otLength && !otHasUrl && !ntHasUrl) {
		// return a list of all of the s3 file paths since a chapter could have v1-v5 and v20-v25
		try {
			// Need to iterate over each object here to see if I can find the right chapter
			const response = await apiProxy.get(
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
			audioReturnObject.audioPaths = audioPaths;
			audioReturnObject.audioFilesetId = get(partialOtAudio, [0, 'id']);
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio partial audio', error.message); // eslint-disable-line no-console
			}
		}
	}

	if (partialNtAudio.length && !ntLength && !otHasUrl && !ntHasUrl) {
		// return a list of all of the s3 file paths since a chapter could have v1-v5 and v20-v25
		try {
			// Need to iterate over each object here to see if I can find the right chapter
			const response = await apiProxy.get(
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
			audioReturnObject.audioPaths = audioPaths;
			audioReturnObject.audioFilesetId = get(partialNtAudio, [0, 'id']);
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio partial audio', error.message); // eslint-disable-line no-console
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
			const response = await apiProxy.get(
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
			audioReturnObject.audioPaths = audioPaths;
			audioReturnObject.audioFilesetId = get(partialNtOtAudio, [0, 'id']);
		} catch (error) {
			if (process.env.NODE_ENV === 'development') {
				console.error('Caught in getChapterAudio partial audio', error.message); // eslint-disable-line no-console
			}
		}
	}

	return audioReturnObject;
};
