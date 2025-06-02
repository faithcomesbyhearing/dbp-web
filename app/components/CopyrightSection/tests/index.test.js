// app/components/CopyrightStatement/tests/index.test.js
import React from 'react';
import { render } from '@testing-library/react';
import CopyrightStatement from '..';

// mock out react-intl
jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (msgs) => msgs,
}));

import {
	copyrights,
	invalidCopyrights,
	invalidCopyrights2,
} from '../../../utils/testUtils/copyrightData';

describe('<CopyrightStatement />', () => {
	const baseProps = { prefix: 'new', copyrights };

	it('renders new testament correctly', () => {
		const { asFragment } = render(<CopyrightStatement {...baseProps} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('renders old testament correctly', () => {
		const { asFragment } = render(
			<CopyrightStatement {...baseProps} prefix="old" />,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('handles invalid new-testament data', () => {
		const { asFragment } = render(
			<CopyrightStatement prefix="new" copyrights={invalidCopyrights} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('handles invalid old-testament data', () => {
		const { asFragment } = render(
			<CopyrightStatement prefix="old" copyrights={invalidCopyrights} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('handles old-testament with no messages', () => {
		const { asFragment } = render(
			<CopyrightStatement prefix="old" copyrights={invalidCopyrights2} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('renders nothing when no copyright data', () => {
		const { asFragment } = render(
			<CopyrightStatement prefix="old" copyrights={{}} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
