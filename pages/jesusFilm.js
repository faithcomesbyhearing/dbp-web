import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import request from '../app/utils/request';
import isUserAgentInternetExplorer from '../app/utils/isUserAgentInternetExplorer';
import parseCookie from '../app/utils/parseCookie';
import JesusFilmVideoPlayer from '../app/components/JesusFilmVideoPlayer';
import SvgWrapper from '../app/components/SvgWrapper';
// Most of the components are in this file due to tight deadline
// hope to refactor and reuse Logo and BackButton
const goBack = () => {
	history.back();
};

function BackButton({ isIe }) {
  return (
<button className={'back-button'} type={'button'} onClick={goBack}>
		<SvgWrapper
			className={'svg'}
			fill={isIe ? '#fff' : ''}
			svgid={'arrow_left'}
		/>
</button>
);
}

BackButton.propTypes = {
	isIe: PropTypes.bool,
};

function Logo({ theme, isIe }) {
  return (
<a
		className={'logo'}
		href={'http://www.bible.is'}
		title={'http://www.bible.is'}
		rel={'noopener'}
>
		{theme === 'paper' &&
			!isIe && (
				<svg className={'svg'}>
				<use xlinkHref={'/light_theme_logo.svg#bible.is_logo_light'} />
				</svg>
			)}
		{(theme !== 'paper' || isIe) && (
			<svg className={'svg'} fill={isIe ? '#fff' : ''}>
				<use xlinkHref={'/dark_theme_logo.svg#bible.is_logo'} />
			</svg>
		)}
</a>
);
}

Logo.propTypes = {
	theme: PropTypes.string,
	isIe: PropTypes.bool,
};

// Basic nav
// Basic footer
// Video Player with adjusted styles
function JesusFilm({
	iso,
	routeLocation,
	hlsStream,
	theme,
	isIe,
	duration,
}) {
	const titleText = `Jesus Film | ${iso} | Bible.is`;

	return (
		<div>
			<Head>
				<meta name={'description'} content={titleText} />
				<meta property={'og:title'} content={titleText} />
				<meta
					property={'og:image'}
					content={`${process.env.BASE_SITE_URL}/public/icon-310x310.png`}
				/>
				<meta property={'og:image:width'} content={310} />
				<meta property={'og:image:height'} content={310} />
				<meta
					property={'og:url'}
					content={`${process.env.BASE_SITE_URL}/${routeLocation}`}
				/>
				<meta property={'og:description'} content={titleText} />
				<meta name={'twitter:title'} content={titleText} />
				<meta name={'twitter:description'} content={titleText} />
				<title>{titleText}</title>
			</Head>
			<div id={'navigation-bar'} className={'nav-background'}>
				<div className={'nav-container jesus-film-override'}>
					<BackButton isIe={isIe} />
					<Logo theme={theme} isIe={isIe} />
				</div>
			</div>
			<JesusFilmVideoPlayer
				hlsStream={hlsStream}
				duration={duration}
				hasVideo
			/>
			<div className={'footer-background'} />
		</div>
	);
}

JesusFilm.getInitialProps = async (context) => {
	const { req } = context;
	const routeLocation = context.asPath;
	const { iso } = context.query;
	const hasHeaders = req && req.headers;

	// Default isIe to false
	let isIe = false;
	// Default theme name is red
	let theme = 'red';

	// Check user agent for ie and get current theme
	if (hasHeaders) {
		isIe = isUserAgentInternetExplorer(req.headers['user-agent']);
	} else {
		isIe = isUserAgentInternetExplorer(navigator.userAgent);
	}

	// Get current theme
	if (hasHeaders && req.headers.cookie) {
		theme = parseCookie(req.headers.cookie).bible_is_theme || 'red';
	} else if (typeof document !== 'undefined' && document.cookie) {
		theme = parseCookie(document.cookie).bible_is_theme || 'red';
	}

	// Data fetching
	const jfResponse = await request(
		`${process.env.BASE_API_ROUTE}/arclight/jesus-film/languages?key=${
			process.env.DBP_API_KEY
		}&v=4&iso=${iso}`,
	);
	const arclightId = jfResponse[iso];
	const videoObject = await request(
		`${process.env.BASE_API_ROUTE}/arclight/jesus-film/chapters?key=${
			process.env.DBP_API_KEY
		}&v=4&arclight_id=${arclightId}`,
	);
	// Number from arclight is 7673792 so use that as a default
	const duration = videoObject.duration_in_milliseconds
		? videoObject.duration_in_milliseconds / 1000
		: 7673792 / 1000;
	// const duration = 7673792 / 1000;
	const hlsStream = arclightId
		? `${process.env.BASE_API_ROUTE}/arclight/jesus-film?key=${
				process.env.DBP_API_KEY
		  }&v=4&arclight_id=${arclightId}`
		: '';

	return {
		routeLocation,
		iso,
		hlsStream,
		duration,
		theme,
		isIe,
	};
};

JesusFilm.propTypes = {
	iso: PropTypes.string,
	theme: PropTypes.string,
	hlsStream: PropTypes.string,
	routeLocation: PropTypes.string,
	duration: PropTypes.number,
	isIe: PropTypes.bool,
};

export default JesusFilm;
