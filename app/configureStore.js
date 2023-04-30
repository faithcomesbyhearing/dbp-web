/**
 * Create the store with dynamic reducers
 */

import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import { fromJS } from 'immutable';
import createSagaMiddleware from 'redux-saga';
import { persistStore } from 'redux-persist';
import createReducer from './reducers';
import REDUX_PERSIST from '../app/utils/reduxPersist';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}) {
	// Create the store with two middlewares
	// 1. sagaMiddleware: Makes redux-sagas work
	// 2. routerMiddleware: Syncs the location/URL path to the state
	const middlewares = [sagaMiddleware];

	const enhancers = [applyMiddleware(...middlewares)];

	/* eslint-disable no-underscore-dangle */
	const composeEnhancers =
		process.env.NODE_ENV !== 'production' &&
		typeof window === 'object' &&
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
			? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
					// Prevent recomputing reducers for `replaceReducer`
					shouldHotReload: false,
			  })
			: compose;
	/* eslint-enable */

	const store = createStore(
		createReducer(),
		fromJS(initialState),
		composeEnhancers(...enhancers),
	);

	if (typeof self === 'object') {
		persistStore(store, {
			stateReconciler: REDUX_PERSIST.storeConfig.stateReconciler
		});
	}

	// Extensions
	store.runSaga = sagaMiddleware.run;
	store.injectedReducers = {}; // Reducer registry
	store.injectedSagas = {}; // Saga registry

	/* istanbul ignore next */
	if (module.hot) {
		module.hot.accept('./reducers', () => {
			store.replaceReducer(createReducer(store.injectedReducers));
		});
	}

	return store;
}
