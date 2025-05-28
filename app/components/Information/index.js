/**
 *
 * Information
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage } from 'react-intl';
import AnimateHeight from 'react-animate-height';
import Link from 'next/link';
import CopyrightSection from '../CopyrightSection';
import { selectCopyrights } from './selectors';
import messages from './messages';
import SvgWrapper from '../SvgWrapper';

export class Information extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			opened: false,
			height: 0,
		};
	}

	setRef = (node) => {
		this.ref = node;
	};

	toggleCopyright = () => {
		const height = 515;

		this.setState((currentState) => ({
			opened: !currentState.opened,
			height: !currentState.height ? height : 0,
		}));
	};

	render() {
		const { copyrights } = this.props;

		return (
			<section ref={this.setRef} className="information">
				<button
					onClick={this.toggleCopyright}
					className="information-toggle"
					type={'button'}
				>
					<FormattedMessage {...messages.material} />
					&nbsp;|&nbsp;
					<span className={'learn-more'}>
						<FormattedMessage {...messages.learnMore} />
					</span>
					<SvgWrapper
						className={this.state.opened ? 'icon rotate' : 'icon'}
						svgid={'arrow_down'}
					/>
				</button>
				<AnimateHeight height={this.state.height} duration={1000}>
					<div
						style={{ maxHeight: this.state.height }}
						className="copyrights-section"
					>
						<CopyrightSection copyrights={copyrights} prefix={'old'} />
						<CopyrightSection copyrights={copyrights} prefix={'new'} />
					</div>
				</AnimateHeight>
				<div className={'ministry-statement'}>
					<div className={'ministry-tagline'}>
						<FormattedMessage {...messages.circleC} />
						&nbsp;
						<a rel={'noopener'} target={'_blank'} href={'http://www.bible.is'}>
							<FormattedMessage {...messages.bibleIsText} />
						</a>
						<FormattedMessage {...messages.ministrySlogan} />
						&nbsp;
						<a
							rel={'noopener'}
							target={'_blank'}
							href={'https://www.faithcomesbyhearing.com'}
						>
							<FormattedMessage {...messages.faithComesByHearing} />
						</a>
						&nbsp;
						<FormattedMessage {...messages.circleR} />
						&nbsp;
					</div>
					<div className={'ministry-terms-support'}>
						{/* <Link legacyBehavior href={'/terms'}>
							<a id={'terms-of-service'}>
								<FormattedMessage {...messages.terms} />
							</a>
						</Link> */}
						<Link href={'/terms'} id={'terms-of-service'}>
							<FormattedMessage {...messages.terms} />
						</Link>
						&nbsp; | &nbsp;
						<a
							href={'https://support.bible.is/contact'}
							rel={'noopener'}
							target={'_blank'}
							id={'help-support'}
						>
							<FormattedMessage {...messages.helpSupport} />
						</a>
					</div>
				</div>
			</section>
		);
	}
}

Information.propTypes = {
	copyrights: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
	copyrights: selectCopyrights(),
});

const mapDispatchToProps = (dispatch) => ({
	dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps())(Information);
