import apiProxy from '../../../utils/apiProxy';
import geFilesetsForBible from '../../../utils/geFilesetsForBible';

export function itemsParser(
	bibles,
	activeTextId,
	activeBookId,
	activeChapter,
	filterText,
	filter,
	handleVersionListClick,
) {
	const filteredBibles = filterText ? bibles.filter(filter) : bibles;
	// Change the way I figure out if a resource has text or audio
	// path, key, types, className, text, clickHandler
	// Set the path to just the bible_id and let app.js handle getting the actual book and chapter needed
	const scrubbedBibles = filteredBibles.reduce(
		(acc, bible) => [
			...acc,
			{
				path: {
					textId: bible['abbr'],
					bookId: activeBookId,
					chapter: activeChapter,
				},
				key: `${bible['abbr']}${bible['date']}`,
				clickHandler: (audioType) => handleVersionListClick(bible, audioType),
				className: bible['abbr'] === activeTextId ? 'active-version' : '',
				title: bible['name'],
				text: bible['vname'] || bible['name'] || bible['abbr'],
				altText:
					bible['vname'] && bible['vname'] !== bible['name']
						? bible['name']
						: '',
				types: bible['filesets'].reduce(
					(a, c) => ({ ...a, [c['type']]: true }),
					{},
				),
			},
		],
		[],
	);
	// When I first get the response from the server with filesets
	const audioAndText = [];
	const audioOnly = [];
	const textOnly = [];

	scrubbedBibles.forEach((b) => {
		if (
			(b.types.audio_drama || b.types.audio) &&
			(b.types.text_plain || b.types.text_json || b.types.text_format)
		) {
			audioAndText.push(b);
		} else if (b.types.audio_drama || b.types.audio) {
			audioOnly.push(b);
		} else {
			textOnly.push(b);
		}
	});
	if (audioAndText.length) {
		return audioAndText;
	} else if (audioOnly.length) {
		return audioOnly;
	}
	return textOnly;
}

export function filterFunction(bible) {
	const lowerCaseText = this.props.filterText.toLowerCase();
	const properties = ['vname', 'name', 'abbr', 'date'];

	return properties.some((property) => {
		const propValue = bible[property] || '';
		return propValue.toLowerCase().includes(lowerCaseText);
	});
}

export async function getTexts({ languageCode }) {
	// Put logic here for determining what url to direct to when user chooses new version
	// Benefits are that all the information can be gathered up front and behind a clear
	// loading spinner
	// Negatives are that the list of versions would take longer to load

	try {
		// Single API call instead of duplicate requests
		const response = await apiProxy.get('/bibles', { language_code: languageCode });
		const data = response.data || [];

		// Process all bibles once
		const processedBibles = data.map((bible) => ({
			...bible,
			filesets: bible.filesets ? geFilesetsForBible(bible.filesets) : [],
		}));

		// Filter for videos (have the required metadata properties)
		const videos = processedBibles.filter(
			(bible) => bible.abbr && bible.language && bible.language_id && bible.iso,
		);

		// Filter for texts (have required fileset types)
		const texts = processedBibles.filter(
			(text) =>
				text.iso &&
				text.abbr &&
				text.filesets?.find(
					(f) =>
						f.type === 'audio' ||
						f.type === 'audio_drama' ||
						f.type === 'text_plain' ||
						f.type === 'text_format' ||
						f.type === 'text_json',
				),
		);
		// Create map of videos for constant time lookup when iterating through the texts
		const videosMap = videos.reduce((a, c) => ({ ...a, [c.abbr]: c }), {});
		// Find any overlapping bibles between the videos and texts
		// Combine the filesets for only those overlapping bibles
		const mappedTexts = texts.map((text) => ({
			...text,
			filesets: videosMap[text.abbr]
				? [
						...text.filesets.filter(
							(f) =>
								f.type === 'audio' ||
								f.type === 'audio_drama' ||
								f.type === 'text_plain' ||
								f.type === 'text_format' ||
								f.type === 'text_json',
						),
						...videosMap[text.abbr].filesets,
					]
				: text.filesets.filter(
						(f) =>
							f.type === 'audio' ||
							f.type === 'audio_drama' ||
							f.type === 'text_plain' ||
							f.type === 'text_format' ||
							f.type === 'text_json',
					),
		}));

		return mappedTexts;
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error(error); // eslint-disable-line no-console
		}

		return [];
	}
}
