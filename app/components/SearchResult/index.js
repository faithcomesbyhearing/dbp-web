/**
 *
 * SearchResult
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

function SearchResult({ result: r, bibleId }) {
	// Dont know of a better way to differentiate between words because two of the
	// same word could be in the text, this way at least their index in the array is different
	return (
		<div
			key={`${r['book_id']}${r['chapter']}${r['verse_start']}`}
			className={'single-result'}
		>
			<h4>
				<Link
					legacyBehavior
					as={`/bible/${bibleId}/${r['book_id']}/${r['chapter']}/${r['verse_start']}`}
					href={`/bible/${bibleId}/${r['book_id']}/${r['chapter']}/${r['verse_start']}`}
				>
					<a>{`${r['chapter']}:${r['verse_start']}`}</a>
				</Link>
			</h4>
			<p>{r['verse_text']}</p>
		</div>
	);
}

SearchResult.propTypes = {
	result: PropTypes.object,
	bibleId: PropTypes.string,
};

export default SearchResult;
