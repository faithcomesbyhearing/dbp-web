/**
 *
 * VersionList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Router from 'next/router';
import { createStructuredSelector } from 'reselect';
import LoadingSpinner from '../LoadingSpinner';
import VersionListSection from '../VersionListSection';
import messages from './messages';
import { selectActiveBookId, selectActiveChapter } from './selectors';
import { changeVersion } from '../../containers/HomePage/actions';
import getBookMetaData from '../../utils/getBookMetaData';
import getFirstChapterReference from '../../utils/getFirstChapterReference';
import { selectHasVideo } from '../../containers/VideoPlayer/selectors';
import getUrl from '../../utils/hrefLinkOrAsLink';

export class VersionList extends React.PureComponent {
	get filteredVersionList() {
		const { bibles, activeTextId, filterText, activeChapter, activeBookId } =
			this.props;
		const filteredBibles = filterText
			? bibles?.filter(this.filterFunction)
			: bibles;

		const getKey = (bible) => {
			if (!bible) return '';
			const abbr = bible.get('abbr');
			const date = bible.get('date') || '2019';
			const typeSuffix = bible.get('hasVideo') ? '_video' : '_plain';
			return abbr + date + typeSuffix;
		};

		// Change the way I figure out if a resource has text or audio
		// path, key, types, className, text, clickHandler
		// Set the path to just the bible_id and let app.js handle getting the actual book and chapter needed
		const scrubbedBibles = filteredBibles?.reduce((acc, bible) => {
			const item = {
				path: {
					textId: bible.get('abbr'),
					bookId: activeBookId,
					chapter: activeChapter,
				},
				key: getKey(bible),
				clickHandler: (audioType) =>
					this.handleVersionListClick(bible, audioType),
				className: bible.get('abbr') === activeTextId ? 'active-version' : '',
				title: bible.get('name'),
				text: bible.get('vname') || bible.get('name') || bible.get('abbr'),
				altText:
					bible.get('vname') && bible.get('vname') !== bible.get('name')
						? bible.get('name')
						: '',
				types: bible.get('filesets')
					? bible
							.get('filesets')
							.reduce((a, c) => ({ ...a, [c.get('type')]: true }), {})
					: {},
			};

			acc.push(item);
			return acc;
		}, []);

		// When I first get the response from the server with filesets
		const video = [];
		const audioAndText = [];
		const audioOnly = [];
		const textOnly = [];

		scrubbedBibles?.forEach((b) => {
			if (b.types.video_stream) {
				video.push(b);
			} else if (
				(b.types.audio_drama || b.types.audio) &&
				(b.types.text_plain || b.types.text_format)
			) {
				audioAndText.push(b);
			} else if (b.types.audio_drama || b.types.audio) {
				audioOnly.push(b);
			} else {
				textOnly.push(b);
			}
		});

		const videoComponent = video?.length ? (
			<div className={'version-list-section'} key={'video'}>
				<div className={'version-list-section-title'}>
					<FormattedMessage {...messages.video} />
				</div>
				<VersionListSection items={video} />
			</div>
		) : null;
		const audioAndTextComponent = audioAndText.length ? (
			<div className={'version-list-section'} key={'audio-and-text'}>
				<div className={'version-list-section-title'}>
					<FormattedMessage {...messages.audioAndText} />
				</div>
				<VersionListSection items={audioAndText} />
			</div>
		) : null;
		const audioOnlyComponent = audioOnly.length ? (
			<div className={'version-list-section'} key={'audio-only'}>
				<div className={'version-list-section-title'}>
					<FormattedMessage {...messages.audioOnly} />
				</div>
				<VersionListSection items={audioOnly} />
			</div>
		) : null;
		const textOnlyComponent = textOnly.length ? (
			<div className={'version-list-section'} key={'text-only'}>
				<div className={'version-list-section-title'}>
					<FormattedMessage {...messages.textOnly} />
				</div>
				<VersionListSection items={textOnly} />
			</div>
		) : null;

		const components = [
			videoComponent,
			audioAndTextComponent,
			audioOnlyComponent,
			textOnlyComponent,
		];

		if (bibles?.size === 0) {
			return (
				<span className="version-item-button">
					There was an error fetching this resource, an Admin has been notified.
					We apologize for the inconvenience.
				</span>
			);
		}

		return scrubbedBibles?.length ? (
			components
		) : (
			<span className="version-item-button">
				There are no matches for your search.
			</span>
		);
	}

	filterFunction = (bible) => {
		const lowerCaseText = this.props.filterText.toLowerCase();
		const properties = ['vname', 'name', 'abbr', 'date'];

		return properties.some((property) => {
			const propValue = bible.get(property) || '';
			return propValue.toLowerCase().includes(lowerCaseText);
		});
	};

	// Make async
	handleVersionListClick = async (bible, audioType) => {
		// Figure out correct url here based on session variable value
		const { toggleTextSelection, activeTextId, activeBookId, activeChapter } =
			this.props;
		const hasVideo = !!bible.get('hasVideo');

		if (bible.get('jesusFilm')) {
			// If there is a Jesus Film then use alternate navigation logic
			Router.push(`/jesus-film/${bible.get('iso')}`);
			toggleTextSelection();
			// End function early since navigation should have already occurred
			return;
		}
		// If bible id is equal to the active bible id then just return and don't change version
		if (bible.get('abbr').toLowerCase() === activeTextId.toLowerCase()) {
			toggleTextSelection();
			return;
		}

		if (bible.get('abbr').toLowerCase() !== activeTextId.toLowerCase()) {
			this.props.dispatch(changeVersion({ state: true }));
		}

		if (JSON.parse(sessionStorage.getItem('bible_is_maintain_location'))) {
			Router.push(
				getUrl({
					textId: bible.get('abbr'),
					bookId: activeBookId,
					chapter: activeChapter,
					audioType,
					isHref: true,
				}),
				getUrl({
					textId: bible.get('abbr'),
					bookId: activeBookId,
					chapter: activeChapter,
					audioType,
					isHref: false,
				}),
			);
		} else {
			// Find url and push that one
			const [filteredMetadata, allMetadata] = await getBookMetaData({
				idsForBookMetadata: bible
					.get('filesets')
					.map((set) => [set.get('type'), set.get('id')])
					.toJS(),
			});

			const bookChapterUrl = getFirstChapterReference(
				bible.get('filesets').toJS(),
				hasVideo,
				allMetadata,
				filteredMetadata,
				audioType,
			);

			// Need to parse out the bookChapterUrl to create the href version for the server
			// Safe to access 0th element for \w of match since it always returns a string
			const bookId = bookChapterUrl.match(/\w*/)[0]; // Get first word which is bookId
			const chapterId = bookChapterUrl.match(/\/\w*/)[0].slice(1); // get second part of url
			const query =
				bookChapterUrl.match(/\?.*/) &&
				bookChapterUrl.match(/\?.*/)[0].replace('?', '&'); // Get any query params at the end

			Router.push(
				`/app?bibleId=${bible.get(
					'abbr',
				)}&bookId=${bookId}&chapter=${chapterId}${query || ''}`,
				`/bible/${bible.get('abbr')}/${bookChapterUrl}`,
			);
		}

		if (bible) {
			if (audioType) {
				if (
					typeof window !== 'undefined' &&
					(audioType === 'audio' || audioType === 'audio_drama')
				) {
					document.cookie = `bible_is_audio_type=${audioType};path=/bible/${bible.get(
						'abbr',
					)}`;
				}
			}
			toggleTextSelection();
		}
	};

	render() {
		const { active, loadingVersions } = this.props;

		return (
			<div
				style={{ display: active ? 'block' : 'none' }}
				className="text-selection-section"
			>
				<div className="version-name-list">
					{loadingVersions ? <LoadingSpinner /> : this.filteredVersionList}
				</div>
			</div>
		);
	}
}

VersionList.propTypes = {
	bibles: PropTypes.object,
	dispatch: PropTypes.func,
	setActiveText: PropTypes.func,
	toggleTextSelection: PropTypes.func,
	activeTextId: PropTypes.string,
	filterText: PropTypes.string,
	activeBookId: PropTypes.string,
	activeChapter: PropTypes.number,
	active: PropTypes.bool,
	hasVideo: PropTypes.bool,
	loadingVersions: PropTypes.bool,
};

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

const mapStateToProps = createStructuredSelector({
	activeBookId: selectActiveBookId(),
	activeChapter: selectActiveChapter(),
	hasVideo: selectHasVideo(),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(VersionList);
