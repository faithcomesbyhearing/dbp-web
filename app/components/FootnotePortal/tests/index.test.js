import React from 'react';
import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import FootnotePortal from '..';

Enzyme.configure({ adapter: new Adapter() });

// Mocks
Object.defineProperty(document, 'getElementById', {
	value: (input) => {
		const el = document.createElement('div');
		el.id = input;
		return el;
	},
});

const props = {
	message: 'Please Login.',
	coords: { x: 15, y: 15 },
	closeFootnote: jest.fn(),
};

describe('FootnotePortal component', () => {
	it('should match snapshot with expected props', () => {
		const tree = Enzyme.mount(<FootnotePortal {...props} />);
		expect(tree).toMatchSnapshot();
	});
});
