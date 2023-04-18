/**
 *
 * SpeedControl
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import CloseMenuFunctions from '../../utils/closeMenuFunctions';

class SpeedControl extends React.PureComponent {
	constructor(props) {
		super(props);
		this.timer = null;
	}

	componentDidMount() {
		this.closeMenuController = new CloseMenuFunctions(
			this.ref,
			this.props.onCloseFunction,
			{ speed: 'speed' },
		);
		this.closeMenuController.onMenuMount();
	}

	componentDidUpdate(nextProps) {
		if (
			this.ref &&
			this.props.active &&
			nextProps.active !== this.props.active
		) {
			this.closeMenuController.onMenuUnmount();
			this.timer = setTimeout(() => {
				this.closeMenuController.onMenuMount();
			}, 100);
		}
	}

	componentWillUnmount() {
		this.closeMenuController.onMenuUnmount();
		clearTimeout(this.timer);
	}

	setRef = (el) => (this.ref = el);

	render() {
		const { active, options, setSpeed, playbackRate } = this.props;

		return (
			<div
				ref={this.setRef}
				className={
					active ? 'speed-control-container' : 'speed-control-container closed'
				}
			>
				<div className="speed-control">
					{options.map((option) => (
						<span
							key={option}
							className={
								playbackRate === option ? 'speed-item active' : 'speed-item'
							}
							onClick={() => setSpeed(option)}
						>
							{option}
						</span>
					))}
				</div>
			</div>
		);
	}
}

SpeedControl.propTypes = {
	options: PropTypes.array,
	setSpeed: PropTypes.func,
	active: PropTypes.bool,
	playbackRate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	onCloseFunction: PropTypes.func,
};

export default SpeedControl;
