import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import CopyrightStatement from '../CopyrightStatement';
import {
	FILESET_MODE_TEXT,
	FILESET_MODE_AUDIO,
	FILESET_MODE_VIDEO,
} from '../../constants/bibleFileset';

const copyrightMessage = (message) =>
	message
		.split('\n')
		.map((m) => [
			<span key={`${m}_cpmessage`}>{m}</span>,
			<br key={`${m}_cplinebreak`} />,
		]);

function CopyrightSection({ copyrights }) {
	const modes = [FILESET_MODE_TEXT, FILESET_MODE_AUDIO, FILESET_MODE_VIDEO];

	return (
		<div className="copyright-content">
			{modes.flatMap((mode) => {
				if (!get(copyrights, [mode])) {
					return [];
				}
				const copyrightsByMode = get(copyrights, [mode]);

				return copyrightsByMode
					.filter(
						(copyrightData) =>
							get(copyrightData, ['organizations']) ||
							get(copyrightData, ['message']),
					)
					.map((copyrightData) => (
						<div
							className={'cp-section'}
							key={`${mode}_${copyrightData.type}_${copyrightData.testament}_cp_section`}
						>
							{get(copyrightData, ['organizations']) ? (
								<CopyrightStatement
									organizations={copyrightData.organizations}
									testament={copyrightData.testament}
									type={mode}
								/>
							) : null}
							{get(copyrightData, ['message']) ? (
								<p>{copyrightMessage(copyrightData.message)}</p>
							) : null}
						</div>
					));
			})}
		</div>
	);
}

CopyrightSection.propTypes = {
	prefix: PropTypes.string,
	copyrights: PropTypes.object,
};

export default CopyrightSection;
