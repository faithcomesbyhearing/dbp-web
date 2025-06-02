import { FILESET_SIZE_STORIES } from '../constants/bibleFileset';

/**
 * Filter the list of filesets to exclude those with a size equal to "STORIES" if the list contains more than one fileset.
 * Currently, the API is not filtering out the filesets with the "STORIES" size.
 *
 * @param {Array} filesets
 * @returns
 */
const removeStoriesFilesets = (filesets, setTypesAllowed) =>
	filesets.filter(
		(file) =>
			(setTypesAllowed[file.type] &&
				file.size !== FILESET_SIZE_STORIES &&
				filesets.length > 1) ||
			filesets.length === 1,
	);

export default removeStoriesFilesets;
