import React from 'react';
import renderer from 'react-test-renderer';
import ReadFullChapter from '..';

jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));

const props = {
	activeTextId: 'ENGESV',
	activeBookId: 'GEN',
	activeChapter: 1,
};

describe('ReadFullChapter component', () => {
	it('should match previous snapshot', () => {
		const tree = renderer.create(<ReadFullChapter {...props} />).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
