// Needed to make process variables available in nextjs
const dotenv = require('dotenv');
if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

const fallbackSiteUrl = 'https://live.bible.is';

module.exports = {
	'process.env': {
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
		NODE_ENV: process.env.NODE_ENV,
		NOTES_PROJECT_ID: process.env.NOTES_PROJECT_ID,

	},
};
