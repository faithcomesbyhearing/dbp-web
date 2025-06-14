/*
 *
 * LanguageProvider
 *
 * this component connects the redux state language locale to the
 * IntlProvider component and i18n messages (loaded from `app/translations`)
 *
 * if there are issues with passing styles to messages use textComponent={Fragment}
 * const Fragment = (props) => props.children;
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { createSelector } from 'reselect';
import { createStructuredSelector } from 'reselect';
import { IntlProvider } from 'react-intl';

import { makeSelectLocale } from './selectors';

export class LanguageProvider extends React.PureComponent {
	render() {
		return (
			<IntlProvider
				locale={this.props.locale}
				key={this.props.locale}
				messages={this.props.messages[this.props.locale]}
			>
				{React.Children.only(this.props.children)}
			</IntlProvider>
		);
	}
}

LanguageProvider.propTypes = {
	locale: PropTypes.string,
	messages: PropTypes.object,
	children: PropTypes.element.isRequired,
};

const mapStateToProps = createStructuredSelector({
	locale: makeSelectLocale,
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(LanguageProvider);
