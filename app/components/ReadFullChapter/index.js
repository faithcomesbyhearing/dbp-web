/**
 *
 * ReadFullChapter
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Link from 'next/link';
import messages from './messages';

function ReadFullChapter({ activeTextId, activeBookId, activeChapter }) {
	const textId = String(activeTextId || '').toLowerCase();
	const bookId = String(activeBookId || '').toLowerCase();
	const chapter = activeChapter;

	const href = `/app?bibleId=${textId}&bookId=${bookId}&chapter=${chapter}`;
	const as = `/bible/${textId}/${bookId}/${chapter}`;
	return (
		<div className={'read-chapter-container'}>
			<Link legacyBehavior href={href} as={as}>
				<button type={'button'} className={'read-chapter'}>
					<FormattedMessage {...messages.readFullChapter} />
				</button>
			</Link>
		</div>
	);
}

ReadFullChapter.propTypes = {
	activeTextId: PropTypes.string,
	activeBookId: PropTypes.string,
	activeChapter: PropTypes.number,
};

ReadFullChapter.defaultProps = {
	activeTextId: '',
	activeBookId: '',
	activeChapter: 1,
};

export default ReadFullChapter;
