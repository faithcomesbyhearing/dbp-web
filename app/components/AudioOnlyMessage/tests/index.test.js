import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioOnlyMessage from '../index';

jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));

const book = 'Romans';
const chapter = 8;

describe('AudioOnlyMessage Component', () => {
	it('Should match previous snapshot', () => {
		const { container } = render(
			<AudioOnlyMessage book={book} chapter={chapter} />,
		);
		expect(container).toMatchSnapshot();
	});

	it('Should render a div containing given book and chapter', () => {
		render(<AudioOnlyMessage book={book} chapter={chapter} />);

		const textContent = screen.getByText(`${book} ${chapter}`);
		expect(textContent).toBeInTheDocument();
		expect(textContent.textContent).toContain(book);
		expect(textContent.textContent).toContain(`${chapter}`);
	});
});
