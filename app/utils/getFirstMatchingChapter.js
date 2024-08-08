// Takes two separate book lists and finds the first book/chapter
// combination that matches in both lists

// Helper function to reduce books into a map of book_id to chapters
const reduceBooks = (filesetTypeObj) =>
  Object.values(filesetTypeObj)?.[0]?.books?.reduce((acc, book) => {
    acc[book.book_id] = book.chapters;
    return acc;
  }, {}) || {};

const firstMatchingChapter = (textObj, audioObj) => {
  const text = reduceBooks(textObj);
  const audio = reduceBooks(audioObj);

  let firstLocation;

  Object.keys(text).some((key) => {
    const textChapters = text[key];
    const audioChapters = audio[key];

    if (audioChapters) {
      return textChapters.some((chapter) => {
        if (audioChapters.includes(chapter)) {
          firstLocation = `${key}/${chapter}`;
          return true;
        }
        return false;
      });
    }
    return false;
  });

  return firstLocation;
};

export default firstMatchingChapter;
