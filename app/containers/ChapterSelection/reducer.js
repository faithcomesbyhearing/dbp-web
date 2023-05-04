/*
 *
 * ChapterSelection reducer
 *
 */

import { fromJS } from 'immutable';

const initialState = fromJS({});

function chapterSelectionReducer(state = initialState, action = { type: null }) {
	switch (action.type) {
	default:
		return state;
	}
}

export default chapterSelectionReducer;
