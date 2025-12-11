import { takeLatest, call, put } from 'redux-saga/effects';
import { GET_VIDEO_LIST, LOAD_VIDEO_LIST } from './constants';
import apiProxy from '../../utils/apiProxy';

export function* getVideos({ filesetId = 'FALTBLP2DV', bookId = 'MRK' }) {
	try {
		const response = yield call(apiProxy.get, `/bibles/filesets/${filesetId}`, {
			type: 'video_stream',
			book_id: bookId,
		});

		if (response.data) {
			yield put({ type: LOAD_VIDEO_LIST, videoList: response.data });
		} else {
			yield put({ type: LOAD_VIDEO_LIST, videoList: [] });
		}
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error getting video playlist', err); // eslint-disable-line no-console
		}
	}
}

export default function* defaultSaga() {
	yield takeLatest(GET_VIDEO_LIST, getVideos);
}
