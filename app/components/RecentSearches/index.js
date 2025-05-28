/**
 *
 * RecentSearches
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

function RecentSearches({ searches, clickHandler }) {
	return Array.isArray(searches) ? searches.map((s) => (
		<button
			className={'search-history-item'}
			key={s}
			onClick={() => clickHandler(s)}
			type={'button'}
		>
			{s}
		</button>
	)) : null;
}

RecentSearches.propTypes = {
	searches: PropTypes.array,
	clickHandler: PropTypes.func,
};

export default RecentSearches;
