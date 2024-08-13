import { createSelector } from 'reselect';

/**
 * Direct selector to the audioPlayer state domain
 */
// const selectDefaultDomain = (state) => state['audioPlayer'];
const selectDefaultDomain = (state) => state.audioPlayer;
const selectHomeDomain = (state) => state.homepage;

const selectAutoPlay = createSelector(
	(state) => state['settings'],
	(settings) => settings?.['userSettings']?.['autoPlayEnabled'],
);

export const selectHomeBooks = createSelector(
	selectHomeDomain,
	(homepage) => homepage.books,
);

export const selectHasAudio = createSelector(
	selectHomeDomain,
	(homepage) => homepage.hasAudio,
);
export const selectHasVideo = createSelector(
	selectHomeDomain,
	(homepage) => homepage.hasVideo,
);
export const selectAudioSource = createSelector(
	selectHomeDomain,
	(homepage) => homepage.audioSource,
);
export const selectAudioPaths = createSelector(
	selectHomeDomain,
	(homepage) => homepage.audioPaths,
);
export const selectActiveFilesets = createSelector(
	selectHomeDomain,
	(homepage) => homepage.activeFilesets,
);
export const selectVideoPlayerOpen = createSelector(
	selectHomeDomain,
	(homepage) => homepage.videoPlayerOpen,
);
export const selectAudioPlayerState = createSelector(
	selectHomeDomain,
	(homepage) => homepage.audioPlayerState,
);
export const selectActiveBookId = createSelector(
	selectHomeDomain,
	(homepage) => homepage.activeBookId,
);
export const selectActiveTextId = createSelector(
	selectHomeDomain,
	(homepage) => homepage.activeTextId,
);
export const selectActiveChapter = createSelector(
	selectHomeDomain,
	(homepage) => homepage.activeChapter,
);
export const selectChangingVersion = createSelector(
	selectHomeDomain,
	(homepage) => homepage.changingVersion,
);

const selectPlaybackRate = createSelector(
	(state) => state['settings'],
	(settings) => settings?.['userSettings']?.['playbackRate'],
);

const selectVolume = createSelector(
	(state) => state['settings'],
	(settings) => settings?.['userSettings']?.['volume'],
);
/**
 * Default selector used by AudioPlayer
 */

const makeSelectAudioPlayer = selectDefaultDomain;

export default makeSelectAudioPlayer;
export {
	selectDefaultDomain,
	selectAutoPlay,
	selectPlaybackRate,
	selectVolume,
};
