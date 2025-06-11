import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PropTypes from 'prop-types';

function LegacyLink({ href, as, children }) {
	const router = useRouter();
	// Only allow a single React element child
	const child = React.Children.only(children);

	// Your core navigation helper
	const navigate = (e) => {
		e.preventDefault();
		if (router.asPath !== as) {
			router.push(href, as);
		}
	};

	// Merge your navigation + any existing child.onClick
	const mergedOnClick = (e) => {
		navigate(e);
		if (typeof child.props.onClick === 'function') {
			child.props.onClick(e);
		}
	};

	return (
		<Link href={href} as={as} onClick={mergedOnClick}>
			{React.cloneElement(child, {
				onClick: mergedOnClick,
			})}
		</Link>
	);
}

LegacyLink.propTypes = {
	href: PropTypes.string.isRequired,
	as: PropTypes.string.isRequired,
	children: PropTypes.element.isRequired,
};

export default LegacyLink;
