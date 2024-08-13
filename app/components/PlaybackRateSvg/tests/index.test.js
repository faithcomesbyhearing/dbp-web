import React from 'react';
import { render } from '@testing-library/react';

import PlaybackRateSvg from '..';

describe('<PlaybackRateSvg /> component tests', () => {
	it('Should match snapshot with default props', () => {
		const { asFragment } = render(<PlaybackRateSvg playbackRate={1} />);

		expect(asFragment()).toMatchSnapshot();
	});
	it('Should match snapshot with 0.75 speed', () => {
		const { asFragment } = render(<PlaybackRateSvg playbackRate={0.75} />);

		expect(asFragment()).toMatchSnapshot();
	});
	it('Should match snapshot with 1.25 speed', () => {
		const { asFragment } = render(<PlaybackRateSvg playbackRate={1.25} />);

		expect(asFragment()).toMatchSnapshot();
	});
	it('Should match snapshot with 1.5 speed', () => {
		const { asFragment } = render(<PlaybackRateSvg playbackRate={1.5} />);

		expect(asFragment()).toMatchSnapshot();
	});
	it('Should match snapshot with 2 speed', () => {
		const { asFragment } = render(<PlaybackRateSvg playbackRate={2} />);

		expect(asFragment()).toMatchSnapshot();
	});
	it('Should match snapshot with no playback speed', () => {
		const { asFragment } = render(<PlaybackRateSvg />);

		expect(asFragment()).toMatchSnapshot();
	});
});
