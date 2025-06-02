import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PropTypes from 'prop-types';

function LegacyLink({ href, as, children }) {
	const router = useRouter();

	const handleClick = (e) => {
		e.preventDefault();

		// Prevent navigation if the user is already on the same path
		if (router.asPath !== as) {
			router.push(href, as);
		}
	};

	// Merge BibleLink's onClick with the child's existing onClick
	const mergeClickHandlers = (childOnClick) => (e) => {
		handleClick(e);

		if (typeof childOnClick === 'function') {
			childOnClick(e);
		}
	};

	return (
		<Link href={href} as={as} legacyBehavior>
			{React.cloneElement(children, {
				onClick: mergeClickHandlers(children.props.onClick),
			})}
		</Link>
	);
}

LegacyLink.propTypes = {
	href: PropTypes.string.isRequired,
	as: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
};

export default LegacyLink;
