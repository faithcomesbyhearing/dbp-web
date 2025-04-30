/**
 *
 * JesusFilmVideoPlayer
 *
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Hls from 'hls.js';

import VideoControls from '../VideoControls';
import VideoProgressBar from '../VideoProgressBar';
import VideoOverlay from '../VideoOverlay';

function JesusFilmVideoPlayer({
	hlsStream,
	duration,
	hasVideo,
	apiKey, // inject via prop instead of hard-coding process.env
	onError, // optional callback
}) {
	const videoRef = useRef(null);
	const router = useRouter();

	// --- state ---
	const [paused, setPaused] = useState(true);
	const [volume, setVolume] = useState(1);
	const [currentTime, setCurrentTime] = useState(0);
	const [bufferedEnd, setBufferedEnd] = useState(0);
	const [hlsSupported, setHlsSupported] = useState(true);

	// --- HLS instance and cleanup ---
	const hlsRef = useRef(null);
	const destroyHls = useCallback(() => {
		if (hlsRef.current) {
			hlsRef.current.destroy();
			hlsRef.current = null;
		}
	}, []);

	// --- initialize HLS / native src on mount / when hlsStream changes ---
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const srcWithKey = `${hlsStream}?key=${apiKey}&v=4`;

		if (Hls.isSupported()) {
			const hls = new Hls();
			hlsRef.current = hls;
			hls.attachMedia(video);
			hls.on(Hls.Events.MEDIA_ATTACHED, () => {
				hls.loadSource(srcWithKey);
			});
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				// user must tap/click once on mobile before autoplay is allowed
				video.addEventListener('click', play);
				video.addEventListener('touchstart', play);
			});
		} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = srcWithKey;
			video.addEventListener('loadedmetadata', () => {
				video.addEventListener('click', play);
				video.addEventListener('touchstart', play);
			});
		} else {
			setHlsSupported(false);
		}

		return () => {
			destroyHls();
			// remove play listeners in case we added them
			video.removeEventListener('click', play);
			video.removeEventListener('touchstart', play);
		};
	}, [hlsStream, apiKey, destroyHls]);

	// --- pause & cleanup on route change ---
	useEffect(() => {
		const handleRouteChange = () => {
			destroyHls();
			videoRef.current?.pause();
			setPaused(true);
		};
		router.events.on('routeChangeStart', handleRouteChange);
		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
	}, [router.events, destroyHls]);

	// --- spacebar toggles play/pause ---
	useEffect(() => {
		const onKeydown = (e) => {
			if (e.code === 'Space' && document.activeElement === videoRef.current) {
				e.preventDefault();
				togglePlay();
			}
		};
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	}, [togglePlay]);

	// --- unified time/seek/buffer update ---
	const onTimeOrBufferUpdate = useCallback(() => {
		const video = videoRef.current;
		if (!video) return;
		setCurrentTime(video.currentTime);
		const buffered = video.buffered;
		if (buffered.length) {
			setBufferedEnd(buffered.end(buffered.length - 1));
		}
	}, []);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		['timeupdate', 'seeking', 'seeked', 'progress'].forEach((evt) =>
			video.addEventListener(evt, onTimeOrBufferUpdate),
		);
		return () => {
			['timeupdate', 'seeking', 'seeked', 'progress'].forEach((evt) =>
				video.removeEventListener(evt, onTimeOrBufferUpdate),
			);
		};
	}, [onTimeOrBufferUpdate]);

	// --- play/pause controls ---
	const play = useCallback(() => {
		const video = videoRef.current;
		if (!video) return;
		const promise = video.play();
		if (promise !== undefined) {
			promise
				.then(() => setPaused(false))
				.catch((err) => {
					setPaused(true);
					if (onError) onError(err);
					// in dev you might still log:
					if (process.env.NODE_ENV === 'development') {
						console.warn('Playback error', err); // eslint-disable-line no-console
					}
				});
		}
	}, [onError]);

	const pause = useCallback(() => {
		videoRef.current?.pause();
		setPaused(true);
	}, []);

	const togglePlay = useCallback(() => {
		paused ? play() : pause();
	}, [paused, play, pause]);

	// --- volume & seeking API ---
	const changeVolume = useCallback((vol) => {
		if (videoRef.current) {
			videoRef.current.volume = vol;
			setVolume(vol);
		}
	}, []);

	const seekTo = useCallback((time) => {
		if (videoRef.current) {
			videoRef.current.currentTime = time;
			setCurrentTime(time);
		}
	}, []);

	// --- fullscreen ---
	const toggleFullScreen = useCallback(() => {
		const video = videoRef.current;
		if (!video) return;
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else if (video.requestFullscreen) {
			video.requestFullscreen();
		}
	}, []);

	// --- render fallback if no HLS support or missing props ---
	if (!hasVideo || !hlsStream || !hlsSupported) {
		return (
			<div className="video-player-container jesus-film-override">
				<h2>
					Something went wrong. Please refresh the page or go back to try again!
				</h2>
			</div>
		);
	}

	return (
		<div className="video-player-container jesus-film-override">
			<div className="video-player">
				<VideoOverlay
					paused={paused}
					playFunction={play}
					pauseFunction={pause}
					togglePlayState={togglePlay}
					isJesusFilm
				/>
				{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
				<video
					ref={videoRef}
					onClick={togglePlay}
					playsInline
					style={{ width: '100%' }}
				/>
				<VideoProgressBar
					paused={paused}
					currentTime={currentTime}
					duration={duration}
					bufferLength={bufferedEnd}
					setCurrentTime={seekTo}
				/>
				<VideoControls
					paused={paused}
					pauseVideo={pause}
					toggleFullScreen={toggleFullScreen}
					updateVolume={changeVolume}
					volume={volume}
				/>
			</div>
		</div>
	);
}

JesusFilmVideoPlayer.propTypes = {
	hlsStream: PropTypes.string.isRequired,
	duration: PropTypes.number.isRequired,
	hasVideo: PropTypes.bool.isRequired,
	apiKey: PropTypes.string.isRequired,
	onError: PropTypes.func,
};

export default JesusFilmVideoPlayer;
