/**
 *
 * AudioPlayer
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import isEqual from 'lodash/isEqual';
import injectReducer from 'utils/injectReducer';
import closeEventHoc from 'components/CloseEventHoc';
import SvgWrapper from 'components/SvgWrapper';
import SpeedControl from 'components/SpeedControl';
import AudioProgressBar from 'components/AudioProgressBar';
import VolumeSlider from 'components/VolumeSlider';
import AudioPlayerMenu from 'components/AudioPlayerMenu';
import GenericErrorBoundary from 'components/GenericErrorBoundary';
import makeSelectAudioPlayer, { selectHasAudio } from './selectors';
import reducer from './reducer';
/* eslint-disable jsx-a11y/media-has-caption */
/* disabled the above eslint config options because you can't add tracks to audio elements */
// Todo: Something in here is trying to update an unmounted component
export class AudioPlayer extends React.Component { // eslint-disable-line react/prefer-stateless-function
	constructor(props) {
		super(props);
		// need to get next and prev audio tracks if I want to enable continuous playing
		this.state = {
			playing: false,
			speedControlState: false,
			volumeSliderState: false,
			elipsisState: false,
			volume: 1,
			duration: 100,
			currentTime: 0,
			playerState: this.props.hasAudio,
			currentSpeed: 1,
		};
	}

