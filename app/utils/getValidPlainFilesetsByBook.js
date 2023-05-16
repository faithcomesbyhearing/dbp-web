import {
	FILESET_SIZE_COMPLETE,
} from '../constants/bibleFileset';

/**
 * Filter the list of plain Fileset Ids to include only those that belong to the same testament as the given book.
 *
 * @param {Book{testament:string}} book
 * @param {Array[type, fileset_id, testament]} filesetIdsForBookMetadata
 * @param {Array} plainFilesetIds
 * @returns
 */
const getValidPlainFilesetsByBook = (
	book,
	filesetIdsForBookMetadata,
	plainFilesetIds,
) => {
	const idsForBookMetadataIndexed = {};

	filesetIdsForBookMetadata.forEach((fileset) => {
		if (fileset[1]) {
			idsForBookMetadataIndexed[fileset[1]] = {
				type: fileset[0],
				id: fileset[1],
				testament: fileset[2],
			};
		}
	});

	return plainFilesetIds.filter((filesetId) =>
		// 1. If the Fileset testament is NTP, it will only be considered valid if the testament of the book is also NT.
		// 2. A Fileset with a testament code of C is considered valid because it includes both the Old and New Testaments.
		//    This is because the C size code denotes a fileset that includes content from both testaments.
		 (
			idsForBookMetadataIndexed[filesetId]?.testament === FILESET_SIZE_COMPLETE ||
			idsForBookMetadataIndexed[filesetId]?.testament.includes(book.testament)
		)
	);
};

export default getValidPlainFilesetsByBook;
