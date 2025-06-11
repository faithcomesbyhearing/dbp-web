import {
	legacy_createStore as createStore,
	applyMiddleware,
	compose,
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore } from 'redux-persist';
import createReducer from './reducers';
import REDUX_PERSIST from './utils/reduxPersist';

export default function configureStore(preloadedState = {}) {
	const sagaMiddleware = createSagaMiddleware();
	const isDev = process.env.NODE_ENV !== 'production';
	const isClient = typeof window !== 'undefined';

	const composeEnhancers =
		isDev && isClient && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
			? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ shouldHotReload: false })
			: compose;

	const store = createStore(
		createReducer(),
		preloadedState,
		composeEnhancers(applyMiddleware(sagaMiddleware)),
	);

	if (isClient) {
		persistStore(store, {
			stateReconciler: REDUX_PERSIST.storeConfig.stateReconciler,
		});
	}

	store.runSaga = sagaMiddleware.run;
	store.injectedReducers = {};
	store.injectedSagas = {};

	if (module.hot && isClient) {
		module.hot.accept('./reducers', () => {
			store.replaceReducer(createReducer(store.injectedReducers));
		});
	}

	return store;
}
