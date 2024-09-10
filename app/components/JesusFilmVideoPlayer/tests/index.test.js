import React from 'react';
import { render } from '@testing-library/react';
import Router from 'next/router';

import JesusFilmVideoPlayer from '..';

const props = {
  hlsStream: `https://4.dbt.io/api/arclight/jesus-film?key=${process.env.DBP_API_KEY}&v=4&arclight_id=23156`,
  duration: 5789,
  hasVideo: true,
};

describe('<JesusFilmVideoPlayer /> component tests', () => {
  it('Should match snapshot with default props', () => {
    const { container } = render(<JesusFilmVideoPlayer {...props} />);
		expect(container).toMatchSnapshot();
  });
  it('Should match snapshot with no hls stream', () => {
    const { container } = render(<JesusFilmVideoPlayer {...props} hlsStream={''} />);
		expect(container).toMatchSnapshot();
  });

  afterEach(() => {
    // Ensure that we clean up mocks after each test
    Router.events.on.mockClear();
    Router.events.off.mockClear();
  });
});
