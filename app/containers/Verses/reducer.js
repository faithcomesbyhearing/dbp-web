/*
 *
 * Verses reducer
 *
 */

import { fromJS } from 'immutable';

const initialState = fromJS({});

function versesReducer(state = initialState, action = { type: null }) {
	switch (action.type) {
		default:
			return state;
	}
}

export default versesReducer;
