import React from 'react';
import PropTypes from 'prop-types';
import SvgWrapper from '../../components/SvgWrapper';
import VolumeSlider from '../../components/VolumeSlider';
import Colors from '../../utils/javascriptColors';

class VideoControls extends React.PureComponent {
	state = {
		volumeSliderState: false,
	};

	getVolumeSvg(volume) {
		if (volume <= 0.25) {
			return <SvgWrapper className={'icon'} fill="#fff" svgid="volume_low" />;
		} else if (volume <= 0.5) {
			return <SvgWrapper className={'icon'} fill="#fff" svgid="volume_1" />;
		} else if (volume <= 0.75) {
			return <SvgWrapper className={'icon'} fill="#fff" svgid="volume_2" />;
		}
		return <SvgWrapper className={'icon'} fill="#fff" svgid="volume_max" />;
	}

	closeVolumeSlider = () => {
		this.setState({ volumeSliderState: false });
	};

	openVolumeSlider = () => {
		this.setState({ volumeSliderState: true });
	};

	render() {
		const {
			paused,
			volume,
			updateVolume,
			pauseVideo,
			toggleElipsis,
			toggleFullScreen,
		} = this.props;
		const { volumeSliderState } = this.state;

		return (
			<div className={paused ? 'controls hide-controls' : 'controls'}>
				<div className={'left-controls'}>
					<div
						className={'video-volume-container'}
						onTouchEnd={(e) => {
							e.preventDefault();
							if (!volumeSliderState) {
								this.openVolumeSlider();
							}
						}}
						onClick={() => {
							if (!volumeSliderState) {
								this.openVolumeSlider();
							}
						}}
					>
						<VolumeSlider
							active={volumeSliderState && !paused}
							onCloseFunction={this.closeVolumeSlider}
							updateVolume={updateVolume}
							volume={volume}
							railStyle={{
								width: '2px',
								backgroundColor: '#000',
							}}
							trackStyle={{
								backgroundColor: Colors.sliderGreen,
								width: '2px',
							}}
							handleStyle={{
								width: '12.5px',
								height: '12.5px',
								backgroundColor: Colors.sliderGreen,
								borderColor: Colors.sliderGreen,
								left: '5px',
							}}
							sliderContainerClassName={'video-slider-container'}
							activeClassNames={'video-volume-slider-container active'}
							inactiveClassNames={'video-volume-slider-container'}
							vertical
						/>
						{this.getVolumeSvg(volume)}
					</div>
					<SvgWrapper onClick={pauseVideo} fill={'#fff'} svgid={'pause'} />
				</div>
				<div className={'right-controls'}>
					<SvgWrapper
						fill={'#fff'}
						onClick={toggleElipsis}
						className={'video-elipsis'}
						svgid={'elipsis'}
					/>
					<SvgWrapper
						fill={'#fff'}
						className={'video-fullscreen'}
						onClick={toggleFullScreen}
						svgid={'fullscreen'}
					/>
				</div>
			</div>
		);
	}
}

VideoControls.propTypes = {
	paused: PropTypes.bool,
	volume: PropTypes.number,
	pauseVideo: PropTypes.func,
	updateVolume: PropTypes.func,
	toggleElipsis: PropTypes.func,
	toggleFullScreen: PropTypes.func,
};

export default VideoControls;
