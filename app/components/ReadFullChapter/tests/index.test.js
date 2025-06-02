import React from 'react';
import { render } from '@testing-library/react';
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
		const { asFragment } = render(<ReadFullChapter {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
