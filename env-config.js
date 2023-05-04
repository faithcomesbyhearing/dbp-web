// Needed to make process variables available in nextjs
require('dotenv').config();

const fallbackSiteUrl = 'https://live.bible.is';

module.exports = {
	'process.env': {
		NODE_ENV: process.env.NODE_ENV,
		DBP_API_KEY: process.env.DBP_API_KEY,
		BASE_API_ROUTE: process.env.BASE_API_ROUTE,
		BASE_SITE_URL: process.env.BASE_SITE_URL || fallbackSiteUrl,
		FB_APP_ID: process.env.FB_APP_ID,
		FB_ACCESS: process.env.FB_ACCESS,
		NOTES_PROJECT_ID: process.env.NOTES_PROJECT_ID,
		DBP_BUCKET_ID: process.env.DBP_BUCKET_ID,
		GOOGLE_APP_ID: process.env.GOOGLE_APP_ID,
		GOOGLE_SECRET: process.env.GOOGLE_SECRET,
		DEVELOPMENT_PROJECT_ID: process.env.DEVELOPMENT_PROJECT_ID,
		CDN_STATIC_FILES: process.env.CDN_STATIC_FILES,
		IS_DEV: process.env.IS_DEV,
		BUGSNAG_SERVER_API_KEY: process.env.BUGSNAG_SERVER_API_KEY,
		BUGSNAG_BROWSER_API_KEY: process.env.BUGSNAG_BROWSER_API_KEY,
		NEWRELIC_LICENSE_KEY: process.env.NEWRELIC_LICENSE_KEY,
		NEWRELIC_ID: process.env.NEWRELIC_ID,
		NEWRELIC_BROWSER_LICENSE_KEY: process.env.NEWRELIC_BROWSER_LICENSE_KEY,
		NEWRELIC_BROWSER_ID: process.env.NEWRELIC_BROWSER_ID,
		NEWRELIC_STAGE_ID: process.env.NEWRELIC_STAGE_ID,

	},
};
