import App from 'next/app';
import React from 'react';
import { withRedux } from '../app/withRedux';
import LanguageProvider from '../app/containers/LanguageProvider';
import { translationMessages } from '../app/i18n';
import '../public/app.scss';
import Error from './_error';
import Bugsnag from '../app/utils/bugsnagClient';

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

class CustomApp extends App {
	render() {
		const { Component, pageProps } = this.props;
		if (
			process.env.NEXT_PUBLIC_NODE_ENV === 'production' ||
			process.env.NEXT_PUBLIC_NODE_ENV === 'staging'
		) {
			return (
				<ErrorBoundary FallbackComponent={Error}>
					<LanguageProvider messages={translationMessages}>
						<Component {...pageProps} />
					</LanguageProvider>
				</ErrorBoundary>
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
