/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

/*
* Todo: Items that need to be done before production
* todo: Replace all tabIndex 0 values with what they should actually be
* todo: Set up a function to init all of the plugins that rely on the browser
* todo: Update site url to match the live site domain name
* todo: Use cookies instead of session and local storage for all user settings (involves user approval before it can be utilized)
* todo: Remove the script for providing feedback
* */
// Needed for redux-saga es6 generator support
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import cachedFetch, { overrideCache } from '../app/utils/cachedFetch';
import HomePage from '../app/containers/HomePage';
import getinitialChapterData from '../app/utils/getInitialChapterData';
import getValidFilesetsByBook from '../app/utils/getValidFilesetsByBook';
import {
  setChapterTextLoadingState,
  setUA,
} from '../app/containers/HomePage/actions';
import svg4everybody from '../app/utils/svgPolyfill';
import parseCookie from '../app/utils/parseCookie';
import getFirstChapterReference from '../app/utils/getFirstChapterReference';
import isUserAgentInternetExplorer from '../app/utils/isUserAgentInternetExplorer';
import checkAvailableSettingsDataInCookies from '../app/utils/checkAvailableSettingsDataInCookies';
import reconcilePersistedState from '../app/utils/reconcilePersistedState';
import REDUX_PERSIST from '../app/utils/reduxPersist';
import getBookMetaData from '../app/utils/getBookMetaData';
import geFilesetsForBible from '../app/utils/geFilesetsForBible';
import hasFilesetVideo from '../app/utils/hasFilesetVideo';
import removeStoriesFilesets from '../app/utils/removeStoriesFilesets';
import {
  FILESET_TYPE_TEXT_PLAIN,
  FILESET_TYPE_TEXT_FORMAT,
  FILESET_TYPE_AUDIO_DRAMA,
  FILESET_TYPE_AUDIO,
} from '../app/constants/bibleFileset';
import Bugsnag from '../app/utils/bugsnagClient';

