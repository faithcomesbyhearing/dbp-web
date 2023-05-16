import React from 'react';
import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import renderer from 'react-test-renderer';
import Colors from '../../../../theme_config/javascriptColors';
import ColorPicker from '..';

Enzyme.configure({ adapter: new Adapter() });

const green = Colors.highlightGreen;
const yellow = Colors.highlightYellow;
const pink = Colors.highlightPink;
const purple = Colors.highlightPurple;
const blue = Colors.highlightBlue;
let handlePickedColor;
let wrapper;

describe('ColorPicker tests', () => {
	beforeEach(() => {
		handlePickedColor = jest.fn(({ color }) => color);
		wrapper = Enzyme.mount(
			<ColorPicker handlePickedColor={handlePickedColor} />,
		);
	});
	it('Should render', () => {
		const tree = renderer
			.create(<ColorPicker handlePickedColor={handlePickedColor} />)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
	it('It should call the handler when the green option is clicked', () => {
		const colorNode = wrapper.find('.green');
		const spy = jest.spyOn(colorNode.props(), 'onClick');
		const colorOutput = colorNode.props().onClick();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(colorOutput).toEqual(green);

		colorNode.simulate('click');

		expect(handlePickedColor).toHaveBeenCalledTimes(2);
		expect(wrapper).toBeTruthy();
	});
	it('It should call the handler when the yellow option is clicked', () => {
		const colorNode = wrapper.find('.yellow');
		const spy = jest.spyOn(colorNode.props(), 'onClick');
		const colorOutput = colorNode.props().onClick();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(colorOutput).toEqual(yellow);

		colorNode.simulate('click');

		expect(handlePickedColor).toHaveBeenCalledTimes(2);
		expect(wrapper).toBeTruthy();
	});
	it('It should call the handler when the pink option is clicked', () => {
		const colorNode = wrapper.find('.pink');
		const spy = jest.spyOn(colorNode.props(), 'onClick');
		const colorOutput = colorNode.props().onClick();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(colorOutput).toEqual(pink);

		colorNode.simulate('click');

		expect(handlePickedColor).toHaveBeenCalledTimes(2);
		expect(wrapper).toBeTruthy();
	});
	it('It should call the handler when the blue option is clicked', () => {
		const colorNode = wrapper.find('.blue');
		const spy = jest.spyOn(colorNode.props(), 'onClick');
		const colorOutput = colorNode.props().onClick();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(colorOutput).toEqual(blue);

		colorNode.simulate('click');

		expect(handlePickedColor).toHaveBeenCalledTimes(2);
		expect(wrapper).toBeTruthy();
	});
	it('It should call the handler when the purple option is clicked', () => {
		const colorNode = wrapper.find('.purple');
		const spy = jest.spyOn(colorNode.props(), 'onClick');
		const colorOutput = colorNode.props().onClick();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(colorOutput).toEqual(purple);

		colorNode.simulate('click');

		expect(handlePickedColor).toHaveBeenCalledTimes(2);
		expect(wrapper).toBeTruthy();
	});
});
