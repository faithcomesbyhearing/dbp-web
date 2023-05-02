import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';

const bugsnagClient =
	process.env.NODE_ENV === 'development'
		? {
        use: () => {},
        notify: () => {},
        getPlugin: () => ({
          createErrorBoundary: () => (Component) => Component,
        }),
		  }
		: Bugsnag.createClient({
			apiKey: process.env.BUGSNAG_BROWSER_API_KEY,
			plugins: [new BugsnagPluginReact()],
		});

export default bugsnagClient;
