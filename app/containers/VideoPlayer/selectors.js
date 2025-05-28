import { createSelector } from 'reselect';
const selectVideoDomain = (state) => state.videoPlayer;
const selectHomepageDomain = (state) => state.homepage;

const selectPlayerOpenState = () =>
	createSelector(selectHomepageDomain, (homepage) =>
		Boolean(homepage.videoPlayerOpen),
	);

const selectHasVideo = () =>
	createSelector(selectHomepageDomain, (homepage) =>
		Boolean(homepage.hasVideo),
	);

const makeSelectVideoPlayerState = selectVideoDomain;

export default makeSelectVideoPlayerState;

export { selectHasVideo, selectPlayerOpenState };
