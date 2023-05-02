import React from 'react';
// import PropTypes from 'prop-types';
import { useStore } from 'react-redux';
import hoistNonReactStatics from 'hoist-non-react-statics';

import getInjectors from './reducerInjectors';

/**
 * Dynamically injects a reducer
 *
 * @param {string} key A key of the reducer
 * @param {function} reducer A reducer that will be injected
 *
 */
const ReducerInjector = ({ keyReducer, reducer, children }) => {
	const store = useStore();
	const injectors = getInjectors(store);

	React.useEffect(() => {
		injectors.injectReducer(keyReducer, reducer);
	}, [injectors, keyReducer, reducer]);

	return children;
};

export default ({ key, reducer }) => (WrappedComponent) => {
	function WithReducer(props) {
  return (
<ReducerInjector keyReducer={key} reducer={reducer}>
			<WrappedComponent {...props} />
</ReducerInjector>
);
}

	WithReducer.displayName = `withReducer(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

	return hoistNonReactStatics(WithReducer, WrappedComponent);
};
