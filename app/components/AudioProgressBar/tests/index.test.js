import React from 'react';
import renderer from 'react-test-renderer';
import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import AudioProgressBar from '..';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('../../AudioDramaToggle', () => function audioDramaToggleMock() {
  return (
<div className={'audio-drama-toggle-container'}>
		<button
			type={'button'}
			id={'drama-button'}
			className={'audio-drama-toggle-button active'}
			onClick={jest.fn()}
		>
			Drama
		</button>
		<button
			type={'button'}
			id={'non-drama-button'}
			className={'audio-drama-toggle-button'}
			onClick={jest.fn()}
		>
			Non-Drama
		</button>
</div>
);
});

const setCurrentTime = jest.fn();
const duration = 300;
const currentTime = 0;

describe('AudioProgressBar Component', () => {
	it('Should match previous snapshot', () => {
		const tree = renderer.create(
			<AudioProgressBar
				duration={duration}
				currentTime={currentTime}
				setCurrentTime={setCurrentTime}
			/>,
		);

		expect(tree).toMatchSnapshot();
	});
	it('Should render a div containing given duration and currentTime', () => {
		const wrapper = Enzyme.mount(
			<AudioProgressBar
				duration={duration}
				currentTime={currentTime}
				setCurrentTime={setCurrentTime}
			/>,
		);
		const style = wrapper.find('.rc-slider-track').get(0).props.style;
		const expectedWidth = `${(100 * (currentTime / duration)).toFixed(0)}%`;

		expect(wrapper.find('.rc-slider-track')).toBeTruthy();
		expect(style).toHaveProperty('width', expectedWidth);
	});
	it('Should render the slider at the correct position', () => {
		const newCurrentTime = 5;
		const wrapper = Enzyme.mount(
			<AudioProgressBar
				duration={duration}
				currentTime={newCurrentTime}
				setCurrentTime={setCurrentTime}
			/>,
		);
		const style = wrapper.find('.rc-slider-track').get(0).props.style;
		const expectedWidth = `${(100 * (newCurrentTime / duration)).toFixed(0)}%`;

		expect(wrapper.find('.rc-slider-track')).toBeTruthy();
		expect(style).toHaveProperty('width', expectedWidth);
	});
});
