import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

jest.mock('../../../utils/injectReducer', () => () => (Component) => Component);
jest.mock('../../../utils/injectSaga',   () => () => (Component) => Component);

import SearchContainer from '../index';
import {
	addSearchTerm,
	getSearchResults,
	stopLoading,
	startLoading,
	viewError,
} from '../actions';
import {
	ADD_SEARCH_TERM,
	GET_SEARCH_RESULTS,
	STOP_LOADING,
	START_LOADING,
	VIEW_ERROR,
} from '../constants';

const mockStore = configureStore([]);
const initialState = {
	searchContainer: {
		searchResults: [],
		lastFiveSearches: [],
		trySearchOptions: [
			{ id: 1, searchText: 'Jesus' },
			{ id: 2, searchText: 'love' },
			{ id: 3, searchText: 'prayer' },
		],
		loadingResults: false,
		showError: false,
	},
};
const store = mockStore(initialState);

describe('SearchContainer actions', () => {
	it('addSearchTerm should create an action with type ADD_SEARCH_TERM', () => {
		const payload = { bibleId: 'ENGESV', searchText: 'love' };
		const expected = { type: ADD_SEARCH_TERM, ...payload };
		expect(addSearchTerm(payload)).toEqual(expected);
	});

	it('getSearchResults should create an action with type GET_SEARCH_RESULTS', () => {
		const payload = { bibleId: 'ENGESV', searchText: 'peace' };
		const expected = { type: GET_SEARCH_RESULTS, ...payload };
		expect(getSearchResults(payload)).toEqual(expected);
	});

	it('stopLoading should create an action with type STOP_LOADING', () => {
		const payload = { foo: 'bar' };
		const expected = { type: STOP_LOADING, ...payload };
		expect(stopLoading(payload)).toEqual(expected);
	});

	it('startLoading should create an action with type START_LOADING', () => {
		const payload = { loading: true };
		const expected = { type: START_LOADING, ...payload };
		expect(startLoading(payload)).toEqual(expected);
	});

	it('viewError should create an action with type VIEW_ERROR', () => {
		const payload = { error: 'Something went wrong' };
		const expected = { type: VIEW_ERROR, ...payload };
		expect(viewError(payload)).toEqual(expected);
	});
	it('should render SearchContainer component properly', () => {
		const { asFragment } = render(
			<Provider store={store}>
				<SearchContainer
					searchText="fake search"
					bibleId="FAKE_BIBLE"
					onSearch={() => {}}
					loading={false}
					error={null}
				/>
			</Provider>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
