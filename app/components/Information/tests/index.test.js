import React from 'react';
import renderer from 'react-test-renderer';
import { act } from 'react-dom/test-utils';
import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import {
	copyrights,
	invalidCopyrights,
	invalidCopyrights2,
} from '../../../utils/testUtils/copyrightData';
import { Information } from '..';

Enzyme.configure({ adapter: new Adapter() });

/* eslint-disable react/prop-types */
jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));
/* eslint-enable react/prop-types */

const props = {
	copyrights,
};

describe('<Information /> component tests', () => {
	it('should match default snapshot', () => {
		const tree = renderer.create(<Information {...props} />).toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('should match snapshot with copyrights missing information', () => {
		const tree = renderer
			.create(<Information copyrights={invalidCopyrights} />)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('should match snapshot with copyrights missing organizations', () => {
		const tree = renderer
			.create(<Information copyrights={invalidCopyrights2} />)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('should open and close', () => {
		const wrapper = Enzyme.mount(<Information copyrights={copyrights} />);
		const spy = jest.spyOn(wrapper.instance(), 'toggleCopyright');
		const button = wrapper.find('.information-toggle');

		act(() => {
			wrapper.instance().forceUpdate();
		});

		button.simulate('click');

		expect(spy).toHaveBeenCalledTimes(1);
		expect(wrapper.state('opened')).toEqual(true);
		expect(wrapper.state('height')).toEqual(515);
	});
});
