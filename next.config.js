const CircularDependencyPlugin = require('circular-dependency-plugin');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE_BUNDLE === 'true',
	openAnalyzer: false, // Add this if you don't want the analyzer to automatically open in the browser
	analyzerMode: 'static',
	reportFilename:
		process.env.NODE_ENV === 'development'
			? '../bundles/server.html'
			: '../bundles/client.html',
	analyzeServer: ['server', 'both'].includes(process.env.ANALYZE_BUNDLE),
	analyzeBrowser: ['browser', 'both'].includes(process.env.ANALYZE_BUNDLE),
});

const fallbackSiteUrl = 'https://live.bible.is';

module.exports = withBundleAnalyzer({
	webpack: (config, { isServer }) => {
		// Exclude 'fs' from client-side builds
		if (!isServer) {
			config.resolve.fallback = {
				fs: false,
			};

			if (process.env.NODE_ENV === 'development') {
				config.plugins.push(
					new CircularDependencyPlugin({
						// exclude detection of files based on a RegExp
						exclude: /node_modules/,
						// include specific file types to check for circular dependencies
						include: /app/, // You can adjust this to the folder you want to check
						// add errors to webpack instead of warnings
						failOnError: true,
						// set the current working directory for displaying module paths
						cwd: process.cwd(),
					}),
				);
			}
		}

		return config;
	},
	experimental: {
		forceSwcTransforms: true,
	},
	env: {
		BASE_API_ROUTE: process.env.BASE_API_ROUTE,
		BASE_SITE_URL: process.env.BASE_SITE_URL || fallbackSiteUrl,
		BUGSNAG_API_KEY: process.env.BUGSNAG_API_KEY,
		CDN_STATIC_FILES: process.env.CDN_STATIC_FILES,
		DBP_API_KEY: process.env.DBP_API_KEY,
		FB_ACCESS: process.env.FB_ACCESS,
		FB_APP_ID: process.env.FB_APP_ID,
		GOOGLE_APP_ID: process.env.GOOGLE_APP_ID,
		GOOGLE_SECRET: process.env.GOOGLE_SECRET,
		NEWRELIC_ID: process.env.NEWRELIC_ID,
		NEWRELIC_LICENSE_KEY: process.env.NEWRELIC_LICENSE_KEY,
		NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
		NOTES_PROJECT_ID: process.env.NOTES_PROJECT_ID,
	},
	compiler: {
		// Enable support for class properties
		styledComponents: true,
	},
	// swcMinify: true,
	sassOptions: {
		// use Dart Sass’s modern compiler API
		api: 'modern-compiler',
		quietDeps: true,
		logger: {
			warn(message, options) {
				if (options.deprecation.id !== 'legacy-js-api') {
					console.warn(message); // eslint-disable-line no-console
				}
			},
		},
	},
});
