import { takeLatest, call, put } from 'redux-saga/effects';
import apiProxy from '../../utils/apiProxy';
import {
	GET_SEARCH_RESULTS,
	LOAD_SEARCH_RESULTS,
	SEARCH_ERROR,
} from './constants';

// Todo: Switch to using fileset id for the search
export function* getSearchResults({ bibleId, searchText }) {
	const searchString = searchText.trim().replace(' ', '+');

	try {
		const response = yield call(apiProxy.get, '/search', {
			fileset_id: bibleId,
			dam_id: bibleId,
			query: searchString,
		});
		const searchResults = response.verses.data;

		yield put({ type: LOAD_SEARCH_RESULTS, searchResults });
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Caught in get search results request', error); // eslint-disable-line no-console
		}
		yield put({ type: SEARCH_ERROR });
	}
}
// Individual exports for testing
export default function* defaultSaga() {
	yield takeLatest(GET_SEARCH_RESULTS, getSearchResults);
}
