// app/components/JesusFilmVideoPlayer/tests/index.test.js
import React from 'react';
import renderer from 'react-test-renderer';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import JesusFilmVideoPlayer from '..';

// 1 Mock Hls so it won’t attempt real playback in JSDOM
jest.mock('hls.js', () => ({
  isSupported: jest.fn(() => false),
}));

// 2 Create a minimal router to satisfy useRouter()
const createRouter = (overrides = {}) => ({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(),
  beforePopState: jest.fn(),
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
  isFallback: false,
  ...overrides,
});

// 3 Wrapper component to inject RouterContext
const withRouter = (children) => (
  <RouterContext.Provider value={createRouter()}>
    {children}
  </RouterContext.Provider>
);

const baseProps = {
  hlsStream: 'https://api-dev.dbp4.org/arclight/jesus-film',
  duration: 5789,
  hasVideo: true,
  apiKey: process.env.DBP_API_KEY || 'test-key',
};

describe('<JesusFilmVideoPlayer />', () => {
  it('renders main UI when hasVideo & hlsStream', () => {
    const tree = renderer
      .create(withRouter(<JesusFilmVideoPlayer {...baseProps} />))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders fallback UI when no hlsStream', () => {
    const tree = renderer
      .create(
        withRouter(
          <JesusFilmVideoPlayer {...baseProps} hlsStream={''} />
        )
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders fallback UI when no hasVideo', () => {
    const tree = renderer
      .create(
        withRouter(
          <JesusFilmVideoPlayer {...baseProps} hasVideo={false} />
        )
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders fallback UI when no hlsStream & no hasVideo', () => {
    const tree = renderer
      .create(
        withRouter(
          <JesusFilmVideoPlayer {...baseProps} hlsStream={''} hasVideo={false} />
        )
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
