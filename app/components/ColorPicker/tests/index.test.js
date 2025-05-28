import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Colors from '../../../../theme_config/javascriptColors';
import ColorPicker from '..';

const green = Colors.highlightGreen;
const yellow = Colors.highlightYellow;
const pink = Colors.highlightPink;
const purple = Colors.highlightPurple;
const blue = Colors.highlightBlue;

describe('ColorPicker tests', () => {
	let handlePickedColor;

	beforeEach(() => {
		handlePickedColor = jest.fn();
	});

	it('Should render and match snapshot', () => {
		const { container } = render(
			<ColorPicker handlePickedColor={handlePickedColor} />,
		);
		expect(container).toMatchSnapshot();
	});

	it('Should call the handler when the green option is clicked', () => {
		const { getByLabelText } = render(
			<ColorPicker handlePickedColor={handlePickedColor} />,
		);
		const greenButton = getByLabelText('green');

		fireEvent.click(greenButton);
		expect(handlePickedColor).toHaveBeenCalledWith({ color: green });
		expect(handlePickedColor).toHaveBeenCalledTimes(1);
	});

	it('Should call the handler when the yellow option is clicked', () => {
		const { getByLabelText } = render(
			<ColorPicker handlePickedColor={handlePickedColor} />,
		);
		const yellowButton = getByLabelText('yellow');

		fireEvent.click(yellowButton);
		expect(handlePickedColor).toHaveBeenCalledWith({ color: yellow });
		expect(handlePickedColor).toHaveBeenCalledTimes(1);
	});

	it('Should call the handler when the pink option is clicked', () => {
		const { getByLabelText } = render(
			<ColorPicker handlePickedColor={handlePickedColor} />,
		);
		const pinkButton = getByLabelText('pink');

		fireEvent.click(pinkButton);
		expect(handlePickedColor).toHaveBeenCalledWith({ color: pink });
		expect(handlePickedColor).toHaveBeenCalledTimes(1);
	});

	it('Should call the handler when the purple option is clicked', () => {
		const { getByLabelText } = render(
			<ColorPicker handlePickedColor={handlePickedColor} />,
		);
		const purpleButton = getByLabelText('purple');

		fireEvent.click(purpleButton);
		expect(handlePickedColor).toHaveBeenCalledWith({ color: purple });
		expect(handlePickedColor).toHaveBeenCalledTimes(1);
	});

	it('Should call the handler when the blue option is clicked', () => {
		const { getByLabelText } = render(
			<ColorPicker handlePickedColor={handlePickedColor} />,
		);
		const blueButton = getByLabelText('blue');

		fireEvent.click(blueButton);
		expect(handlePickedColor).toHaveBeenCalledWith({ color: blue });
		expect(handlePickedColor).toHaveBeenCalledTimes(1);
	});
});
