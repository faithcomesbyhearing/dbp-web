const withBundleAnalyzer = require('@next/bundle-analyzer');

if (process.env.ANALYZE_BUNDLE) {
	module.exports = withBundleAnalyzer({
		analyzeServer: ['server', 'both'].includes(process.env.ANALYZE_BUNDLE),
		analyzeBrowser: ['browser', 'both'].includes(process.env.ANALYZE_BUNDLE),
		bundleAnalyzerConfig: {
			server: {
				analyzerMode: 'public',
				reportFilename: '../bundles/server.html',
			},
			browser: {
				analyzerMode: 'public',
				reportFilename: '../bundles/client.html',
			},
		},
	});
} else {
	module.exports = {
		// Your other Next.js configuration options
	};
}
