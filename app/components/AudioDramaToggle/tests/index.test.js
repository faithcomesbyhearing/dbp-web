import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioDramaToggle } from '../index';

const props = {
	audioType: 'audio_drama',
	availableAudioTypes: ['audio_drama', 'audio'],
	dispatch: jest.fn(),
};

describe('<AudioDramaToggle />', () => {
	it('Expect to match snapshot for drama audio', () => {
		const { asFragment } = render(<AudioDramaToggle {...props} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('Expect to match snapshot for plain audio', () => {
		const { asFragment } = render(<AudioDramaToggle {...props} audioType="audio" />);
		expect(asFragment()).toMatchSnapshot();
	});

	it('Expect to match snapshot for only plain audio available', () => {
		const { asFragment } = render(
		<AudioDramaToggle {...props} availableAudioTypes={['audio']} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('Expect to match snapshot for only drama audio available', () => {
		const { asFragment } = render(
		<AudioDramaToggle {...props} availableAudioTypes={['audio_drama']} />,
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it('should render two buttons and handle clicks correctly', () => {
		render(<AudioDramaToggle {...props} />);

		const dramaButton = screen.getByText('Drama');
		const nonDramaButton = screen.getByText('Non-Drama');

		expect(dramaButton).toBeInTheDocument();
		expect(nonDramaButton).toBeInTheDocument();

		// Simulate clicks and check dispatch calls
		fireEvent.click(dramaButton);
		expect(props.dispatch).toHaveBeenCalledTimes(0); // drama is already selected

		fireEvent.click(nonDramaButton);
		expect(props.dispatch).toHaveBeenCalledTimes(1); // switching to non-drama

		fireEvent.click(nonDramaButton);
		expect(props.dispatch).toHaveBeenCalledTimes(2); // non-drama
	});
});
