import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import axios from 'axios';
import apiProxy from '../app/utils/apiProxy';
import Bugsnag from '../app/utils/bugsnagClient';
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
			{theme === 'paper' && !isIe && (
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
function JesusFilm({ iso, routeLocation, hlsStream, theme, isIe, duration }) {
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
				onError={() => {
					alert(
						'There was an error loading the video. Please try again later.',
					);
				}}
			/>
			<div className={'footer-background'} />
		</div>
	);
}

JesusFilm.getInitialProps = async (context) => {
	const { req } = context;
	const routeLocation = context.asPath;
	const { iso } = context.query;
	const hasHeaders = req?.headers;

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

	try {
		// Data fetching using apiProxy
		const jfResponse = await apiProxy.get('/arclight/jesus-film/languages', {
			iso,
		});

		const arclightId = jfResponse[iso];
		const videoObject = await apiProxy.get('/arclight/jesus-film/chapters', {
			arclight_id: arclightId,
		});

		// Number from arclight is 7673792 so use that as a default
		const duration = videoObject.duration_in_milliseconds
			? videoObject.duration_in_milliseconds / 1000
			: 7673792 / 1000;

		// This is constructed server-side so the key is not exposed to the client
		const hlsStream = arclightId ? apiProxy.buildProxyUrl(`/arclight/jesus-film?arclight_id=${arclightId}`) : '';

		return {
			routeLocation,
			iso,
			hlsStream,
			duration,
			theme,
			isIe,
		};
	} catch (error) {
		if (axios.isAxiosError(error) && error.config) {
			Bugsnag.notify(error, (event) => {
				event.addMetadata('API Request', {
					url: error.config.url,
					method: error.config.method,
					headers: error.config.headers,
					params: error.config.params,
					message: error.message,
				});
			});
		} else {
			Bugsnag.notify(error);
		}
		return {
			iso,
			routeLocation,
			hlsStream: '',
			duration: 7673792 / 1000, // Default duration
			theme,
			isIe,
		};
	}
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
