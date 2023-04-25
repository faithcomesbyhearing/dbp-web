import App from 'next/app';
import React from 'react';
import { withRedux } from '../app/withRedux';
import LanguageProvider from '../app/containers/LanguageProvider';
import { translationMessages } from '../app/i18n';
import '../public/app.scss';
import Error from './_error';
import bugsnagClient from '../app/utils/bugsnagClient';

const ErrorBounary = bugsnagClient.getPlugin('react');

class CustomApp extends App {
	render() {
		const { Component, pageProps } = this.props;
		if (
			process.env.NODE_ENV === 'production' ||
			process.env.NODE_ENV === 'staging'
		) {
			return (
				<ErrorBounary FallbackComponent={Error}>
					<LanguageProvider messages={translationMessages}>
						<Component {...pageProps} />
					</LanguageProvider>
				</ErrorBounary>
			);
		}

		return (
			<LanguageProvider messages={translationMessages}>
				<Component {...pageProps} />
			</LanguageProvider>
		);
	}
}

export default withRedux(CustomApp);
