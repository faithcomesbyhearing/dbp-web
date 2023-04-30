/**
 * Create the store with dynamic reducers
 */

// import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
// import { fromJS } from 'immutable';
// import createSagaMiddleware from 'redux-saga';
// import { persistStore, persistReducer } from 'redux-persist';
// // import storage from 'redux-persist/lib/storage';
// import createReducer from './reducers';
// // import REDUX_PERSIST from '../app/utils/reduxPersist';

// const sagaMiddleware = createSagaMiddleware();

// export default function configureStore(initialState = {}) {
// 	// Create the store with two middlewares
// 	// 1. sagaMiddleware: Makes redux-sagas work
// 	// 2. routerMiddleware: Syncs the location/URL path to the state
// 	const middlewares = [sagaMiddleware];

// 	// const enhancers = [applyMiddleware(...middlewares), autoRehydrate()];
// 	// const enhancers = [applyMiddleware(...middlewares), autoRehydrate];
// 	const enhancers = [applyMiddleware(...middlewares)];

// 	/* eslint-disable no-underscore-dangle */
// 	const composeEnhancers =
// 		process.env.NODE_ENV !== 'production' &&
// 		typeof window === 'object' &&
// 		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
// 			? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
// 					// Prevent recomputing reducers for `replaceReducer`
// 					shouldHotReload: false,
// 			  })
// 			: compose;
// 	/* eslint-enable */

// 	const store = createStore(
// 		createReducer(),
// 		fromJS(initialState),
// 		composeEnhancers(...enhancers),
// 	);

// 	if (typeof self === 'object') {
// 		persistStore(store);
// 	}

// 	// Extensions
// 	store.runSaga = sagaMiddleware.run;
// 	store.injectedReducers = {}; // Reducer registry
// 	store.injectedSagas = {}; // Saga registry

// 	/* istanbul ignore next */
// 	if (module.hot) {
// 		module.hot.accept('./reducers', () => {
// 			store.replaceReducer(createReducer(store.injectedReducers));
// 		});
// 	}

// 	return store;
// }

import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { fromJS, isImmutable, isCollection } from 'immutable';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
import createReducer from './reducers';
import REDUX_PERSIST from '../app/utils/reduxPersist';

const immutableTransform = createTransform(
	(inboundState, key) => {
		console.log("TRANSFORM inboundState", inboundState);
		if (inboundState && typeof inboundState === 'object' && !isImmutable(inboundState) && !isCollection(inboundState)) {
			return fromJS(inboundState);
		}
		return inboundState;
	},
	(outboundState, key) => {
		console.log("TRANSFORM outboundState", outboundState);
		if (isImmutable(outboundState)) {
			return outboundState.toJS();
		}
		return outboundState;
	},
);

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}) {
	const storage = require('redux-persist/lib/storage').default;
	console.log("configureStore initialState ===============>", initialState);
	const middlewares = [sagaMiddleware];

	// Create a persist configuration object
	const persistConfig = {
		// key: 'root',
		key: REDUX_PERSIST.reducerKey,
		storage,
		transforms: [immutableTransform],
		blacklist: REDUX_PERSIST.storeConfig.blacklist,
		whitelist: REDUX_PERSIST.storeConfig.whitelist,
		stateReconciler: REDUX_PERSIST.storeConfig.stateReconciler
	};

	// Wrap your rootReducer with persistReducer
	const persistedReducer = persistReducer(persistConfig, createReducer());

	console.log("persistedReducer END ===============>");

	const composeEnhancers =
		process.env.NODE_ENV !== 'production' &&
			typeof window === 'object' &&
			window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
			? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
				shouldHotReload: false,
			})
			: compose;

	const enhancers = [applyMiddleware(...middlewares)];

	const store = createStore(
		persistedReducer,
		// fromJS(initialState),
		initialState,
		composeEnhancers(...enhancers),
	);
	console.log("createStore END ===============>");

	if (typeof self === 'object') {
		persistStore(store);
	}
	console.log("persistStore END ===============>");


	// Extensions
	store.runSaga = sagaMiddleware.run;
	store.injectedReducers = {}; // Reducer registry
	store.injectedSagas = {}; // Saga registry

	if (module.hot) {
		module.hot.accept('./reducers', () => {
			store.replaceReducer(createReducer(store.injectedReducers));
		});
	}

	console.log("configureStore END ===============>", initialState);

	return store;
}
