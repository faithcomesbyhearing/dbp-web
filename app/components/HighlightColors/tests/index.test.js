import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Colors from '../../../../theme_config/javascriptColors';
import HighlightColors from '..';

/* eslint-disable react/prop-types */
jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));
/* eslint-enable react/prop-types */
const options = ['None', 'Yellow', 'Green', 'Pink', 'Purple', 'Blue'];
const green = Colors.highlightGreen;
const yellow = Colors.highlightYellow;
const pink = Colors.highlightPink;
const purple = Colors.highlightPurple;
const blue = Colors.highlightBlue;

describe('HighlightColors component', () => {
	let addHighlight;

	beforeEach(() => {
		addHighlight = jest.fn(({ color }) => color);
	});

	it('should match snapshot', () => {
		const { container } = render(<HighlightColors addHighlight={addHighlight} />);
		expect(container).toMatchSnapshot();
	});

	it('should handle yellow highlight option click', () => {
		const { container } = render(<HighlightColors addHighlight={addHighlight} />);
		const yellowButton = container.querySelector('.yellow');

		fireEvent.click(yellowButton, { clientX: 10, clientY: 10 });
		expect(addHighlight).toHaveBeenCalledWith({
			color: yellow,
			popupCoords: { x: 10, y: 10 },
		});
		expect(addHighlight).toHaveBeenCalledTimes(1);
	});

	it('should handle green highlight option click', () => {
		const { container } = render(<HighlightColors addHighlight={addHighlight} />);
		const greenButton = container.querySelector('.green');

		fireEvent.click(greenButton, { clientX: 10, clientY: 10 });
		expect(addHighlight).toHaveBeenCalledWith({
			color: green,
			popupCoords: { x: 10, y: 10 },
		});
		expect(addHighlight).toHaveBeenCalledTimes(1);
	});

	it('should handle pink highlight option click', () => {
		const { container } = render(<HighlightColors addHighlight={addHighlight} />);
		const pinkButton = container.querySelector('.pink');

		fireEvent.click(pinkButton, { clientX: 10, clientY: 10 });
		expect(addHighlight).toHaveBeenCalledWith({
			color: pink,
			popupCoords: { x: 10, y: 10 },
		});
		expect(addHighlight).toHaveBeenCalledTimes(1);
	});

	it('should handle purple highlight option click', () => {
		const { container } = render(<HighlightColors addHighlight={addHighlight} />);
		const purpleButton = container.querySelector('.purple');

		fireEvent.click(purpleButton, { clientX: 10, clientY: 10 });
		expect(addHighlight).toHaveBeenCalledWith({
			color: purple,
			popupCoords: { x: 10, y: 10 },
		});
		expect(addHighlight).toHaveBeenCalledTimes(1);
	});

	it('should handle blue highlight option click', () => {
		const { container } = render(<HighlightColors addHighlight={addHighlight} />);
		const blueButton = container.querySelector('.blue');

		fireEvent.click(blueButton, { clientX: 10, clientY: 10 });
		expect(addHighlight).toHaveBeenCalledWith({
			color: blue,
			popupCoords: { x: 10, y: 10 },
		});
		expect(addHighlight).toHaveBeenCalledTimes(1);
	});

	it('should handle no color highlight option click', () => {
		const { container } = render(<HighlightColors addHighlight={addHighlight} />);
		const noneButton = container.querySelector('.none');

		fireEvent.click(noneButton, { clientX: 10, clientY: 10 });
		expect(addHighlight).toHaveBeenCalledWith({
			color: 'none',
			popupCoords: { x: 10, y: 10 },
		});
		expect(addHighlight).toHaveBeenCalledTimes(1);
	});

	it('should contain all color options', () => {
		const { getAllByText } = render(<HighlightColors addHighlight={addHighlight} />);
		const colorTextNodes = getAllByText(/none|yellow|green|pink|purple|blue/i);

		colorTextNodes.forEach((node, index) => expect(node.textContent).toEqual(options[index]));
	});
});
