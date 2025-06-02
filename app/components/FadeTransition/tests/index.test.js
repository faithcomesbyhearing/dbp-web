import React from 'react';
import { render } from '@testing-library/react';
import FadeTransition from '..';

const children = (
	<div id="transition-child-id">
		<h1>Child of the transition</h1>
		<p>Paragraph child of the transition</p>
	</div>
);

describe('<FadeTransition /> component', () => {
	it('should match snapshot with classNames', () => {
		const { asFragment } = render(
			<FadeTransition classNames={'slide-from-right'}>
				{children}
			</FadeTransition>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
	it('should match snapshot without classNames', () => {
		const { asFragment } = render(<FadeTransition>{children}</FadeTransition>);
		expect(asFragment()).toMatchSnapshot();
	});
});
