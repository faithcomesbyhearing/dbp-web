import { LOAD_VIDEO_LIST } from './constants';

const initialState = structuredClone({
	videoList: [],
});

export default (state = initialState, action = { type: null }) => {
	switch (action.type) {
		case LOAD_VIDEO_LIST:
			return {
				...state,
				videoList: structuredClone(action.videoList),
			};
		default:
			return state;
	}
};
