import React from 'react';
import { render } from '@testing-library/react';
import MyHighlights from '..';
import {
	getHighlightReference,
	highlights,
} from '../../../utils/testUtils/notebookFunctions';

const props = {
	highlights,
	getReference: jest.fn((params) => getHighlightReference(params)),
	toggleNotesModal: jest.fn(),
	startUpdateProcess: jest.fn(),
	deleteHighlights: jest.fn(),
};

describe('<MyHighlights /> component', () => {
	it('should match snapshot with expected props', () => {
		const { asFragment } = render(<MyHighlights {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
