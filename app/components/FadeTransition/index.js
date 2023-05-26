/**
 *
 * FadeTransition
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

function FadeTransition({ children, classNames, ...props }) {
  return (
<CSSTransition {...props} timeout={400} classNames={classNames || 'fade'}>
		{children}
</CSSTransition>
);
}

FadeTransition.propTypes = {
	children: PropTypes.node,
	classNames: PropTypes.string,
};

export default FadeTransition;
