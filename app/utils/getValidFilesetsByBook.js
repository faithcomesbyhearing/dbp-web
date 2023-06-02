import { FILESET_SIZE_COMPLETE } from '../constants/bibleFileset';

/**
 * Filter the list of plain Fileset Ids to include only those that belong to the same testament as the given book.
 *
 * @param {Book{testament:string}} book
 * @param {Array[type, fileset_id, testament]} filesetIdsForBookMetadata
 * @param {Array} filesets
 * @returns
 */
const getValidFilesetsByBook = (
	book,
	filesetIdsForBookMetadata,
	filesets,
	filesetIdsWithBooksAllowed,
) => {
	const idsForBookMetadataIndexed = {};
	const filesetWithBooksAllowedIndexed = filesetIdsWithBooksAllowed.reduce(
		(accum, fileset) => ({ ...accum, ...fileset }),
		{},
	);

	filesetIdsForBookMetadata.forEach((fileset) => {
		const filesetId = fileset[1];
		const filesetType = fileset[0];
		const filesetSize = fileset[2];

		if (filesetId) {
			const booksAllowed = {};
			if (filesetWithBooksAllowedIndexed[filesetId]) {
				filesetWithBooksAllowedIndexed[filesetId].forEach((bookAllowed) => {
					booksAllowed[bookAllowed.book_id] = true;
				});
			}

			idsForBookMetadataIndexed[filesetId] = {
				type: filesetType,
				id: filesetId,
				testament: filesetSize,
				booksAllowed,
			};
		}
	});

	return filesets.filter(
		(fileset) =>
			// 1. If the Fileset testament is NTP, it will only be considered valid if the testament of the book is also NT.
			// 2. A Fileset with a testament code of C is considered valid because it includes both the Old and New Testaments.
			//    This is because the C size code denotes a fileset that includes content from both testaments.
			(idsForBookMetadataIndexed[fileset.id]?.testament ===
				FILESET_SIZE_COMPLETE ||
				idsForBookMetadataIndexed[fileset.id]?.testament.includes(
					book.testament,
				)) &&
			idsForBookMetadataIndexed[fileset.id]?.booksAllowed[book.book_id],
	);
};

export default getValidFilesetsByBook;
