import React from 'react';
import PropTypes from 'prop-types';

/**
 * A simple, accessible version list using native <details>/<summary>.
 */
const VersionListSection = ({ items }) => (
	<div className="version-list-section">
		{items.map((item) => {
			const { key, title, className, text, altText, types, clickHandler } =
				item;
			const displayText = altText ? `${text} (${altText})` : text;

			// Case: audio with drama and non-drama options
			if (types.audio && types.audio_drama) {
				return (
					<details key={key} className="accordion-item">
						<summary className="accordion-title-style summary-no-marker">
							<h4 title={title} className={className}>
								{displayText}
							</h4>
						</summary>
						<div className="accordion-body-style">
							<button
								className="version-item-button"
								onClick={() => clickHandler('audio_drama')}
								type="button"
							>
								Dramatized Version
							</button>
							<button
								className="version-item-button"
								onClick={() => clickHandler('audio')}
								type="button"
							>
								Non-Dramatized Version
							</button>
						</div>
					</details>
				);
			}

			// Default case: single link-like button
			return (
				<details key={key} className="accordion-item">
					<summary className="accordion-title-style summary-no-marker top-level-title">
						<button
							className={className}
							onClick={() => clickHandler('')}
							title={title}
							type="button"
						>
							{displayText}
						</button>
					</summary>
				</details>
			);
		})}
	</div>
);

VersionListSection.propTypes = {
	items: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			className: PropTypes.string,
			text: PropTypes.string.isRequired,
			altText: PropTypes.string,
			types: PropTypes.shape({
				audio: PropTypes.bool,
				audio_drama: PropTypes.bool,
				text_plain: PropTypes.bool,
				text_format: PropTypes.bool,
			}).isRequired,
			clickHandler: PropTypes.func.isRequired,
		}),
	).isRequired,
};

export default VersionListSection;
