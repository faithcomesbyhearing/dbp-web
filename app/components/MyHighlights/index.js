/**
 *
 * MyHighlights
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
import Link from 'next/link';
import SvgWrapper from '../SvgWrapper';
// import ColorPicker from 'components/ColorPicker';
// import styled from 'styled-components';

class MyHighlights extends React.PureComponent {
	// eslint-disable-line react/prefer-stateless-function
	state = {
		selectedId: '',
		selectedColor: '',
	};

	highlightIcon(color) {
		return (
			<span className={'color-icon'} style={{ backgroundColor: `${color}` }} />
		);
	}

	render() {
		const {
			highlights,
			getReference,
			deleteHighlights,
			toggleNotesModal,
			startUpdateProcess,
		} = this.props;
		// console.log('colorPickerState', colorPickerState);

		return highlights.map((highlight) => (
			<div
				key={`${highlight.id}_${highlight.highlighted_color}`}
				className={'highlight-item'}
			>
				<Link
					as={`/bible/${highlight.bible_id}/${highlight.book_id}/${
						highlight.chapter
					}/${highlight.verse_start}`}
					href={`/bible/${highlight.bible_id}/${highlight.book_id}/${
						highlight.chapter
					}/${highlight.verse_start}`}
				>
					<a onClick={toggleNotesModal} className="list-item">
						<div className="title-text">
							<h4 className="title">{getReference(highlight)}</h4>
							<h4 className={'text'}>{highlight.bible_id}</h4>
						</div>
					</a>
				</Link>
				<div
					className={'edit-color'}
					tabIndex={0}
					role={'button'}
					onClick={() =>
						startUpdateProcess({
							id: highlight.id,
							color: highlight.highlighted_color,
						})
					}
				>
					{this.highlightIcon(highlight.highlighted_color)}
					<span>Edit</span>
				</div>
				<div className={'delete-highlight'}>
					<SvgWrapper
						className={'icon'}
						svgid={'delete'}
						onClick={() => deleteHighlights({ ids: [highlight.id] })}
					/>
					<span>Delete</span>
				</div>
			</div>
		));
	}
}

MyHighlights.propTypes = {
	highlights: PropTypes.array,
	getReference: PropTypes.func,
	deleteHighlights: PropTypes.func,
	// updateHighlight: PropTypes.func,
	toggleNotesModal: PropTypes.func,
	startUpdateProcess: PropTypes.func,
};

export default MyHighlights;