	componentDidMount() {
		// If auto play is enabled I need to start the player
		if (this.props.autoPlay) {
			// console.log('component mounted and auto play was true');
			this.audioRef.addEventListener('canplay', this.autoPlayListener);
		}
		// Add all the event listeners I need for the audio player
		this.audioRef.addEventListener('durationchange', this.durationChangeEventListener);
		this.audioRef.addEventListener('timeupdate', this.timeUpdateEventListener);
		this.audioRef.addEventListener('seeking', this.seekingEventListener);
		this.audioRef.addEventListener('seeked', this.seekedEventListener);
		this.audioRef.addEventListener('ended', this.endedEventListener);
		this.audioRef.addEventListener('playing', this.playingEventListener);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.audioSource !== this.props.audioSource) {
			if (nextProps.audioSource) {
				this.setState({ playerState: true, playing: false });
			} else if (this.state.playerState) {
				this.setState({ playerState: false, playing: false });
			}
			if (nextProps.autoPlay) {
				// console.log('source changed and auto play is true');
				this.audioRef.addEventListener('canplay', this.autoPlayListener);
			}
		}
		if (!nextProps.autoPlay) {
			// console.log('auto play is now false');
			this.audioRef.removeEventListener('canplay', this.autoPlayListener);
		}
		// if (nextProps.autoPlay) {
			// console.log('auto play is now true');
		// }
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextState.volume !== this.state.volume) {
			return false;
		}
		if (!isEqual(nextProps, this.props) || !isEqual(nextState, this.state)) {
			return true;
		}
		return false;
	}

	componentWillUnmount() {
		// Removing all the event listeners in the case that this component is unmounted
		this.audioRef.removeEventListener('canplay', this.autoPlayListener);
		this.audioRef.removeEventListener('durationchange', this.durationChangeEventListener);
		this.audioRef.removeEventListener('timeupdate', this.timeUpdateEventListener);
		this.audioRef.removeEventListener('seeking', this.seekingEventListener);
		this.audioRef.removeEventListener('seeked', this.seekedEventListener);
		this.audioRef.removeEventListener('ended', this.endedEventListener);
		this.audioRef.removeEventListener('playing', this.playingEventListener);
	}

	setCurrentTime = (time) => {
		this.audioRef.currentTime = time;
		this.setState({
			currentTime: time,
		});
	}

	setAudioPlayerRef = (el) => {
		this.audioPlayerContainer = el;
	}

	setSpeedControlState = (state) => this.setState({
		speedControlState: state,
	})

	setVolumeSliderState = (state) => this.setState({
		volumeSliderState: state,
	})

	setElipsisState = (state) => this.setState({
		elipsisState: state,
	})

	handleRef = (el) => {
		this.audioRef = el;
	}

	handleBackgroundClick = () => {
		if (!this.state.playerState) {
			this.toggleAudioPlayer();
		}
	}

	updateVolume = (volume) => {
		this.audioRef.volume = volume;
		this.setState({
			volume,
		});
	}

	autoPlayListener = () => { // can accept event as a parameter
		// console.log('can play fired and was true');
		this.playVideo();
	}

	durationChangeEventListener = (e) => {
		this.setState({
			duration: e.target.duration,
		});
	}

	timeUpdateEventListener = (e) => {
		this.setState({
			currentTime: e.target.currentTime,
		});
	}

	seekingEventListener = (e) => {
		this.setState({
			currentTime: e.target.currentTime,
		});
	}

	seekedEventListener = (e) => {
		this.setState({
			currentTime: e.target.currentTime,
		});
	}

	endedEventListener = () => {
		// console.log('ended and autoplay was ', this.props.autoPlay);
		if (this.props.autoPlay) {
			this.skipForward();
		}
		this.pauseVideo();
	}

	playingEventListener = (e) => {
		// console.log('playing status', e.target.paused);
		// console.log('playing ended', e.target.ended);
		if (this.state.playing && e.target.paused) {
			this.setState({
				playing: false,
			});
		} else if (!this.state.playing && !e.target.paused) {
			this.setState({
				playing: true,
			});
		}
	}

	pauseVideo = () => {
		this.audioRef.pause();
		this.setState({
			playing: false,
		});
	}

	playVideo = () => this.audioRef.play().then(() => this.setState({
		playing: true,
	}))

	updatePlayerSpeed = (rate) => {
		if (this.state.currentSpeed !== rate) {
			this.audioRef.playbackRate = rate;
			this.setState({
				currentSpeed: rate,
			});
		}
	}

	skipBackward = () => {
		this.setCurrentTime(0);
		this.props.skipBackward();
		this.setState({
			playing: false,
		});
	}

	skipForward = () => {
		this.setCurrentTime(0);
		this.props.skipForward();
		this.setState({
			playing: false,
		});
	}

	toggleAudioPlayer = () => {
		if (this.props.audioSource) {
			this.setState({
				playerState: !this.state.playerState,
			});
		}
	}
	// Simpler to close all modals than to try and figure out which one to close
	closeModals = () => {
		this.setState({
			volumeSliderState: false,
			speedControlState: false,
			elipsisState: false,
		});
	}

	get volumeControl() {
		return closeEventHoc(VolumeSlider, this.closeModals);
	}

	get speedControl() {
		return closeEventHoc(SpeedControl, this.closeModals);
	}

	get playerMenu() {
		return closeEventHoc(AudioPlayerMenu, this.closeModals);
	}

	render() {
		const {
			audioSource: source,
			hasAudio,
			toggleAutoPlay,
			autoPlay,
		} = this.props;

		return (
			<GenericErrorBoundary affectedArea="AudioPlayer">
				<div role="button" tabIndex={0} className="audio-player-background" ref={this.setAudioPlayerRef} onClick={this.handleBackgroundClick}>
					{
						(this.state.playerState && hasAudio) ? (
							<div className="audio-player-container">
								<span title={'Skip Back'}><SvgWrapper onClick={this.skipBackward} className="svgitem icon" fill="#fff" svgid="backward" /></span>
								{
									!this.state.playing ? (
										<span title={'Play'}><SvgWrapper onClick={this.playVideo} className="svgitem icon" fill="#fff" svgid="play_audio" /></span>
									) : null
								}
								{
									this.state.playing ? (
										<span title={'Pause'}><SvgWrapper onClick={this.pauseVideo} className="svgitem icon" fill="#fff" svgid="pause" /></span>
									) : null
								}
								<span title={'Skip Forward'}><SvgWrapper onClick={this.skipForward} className="svgitem icon" fill="#fff" svgid="forward" /></span>
								<AudioProgressBar setCurrentTime={this.setCurrentTime} duration={this.state.duration} currentTime={this.state.currentTime} />
								<div id="volume-wrap">
									<div title={'Volume Control'} role="button" tabIndex="0" className={this.state.volumeSliderState ? 'item active' : 'item'} onClick={() => { this.state.volumeSliderState ? this.setVolumeSliderState(false) : this.setVolumeSliderState(true); this.setSpeedControlState(false); this.setElipsisState(false); }}><SvgWrapper className={'icon'} fill="#fff" svgid="volume" /></div>
									{
										this.state.volumeSliderState && <this.volumeControl active={this.state.volumeSliderState} updateVolume={this.updateVolume} volume={this.state.volume} />
									}
								</div>
								<div id="volume-wrap">
									<div title={'Speed Control'} role="button" tabIndex="0" className={this.state.speedControlState ? 'item active' : 'item'} onClick={() => { this.state.speedControlState ? this.setSpeedControlState(false) : this.setSpeedControlState(true); this.setElipsisState(false); this.setVolumeSliderState(false); }}><SvgWrapper className={'icon'} fill="#fff" svgid="play_speed" /></div>
									{
										this.state.speedControlState ? (
											<this.speedControl currentSpeed={this.state.currentSpeed} options={[0.5, 1, 1.25, 1.5, 2]} setSpeed={this.updatePlayerSpeed} />
										) : null
									}
								</div>
								<div id="volume-wrap">
									<div title={'Audio Settings'} role="button" tabIndex="0" className={this.state.elipsisState ? 'item active' : 'item'} onClick={() => { this.state.elipsisState ? this.setElipsisState(false) : this.setElipsisState(true); this.setVolumeSliderState(false); this.setSpeedControlState(false); }}><SvgWrapper className={'icon'} fill="#fff" svgid="more_menu" /></div>
									{
										this.state.elipsisState ? (
											<this.playerMenu autoPlay={autoPlay} toggleAutoPlay={toggleAutoPlay} />
										) : null
									}
								</div>
							</div>
						) : null
					}
					<audio preload={'auto'} ref={this.handleRef} className="audio-player" src={source}></audio>
					<SvgWrapper onClick={(e) => { e.stopPropagation(); this.toggleAudioPlayer(); }} width="50px" height="5px" className={this.state.playerState ? 'audio-gripper' : 'audio-gripper closed'} style={{ cursor: source ? 'pointer' : 'inherit' }} svgid="gripper" />
				</div>
			</GenericErrorBoundary>
		);
	}
}

AudioPlayer.propTypes = {
	audioSource: PropTypes.string,
	skipBackward: PropTypes.func.isRequired,
	skipForward: PropTypes.func.isRequired,
	toggleAutoPlay: PropTypes.func,
	hasAudio: PropTypes.bool,
	autoPlay: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
	audioplayer: makeSelectAudioPlayer(),
	hasAudio: selectHasAudio(),
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'audioPlayer', reducer });

export default compose(
	withReducer,
	withConnect,
)(AudioPlayer);
