import React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import { ChapterSelection } from '..';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('../../../components/BooksTable', () => function booksTableMock() {
  return <div />;
});

const dispatch = jest.fn();

const activeProps = {
	dispatch,
	active: true,
	activeBookName: 'Genesis',
};
const inactiveProps = {
	dispatch,
	active: false,
	activeBookName: 'Genesis',
};

describe('<ChapterSelection />', () => {
	it('should match snapshot for default active props', () => {
		const tree = renderer
			.create(<ChapterSelection {...activeProps} />)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('should match snapshot for deafult inactive props', () => {
		const tree = renderer
			.create(<ChapterSelection {...inactiveProps} />)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('should call receive props when active state changes', () => {
		const wrapper = Enzyme.mount(<ChapterSelection {...activeProps} />);
		const spy = jest.spyOn(wrapper.instance(), 'componentDidUpdate');
		wrapper.setProps({ active: false });
		expect(spy).toHaveBeenCalled();
	});
	it('should toggle active state with toggleChapterSelection', () => {
		const wrapper = Enzyme.mount(<ChapterSelection {...activeProps} />);
		const spy1 = jest.spyOn(wrapper.instance(), 'componentWillUnmount');
		const spy2 = jest.spyOn(wrapper.instance(), 'toggleChapterSelection');
		const spy3 = jest.spyOn(
			wrapper.instance().closeMenuController,
			'onMenuUnmount',
		);

		act(() => {
			wrapper.instance().forceUpdate();
		});

		wrapper.instance().toggleChapterSelection();

		expect(dispatch).toHaveBeenCalled();
		expect(spy2).toHaveBeenCalled();
		wrapper.instance().componentWillUnmount();
		expect(spy1).toHaveBeenCalled();
		expect(spy3).toHaveBeenCalled();
	});
});
