import React from 'react';
import { render } from '@testing-library/react';

import NoteVerseText from '..';

const notePassage =
	'Salmon the father of Boaz, whose mother was Rahab. Boaz became the father of Obed, whose mother was Ruth. Obed became the father of Jesse,';

describe('<NoteVerseText />', () => {
	it('Should match snapshot when not loading', () => {
		const { asFragment } = render(
			<NoteVerseText notePassage={notePassage} loading={false} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('Should match snapshot when loading', () => {
		const { asFragment } = render(
			<NoteVerseText notePassage={notePassage} loading />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
