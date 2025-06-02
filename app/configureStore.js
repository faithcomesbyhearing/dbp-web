import {
	legacy_createStore as createStore,
	applyMiddleware,
	compose,
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore } from 'redux-persist';
import createReducer from './reducers';
import REDUX_PERSIST from './utils/reduxPersist';

const sagaMiddleware = createSagaMiddleware();

const configureMiddleware = () => {
	const middlewares = [sagaMiddleware];
	return applyMiddleware(...middlewares);
};

const configureEnhancers = () => {
	const isDevEnvironment = process.env.NODE_ENV !== 'production';
	const hasReduxDevTools =
		typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

	if (isDevEnvironment && hasReduxDevTools) {
		return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
			shouldHotReload: false,
		});
	}

	return compose;
};

export default function configureStore(initialState = {}) {
	const enhancers = [configureMiddleware()];
	const composeEnhancers = configureEnhancers();
	const store = createStore(
		createReducer(),
		structuredClone(initialState),
		composeEnhancers(...enhancers),
	);

	if (typeof self === 'object') {
		persistStore(store, {
			stateReconciler: REDUX_PERSIST.storeConfig.stateReconciler,
		});
	}

	store.runSaga = sagaMiddleware.run;
	store.injectedReducers = {}; // Reducer registry
	store.injectedSagas = {}; // Saga registry

	if (module.hot) {
		module.hot.accept('./reducers', () => {
			store.replaceReducer(createReducer(store.injectedReducers));
		});
	}

	return store;
}
