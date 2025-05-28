import url from './hrefLinkOrAsLink';

export default ({
	books,
	chapter,
	bookId,
	textId,
	verseNumber,
	text: chapterText,
	isHref,
	audioType,
}) => {
	if (!books?.length) {
		return url({ audioType, textId, bookId, chapter, isHref });
	}
	if (verseNumber && chapterText.length) {
		const prevVerse = parseInt(verseNumber, 10) - 1 || 1;
		const lastVerse = chapterText.length;
		// Is it past the max verses for the chapter?
		// if not increment it by 1
		if (prevVerse <= lastVerse && prevVerse > 0) {
			// Verse was valid

			return url({
				audioType,
				textId,
				bookId,
				chapter,
				nextVerse: prevVerse,
				isHref,
			});
		} else if (prevVerse < 0) {
			// Verse was below valid range

			return url({
				audioType,
				textId,
				bookId,
				chapter,
				nextVerse: '1',
				isHref,
			});
		} else if (prevVerse > lastVerse) {
			// Verse was above valid range

			return url({
				audioType,
				textId,
				bookId,
				chapter,
				nextVerse: lastVerse,
				isHref,
			});
		}
	} else if (verseNumber) {
		const nextVerse = parseInt(verseNumber, 10) - 1 || 1;

		if (nextVerse && nextVerse > 0) {
			// The next verse is within a valid range

			return url({ audioType, textId, bookId, chapter, nextVerse, isHref });
		} else if (nextVerse < 0) {
			// The next verse is below 0 and thus invalid

			return url({
				audioType,
				textId,
				bookId,
				chapter,
				nextVerse: '1',
				isHref,
			});
		}
	}

	if (
		books[0] &&
		bookId.toLowerCase() === books[0].book_id.toLowerCase() &&
		chapter - 1 === 0
	) {
		return url({ audioType, textId, bookId, chapter, isHref });
	}

	let activeBookIndex;
	let previousBookIndex;

	books.forEach((book, index) => {
		if (book.book_id.toLowerCase() === bookId.toLowerCase()) {
			activeBookIndex = index;

			if (index - 1 >= 0) {
				previousBookIndex = index - 1;
			} else {
				previousBookIndex = index;
			}
		}
	});

	const previousBook = books[previousBookIndex] ?? {
		chapters: [],
		book_id: '',
	};
	const activeBook = books[activeBookIndex] ?? { chapters: [], book_id: '' };
	if (chapter - 1 === 0) {
		const chapters = Array.isArray(previousBook.chapters)
			? previousBook.chapters
			: [];

		const lastChapter =
			(chapters.length && chapters[chapters.length - 1]) || chapter;
		// Goes to the last chapter in the previous book
		return url({
			audioType,
			textId,
			bookId: previousBook['book_id'],
			// chapter: previousBook?.['chapters']?.[-1],
			chapter: lastChapter,
			isHref,
		});
	}
	// If the chapter number is greater than the active chapter then we have gone too far and need to get the previous chapter
	const chapterIndex = activeBook['chapters'].findIndex(
		(c) => c === chapter || c > chapter,
	);

	if (!chapterIndex) {
		return url({ audioType, textId, bookId, chapter, isHref });
	}

	return url({ audioType, textId, bookId, chapter: chapterIndex, isHref });
};
