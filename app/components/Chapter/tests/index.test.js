import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chapter from '..';

describe('<Chapter />', () => {
	const clickMessage = 'click-handler';
	const clickHandler = jest.fn(() => clickMessage);

	it('Should render and display chapter number', () => {
		render(<Chapter clickHandler={clickHandler} chapter={1} active href={''} as={''} />);
		expect(screen.getByText('1')).toBeInTheDocument();
	});

	it('Should render for active chapter', () => {
		render(<Chapter clickHandler={clickHandler} chapter={1} active href={''} as={''} />);
		expect(screen.getByText('1')).toHaveClass('active-chapter');
	});

	it('Should render for inactive chapter', () => {
		render(<Chapter clickHandler={clickHandler} chapter={1} href={''} as={''} />);
		expect(screen.getByText('1')).not.toHaveClass('active-chapter');
	});

	it('Should match snapshot for active chapter', () => {
		const { asFragment } = render(<Chapter clickHandler={clickHandler} chapter={1} active href={''} as={''} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('Should match snapshot for inactive chapter', () => {
		const { asFragment } = render(<Chapter clickHandler={clickHandler} chapter={1} href={''} as={''} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('Should correctly fire click event', () => {
		const { container } = render(<Chapter clickHandler={clickHandler} chapter={1} active href={''} as={''} />);
		// const anchor = screen.getByRole('link', { name: '1' });
		const anchor = container.querySelector('.chapter-box');
		fireEvent.click(anchor);
		expect(clickHandler).toHaveBeenCalledTimes(1);

		const clickResult = clickHandler.mock.results[0].value;
		expect(clickResult).toEqual(clickMessage);
	});
});
