import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import parseCookie from '../app/utils/parseCookie';

import { themes, fonts, sizes } from '../app/containers/Settings/themes';

export default class MyDocument extends Document {
	// Look at applying the theme here - (low priority at this time)
	static async getInitialProps({ req, renderPage }) {
		const page = await renderPage();
		let cookie = {};

		if (req?.headers?.cookie) {
			cookie = parseCookie(req.headers.cookie);
		} else if (typeof document !== 'undefined') {
			cookie = document.cookie ? parseCookie(document.cookie) : {};
		}

		return {
			theme: cookie.bible_is_theme,
			fontFamily: cookie.bible_is_font_family,
			fontSize: cookie.bible_is_font_size,
			...page,
		};
	}

	getHtmlStyle() {
		const { theme, fontFamily, fontSize } = this.props;
		const styleHtml = theme ? themes[theme] : {};

		if (fontFamily) {
			styleHtml['--application-font-family'] = fonts[fontFamily];
		}

		if (fontSize) {
			styleHtml['--application-base-font-size'] = sizes[fontSize];
		}

		return styleHtml;
	}

	render() {
		return (
			<Html style={this.getHtmlStyle()}>
				<Head></Head>
				<body>
					<noscript>
						{process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? (
							<iframe
								src="https://www.googletagmanager.com/ns.html?id=GTM-N48RPTL"
								height="0"
								width="0"
								style={{ display: 'none', visibility: 'hidden' }}
							/>
						) : null}
					</noscript>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
