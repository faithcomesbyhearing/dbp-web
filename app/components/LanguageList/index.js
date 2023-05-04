/**
 *
 * LanguageList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { List, AutoSizer } from 'react-virtualized';
import { matchSorter } from 'match-sorter';
import Router from 'next/router';
import { loadVersionForLanguage } from '../../containers/TextSelection/actions';
import { changeVersion } from '../../containers/HomePage/actions';
import { getVersionForLanguage } from '../../utils/getVersionForLanguage';
import LoadingSpinner from '../LoadingSpinner';
import {
  selectActiveBookId,
  selectActiveChapter,
} from '../VersionList/selectors';

export class LanguageList extends React.PureComponent {
  constructor(props) {
    super(props);
    // eslint-disable-line react/prefer-stateless-function
    this.state = {
      startY: 0,
      distance: 0,
      endY: 0,
      pulling: false,
    };
  }

  // Try to reduce the number of times language list is iterated over
  getFilteredLanguages(width, height) {
    const { languages, languageCode, filterText, fromCountry } = this.props;
    const filteredLanguages = filterText
      ? matchSorter(languages, filterText, {
          threshold: matchSorter.rankings.ACRONYM,
          keys: [
            'name',
            'iso',
            'autonym',
            {
              maxRanking: matchSorter.rankings.STARTS_WITH,
              key: 'alt_names',
            },
          ],
        })
      : languages;

    if (languages.length === 0) {
      return null;
    }

    const renderARow = ({ index, style, key }) => {
      const language = filteredLanguages[index];

      return (
        <div
          style={style}
          key={key}
          className="language-name"
          role="button"
          tabIndex={0}
          title={language.englishName || language.name}
          onClick={(e) => this.handleLanguageClick(e, language)}
        >
          <h4
            className={
              language.id === languageCode ? 'active-language-name' : ''
            }
          >
            {language.alt_names && language.alt_names.includes(filterText)
              ? filterText
              : language.autonym || language.englishName || language.name}
            {language.autonym &&
            language.autonym !== (language.englishName || language.name)
              ? ` - ( ${language.englishName || language.name} )`
              : null}
          </h4>
        </div>
      );
    };

    const getActiveIndex = () => {
      let activeIndex = 0;

      filteredLanguages.forEach((l, i) => {
        if (l.id === languageCode) {
          activeIndex = i;
        }
      });

      return activeIndex;
    };

    return filteredLanguages.length ? (
      <List
        id={'list-element'}
        estimatedRowSize={34 * filteredLanguages.length}
        height={height}
        rowRenderer={renderARow}
        rowCount={filteredLanguages.length}
        overscanRowCount={2}
        rowHeight={34}
        scrollToIndex={fromCountry ? 0 : getActiveIndex()}
        width={width}
        scrollToAlignment={'start'}
      />
    ) : (
      <div className={'language-error-message'}>
        There are no matches for your search.
      </div>
    );
  }

  // If a swipe happened
  // Check if list's scroll top is 0
  // If it is at 0 then activate the logic for refreshing the countries
  // Otherwise do not do anything
  handleStart = (clientY) => {
    if (this.listScrollTop() === 0) {
      this.setState({ startY: clientY, pulling: true });
    }
  };

  handleMove = (clientY) => {
    // Difference between this move position and the start position
    // is the distance the refresh message should be from where it started
    const maxDistance = 80;
    const minDistance = 0;
    if (
      this.listScrollTop() === 0 &&
      this.state.startY === 0 &&
      !this.state.pulling
    ) {
      this.setState({ startY: clientY, pulling: true });
    } else if (
      clientY - this.state.startY <= maxDistance &&
      clientY - this.state.startY >= minDistance &&
      this.state.pulling
    ) {
      this.setState((cs) => ({ distance: clientY - cs.startY }));
    }
  };

  handleEnd = (clientY) => {
    // User must have pulled at least 40px
    const minDistance = 40;
    if (
      this.state.startY < clientY &&
      this.state.pulling &&
      this.state.distance > minDistance
    ) {
      this.setState({
        startY: 0,
        distance: 0,
        endY: 0,
        pulling: false,
      });
      this.props.getLanguages();
    } else {
      this.setState({
        startY: 0,
        distance: 0,
        endY: 0,
        pulling: false,
      });
    }
  };

  handleTouchStart = (touchStartEvent) => {
    this.handleStart(touchStartEvent.targetTouches[0].clientY);
  };

  handleTouchMove = (touchMoveEvent) => {
    this.handleMove(touchMoveEvent.targetTouches[0].clientY);
  };

  handleTouchEnd = (e) => {
    this.handleEnd(e.changedTouches[0].clientY);
  };

  handleMouseDown = (mouseDownEvent) => {
    this.handleStart(mouseDownEvent.clientY);
    this.container.addEventListener('mousemove', this.handleMouseMove);
  };

  handleMouseMove = (mouseMoveEvent) => {
    this.handleMove(mouseMoveEvent.clientY);
  };

  handleMouseUp = (e) => {
    this.handleEnd(e.clientY);
    this.container.removeEventListener('mousemove', this.handleMouseMove);
  };

  handleMouseLeave = (e) => {
    this.handleMouseUp(e);
  };

  listScrollTop = () =>
    document && document.getElementById('list-element')
      ? document.getElementById('list-element').scrollTop
      : 0;

  handleLanguageClick = async (e, language) => {
    if ('stopPropagation' in e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    } else if ('cancelBubble' in e) {
      e.cancelBubble = true;
    }
    const {
      setActiveIsoCode,
      activeBookId,
      activeChapter,
      toggleTextSelection,
      toggleLanguageList,
      toggleVersionList,
      dispatch,
      setFromCountry,
    } = this.props;

    if (language.bibles === 1) {
      // Go straight to the bible
      setActiveIsoCode({
        iso: language.iso,
        name: language.name,
        languageCode: language.id,
      });
      // Set menu and background to loading state
      dispatch(changeVersion({ state: true }));
      dispatch(loadVersionForLanguage({ state: true }));

      // Wait for routes to be generated
      const { versionHref, versionAs } = await getVersionForLanguage({
        languageCode: language.id,
        activeBookId,
        activeChapter,
      });

      // FIXME: see comment below. we no longer provide asset_id to api; what can we adjust here to remove "temporary failsafe"
      // Temporary failsafe for until the api supports multiple values in asset_id param
      if (!versionHref || !versionAs) {
        // If no version then use default behavior
        setFromCountry(false);
        dispatch(loadVersionForLanguage({ state: false }));
        toggleLanguageList();
        toggleVersionList();
      } else {
        // Push new route
        Router.push(versionHref, versionAs);
        dispatch(loadVersionForLanguage({ state: false }));
        toggleTextSelection();
      }
    } else if (language) {
      setActiveIsoCode({
        iso: language.iso,
        name: language.name,
        languageCode: language.id,
      });
      setFromCountry(false);
      toggleLanguageList();
      toggleVersionList();
    }
  };

  handleRef = (el) => {
    this.container = el;
  };

  render() {
    const {
      active,
      loadingLanguages,
      loadingLanguageVersion,
      languages,
    } = this.props;
    const distance = this.state.distance;

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    if (active) {
      return (
        <div className="text-selection-section">
          <div
            ref={this.handleRef}
            onTouchStart={this.handleTouchStart}
            onTouchEnd={this.handleTouchEnd}
            onTouchMove={this.handleTouchMove}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            onMouseLeave={this.handleMouseLeave}
            className="language-name-list"
          >
            <div
              style={{ height: distance, maxHeight: distance }}
              className={
                distance ? 'pull-down-refresh pulling' : 'pull-down-refresh'
              }
            >
              <span style={{ textAlign: 'center', width: '100%' }}>
                {`${distance > 40 ? 'Release' : 'Pull'} to Refresh`}
              </span>
            </div>
            {!loadingLanguages && !loadingLanguageVersion ? (
              <AutoSizer>
                {({ width, height }) =>
                  this.getFilteredLanguages(width, height)}
              </AutoSizer>
            ) : (
              <LoadingSpinner />
            )}
            {languages.length === 0 && !loadingLanguages ? (
              <span className={'language-error-message'}>
                There was an error fetching this resource, an Admin has been
                notified. We apologize for the inconvenience.
              </span>
            ) : null}
          </div>
        </div>
      );
    }
    return null;
  }
}

LanguageList.propTypes = {
  languages: PropTypes.array,
  dispatch: PropTypes.func,
  setActiveIsoCode: PropTypes.func,
  setFromCountry: PropTypes.func,
  toggleLanguageList: PropTypes.func,
  toggleVersionList: PropTypes.func,
  toggleTextSelection: PropTypes.func,
  getLanguages: PropTypes.func,
  activeBookId: PropTypes.string,
  filterText: PropTypes.string,
  active: PropTypes.bool,
  fromCountry: PropTypes.bool,
  loadingLanguages: PropTypes.bool,
  loadingLanguageVersion: PropTypes.bool,
  activeChapter: PropTypes.number,
  languageCode: PropTypes.number,
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

const mapStateToProps = createStructuredSelector({
  activeBookId: selectActiveBookId(),
  activeChapter: selectActiveChapter(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(LanguageList);
