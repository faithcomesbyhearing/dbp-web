import universalFetch from './universalFetch';

import {
	FILESET_TYPE_TEXT_FORMAT,
	FILESET_TYPE_TEXT_JSON,
} from '../constants/bibleFileset';

export default async ({
	plainFilesetIds,
	formattedFilesetIds,
	formattedJsonFilesetIds,
	bookId: lowerCaseBookId,
	chapter,
}) => {
	// Gather all initial data
	const bookId = lowerCaseBookId.toUpperCase();
	// start promise for formatted text
	const formattedPromises = formattedFilesetIds.map(async (id) => {
		const { data } = await universalFetch.get(
			`/bibles/filesets/${id}`,
			{
				book_id: bookId,
				chapter_id: chapter,
				type: FILESET_TYPE_TEXT_FORMAT,
			},
		);
		const path = data?.[0]?.path;
		let text = '';
		if (path) {
			try {
				text = await universalFetch.get(path);
			} catch (e) {
				if (process.env.NODE_ENV === 'development') {
					console.log(
						'Error fetching formatted text: ',
						e.message,
						' path: ',
						path,
					);
				}
			}
		}

		return text || '';
	});

	const formattedJsonPromises = formattedJsonFilesetIds.map(async (id) => {
		const { data } = await universalFetch.get(
			`/bibles/filesets/${id}`,
			{
				book_id: bookId,
				chapter_id: chapter,
				type: FILESET_TYPE_TEXT_JSON,
			},
		);
		const path = data?.[0]?.path;
		let text = '';
		if (path) {
			try {
				const textRes = await universalFetch.get(path);
				text = JSON.stringify(textRes);
			} catch (e) {
				if (process.env.NODE_ENV === 'development') {
					console.log(
						'Error fetching formatted JSON text: ',
						e.message,
						' path: ',
						path,
						'err', e,
					);
				}
			}
		}

		return text || '';
	});

	let plainTextJson = JSON.stringify({});
	// start promise for plain text
	const plainPromises = plainFilesetIds.map(async (id) => {
		const { data } = await universalFetch.get(
			`/bibles/filesets/${id}/${bookId}/${chapter}`,
		);
		return data || [];
	});

	let plainTextFound = false;
	let plainText = [];
	/* eslint-disable */
	for (const promise of plainPromises) {
		if (plainTextFound) break;
		await promise
			.then((res) => {
				plainText = res;
				plainTextFound = true;
			})
			.catch((reason) => {
				if (process.env.NODE_ENV === 'development') {
					console.error('Reason race threw: ', reason.message);  
				}
			});
	}
	const formattedText = await Promise.all(formattedPromises);
	const formattedJsonText = await Promise.all(formattedJsonPromises);

	/* eslint-enable */
	// Return a default object in the case that none of the api calls work
	return {
		plainText,
		plainTextJson,
		formattedText: formattedText[0] || '',
		formattedJsonText: formattedJsonText[0] || '',
	};
};
