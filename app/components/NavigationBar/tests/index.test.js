import React from 'react';
import { render } from '@testing-library/react';
import NavigationBar from '..';

const props = {
	theme: 'red',
	userAgent: '',
	activeTextId: 'ENGESV',
	activeBookName: 'Matthew',
	activeTextName: 'English Standard Version',
	textDirection: 'ltr',
	toggleChapterSelection: jest.fn(),
	toggleVersionSelection: jest.fn(),
	activeChapter: 1,
	isChapterSelectionActive: false,
	isVersionSelectionActive: false,
};

describe('<NavigationBar /> component', () => {
	it('should match snapshot with default props', () => {
		const { asFragment } = render(<NavigationBar {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with chapter selection active', () => {
		const { asFragment } = render(
			<NavigationBar {...props} isChapterSelectionActive />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with version selection active', () => {
		const { asFragment } = render(
			<NavigationBar {...props} isVersionSelectionActive />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with ms as the user agent', () => {
		const { asFragment } = render(
			<NavigationBar {...props} userAgent={'ms'} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with paper theme', () => {
		const { asFragment } = render(<NavigationBar {...props} theme={'paper'} />);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with paper theme and ms as the user agent', () => {
		const { asFragment } = render(
			<NavigationBar {...props} theme={'paper'} userAgent={'ms'} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with rtl text direction', () => {
		const { asFragment } = render(
			<NavigationBar {...props} textDirection={'rtl'} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with rtl text direction and ms as the user agent', () => {
		const { asFragment } = render(
			<NavigationBar {...props} textDirection={'rtl'} userAgent={'ms'} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with rtl text direction and paper theme', () => {
		const { asFragment } = render(
			<NavigationBar {...props} textDirection={'rtl'} theme={'paper'} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with rtl text direction, paper theme, and ms as the user agent', () => {
		const { asFragment } = render(
			<NavigationBar
				{...props}
				textDirection={'rtl'}
				theme={'paper'}
				userAgent={'ms'}
			/>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with active chapter 2', () => {
		const { asFragment } = render(
			<NavigationBar {...props} activeChapter={2} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot with active chapter 2 and chapter selection active', () => {
		const { asFragment } = render(
			<NavigationBar {...props} activeChapter={2} isChapterSelectionActive />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
