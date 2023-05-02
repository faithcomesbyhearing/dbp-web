const Bugsnag = require('@bugsnag/js');
const BugsnagPluginReact = require('@bugsnag/plugin-react');

const bugsnagClient =
	process.env.NODE_ENV === 'development'
		? {
        use: () => {},
        notify: () => {},
        getPlugin: () => ({
          createErrorBoundary: () => (Component) => Component, // Return the component unchanged in development mode
        }),
      }
		: Bugsnag.createClient({
			apiKey: process.env.BUGSNAG_SERVER_API_KEY,
			plugins: [new BugsnagPluginReact()],
		});

module.exports = bugsnagClient;
