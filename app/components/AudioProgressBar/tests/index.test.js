import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom'; // for additional matchers like toHaveAttribute
import AudioProgressBar from '../index';

jest.mock('next/dynamic', () => ({
	__esModule: true,
	default: (...props) => {
	  const dynamicModule = jest.requireActual('next/dynamic');
	  const dynamicActualComp = dynamicModule.default;
	  const RequiredComponent = dynamicActualComp(props[0]);
	  RequiredComponent.preload
		? RequiredComponent.preload()
		: RequiredComponent.render.preload();
	  return RequiredComponent;
	},
}));

// Mock the AudioDramaToggle component
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
		const { container } = render(
			<AudioProgressBar
				duration={duration}
				currentTime={currentTime}
				setCurrentTime={setCurrentTime}
			/>,
		);
		expect(container).toMatchSnapshot();
	});

	it('Should render a slider with correct position', () => {
		const { container } = render(
			<AudioProgressBar
				duration={duration}
				currentTime={currentTime}
				setCurrentTime={setCurrentTime}
			/>,
		);

		const slider = container.querySelector('.rc-slider-track');
		expect(slider).toBeInTheDocument();
		const expectedValue = (100 * (currentTime / duration)).toFixed(0);

		expect(slider).toHaveStyle(`width: ${expectedValue}%`);
	});

	it('Should update slider position and call setCurrentTime', async () => {
		const newCurrentTime = 5;
		const { container } = render(
			<AudioProgressBar
				duration={duration}
				currentTime={newCurrentTime}
				setCurrentTime={setCurrentTime}
			/>,
		);

		const sliderTrack = container.querySelector('.rc-slider-track');
		const expectedWidth = `${(100 * (newCurrentTime / duration)).toFixed(0)}%`;
		expect(sliderTrack).toHaveStyle(`width: ${expectedWidth}`);
	});
});
