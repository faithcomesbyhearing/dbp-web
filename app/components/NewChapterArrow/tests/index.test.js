import React from 'react';
import { render } from '@testing-library/react';
import NewChapterArrow from '..';
import getPreviousChapterUrl from '../../../utils/getPreviousChapterUrl';
import getNextChapterUrl from '../../../utils/getNextChapterUrl';
import { text } from '../../../utils/testUtils/plaintextData';
import { bookData } from '../../../utils/testUtils/booksData';

const books = [...bookData.OT, ...bookData.NT];

const prevProps = {
	disabled: false,
	clickHandler: jest.fn(),
	svgid: 'arrow_left',
	svgClasses: 'prev-arrow-svg',
	disabledContainerClasses: 'arrow-wrapper prev disabled',
	containerClasses: 'arrow-wrapper prev',
	getNewUrl: getPreviousChapterUrl,
	urlProps: {
		books,
		text,
		chapter: 2,
		bookId: 'mat',
		textId: 'engesv',
		verseNumber: 0,
		audioType: 'audio_drama',
	},
};
const nextProps = {
	disabled: false,
	clickHandler: jest.fn(),
	svgid: 'arrow_left',
	svgClasses: 'next-arrow-svg',
	disabledContainerClasses: 'arrow-wrapper next disabled',
	containerClasses: 'arrow-wrapper next',
	getNewUrl: getNextChapterUrl,
	urlProps: {
		books,
		text,
		chapter: 2,
		bookId: 'mat',
		textId: 'engesv',
		verseNumber: 0,
		audioType: 'audio_drama',
	},
};

describe('NewChapterArrow', () => {
	it('should match snapshot for previous arrow base props', () => {
		const { asFragment } = render(<NewChapterArrow {...prevProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot for next arrow base props', () => {
		const { asFragment } = render(<NewChapterArrow {...nextProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot for previous arrow disabled props', () => {
		const { asFragment } = render(<NewChapterArrow {...prevProps} disabled />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot for next arrow disabled props', () => {
		const { asFragment } = render(<NewChapterArrow {...nextProps} disabled />);
		expect(asFragment()).toMatchSnapshot();
	});
});
