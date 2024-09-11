/**
 *
 * MyHighlights
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
// import Link from 'next/link';
import SvgWrapper from '../SvgWrapper';
import LegacyLink from '../LegacyLink';

class MyHighlights extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			selectedId: '',
			selectedColor: '',
		};
	}

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

		const handleClick = (newUrl) =>
			(e) => {
				if (Router.asPath === newUrl) {
					e.preventDefault(); // Stop navigation if it's the same URL
					toggleNotesModal(); // Only toggle modal
				}
			};

		return highlights.map((highlight) => (
			<div
				key={`${highlight.id}_${highlight.highlighted_color}`}
				id={`${highlight.id}_${highlight.highlighted_color}`}
				className={'highlight-item'}
			>
				<LegacyLink
					as={`/bible/${highlight.bible_id}/${highlight.book_id}/${
						highlight.chapter
					}`}
					href={`/bible/${highlight.bible_id}/${highlight.book_id}/${
						highlight.chapter
					}`}
				>
					<button
						onClick={toggleNotesModal}
						className="list-item"
						type="button"
					>
						<div className="title-text">
							<h4 className="title">{getReference(highlight)}</h4>
							<h4 className={'text'}>{highlight.bible_id}</h4>
						</div>
					</button>
				</LegacyLink>
				<button
					id={`${highlight.id}_${highlight.highlighted_color}-edit`}
					className={'edit-color'}
					tabIndex={0}
					type={'button'}
					onClick={() =>
						startUpdateProcess({
							id: highlight.id,
							color: highlight.highlighted_color,
						})
					}
				>
					{this.highlightIcon(highlight.highlighted_color)}
					<span>Edit</span>
				</button>
				<div className={'delete-highlight'}>
					<SvgWrapper
						className={'icon'}
						svgid={'delete'}
						id={`${highlight.id}_${highlight.highlighted_color}-delete`}
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
	toggleNotesModal: PropTypes.func,
	startUpdateProcess: PropTypes.func,
};

export default MyHighlights;
