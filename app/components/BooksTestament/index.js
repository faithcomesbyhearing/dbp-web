/**
 *
 * BooksTestament
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import ChaptersContainer from '../ChaptersContainer';
import SvgWrapper from '../SvgWrapper';

function BooksTestament({
	books,
	selectedBookName,
	testamentPrefix,
	handleRef,
	handleBookClick,
	handleChapterClick,
	activeBookName,
	activeTextId,
	activeChapter,
	audioType,
	testamentTitle,
}) {
	return [
		<div key={`${testamentPrefix}_title_key`} className={'testament-title'}>
			<h3>{testamentTitle}</h3>
		</div>,
		books.map((book) => (
			<div
				className={'book-button'}
				data-testid={(book['name'] || book['name_short']).concat(
					book['book_id'],
				)}
				ref={
					(book['name'] || book['name_short']) === selectedBookName
						? (el) => handleRef(el, 'button')
						: null
				}
				key={(book['name'] || book['name_short']).concat(book['book_id'])}
				id={(book['name'] || book['name_short']).concat(book['book_id'])}
				onClick={(e) => handleBookClick(e, book['name'] || book['name_short'])}
			>
				<h4
					className={
						(book['name'] || book['name_short']) === selectedBookName
							? 'active-book'
							: ''
					}
				>
					{book['name'] || book['name_short']}
					{book['hasVideo'] && (
						<SvgWrapper className={'gospel-films'} svgid={'gospel_films'} />
					)}
				</h4>
				<ChaptersContainer
					bookName={book['name']}
					audioType={audioType}
					bookNameShort={book['name_short']}
					activeTextId={activeTextId}
					activeChapter={activeChapter}
					handleChapterClick={handleChapterClick}
					chapters={book['chapters']}
					selectedBookName={selectedBookName}
					activeBookName={activeBookName}
					bookId={book['book_id']}
					book={book}
				/>
			</div>
		)),
	];
}

BooksTestament.propTypes = {
	books: PropTypes.object,
	handleRef: PropTypes.func,
	handleBookClick: PropTypes.func,
	handleChapterClick: PropTypes.func,
	activeChapter: PropTypes.number,
	testamentPrefix: PropTypes.string,
	testamentTitle: PropTypes.string,
	selectedBookName: PropTypes.string,
	activeBookName: PropTypes.string,
	activeTextId: PropTypes.string,
	audioType: PropTypes.string,
};

export default BooksTestament;
