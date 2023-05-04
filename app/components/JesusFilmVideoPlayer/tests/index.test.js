import React from 'react';
import renderer from 'react-test-renderer';

import JesusFilmVideoPlayer from '..';

const props = {
  hlsStream:
    'https://api-dev.dbp4.org/arclight/jesus-film?key=${process.env.DBP_API_KEY}&v=4&arclight_id=23156',
  duration: 5789,
  hasVideo: true,
};

describe('<JesusFilmVideoPlayer /> component tests', () => {
  it('Should match snapshot with default props', () => {
    const tree = renderer.create(<JesusFilmVideoPlayer {...props} />).toJSON();

    expect(tree).toMatchSnapshot();
  });
  it('Should match snapshot with no hls stream', () => {
    const tree = renderer
      .create(<JesusFilmVideoPlayer {...props} hlsStream={''} />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
