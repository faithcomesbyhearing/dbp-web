/**
 *
 * AccountSettings
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SvgWrapper from '../SvgWrapper';
import PopupMessage from '../PopupMessage';
import messages from './messages';

class AccountSettings extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			email: this.props.profile.email,
			nickname: this.props.profile.nickname,
			name: this.props.profile.name,
			avatar: this.props.profile.avatar,
			popupOpen: false,
		};
	}

	handleEmailChange = (e) => {
		this.setState({ email: e.target.value });
	};

	render() {
		const { logout, profile } = this.props;
		const { email, popupOpen } = this.state;

		return (
			<div className="account-settings">
				<div
					role="button"
					tabIndex={0}
					onClick={logout}
					className="logout-button"
				>
					<FormattedMessage {...messages.logout} />
				</div>
				<section className="personal-info">
					<SvgWrapper
						className={'avatar-placeholder'}
						svgid={'avatar_placeholder'}
					/>
					{profile.nickname && profile.nickname !== 'undefined' ? (
						<h3 className="name">{profile.nickname}</h3>
					) : null}
					{profile.name && profile.name !== 'undefined' ? (
						<span className="name">{profile.name}</span>
					) : null}
				</section>
				<div className="email-section">
					<span className="title">e-mail</span>
					<span className="wrapper">
						<SvgWrapper
							className="icon"
							height="26px"
							width="26px"
							svgid="e-mail"
						/>
						<input
							onChange={this.handleEmailChange}
							placeholder="emailaddress@mail.com"
							value={email}
						/>
					</span>
				</div>
				{/* <DonateButton /> */}
				{popupOpen ? (
					<PopupMessage
						message={'Please select a valid image file.'}
						x={160}
						y={250}
					/>
				) : null}
			</div>
		);
	}
}

AccountSettings.propTypes = {
	logout: PropTypes.func,
	changePicture: PropTypes.func,
	profile: PropTypes.object,
};

export default AccountSettings;
