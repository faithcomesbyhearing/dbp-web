/**
 *
 * JesusFilmVideoPlayer
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import Hls from 'hls.js';
import VideoControls from '../VideoControls';
import VideoProgressBar from '../VideoProgressBar';
import VideoOverlay from '../VideoOverlay';

class JesusFilmVideoPlayer extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			paused: true,
			volume: 1,
			currentTime: 0,
			bufferLength: 0,
			hlsSupported: true,
		};
		this.videoRef = React.createRef();
	}

	componentDidMount() {
		if (this.videoRef.current) {
			this.initializeHls();
			this.videoRef.current.addEventListener(
				'webkitendfullscreen',
				this.webkitendfullscreen,
			);
			Router.events.on('routeChangeStart', this.handleRouteChange);
		}
		document.addEventListener('keypress', this.pauseWithSpacebar);
	}

	componentWillUnmount() {
		this.cleanupHls();
		if (this.videoRef.current) {
			this.videoRef.current.removeEventListener(
				'webkitendfullscreen',
				this.webkitendfullscreen,
			);
		}
		document.removeEventListener('keypress', this.pauseWithSpacebar);
		Router.events.off('routeChangeStart', this.handleRouteChange);
	}

	webkitendfullscreen = () => {
		this.pauseVideo();
	};

	initializeHls = () => {
		if (Hls.isSupported()) {
			this.hls = new Hls();
			this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
				this.hls.loadSource(
					`${this.props.hlsStream}?key=${process.env.DBP_API_KEY}&v=4`,
				);
				this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
					// Add user interaction check before playing the video
					this.videoRef.current.addEventListener('click', this.playVideo);
					this.videoRef.current.addEventListener('touchstart', this.playVideo);
				});
			});
			this.hls.attachMedia(this.videoRef.current);
			this.addVideoEventListeners();
		} else if (
			this.videoRef.current.canPlayType('application/vnd.apple.mpegurl')
		) {
			this.videoRef.current.src = `${this.props.hlsStream}?key=${process.env.DBP_API_KEY}&v=4`;
			this.videoRef.current.addEventListener('loadedmetadata', () => {
				// Add user interaction check before playing the video
				this.videoRef.current.addEventListener('click', this.playVideo);
				this.videoRef.current.addEventListener('touchstart', this.playVideo);
			});
			this.addVideoEventListeners();
		} else {
			this.setState({ hlsSupported: false });
		}
	};

	addVideoEventListeners = () => {
		const video = this.hls ? this.hls.media : this.videoRef.current;
		video.addEventListener('timeupdate', this.timeUpdateEventListener);
		video.addEventListener('seeking', this.seekingEventListener);
		video.addEventListener('seeked', this.seekedEventListener);
	};

	cleanupHls = () => {
		if (this.hls) {
			this.hls.destroy();
		}
		if (this.videoRef.current) {
			const video = this.hls ? this.hls.media : this.videoRef.current;

			if (video) {
				video.removeEventListener('timeupdate', this.timeUpdateEventListener);
				video.removeEventListener('seeking', this.seekingEventListener);
				video.removeEventListener('seeked', this.seekedEventListener);
			}
		}
	};

	handleRouteChange = () => {
		this.cleanupHls();
		if (this.videoRef.current) {
			this.pauseVideo();
		}
	};

	togglePlayState = () => {
		const { paused } = this.state;
		if (paused) {
			this.playVideo();
		} else {
			this.pauseVideo();
		}
	};

	timeUpdateEventListener = (e) => {
		this.setState({ currentTime: e.target.currentTime });
	};

	seekingEventListener = (e) => {
		this.setState({ currentTime: e.target.currentTime });
	};

	seekedEventListener = (e) => {
		this.setState({ currentTime: e.target.currentTime });
	};

	playVideo = () => {
		const video = this.hls ? this.hls.media : this.videoRef.current;
		const playPromise = video.play();
		if (playPromise !== undefined) {
			playPromise
				.then(() => {
					this.setState({ paused: false });
				})
				.catch((err) => {
					this.setState({ paused: true });
					if (process.env.NODE_ENV === 'development') {
						console.error('playVideo error', err); // eslint-disable-line no-console
					}
				});
		}
	};

	pauseVideo = () => {
		this.videoRef.current.pause();
		this.setState({ paused: true });
	};

	pauseWithSpacebar = (e) => {
		if (e.key === ' ') {
			this.togglePlayState();
		}
	};

	updateVolume = (volume) => {
		this.videoRef.current.volume = volume;
		this.setState({ volume });
	};

	toggleFullScreen = () => {
		const video = this.videoRef.current;
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else if (video.requestFullscreen) {
			video.requestFullscreen();
		} else if (video.webkitRequestFullscreen) {
			video.webkitRequestFullscreen();
		} else if (video.mozRequestFullScreen) {
			video.mozRequestFullScreen();
		} else if (video.msRequestFullscreen) {
			video.msRequestFullscreen();
		}
	};

	render() {
		const { volume, paused, currentTime, bufferLength } = this.state;
		const { hasVideo, hlsStream, duration } = this.props;

		if (!hasVideo || !hlsStream) {
			return (
				<div className="video-player-container jesus-film-override">
					<h2>
						Something went wrong. Please refresh the page or go back to try
						again!
					</h2>
				</div>
			);
		}

		return (
			<div className="video-player-container jesus-film-override">
				<div className="video-player">
					<VideoOverlay
						paused={paused}
						playFunction={this.playVideo}
						pauseFunction={this.pauseVideo}
						togglePlayState={this.togglePlayState}
						isJesusFilm
					/>
					<video ref={this.videoRef} onClick={this.togglePlayState} />
					<VideoProgressBar
						paused={paused}
						currentTime={currentTime}
						duration={duration}
						setCurrentTime={this.setCurrentTime}
						bufferLength={bufferLength}
					/>
					<VideoControls
						paused={paused}
						pauseVideo={this.pauseVideo}
						toggleFullScreen={this.toggleFullScreen}
						updateVolume={this.updateVolume}
						volume={volume}
					/>
				</div>
			</div>
		);
	}
}

JesusFilmVideoPlayer.propTypes = {
	hlsStream: PropTypes.string.isRequired,
	duration: PropTypes.number.isRequired,
	hasVideo: PropTypes.bool.isRequired,
};

export default JesusFilmVideoPlayer;
