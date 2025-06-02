/**
 * NotFoundPage
 *
 * This is the page we show when the user visits a url that doesn't have a route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */
import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import LanguageProvider from '../app/containers/LanguageProvider';
import { translationMessages } from '../app/i18n';
import SvgWrapper from '../app/components/SvgWrapper';
import messages from '../app/containers/NotFoundPage/messages';
import configureStore from '../app/configureStore';

export default function Custom404() {
	const store = useMemo(() => configureStore({}, {}, {}), []);
	return (
		<Provider store={store}>
			<LanguageProvider messages={translationMessages}>
				<div className={'not-found'}>
					<div className={'top-bar'}>
						<a
							className="logo"
							href={process.env.BASE_SITE_URL}
							title={'http://www.bible.is'}
							target={'_blank'}
							rel={'noopener'}
						>
							<SvgWrapper className="svg" svgid={'bible.is_logo'} />
						</a>
					</div>
					<div className={'content'}>
						<h1 className={'header'}>404</h1>
						<h1 className={'header'}>
							<FormattedMessage {...messages.headermessage} />
						</h1>
						<ul>
							<li>
								<FormattedMessage {...messages.tryAgain} />
							</li>
							<li>
								<FormattedMessage {...messages.homePage} />
								<a href={process.env.BASE_SITE_URL}>
									<FormattedMessage {...messages.homePageLink} />
								</a>
							</li>
						</ul>
					</div>
					<div className={'bottom-bar'} />
				</div>
			</LanguageProvider>
		</Provider>
	);
}
