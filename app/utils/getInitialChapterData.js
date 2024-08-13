import cachedFetch from './cachedFetch';
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
		const url = `${process.env.BASE_API_ROUTE}/bibles/filesets/${id}?key=${
			process.env.DBP_API_KEY
		}&v=4&book_id=${bookId}&chapter_id=${chapter}&type=${FILESET_TYPE_TEXT_FORMAT}`;
		const res = await cachedFetch(url).catch((e) => {
			if (process.env.NODE_ENV === 'development') {
				console.log('Error in request for formatted fileset: ', e); // eslint-disable-line no-console
			}
		});
		const path = res?.data[0]?.path;
		let text = '';
		if (path) {
			text = await cachedFetch(path)
				.then((textRes) => textRes)
				.catch((e) => {
					if (process.env.NODE_ENV === 'development') {
						console.log(
							'Error fetching formatted text: ',
							e.message,
							' path: ',
							path,
						);  
					}
				});
		}

		return text || '';
	});

	const formattedJsonPromises = formattedJsonFilesetIds.map(async (id) => {
		const url = `${process.env.BASE_API_ROUTE}/bibles/filesets/${id}?key=${
			process.env.DBP_API_KEY
		}&v=4&book_id=${bookId}&chapter_id=${chapter}&type=${FILESET_TYPE_TEXT_JSON}`;
		const res = await cachedFetch(url).catch((e) => {
			if (process.env.NODE_ENV === 'development') {
				console.log('Error in request for formatted JSON fileset: ', e); // eslint-disable-line no-console
			}
		});
		const path = res?.data[0]?.path;
		let text = '';
		if (path) {
			text = await cachedFetch(path)
				.then((textRes) => JSON.stringify(textRes))
				.catch((e) => {
					if (process.env.NODE_ENV === 'development') {
						console.log(
							'Error fetching formatted JSON text: ',
							e.message,
							' path: ',
							path,
						);  
					}
				});
		}

		return text || '';
	});

	let plainTextJson = JSON.stringify({});
	// start promise for plain text
	const plainPromises = plainFilesetIds.map(async (id) => {
		const url = `${
			process.env.BASE_API_ROUTE
		}/bibles/filesets/${id}/${bookId}/${chapter}?key=${
			process.env.DBP_API_KEY
		}&v=4`;
		const res = await cachedFetch(url)
			.then((json) => {
				plainTextJson = JSON.stringify(json.data);
				return json;
			})
			.catch((e) => {
				if (process.env.NODE_ENV === 'development') {
					console.error('Error in request for plain fileset: ', 'url', url, e); // eslint-disable-line no-console
				}
				return { data: [] };
			});

		return res ? res.data : [];
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
