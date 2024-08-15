import cachedFetch from './cachedFetch';
import removeDuplicates from './removeDuplicateObjects';

export default async ({ idsForBookMetadata }) => {
  // idsForBookMetadata is an array of arrays
  // each child array is structured as [filesetType, filesetId]
  // Track which results were mapped to video_stream
  const booksWithVideo = {};
  // Group all others together
  const bookMetaPromises = idsForBookMetadata.map(async ([filesetType, filesetId]) => {
    const hasVideo = filesetType === 'video_stream';
    const url = `${process.env.BASE_API_ROUTE}/bibles/filesets/${
      filesetId
    }/books?v=4&key=${process.env.DBP_API_KEY}&fileset_type=${filesetType}`;
    const res = await cachedFetch(url);
    const books = res.data || [];

    if (hasVideo) {
      books.forEach(({ book_id: bookId }) => {
        booksWithVideo[bookId] = true;
      });
    }
    return { [filesetId]: { filesetType, books } };
  });

  const allMetadata = await Promise.all(bookMetaPromises);

  const dataWithoutDuplicates = removeDuplicates(
    allMetadata.slice().reduce((reducedObjects, filesetObject) => {
      const filesetBook = Object.values(filesetObject)?.[0];
      if (filesetBook) {
        return [...reducedObjects, ...filesetBook.books];
      }
      return reducedObjects;
    }, []),
    'book_id',
  )
    .map((book) => ({ ...book, hasVideo: !!booksWithVideo[book.book_id] }))
    .sort((a, b) => (a.book_order > b.book_order ? 1 : -1));

  return [dataWithoutDuplicates, allMetadata];
};
