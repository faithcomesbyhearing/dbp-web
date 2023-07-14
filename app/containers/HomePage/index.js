/*
 * HomePage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { TransitionGroup } from 'react-transition-group';
import dynamic from 'next/dynamic';
import isEqual from 'lodash/isEqual';
import injectSaga from '../../utils/injectSaga';
import injectReducer from '../../utils/injectReducer';
import checkForVideoAsync from '../../utils/checkForVideoAsync';
import settingsReducer from '../Settings/reducer';
import AudioPlayer from '../AudioPlayer';
import Text from '../Text';
import NavigationBar from '../../components/NavigationBar';
import Footer from '../../components/Footer';
import FadeTransition from '../../components/FadeTransition';
import notesReducer from '../Notes/reducer';
import notesSaga from '../Notes/saga';
import textReducer from '../TextSelection/reducer';
import textSaga from '../TextSelection/saga';
import profileSaga from '../Profile/saga';
import profileReducer from '../Profile/reducer';
import makeSelectProfile from '../Profile/selectors';
import { setActiveIsoCode } from '../TextSelection/actions';
import { getBookmarksForChapter } from '../Notes/actions';
import { setHasVideo } from '../VideoPlayer/actions';
import {
  getNotes,
  getHighlights,
  getCopyrights,
  toggleProfile,
  toggleNotesModal,
  toggleSearchModal,
  toggleSettingsModal,
  toggleChapterSelection,
  toggleVersionSelection,
  toggleFirstLoadForTextSelection,
  setChapterTextLoadingState,
  resetBookmarkState,
  initApplication,
  changeVersion,
} from './actions';
import makeSelectHomePage, {
  selectSettings,
  selectFormattedSource,
  selectAuthenticationStatus,
  selectUserId,
  selectMenuOpenState,
  selectUserNotes,
  selectActiveNotesView,
} from './selectors';
import reducer from './reducer';
import saga from './saga';
import {
  applyTheme,
  applyFontFamily,
  applyFontSize,
  toggleWordsOfJesus,
} from '../Settings/themes';
import { setAudioType } from '../AudioPlayer/actions';

const VideoPlayer = dynamic(import('../VideoPlayer'), {
  loading: () => null,
});
const Profile = dynamic(import('../Profile'), {
  loading: () => null,
});
const Settings = dynamic(import('../Settings'), {
  loading: () => null,
});
const SearchContainer = dynamic(import('../SearchContainer'), {
  loading: () => null,
});
const Notes = dynamic(import('../Notes'), {
  loading: () => null,
});

class HomePage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isScrollingDown: false,
    };
    this.timer = null;
  }

  componentDidMount() {
    const {
      activeFilesets,
    } = this.props.homepage;
    const { userSettings } = this.props;

    toggleWordsOfJesus(
      userSettings.getIn(['toggleOptions', 'redLetter', 'active']),
    );

    this.timer = setTimeout(() => {
      this.getCopyrights({ filesetIds: activeFilesets });
    }, 100);

    if (this.props.homepage.match.params.token) {
      // Open Profile
      this.toggleProfile();
      // Give profile the token - done in render
      // Open Password Reset Verified because there is a token - done in Profile/index
    }

    if (process.env.FB_APP_ID) {
      try {
        ((d, s, id) => {
          let js = d.getElementsByTagName(s)[0];
          const fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s);
          js.id = id;
          js.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.12&appId=${
            process.env.FB_APP_ID
          }&autoLogAppEvents=1`;
          fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'facebook-jssdk');
        // Init the Facebook api here
        if (!this.props.userId) {
          window.fbAsyncInit = () => {
            FB.init({
              appId: process.env.FB_APP_ID,
              autoLogAppEvents: true,
              cookie: true,
              xfbml: true,
              version: 'v2.12',
            });
          };
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error initializing fb api', err); // eslint-disable-line no-console
        }
      }
    }

    if (process.env.GOOGLE_APP_ID) {
      try {
        // May need to create a script and append it to the dom then wait for it to finish loading
        if (!this.props.userId && typeof gapi !== 'undefined') {
          gapi.load('auth2', () => {
            try {
              window.auth2 = gapi.auth2.init({
                client_id: process.env.GOOGLE_APP_ID || 'no_client',
                scope: 'profile',
              });
            } catch (err) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('Error initializing google api lower catch', err); // eslint-disable-line no-console
              }
            }
          });
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error initializing google api', err); // eslint-disable-line no-console
        }
      }
    }
    const videoFileset = activeFilesets.filter(
      (f) => f.type === 'video_stream',
    )[0];
    this.checkForVideo(
      videoFileset ? videoFileset.id : '',
      this.props.homepage.activeBookId,
      this.props.homepage.activeChapter,
    );
  }

  componentDidUpdate(prevProps) {
    // Based on nextProps so that requests have the latest chapter information
    const {
      activeTextId,
      activeBookId,
      activeChapter,
      addBookmarkSuccess,
      audioSource,
      activeFilesets,
    } = this.props.homepage;
    const { userSettings, formattedSource, textData } = this.props;
    const {
      userSettings: prevSettings,
      formattedSource: prevFormattedSource,
      textData: prevTextData,
    } = prevProps;
    const { userId, userAuthenticated } = this.props.profile;
    const {
      addBookmarkSuccess: addBookmarkSuccessProps,
      activeTextId: activeTextIdProps,
      activeBookId: activeBookIdProps,
      activeChapter: activeChapterProps,
      audioSource: prevAudioSource,
    } = prevProps.homepage;
    const {
      userId: userIdProps,
      userAuthenticated: userAuthenticatedProps,
    } = prevProps.profile;
    const prevVerseNumber = prevProps.homepage.match.params.verse;
    const verseNumber = this.props.homepage.match.params.verse;
    const audioParam =
      location?.search &&
      location.search
        .slice(1)
        .split('&')
        .map((key) => key.split('='))
        .find((key) => key[0] === 'audio_type');
    if (
      audioParam &&
      (audioParam[1] !== prevProps.homepage.audioType ||
        audioParam[1] !== this.props.homepage.audioType)
    ) {
      prevProps.dispatch(setAudioType({ audioType: audioParam[1] }));
    }

    if (this.props.homepage.changingVersion) {
      this.props.dispatch(changeVersion({ state: false }));
    }

    // If there was a change in the params then make sure loading state is set to false
    if (
      prevVerseNumber !== verseNumber ||
      formattedSource.main !== prevFormattedSource.main ||
      !isEqual(prevTextData.text, textData.text) ||
      audioSource !== prevAudioSource ||
      activeChapter !== activeChapterProps
    ) {
      this.setTextLoadingState({ state: false });
      this.getCopyrights({ filesetIds: activeFilesets });
    }

    // Only apply the them if one of them changed - use the newest one always since that will be what the user clicked
    if (typeof document !== 'undefined') {
      if (
        prevSettings.getIn(['toggleOptions', 'redLetter', 'active']) !==
        userSettings.getIn(['toggleOptions', 'redLetter', 'active'])
      ) {
        toggleWordsOfJesus(
          userSettings.getIn(['toggleOptions', 'redLetter', 'active']),
        );
      }
      if (prevSettings.get('activeTheme') !== userSettings.get('activeTheme')) {
        applyTheme(userSettings.get('activeTheme'));
      }
      if (
        prevSettings.get('activeFontType') !==
        userSettings.get('activeFontType')
      ) {
        applyFontFamily(userSettings.get('activeFontType'));
      }
      if (
        prevSettings.get('activeFontSize') !==
        userSettings.get('activeFontSize')
      ) {
        applyFontSize(userSettings.get('activeFontSize'));
      }
    }
    // If there is an authenticated user then send these calls
    if (
      userId &&
      userAuthenticated &&
      (userId !== userIdProps ||
        userAuthenticated !== userAuthenticatedProps ||
        activeTextId !== activeTextIdProps ||
        activeBookId !== activeBookIdProps ||
        activeChapter !== activeChapterProps)
    ) {
      // Should move all of these into the same call to reduce the number of renders in the text component
      this.props.dispatch(
        getHighlights({
          bible: activeTextId,
          book: activeBookId,
          chapter: activeChapter,
          userAuthenticated,
          userId,
        }),
      );
      this.props.dispatch(
        getNotes({
          userId,
          params: {
            bible_id: activeTextId,
            book_id: activeBookId,
            chapter: activeChapter,
            limit: 150,
            page: 1,
          },
        }),
      );

      this.props.dispatch(
        getBookmarksForChapter({
          userId,
          params: {
            bible_id: activeTextId,
            book_id: activeBookId,
            chapter: activeChapter,
            limit: 150,
            page: 1,
          },
        }),
      );
    }

    if (addBookmarkSuccess !== addBookmarkSuccessProps && addBookmarkSuccess) {
      this.props.dispatch(
        getBookmarksForChapter({
          userId,
          params: {
            bible_id: activeTextId,
            book_id: activeBookId,
            chapter: activeChapter,
            limit: 150,
            page: 1,
          },
        }),
      );
      this.props.dispatch(resetBookmarkState());
    }

    if (this.props.homepage.firstLoad) {
      this.toggleFirstLoadForTextSelection();
    }

    if (!this.props.homepage.firstLoad && prevProps.homepage.firstLoad) {
      this.props.dispatch(
        setActiveIsoCode({
          iso: this.props.homepage.initialIsoCode,
          languageCode: this.props.homepage.defaultLanguageCode,
          name: this.props.homepage.initialLanguageName,
        }),
      );

      this.props.dispatch(
        initApplication({
          languageIso: this.props.homepage.defaultLanguageIso,
          languageCode: this.props.homepage.defaultLanguageCode,
        }),
      );
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  getCopyrights = (props) => this.props.dispatch(getCopyrights(props));

  setTextLoadingState = (props) =>
    this.props.dispatch(setChapterTextLoadingState(props));

  checkForVideo = async (filesetId, bookId, chapter) => {
    if (!filesetId) {
      this.props.dispatch(
        setHasVideo({
          state: false,
          videoChapterState: false,
          videoPlayerOpen: false,
        }),
      );
      return;
    }
    const hasVideo = await checkForVideoAsync(filesetId, bookId, chapter);

    this.props.dispatch(
      setHasVideo({
        state: hasVideo,
        videoChapterState: hasVideo,
        videoPlayerOpen: hasVideo,
      }),
    );
  };

  toggleFirstLoadForTextSelection = () =>
    this.props.homepage.firstLoad &&
    this.props.dispatch(toggleFirstLoadForTextSelection());

  toggleProfile = () => {
    this.props.dispatch(toggleProfile());
  };

  toggleNotesModal = () => {
    this.props.dispatch(toggleNotesModal());
  };

  toggleSettingsModal = () => {
    this.props.dispatch(toggleSettingsModal());
  };

  toggleSearchModal = () => {
    this.props.dispatch(toggleSearchModal());
  };

  toggleChapterSelection = () => {
    this.props.dispatch(toggleChapterSelection());
  };

  toggleVersionSelection = () => {
    this.props.dispatch(toggleVersionSelection());
  };

  render() {
    const {
      activeBookId,
      activeTextId,
      activeChapter,
      activeBookName,
      activeFilesets,
      activeTextName,
      activeFilesetId,
      audioPlayerState,
      books,
      isProfileActive,
      isNotesModalActive,
      isSearchModalActive,
      isSettingsModalActive,
      isVersionSelectionActive,
      isChapterSelectionActive,
      userAgent,
      loadingAudio,
      loadingNewChapterText,
      chapterTextLoadingState,
      changingVersion,
      videoPlayerOpen,
      hasVideo,
      audioType,
      textDirection,
    } = this.props.homepage;

    const { userSettings, isMenuOpen, isIe, activeNotesView } = this.props;

    const { isScrollingDown } = this.state;
    const { text: updatedText } = this.props.textData;
    const token = this.props.homepage.match.params.token || '';
    const verse = this.props.homepage.match.params.verse || '';

    return (
      <>
        <NavigationBar
          userAgent={userAgent}
          activeTextId={activeTextId}
          activeChapter={activeChapter}
          activeTextName={activeTextName}
          activeBookName={activeBookName}
          textDirection={textDirection}
          theme={userSettings.get('activeTheme')}
          isScrollingDown={isScrollingDown}
          isChapterSelectionActive={isChapterSelectionActive}
          isVersionSelectionActive={isVersionSelectionActive}
          toggleChapterSelection={this.toggleChapterSelection}
          toggleVersionSelection={this.toggleVersionSelection}
        />
        <div
          className={
            videoPlayerOpen || !audioPlayerState
              ? 'content-container audio-closed'
              : 'content-container'
          }
        >
          {(activeTextId && (
              <VideoPlayer
                fileset={
                  activeFilesets.filter((f) => f.type === 'video_stream')[0]
                }
                bookId={activeBookId}
                chapter={activeChapter}
                books={books}
                text={updatedText}
                textId={activeTextId}
              />
            )
          )}
          { activeTextId && (
              <Text
              books={books}
              text={updatedText}
              hasVideo={hasVideo}
              verseNumber={verse}
              audioType={audioType}
              menuIsOpen={isMenuOpen}
              activeTextId={activeTextId}
              activeBookId={activeBookId}
              loadingAudio={loadingAudio}
              activeChapter={activeChapter}
              changingVersion={changingVersion}
              videoPlayerOpen={videoPlayerOpen}
              isScrollingDown={isScrollingDown}
              audioPlayerState={audioPlayerState}
              loadingNewChapterText={loadingNewChapterText}
              chapterTextLoadingState={chapterTextLoadingState}
              />
          )}
        </div>
        <TransitionGroup>
          {isSettingsModalActive ? (
            <FadeTransition
              classNames="slide-from-right"
              in={isSettingsModalActive}
            >
              <Settings
                userSettings={userSettings}
                toggleSettingsModal={this.toggleSettingsModal}
                isIe={isIe}
              />
            </FadeTransition>
          ) : null}
          {isProfileActive ? (
            <FadeTransition classNames="slide-from-left" in={isProfileActive}>
              <Profile
                resetPasswordSent={this.resetPasswordSent}
                userAccessToken={token}
                toggleProfile={this.toggleProfile}
                isIe={isIe}
              />
            </FadeTransition>
          ) : null}
          {isNotesModalActive ? (
            <FadeTransition
              classNames="slide-from-right"
              in={isNotesModalActive}
            >
              <Notes
                activeBookId={activeBookId}
                activeChapter={activeChapter}
                toggleProfile={this.toggleProfile}
                toggleNotesModal={this.toggleNotesModal}
                openView={activeNotesView}
                isIe={isIe}
              />
            </FadeTransition>
          ) : null}
          {isSearchModalActive ? (
            <FadeTransition
              classNames="slide-from-left"
              in={isSearchModalActive}
            >
              <SearchContainer
                bibleId={activeTextId}
                activeFilesetId={activeFilesetId}
                books={books}
                toggleSearchModal={this.toggleSearchModal}
                isIe={isIe}
              />
            </FadeTransition>
          ) : null}
        </TransitionGroup>
        {activeTextId && <AudioPlayer verseNumber={verse} audioType={audioType} />}
        <Footer
          profileActive={isProfileActive}
          searchActive={isSearchModalActive}
          notebookActive={isNotesModalActive}
          settingsActive={isSettingsModalActive}
          isScrollingDown={isScrollingDown}
          toggleProfile={this.toggleProfile}
          toggleSearch={this.toggleSearchModal}
          toggleNotebook={this.toggleNotesModal}
          toggleSettingsModal={this.toggleSettingsModal}
        />
      </>
    );
  }
}

HomePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  homepage: PropTypes.shape({
    activeBookId: PropTypes.string,
    activeTextId: PropTypes.string.isRequired,
    activeChapter: PropTypes.number,
    activeBookName: PropTypes.string,
    activeFilesets: PropTypes.array,
    activeTextName: PropTypes.string,
    activeFilesetId: PropTypes.string,
    audioPlayerState: PropTypes.bool,
    books: PropTypes.array,
    isProfileActive: PropTypes.bool,
    isNotesModalActive: PropTypes.bool,
    isSearchModalActive: PropTypes.bool,
    isSettingsModalActive: PropTypes.bool,
    isVersionSelectionActive: PropTypes.bool,
    isChapterSelectionActive: PropTypes.bool,
    userAgent: PropTypes.string,
    loadingAudio: PropTypes.bool,
    loadingNewChapterText: PropTypes.bool,
    chapterTextLoadingState: PropTypes.bool,
    changingVersion: PropTypes.bool,
    videoPlayerOpen: PropTypes.bool,
    hasVideo: PropTypes.bool,
    audioType: PropTypes.string,
    textDirection: PropTypes.string,
    match: PropTypes.object,
    firstLoad: PropTypes.bool,
    addBookmarkSuccess: PropTypes.bool,
    defaultLanguageIso: PropTypes.string,
    initialIsoCode: PropTypes.string,
    initialLanguageName: PropTypes.string,
    defaultLanguageCode: PropTypes.number,
    audioSource: PropTypes.string,
  }).isRequired,
  userSettings: PropTypes.object,
  formattedSource: PropTypes.object,
  userAuthenticated: PropTypes.bool,
  isIe: PropTypes.bool,
  activeNotesView: PropTypes.string,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  textData: PropTypes.object,
  isMenuOpen: PropTypes.bool,
  profile: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  homepage: makeSelectHomePage(),
  formattedSource: selectFormattedSource(),
  userAuthenticated: selectAuthenticationStatus(),
  userId: selectUserId(),
  textData: selectUserNotes(),
  profile: makeSelectProfile(),
  isMenuOpen: selectMenuOpenState(),
  userSettings: selectSettings(),
  activeNotesView: selectActiveNotesView(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

// Defeats the purpose of code splitting - need to figure out a different method to reduce bundle size
const withReducer = injectReducer({ key: 'homepage', reducer });
const withSaga = injectSaga({ key: 'homepage', saga });
const withTextReducer = injectReducer({
  key: 'textSelection',
  reducer: textReducer,
});
const withTextSaga = injectSaga({ key: 'textSelection', saga: textSaga });
const withNotesSaga = injectSaga({ key: 'notes', saga: notesSaga });
const withNotesReducer = injectReducer({ key: 'notes', reducer: notesReducer });
const withProfileReducer = injectReducer({
  key: 'profile',
  reducer: profileReducer,
});
const withProfileSaga = injectSaga({ key: 'profile', saga: profileSaga });
const withSettingsReducer = injectReducer({
  key: 'settings',
  reducer: settingsReducer,
});

export default compose(
  withReducer,
  withTextReducer,
  withProfileReducer,
  withProfileSaga,
  withNotesReducer,
  withSaga,
  withNotesSaga,
  withTextSaga,
  withSettingsReducer,
  withConnect,
)(HomePage);
