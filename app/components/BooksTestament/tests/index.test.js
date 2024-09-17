// BooksTestament.test.js

import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import BooksTestament from '..';

const books = fromJS([
	{
		book_id: 'GEN',
		book_id_usfx: 'GN',
		book_id_osis: 'Gen',
		name: 'Genesis',
		testament: 'OT',
		testament_order: 1,
		book_order: 1,
		book_group: 'The Law',
		chapters: Array.from({ length: 50 }, (_, i) => i + 1),
	},
	{
		book_id: 'EXO',
		book_id_usfx: 'EX',
		book_id_osis: 'Exod',
		name: 'Exodus',
		testament: 'OT',
		testament_order: 2,
		book_order: 2,
		book_group: 'The Law',
		chapters: Array.from({ length: 40 }, (_, i) => i + 1),
	},
	{
		book_id: 'LEV',
		book_id_usfx: 'LV',
		book_id_osis: 'Lev',
		name: 'Leviticus',
		testament: 'OT',
		testament_order: 3,
		book_order: 3,
		book_group: 'The Law',
		chapters: Array.from({ length: 27 }, (_, i) => i + 1),
	},
]);

const handleRef = jest.fn();
const handleBookClick = jest.fn();
const handleChapterClick = jest.fn();
const activeChapter = 1;
const testamentPrefix = 'ot';
const testamentTitle = 'Old Testament';
const selectedBookName = 'Genesis';
const activeBookName = 'Genesis';
const activeTextId = 'ENGESV';
const audioType = 'drama';

describe('<BooksTestament />', () => {
	it('Should match the old snapshot', () => {
		const { asFragment } = render(
		<BooksTestament
			books={books}
			handleRef={handleRef}
			handleBookClick={handleBookClick}
			handleChapterClick={handleChapterClick}
			activeChapter={activeChapter}
			testamentPrefix={testamentPrefix}
			testamentTitle={testamentTitle}
			selectedBookName={selectedBookName}
			activeBookName={activeBookName}
			activeTextId={activeTextId}
			audioType={audioType}
		/>,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('Should only render one active book', () => {
		const { container } = render(
		<BooksTestament
			books={books}
			handleRef={handleRef}
			handleBookClick={handleBookClick}
			handleChapterClick={handleChapterClick}
			activeChapter={activeChapter}
			testamentPrefix={testamentPrefix}
			testamentTitle={testamentTitle}
			selectedBookName={selectedBookName}
			activeBookName={activeBookName}
			activeTextId={activeTextId}
			audioType={audioType}
		/>,
		);

		// Query all elements with the 'active-book' class
		const activeBooks = container.querySelectorAll('.active-book');
		expect(activeBooks.length).toBe(1);
	});

	it('Should only render one active chapter and it should match the given prop', () => {
		const { container } = render(
		<BooksTestament
			books={books}
			handleRef={handleRef}
			handleBookClick={handleBookClick}
			handleChapterClick={handleChapterClick}
			activeChapter={activeChapter}
			testamentPrefix={testamentPrefix}
			testamentTitle={testamentTitle}
			selectedBookName={selectedBookName}
			activeBookName={activeBookName}
			activeTextId={activeTextId}
			audioType={audioType}
		/>,
		);

		// Query all elements with the 'active-chapter' class
		const activeChapters = container.querySelectorAll('.active-chapter');
		expect(activeChapters.length).toBe(1);
		expect(activeChapters[0].textContent).toBe('1');
	});
});
