import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // for custom matchers like toBeInTheDocument
import Checkbox from '..';

const updater = jest.fn(() => {
	props.toggleState = !props.toggleState;
});
const props = {
	label: 'autoplay',
	toggleState: true,
	className: 'autoplay',
	id: 'autoplay-checkbox',
	updater,
};

const stringToBoolean = (input) => {
	if (input === 'true') {
		return true;
	} else if (input === 'false') {
		return false;
	} else {
		return undefined;
	}
};

describe('Checkbox component', () => {
	beforeEach(() => {
		props.toggleState = true;
	});

	it('should match snapshot for active state', () => {
		const { asFragment } = render(<Checkbox {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should match snapshot for inactive state', () => {
		const { asFragment } = render(<Checkbox {...props} toggleState={false} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should match snapshot for default props', () => {
		const { asFragment } = render(<Checkbox {...props} id={''} className={''} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should render in active state', () => {
		render(<Checkbox {...props} />);
		const input = screen.getByRole('checkbox');
		// expect(input.value).toBe(props.toggleState); // Checked when true
		expect(stringToBoolean(input.value)).toBe(props.toggleState); // Checked when true
	});

	it('should render in inactive state when toggled', () => {
		const { rerender } = render(<Checkbox {...props} />);
		const input = screen.getByRole('checkbox');

		expect(props.toggleState).toBe(true); // Now checked

		// Simulate the change event
		fireEvent.click(input);

		expect(updater).toHaveBeenCalledTimes(1);

		// Verify the checkbox value after click
		expect(props.toggleState).toBe(false); // Now unchecked

		// Re-render the component with updated props
		rerender(<Checkbox {...props} toggleState={props.toggleState} />);

		// Verify the checkbox value after the update
		expect(stringToBoolean(screen.getByRole('checkbox').value)).toBe(props.toggleState); // Now unchecked
	});
});
