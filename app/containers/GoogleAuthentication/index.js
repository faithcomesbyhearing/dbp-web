/**
 *
 * GoogleAuthentication
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import SvgWrapper from '../../components/SvgWrapper';
import PopupMessage from '../../components/PopupMessage';
import { createUserWithSocialAccount } from '../HomePage/actions';

export class GoogleAuthentication extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = { popupOpen: false, popupCoords: { x: 0, y: 0 } };
	}

	handleSocialLogin = () => {
		this.props.dispatch(createUserWithSocialAccount({ provider: 'google' }));
	};

	render() {
		return (
			<div
				role={'button'}
				id={'google-login'}
				tabIndex={0}
				onClick={this.handleSocialLogin}
				className="google"
			>
				<SvgWrapper
					style={{ backgroundColor: 'white' }}
					className="svg"
					height="26px"
					width="26px"
					svgid="google"
				/>
				Sign in with Google
				{this.state.popupOpen ? (
					<PopupMessage
						y={this.state.popupCoords.y}
						x={this.state.popupCoords.x}
						message={'This functionality is currently unavailable.'}
					/>
				) : null}
			</div>
		);
	}
}

GoogleAuthentication.displayName = 'Google Authentication';

GoogleAuthentication.propTypes = {
	dispatch: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

const withConnect = connect(null, mapDispatchToProps);

export default compose(withConnect)(GoogleAuthentication);
