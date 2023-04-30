import React from 'react';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
/* eslint-disable */
const isServer = typeof window === 'undefined';
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

function getOrCreateStore(initialState) {
	// Always make a new store if server, otherwise state is shared between requests
	if (isServer) {
		return configureStore(initialState);
	}

	// Create store if unavailable on the client and set it on the window object
	if (!window[__NEXT_REDUX_STORE__]) {
		window[__NEXT_REDUX_STORE__] = configureStore(initialState);
	}
	return window[__NEXT_REDUX_STORE__];
}

export const withRedux = (WrappedComponent) => {
	const WithRedux = ({ initialReduxState, ...props }) => {
		const reduxStore = getOrCreateStore(initialReduxState);

		return (	
			<Provider store={reduxStore}>
				<WrappedComponent {...props} />
			</Provider>
		);
	};

	WithRedux.getInitialProps = async (appContext) => {
		const { ctx } = appContext;
		const reduxStore = getOrCreateStore();

		ctx.reduxStore = reduxStore;

		let appProps = {};
		if (typeof WrappedComponent.getInitialProps === 'function') {
			// console.log("FIRE ===============> getInitialProps");
			appProps = await WrappedComponent.getInitialProps(appContext);
		}

		return {
			...appProps,
			initialReduxState: reduxStore.getState(),
		};
	};

	return WithRedux;
};
/* eslint-enable */
