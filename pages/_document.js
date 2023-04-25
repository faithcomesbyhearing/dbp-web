import Document, { Html, Head, Main, NextScript } from 'next/document';
import parseCookie from '../app/utils/parseCookie';
/* eslint-disable no-unused-vars */
import { paper, dark, red, themes } from '../app/containers/Settings/themes';
/* eslint-enable no-unused-vars */

/* eslint-disable */
export default class MyDocument extends Document {
  // Look at applying the theme here - (low priority at this time)
  static getInitialProps = async ({ req, renderPage }) => {
    const page = await renderPage();
    let cookie = {};

    if (req && req.headers && req.headers.cookie) {
      cookie = parseCookie(req.headers.cookie);
    } else if (typeof document !== 'undefined') {
      cookie = document.cookie ? parseCookie(document.cookie) : {};
    }

    return { theme: cookie.bible_is_theme, ...page };
  };
  render() {
    return (
      <Html>
        <Head></ Head>
        <body>
          <noscript>
            {process.env.NODE_ENV === 'production' && !process.env.IS_DEV ? (
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
      </ Html>
    );
  }
}

/* eslint-enable */
