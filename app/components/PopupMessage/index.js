/**
 *
 * PopupMessage
 *
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

function PopupMessage({ styles, message, x, y }) {
	const component = (
		<div
			style={{ top: y - 50, left: x - 87.5, ...styles }}
			className={'custom-popup'}
		>
			{message ? (
				<div>{message}</div>
			) : (
				<div>
					If you believe this to be an error please{' '}
					<a
						className={'logo'}
						href={'https://support.bible.is/contact'}
						title={'https://support.bible.is/contact'}
						target={'_blank'}
						rel={'noopener'}
					>
						contact support
					</a>
					.
				</div>
			)}
		</div>
	);

	return ReactDOM.createPortal(component, document.getElementById('__next'));
}

PopupMessage.propTypes = {
	message: PropTypes.oneOfType([
		PropTypes.string.isRequired,
		PropTypes.func.isRequired,
		PropTypes.object.isRequired,
	]).isRequired,
	x: PropTypes.number,
	y: PropTypes.number,
	styles: PropTypes.object,
};

export default PopupMessage;