function AppContainer(props) {
  const router = useRouter();
  const [prevFormattedText, setPrevFormattedText] = useState('');

  /* eslint-disable no-undef */
  const handleRouteChange = (url) => {
    /* eslint-enable no-undef */
    // Pause audio
    // Start loading spinner for text
    // Close any open menus
    // Remove current audio source - (may fix item 1)
    // TODO: Probably need to get the new highlights here or at least start the process for getting them
    if (typeof dataLayer !== 'undefined') {
      try {
        dataLayer.push({
          event: 'pageview',
          page: {
            path: url,
            title: url,
          },
        });
      } catch (err) {
        console.error('Google tag manager did not capture pageview: ', err); // eslint-disable-line no-console
      }
    }
    props.dispatch(setChapterTextLoadingState({ state: true }));
  };

  // eslint-disable-line no-undef
  useEffect(() => {
    if (
      localStorage.getItem('reducerVersion') !== REDUX_PERSIST.reducerVersion
    ) {
      reconcilePersistedState(
        ['settings', 'searchContainer', 'profile'],
        REDUX_PERSIST.reducerKey,
      );
      localStorage.setItem('reducerVersion', REDUX_PERSIST.reducerVersion);
    }
    // If the page was served from the server then I need to cache the data for this route
    if (props.isFromServer) {
      props.fetchedUrls.forEach((url) => {
        if (url.data.error || url.data.errors) {
          overrideCache(url.href, {}, 1);
        } else {
          overrideCache(url.href, url.data);
        }
      });
    }
    // If undefined gets stored in local storage it cannot be parsed so I have to compare strings
    if (props?.userProfile?.userId) {
      props.dispatch({
        type: 'GET_INITIAL_ROUTE_STATE_PROFILE',
        profile: {
          userId: props.userProfile.userId,
          userAuthenticated: !!props.userProfile.userId,
          userProfile: {
            email:
              props.userProfile.email || '',
            name:
              props.userProfile.name || '',
            nickname:
              props.userProfile.name || '',
          },
        },
      });
    } else if (sessionStorage?.getItem('bible_is_user_id')) {
      props.dispatch({
        type: 'GET_INITIAL_ROUTE_STATE_PROFILE',
        profile: {
          userId: sessionStorage.getItem('bible_is_user_id'),
          userAuthenticated: !!sessionStorage.getItem('bible_is_user_id'),
          userProfile: {
            email: sessionStorage.getItem('bible_is_user_email') || '',
            name: sessionStorage.getItem('bible_is_user_name') || '',
            nickname: sessionStorage.getItem('bible_is_user_nickname') || '',
          },
        },
      });
    }
    const redLetter =
      !!props.formattedText &&
      !!(
        props.formattedText.includes('class="wj"') ||
        props.formattedText.includes("class='wj'")
      );
    props.dispatch({
      type: 'GET_INITIAL_ROUTE_STATE_SETTINGS',
      redLetter,
      crossReferences:
        !!props.formattedText &&
        !!(
          props.formattedText.includes('class="ft"') ||
          props.formattedText.includes('class="xt"')
        ),
    });
    props.dispatch(setChapterTextLoadingState({ state: false }));

    if (props.isIe) {
      props.dispatch(setUA());
      if (
        typeof svg4everybody === 'function' &&
        typeof window !== 'undefined'
      ) {
        svg4everybody();
      }
    }
  }, []);

  useEffect(() => {
    // Intercept all route changes to ensure that the loading spinner starts
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    if (props.formattedText !== prevFormattedText) {
      const redLetter =
        !!prevFormattedText &&
        !!(
          prevFormattedText.includes('class="wj"') ||
          prevFormattedText.includes("class='wj'")
        );

      props.dispatch({
        type: 'GET_INITIAL_ROUTE_STATE_SETTINGS',
        redLetter,
        crossReferences:
          !!prevFormattedText &&
          !!(
            prevFormattedText.includes('class="ft"') ||
            prevFormattedText.includes('class="xt"')
          ),
      });
      setPrevFormattedText(props.formattedText);
    }
  }, [props.formattedText]);

  useEffect(() => {
    if (props.triggerRedirect.url && props.triggerRedirect.as) {
      router.push(
        props.triggerRedirect.url,
        props.triggerRedirect.as,
      );
    }
  }, [props.triggerRedirect.url, props.triggerRedirect.as]);

  const {
    activeChapter,
    chapterText,
    activeBookName,
    routeLocation,
    initialPlaybackRate,
    initialVolume,
    isIe,
  } = props;
  // Defaulting description text to an empty string since no metadata is better than inaccurate metadata
  const descriptionText =
    chapterText && chapterText[0] ? `${chapterText[0].verse_text}...` : '';

  const headTitle = `${activeBookName} ${activeChapter}${props.match?.params?.verse
      ? `:${props.match.params.verse}`
      : ''
    } ${'| Bible.is'}`;
    return (
      <div>
        <Head>
          <meta name={'description'} content={descriptionText} />
          <meta
            property={'og:title'}
            content={`${activeBookName} ${activeChapter}${
              props.match?.params?.verse
                ? `:${props.match.params.verse}`
                : ''
            } | Bible.is`}
          />
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
          <meta property={'og:description'} content={descriptionText} />
          <meta
            name={'twitter:title'}
            content={`${activeBookName} ${activeChapter}`}
          />
          <meta name={'twitter:description'} content={descriptionText} />
          <title>
            {headTitle}
          </title>
        </Head>
        <HomePage
          initialPlaybackRate={initialPlaybackRate}
          initialVolume={initialVolume}
          isIe={isIe}
        />
      </div>
    );
}

AppContainer.displayName = 'Main app';

