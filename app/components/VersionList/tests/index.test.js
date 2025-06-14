import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom'; // for additional matchers like toHaveAttribute
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import VersionList from '..';
import { getTexts } from '../../VersionListSection/tests/versionListSectionUtils';

// Mock the selectors
jest.mock('../selectors', () => ({
	selectActiveBookId: jest.fn(() => () => 'MAT'), // Return a function
	selectActiveChapter: jest.fn(() => () => 5), // Return a function
	selectHasVideo: jest.fn(() => () => false), // Return a function
}));

jest.mock('react-intl', () => ({
	FormattedMessage: ({ defaultMessage }) => <span>{defaultMessage}</span>,
	defineMessages: (messages) => messages,
}));

// Create a mock Redux store
const mockStore = configureMockStore();

const props = {
	dispatch: jest.fn(),
	setActiveText: jest.fn(),
	toggleTextSelection: jest.fn(),
	activeTextId: 'ENGESV',
	activeBookId: 'MAT',
	activeChapter: 5,
	filterText: '',
	active: true,
	loadingVersions: false,
};

let bibles = structuredClone([]);

describe('<VersionList />', () => {
	beforeEach(async () => {
		const jsBibles = await getTexts({ languageCode: 17045 });
		bibles = structuredClone(jsBibles);
	}, 10000);

	it('Should match previous snapshot', () => {
		const initialState = structuredClone({
			homepage: {
				hasVideo: false, // This is where your selector looks for `hasVideo`
			},
			videoPlayer: {
				videoList: [],
			},
		});

		const store = mockStore(initialState);

		const { asFragment } = render(
			<Provider store={store}>
				<VersionList {...props} bibles={bibles} />
			</Provider>,
		);
		expect(asFragment()).toMatchSnapshot();
	}, 10000);

	it('Should render a list of version names', () => {
		const initialState = structuredClone({
			homepage: {
				hasVideo: false, // This is where your selector looks for `hasVideo`
			},
			videoPlayer: {
				videoList: [],
			},
		});

		const store = mockStore(initialState);

		render(
			<Provider store={store}>
				<VersionList {...props} bibles={bibles} />
			</Provider>,
		);

		// Add assertions here if needed.
	}, 10000);

	it('Should render all available bibles as accordion titles', () => {
		const initialState = structuredClone({
			homepage: {
				hasVideo: false, // This is where your selector looks for `hasVideo`
			},
			videoPlayer: {
				videoList: [],
			},
		});

		const store = mockStore(initialState);

		const { container } = render(
			<Provider store={store}>
				<VersionList {...props} bibles={bibles} />
			</Provider>,
		);

		const versionList = container.querySelector('.version-name-list');

		expect(versionList).toBeInTheDocument();
		// Add assertions here if needed.
	}, 10000);
}, 10000);
