import React from 'react';
import { act } from 'react-dom/test-utils';
import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';

import renderer from 'react-test-renderer';
import { AudioDramaToggle } from '..';

Enzyme.configure({ adapter: new Adapter() });

const props = {
	audioType: 'audio_drama',
	availableAudioTypes: ['audio_drama', 'audio'],
	dispatch: jest.fn((action) => action),
};

describe('<AudioDramaToggle />', () => {
	it('Expect to match snapshot for drama audio', () => {
		const tree = renderer.create(<AudioDramaToggle {...props} />).toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('Expect to match snapshot for plain audio', () => {
		const tree = renderer
			.create(<AudioDramaToggle {...props} audioType={'audio'} />)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('Expect to match snapshot for only plain audio available', () => {
		const tree = renderer
			.create(<AudioDramaToggle {...props} availableAudioTypes={['audio']} />)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('Expect to match snapshot for only drama audio available', () => {
		const tree = renderer
			.create(
				<AudioDramaToggle {...props} availableAudioTypes={['audio_drama']} />,
			)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('mount and have two different buttons', () => {
		const wrapper = Enzyme.mount(<AudioDramaToggle {...props} />);
		const dramaButton = wrapper.find('#drama-button');
		const nonDramaButton = wrapper.find('#non-drama-button');
		const spy = jest.spyOn(wrapper.instance(), 'setAudioType');

		act(() => {
			wrapper.instance().forceUpdate();
		});

		expect(dramaButton).toHaveLength(1);
		expect(nonDramaButton).toHaveLength(1);

		dramaButton.simulate('click');
		expect(spy).toHaveBeenCalledTimes(1);

		nonDramaButton.simulate('click');
		expect(spy).toHaveBeenCalledTimes(2);
	});
});
