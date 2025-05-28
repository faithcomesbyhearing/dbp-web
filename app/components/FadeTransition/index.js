/**
 *
 * FadeTransition
 *
 */

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

function FadeTransition({ children, classNames, ...props }) {
	const nodeRef = useRef(null);
	return (
		<CSSTransition
			{...props}
			timeout={400}
			classNames={classNames || 'fade'}
			nodeRef={nodeRef}
		>
			{children}
		</CSSTransition>
	);
}

FadeTransition.propTypes = {
	children: PropTypes.node,
	classNames: PropTypes.string,
};

export default FadeTransition;
