// app/components/JesusFilmVideoPlayer/tests/index.test.js
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { useRouter } from 'next/router';
import JesusFilmVideoPlayer from '..';

// 1) Mock hls.js so we don't try to load a real HLS stream in JSDOM
jest.mock('hls.js', () => ({
	isSupported: jest.fn(() => false),
}));

// 2) Mock next/router's useRouter to give us a dummy events object
jest.mock('next/router', () => ({
	useRouter: jest.fn(),
}));

const baseProps = {
	hlsStream: 'https://api-dev.dbp4.org/arclight/jesus-film',
	duration: 5789,
	hasVideo: true,
	apiKey: process.env.DBP_API_KEY || 'test-key',
};

describe('<JesusFilmVideoPlayer /> (RTL + snapshots)', () => {
	afterEach(cleanup);

	it('renders main UI when hasVideo & hlsStream', () => {
		useRouter.mockReturnValue({
			events: {
				on: jest.fn(),
				off: jest.fn(),
				emit: jest.fn(),
			},
		});
		const { container } = render(<JesusFilmVideoPlayer {...baseProps} />);
		expect(container).toMatchSnapshot();
	});

	it('renders fallback UI when no hlsStream', () => {
		const { container } = render(
			<JesusFilmVideoPlayer {...baseProps} hlsStream={''} />,
		);
		expect(container).toMatchSnapshot();
	});

	it('renders fallback UI when hasVideo is false', () => {
		useRouter.mockReturnValue({
			events: {
				on: jest.fn(),
				off: jest.fn(),
				emit: jest.fn(),
			},
		});
		const { container } = render(
			<JesusFilmVideoPlayer {...baseProps} hasVideo={false} />,
		);
		expect(container).toMatchSnapshot();
	});

	it('renders fallback UI when both hasVideo=false and no hlsStream', () => {
		useRouter.mockReturnValue({
			events: {
				on: jest.fn(),
				off: jest.fn(),
				emit: jest.fn(),
			},
		});
		const { container } = render(
			<JesusFilmVideoPlayer {...baseProps} hasVideo={false} hlsStream={''} />,
		);
		expect(container).toMatchSnapshot();
	});
});