AppContainer.getInitialProps = async (context) => {
  const { req, res: serverRes } = context;
  const routeLocation = context.asPath;
  const {
    bookId = '',
    chapter: chapterParam,
    bibleId = 'ENGESV',
    verse,
    token,
    userId: reqUserId,
    userEmail = '',
    userName = '',
  } = context.query;
  const userProfile = {
    userId: reqUserId,
    email: userEmail,
    name: userName,
    nickname: userName,
  };
  const tempChapter =
    typeof chapterParam === 'string' && chapterParam.split('?')[0];
  const chapter = tempChapter || chapter;
  // Using let here because the cookie data can come from the server or the client
  let audioParam = req && req.query.audio_type;
  let userId = reqUserId || '';
  let hasVideo = false;
  let isFromServer = true;
  let isAuthenticated = false;
  let initialVolume = 1;
  let initialPlaybackRate = 1;
  let isIe = false;
  let audioType = '';
  const triggerRedirect = {
    url: null,
    as: null,
  };

  if (req?.query.audio_type) {
    audioParam = req.query.audio_type;
  } else if (!req) {
    audioParam = context.query.audio_type;
  }

  if (req?.headers) {
    isIe = isUserAgentInternetExplorer(req.headers['user-agent']);
  }

  let cookieData = null;

  if (req?.headers.cookie) {
    // Get all cookies that the page needs
    cookieData = parseCookie(req.headers.cookie);

    if (cookieData.bible_is_audio_type) {
      audioType = cookieData.bible_is_audio_type;
    }

    if (userId) {
      // Authentication Information
      isAuthenticated = !!userId;
      // User Profile
      userProfile.email = userEmail;
      userProfile.nickname = userName;
      userProfile.name = userName;
      userProfile.userId = userId;
      // Avatar is a placeholder for when we actually build the rest of that functionality
      userProfile.avatar = '';
    } else if (!userId) {
      // Authentication Information
      userId = cookieData.bible_is_user_id || '';
      isAuthenticated = !!cookieData.bible_is_user_id;
      // User Profile
      userProfile.email = cookieData.bible_is_email || '';
      userProfile.nickname = cookieData.bible_is_name || '';
      userProfile.name = cookieData.bible_is_name;
      // Avatar is a placeholder for when we actually build the rest of that functionality
      userProfile.avatar = '';
    }

    // Audio Player
    initialVolume =
      cookieData.bible_is_volume === 0 ? 0 : cookieData.bible_is_volume || 1;
    initialPlaybackRate = cookieData.bible_is_playbackrate || 1;

    // Handle oauth code if there is one
    if (cookieData.bible_is_cb_code && cookieData.bible_is_provider) {
      await fetch(
        `${process.env.BASE_API_ROUTE}/login/${
          cookieData.bible_is_provider
        }/callback?v=4&project_id=${process.env.NOTES_PROJECT_ID}&key=${
          process.env.DBP_API_KEY
        }&alt_url=true&code=${cookieData.bible_is_cb_code}`,
      ).then((body) => body.data);
    }

    isFromServer = false;
  } else if (typeof document !== 'undefined' && document.cookie) {
    cookieData = parseCookie(document.cookie);
    if (cookieData.bible_is_audio_type) {
      audioType = cookieData.bible_is_audio_type;
    }

    if (userId) {
      // Authentication Information
      isAuthenticated = !!userId;
      // User Profile
      userProfile.email = userEmail;
      userProfile.nickname = userName;
      userProfile.name = userName;
      userProfile.userId = userId;
      // Avatar is a placeholder for when we actually build the rest of that functionality
      userProfile.avatar = '';
    } else if (!userId) {
      // Authentication Information
      userId = localStorage.getItem('bible_is_user_id') || '';
      isAuthenticated = !!localStorage.getItem('bible_is_user_id') || '';
      // User Profile
      userProfile.email = localStorage.getItem('bible_is_user_email') || '';
      userProfile.nickname = localStorage.getItem('bible_is_user_name') || '';
      userProfile.name = localStorage.getItem('bible_is_user_nickname');
      userProfile.userId = userId;
      // Avatar is a placeholder for when we actually build the rest of that functionality
      userProfile.avatar = '';
    }

    // Audio Player
    initialVolume =
      cookieData.bible_is_volume === 0 ? 0 : cookieData.bible_is_volume || 1;
    initialPlaybackRate = cookieData.bible_is_playbackrate || 1;
  }

  const singleBibleUrl = `${process.env.BASE_API_ROUTE}/bibles/${bibleId}?key=${
    process.env.DBP_API_KEY
  }&v=4&include_font=true`;

  // Get active bible data
  const singleBibleRes = await cachedFetch(singleBibleUrl).catch((e) => {
    console.error('Error in get initial props single bible: ', e.message); // eslint-disable-line no-console
    if (axios.isAxiosError(e)) {
      console.error('Error occurred at URL:', e.config.url); // eslint-disable-line no-console
      Bugsnag.notify(e, (event) => {
        event.addMetadata('request', {
          url: e.config.url,
          method: e.config.method,
          headers: e.config.headers,
          params: e.config.params,
          message: e.message,
        });
      });
    }
    return { data: {} };
  });
  const bible = singleBibleRes.data;
  if (typeof document !== 'undefined') {
    if (bible.fonts) {
      localStorage.setItem('bible_is_bible_fonts', JSON.stringify(bible.fonts));
    } else {
      localStorage.removeItem('bible_is_bible_fonts');
    }
  }

  // Acceptable fileset types that the site is capable of ingesting and displaying
  const setTypes = {
    audio_drama: true,
    audio: true,
    text_plain: true,
    text_format: true,
    video_stream: true,
  };

  const bibleFilesets = bible?.filesets ? geFilesetsForBible(bible.filesets) : [];
  const filesetsWithoutStories = removeStoriesFilesets(bibleFilesets, setTypes);

  const idsForBookMetadata = filesetsWithoutStories.map((fileset) => ([fileset.type, fileset.id, fileset.size]));
  const [bookMetaData, bookMetaResponse] = await getBookMetaData({
    idsForBookMetadata,
  });

  const foundBook = bookMetaData.find(
    (book) => bookId && book.book_id === bookId.toUpperCase(),
  );

  const filesets = foundBook
    ? getValidFilesetsByBook(foundBook, idsForBookMetadata, filesetsWithoutStories, bookMetaResponse)
    : [];

  hasVideo = filesets && filesets.length > 0 && hasFilesetVideo(filesets);

  // Gets only one of the text_plain filesets
  const activeFilesetId = filesets
    ? filesets
      .filter(
        (f) => (f.type === FILESET_TYPE_TEXT_PLAIN),
      )
      .reduce((a, c) => c.id, '')
    : '';

  // Separate filesets by type
  const plainFilesetIds = filesets.reduce((plainFilesetResult, fileset) => {
    if (fileset.type === FILESET_TYPE_TEXT_PLAIN) {
      plainFilesetResult.push(fileset.id);
    }
    return plainFilesetResult;
  }, []);
  const formattedFilesetIds = filesets.reduce((formattedFilesetResult, fileset) => {
    if (fileset.type === FILESET_TYPE_TEXT_FORMAT) {
      formattedFilesetResult.push(fileset.id);
    }
    return formattedFilesetResult;
  }, []);

  if (audioParam) {
    // If there are any audio filesets with the given type
    if (filesets.some((set) => set.type === audioParam)) {
      audioType = audioParam;
      // Otherwise check for drama first
    } else if (filesets.some((set) => set.type === FILESET_TYPE_AUDIO_DRAMA)) {
      audioType = FILESET_TYPE_AUDIO_DRAMA;
      audioParam = '';
      // Lastly check for plain audio
    } else if (filesets.some((set) => set.type === FILESET_TYPE_AUDIO)) {
      audioType = FILESET_TYPE_AUDIO;
      audioParam = '';
    }
  }

  // Redirect to the new url if conditions are met
  if (bookMetaData?.length) {
    const foundChapter =
      foundBook?.chapters.find((c) => chapter && c === parseInt(chapter, 10));
    // Default book/chapter to matthew 1 to keep it from breaking if there is an error encountered in getFirstChapterReference
    let bookChapterRoute = 'MAT/1';
    // Handles getting the book/chapter that follows Jon Stearley's methodology
    try {
      bookChapterRoute = getFirstChapterReference(
        filesets,
        hasVideo,
        bookMetaResponse,
        bookMetaData,
        audioParam,
      );
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error getting initial book', err); // eslint-disble-line no-console
      }
    }

    // If the book wasn't found and chapter wasn't found
    // Go to the first book and first chapter
    const foundBookId = foundBook?.book_id;
    const foundChapterId =
      foundBook && (foundBook.chapters[0] || foundBook.chapters[0] === 0 || 1);
    /**
     * 1. Visit /bible/bibleId
     */
    if (!foundBook && (!foundChapter && foundChapter !== 0)) {
      // Logs the url that will be redirected to
      if (serverRes) {
        // If there wasn't a book then we need to redirect to mark for video resources and matthew for other resources
        serverRes.writeHead(301, {
          Location: `${req.protocol}://${req.get(
            'host',
          )}/bible/${bibleId}/${bookChapterRoute}`,
        });
        serverRes.end();
      } else {
        const bookRoute = bookChapterRoute.split('/')[0];
        const chapterRoute = bookChapterRoute.split('/')[1];
        triggerRedirect.url = `/app?bibleId=${bibleId}&bookId=${bookRoute}&chapter=${chapterRoute}`;
        triggerRedirect.as = `/bible/${bibleId}/${bookChapterRoute}`;
      }
    } else if (foundBook) {
      // if the book was found
      // check for the chapter
      if (!foundChapter && foundChapter !== 0) {
        // if the chapter was not found
        // go to the book and the first chapter for that book
        if (serverRes) {
          serverRes.writeHead(301, {
            Location: `${req.protocol}://${req.get(
              'host',
            )}/bible/${bibleId}/${foundBookId}/${foundChapterId}${
              audioParam ? `?audio_type=${audioParam}` : ''
            }`,
          });
          serverRes.end();
        } else {
          triggerRedirect.url = `/app?bibleId=${bibleId}&bookId=${foundBookId}&chapter=${foundChapterId}`;
          triggerRedirect.as = `/bible/${bibleId}/${foundBookId}/${foundChapterId}${
            audioParam ? `?audio_type=${audioParam}` : ''
          }`;
        }
      }
    }
  }
  // dont change book or chapter
  let initData = {
    plainText: [],
    formattedText: '',
    plainTextJson: {},
    audioPaths: [''],
  };
  try {
    /* eslint-disable no-console */
    initData = await getinitialChapterData({
      filesets,
      bookId,
      chapter,
      plainFilesetIds,
      formattedFilesetIds,
      audioType,
    }).catch((err) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          `Error caught in get initial chapter data in promise: ${err.message}`,
        );
      }
      return {
        formattedText: '',
        plainText: [],
        plainTextJson: {},
        audioPaths: [''],
      };
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `Error caught in get initial chapter data by try catch: ${err.message}`,
      );
    }
  }
  /* eslint-enable no-console */
  // Get text for chapter
  const chapterText = initData.plainText;

  let activeBook = { chapters: [] };
  const bookData = bookMetaData.length || !bible ? bookMetaData : bible.books;

  if (bookData) {
    const urlBook = bookData.find(
      (book) =>
        book.book_id && book.book_id.toLowerCase() === bookId.toLowerCase(),
    );
    if (urlBook) {
      activeBook = urlBook;
    } else {
      activeBook = bookData[0];
    }
  } else {
    activeBook = undefined;
  }
  const availableAudioTypes = [];

  if (filesets.some((set) => set.type === FILESET_TYPE_AUDIO_DRAMA)) {
    availableAudioTypes.push(FILESET_TYPE_AUDIO_DRAMA);
  }

  if (filesets.some((set) => set.type === FILESET_TYPE_AUDIO)) {
    availableAudioTypes.push(FILESET_TYPE_AUDIO);
  }
  const activeBookName = activeBook ? activeBook.name : '';
  const testaments = bookData
    ? bookData.reduce((a, c) => ({ ...a, [c.book_id]: c.testament }), {})
    : [];

  if (context.reduxStore) {
    if (userProfile.userId && userProfile.email) {
      context.reduxStore.dispatch({
        type: 'GET_INITIAL_ROUTE_STATE_PROFILE',
        profile: {
          userId: userProfile.userId,
          userAuthenticated: !!userProfile.userId,
          userProfile: {
            email: userProfile.email || '',
            name: userProfile.name || '',
            nickname: userProfile.name || '',
          },
        },
      });
    }

    if (cookieData && checkAvailableSettingsDataInCookies(cookieData)) {
      context.reduxStore.dispatch({
        type: 'GET_INITIAL_ROUTE_STATE_SETTINGS_FROM_APP',
        settings: {
          activeTheme: cookieData.bible_is_theme,
          activeFontType: cookieData.bible_is_font_family,
          activeFontSize: cookieData.bible_is_font_size,
          readersMode: cookieData.bible_is_userSettings_toggleOptions_readersMode_active,
          justifiedText: cookieData.bible_is_userSettings_toggleOptions_justifiedText_active,
          redLetter: cookieData.bible_is_userSettings_toggleOptions_justifiedText_active,
          crossReferences: cookieData.bible_is_userSettings_toggleOptions_crossReferences_active,
          oneVersePerLine: cookieData.bible_is_userSettings_toggleOptions_oneVersePerLine_active,
        },
      });
    }

    context.reduxStore.dispatch({
      type: 'GET_INITIAL_ROUTE_STATE_HOMEPAGE',
      homepage: {
        userProfile,
        activeFilesetId,
        audioType: audioType || '',
        availableAudioTypes,
        loadingAudio: true,
        hasVideo,
        videoPlayerOpen: hasVideo,
        chapterText,
        testaments,
        formattedSource: initData.formattedText,
        activeFilesets: filesets,
        changingVersion: false,
        books: bookData || [],
        activeChapter: parseInt(chapter, 10) >= 0 ? parseInt(chapter, 10) : 1,
        activeBookName,
        verseNumber: verse,
        activeTextId: bible.abbr,
        activeIsoCode: bible.iso || '',
        defaultLanguageIso: bible.iso || 'eng',
        activeLanguageName: bible.language || '',
        activeTextName: bible.vname || bible.name,
        defaultLanguageName: bible.language || 'English: USA',
        defaultLanguageCode: bible.language_id || 17045,
        bibleFontAvailable: !!bible.fonts,
        textDirection: bible.alphabet ? bible.alphabet.direction : 'ltr',
        activeBookId: bookId.toUpperCase() || '',
        userId,
        isIe,
        userAuthenticated: isAuthenticated || false,
        isFromServer,
        match: {
          params: {
            bibleId,
            bookId,
            chapter,
            verse,
            token,
          },
        },
      },
    });
  }

  return {
    initialVolume,
    initialPlaybackRate,
    chapterText,
    testaments,
    audioType: audioType || '',
    formattedText: initData.formattedText,
    books: bookData || [],
    activeChapter: parseInt(chapter, 10) >= 0 ? parseInt(chapter, 10) : 1,
    activeBookName,
    verseNumber: verse,
    activeTextId: bible.abbr,
    activeIsoCode: bible.iso,
    activeLanguageName: bible.language,
    textDirection: bible.alphabet ? bible.alphabet.direction : 'ltr',
    activeFilesets: filesets,
    defaultLanguageIso: bible.iso || 'eng',
    defaultLanguageName: bible.language || 'English: USA',
    defaultLanguageCode: bible.language_id || 17045,
    bibleFontAvailable: !!bible.fonts,
    activeTextName: bible.vname || bible.name,
    activeBookId: bookId.toUpperCase(),
    userProfile,
    userId: userId || '',
    isAuthenticated: isAuthenticated || false,
    isFromServer,
    isIe,
    routeLocation,
    match: {
      params: {
        bibleId,
        bookId,
        chapter,
        verse,
        token,
      },
    },
    fetchedUrls: [],
    triggerRedirect,
  };
};

AppContainer.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
  userProfile: PropTypes.object,
  chapterText: PropTypes.array,
  fetchedUrls: PropTypes.array,
  isFromServer: PropTypes.bool,
  isIe: PropTypes.bool,
  routeLocation: PropTypes.string,
  activeBookName: PropTypes.string,
  formattedText: PropTypes.string,
  activeChapter: PropTypes.number,
  initialVolume: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  initialPlaybackRate: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  triggerRedirect: PropTypes.shape({
    url: PropTypes.string,
    as: PropTypes.string,
  }),
};

export default connect()(AppContainer);
