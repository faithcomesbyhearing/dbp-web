/**
 *
 * ReadersModeVerse
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import customStyle from '../../utils/customVerseStyle';

function ReadersModeVerse({
	onMouseUp,
	onMouseDown,
	onHighlightClick,
	verse,
	activeVerse,
	verseIsActive,
}) {
	// Determine if the current verse is active
	const isActiveVerse =
		verseIsActive &&
		(parseInt(activeVerse, 10) === verse.verse_start ||
			activeVerse === verse.verse_start_alt);

	// Conditional class names
	const verseClassName = isActiveVerse
		? 'align-left active-verse'
		: 'align-left';

	// Handle keyboard interaction (space and enter)
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			onHighlightClick(e);
		}
	};

	return (
		<>
			<span
				onMouseUp={onMouseUp}
				onMouseDown={onMouseDown}
				onClick={onHighlightClick}
				onKeyDown={handleKeyDown}
				style={customStyle(verse)}
				className={verseClassName}
				data-verseid={verse.verse_start}
				key={verse.verse_start}
				dangerouslySetInnerHTML={{ __html: verse.verse_text }}
				aria-label={verse.verse_text}
			/>
			<span key={`${verse.verse_end}spaces`} className={'readers-spaces'}>
				&nbsp;
			</span>
		</>
	);
}

ReadersModeVerse.propTypes = {
	onMouseUp: PropTypes.func,
	onMouseDown: PropTypes.func,
	onHighlightClick: PropTypes.func,
	verse: PropTypes.shape({
		verse_start: PropTypes.number.isRequired,
		verse_start_alt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		verse_text: PropTypes.string.isRequired,
		verse_end: PropTypes.number.isRequired,
	}).isRequired,
	activeVerse: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	verseIsActive: PropTypes.bool,
};

export default ReadersModeVerse;
