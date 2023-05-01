import React from 'react';
import { useStore } from 'react-redux';
import hoistNonReactStatics from 'hoist-non-react-statics';

import getInjectors from './sagaInjectors';

/**
 * Dynamically injects a saga, passes component's props as saga arguments
 *
 * @param {string} key A key of the saga
 * @param {function} saga A root saga that will be injected
 * @param {string} [mode] By default (constants.RESTART_ON_REMOUNT) the saga will be started on component mount and
 * cancelled with `task.cancel()` on component un-mount for improved performance. Another two options:
 *   - constants.DAEMON—starts the saga on component mount and never cancels it or starts again,
 *   - constants.ONCE_TILL_UNMOUNT—behaves like 'RESTART_ON_REMOUNT' but never runs it again.
 *
 */
const InjectSaga = ({ keySaga, saga, mode, children }) => {
	const store = useStore();
	const injectors = getInjectors(store);

	React.useEffect(() => {
		const { injectSaga } = injectors;
		if (injectSaga) {
			injectSaga(keySaga, { saga, mode }, { store });
		}

		return () => {
			const { ejectSaga } = injectors;
			ejectSaga(keySaga);
		};
	}, []);

	return children;
};

export default ({ key, saga, mode }) => (WrappedComponent) => {
	const WithSaga = (props) => (
		<InjectSaga keySaga={key} saga={saga} mode={mode}>
			<WrappedComponent {...props} />
		</InjectSaga>
	);

	WithSaga.displayName = `withSaga(${WrappedComponent.displayName ||
	WrappedComponent.name ||
	'Component'})`;

	return hoistNonReactStatics(WithSaga, WrappedComponent);
};
