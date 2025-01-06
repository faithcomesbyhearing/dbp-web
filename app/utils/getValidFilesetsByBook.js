import { FILESET_SIZE_COMPLETE, FILESET_SIZE_STORIES } from '../constants/bibleFileset';
import { BOOK_COVENANT_TESTAMENT } from '../constants/books';

/**
 * Filter the list of plain Fileset Ids to include only those that belong to the same testament as the given book.
 *
 * @param {Book{testament:string}} book
 * @param {Array[type, fileset_id, testament]} filesetIdsForBookMetadata
 * @param {Array} filesets
 * @param {Array[{fileset_id : Object{filesetType:string, books:Array}}]} filesetIdsWithBooksAllowed
 * @returns
 */
const getValidFilesetsByBook = (
  book,
  filesetIdsForBookMetadata,
  filesets,
  filesetIdsWithBooksAllowed,
) => {
  const idsForBookMetadataIndexed = {};
  const filesetWithBooksAllowedIndexed = {};

  filesetIdsWithBooksAllowed.forEach((item) => {
    const [key, value] = Object.entries(item)[0];
    if (!filesetWithBooksAllowedIndexed[key]) {
      filesetWithBooksAllowedIndexed[key] = [];
    }
    filesetWithBooksAllowedIndexed[key] = filesetWithBooksAllowedIndexed[key].concat(value.books);
  });

  filesetIdsForBookMetadata.forEach(([filesetType, filesetId, filesetSize]) => {
    if (!filesetId) return;

    const booksAllowed = (filesetWithBooksAllowedIndexed[filesetId] || []).reduce((acc, { book_id: bookId }) => {
      acc[bookId] = true;
      return acc;
    }, {});

    idsForBookMetadataIndexed[filesetId] = idsForBookMetadataIndexed[filesetId] || {};
    idsForBookMetadataIndexed[filesetId][filesetType] = {
      testament: filesetSize,
      booksAllowed,
    };
  });

  return filesets.filter((fileset) => {
    // 1. If the Fileset testament is NTP, it will only be considered valid if the testament of the book is also NT.
    // 2. A Fileset with a testament code of C is considered valid because it includes both the Old and New Testaments.
    //    This is because the C size code denotes a fileset that includes content from both testaments.
    const filesetMetadata = idsForBookMetadataIndexed[fileset.id]?.[fileset.type];

    if (!filesetMetadata) {
      return false;
    }

    const isCompleteTestament = filesetMetadata.testament === FILESET_SIZE_COMPLETE;
    const isMatchingTestament = filesetMetadata.testament.includes(book.testament);
    const isCovenantTestament = FILESET_SIZE_STORIES === filesetMetadata.testament && book.testament === BOOK_COVENANT_TESTAMENT;
    const isBookAllowed = filesetMetadata.booksAllowed[book.book_id];

    return (isCompleteTestament || isMatchingTestament || isCovenantTestament) && isBookAllowed;
  });
};

export default getValidFilesetsByBook;
