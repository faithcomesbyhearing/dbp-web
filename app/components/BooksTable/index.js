/**
 *
 * BooksTable
 *
 */

import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import LoadingSpinner from '../LoadingSpinner';
import BooksTestament from '../BooksTestament';
import {
	BOOK_COVENANT_TESTAMENT,
	BOOK_NEW_TESTAMENT,
	BOOK_OLD_TESTAMENT,
	BOOK_AP_TESTAMENT,
	BOOK_DEU_TESTAMENT,
} from '../../constants/books';
import {
	selectAuthenticationStatus,
	selectUserId,
	selectAudioType,
} from '../../containers/HomePage/selectors';
import {
	selectActiveTextId,
	selectBooks,
	selectActiveBookName,
	selectActiveChapter,
	selectAudioObjects,
	selectHasTextInDatabase,
	selectFilesetTypes,
	selectLoadingBookStatus,
} from './selectors';
import { selectTextDirection } from '../../containers/Verses/selectors';

export class BooksTable extends React.PureComponent {
	constructor(props) {
		super(props);
		// eslint-disable-line react/prefer-stateless-function
		this.state = {
			selectedBookName:
				this.props.initialBookName || this.props.activeBookName || '',
			updateScrollTop: false,
		};
	}

	componentDidMount() {
		if (this.button && this.container) {
			this.container.scrollTop = this.button.offsetTop - 54 - 10;
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.active !== this.props.active && this.props.active) {
			this.setState({ selectedBookName: this.props.activeBookName });
		}
	}

	setScrollTop = (book, positionBefore, scrollTopBefore) => {
		const positionAfter = book.parentElement.offsetTop; // not sure about parentElement

		if (positionBefore > positionAfter) {
			const newScrollTop = scrollTopBefore - (positionBefore - positionAfter);

			this.container.scrollTop = newScrollTop;
		}
	};

	handleBookClick = (e, name) => {
		typeof e.persist === 'function' && e.persist(); // eslint-disable-line no-unused-expressions
		const positionBefore = e.target.parentElement.offsetTop;
		const scrollTopBefore = this.container.scrollTop;

		if (this.state.selectedBookName === name) {
			this.setState(
				() => ({
					selectedBookName: '',
				}),
				() => {
					this.setScrollTop(e.target);
				},
			);
		} else {
			this.setState(
				() => ({
					selectedBookName: name,
				}),
				() => {
					this.setScrollTop(e.target, positionBefore, scrollTopBefore);
				},
			);
		}
	};

	handleChapterClick = () => {
		sessionStorage.setItem('bible_is_maintain_location', JSON.stringify(true));
		this.props.closeBookTable();
	};

	handleRef = (el, name) => {
		this[name] = el;
	};

	renderBooksTestament = (books, prefix, title) => {
		const { audioType, activeTextId, activeChapter, activeBookName } =
			this.props;
		const { selectedBookName } = this.state;

		return (
			<BooksTestament
				books={books}
				testamentPrefix={prefix}
				testamentTitle={title}
				selectedBookName={selectedBookName}
				handleRef={this.handleRef}
				handleBookClick={this.handleBookClick}
				handleChapterClick={this.handleChapterClick}
				audioType={audioType}
				activeBookName={activeBookName}
				activeTextId={activeTextId}
				activeChapter={activeChapter}
			/>
		);
	};

	render() {
		const { books, loadingBooks, textDirection } = this.props;

		if (loadingBooks) {
			return <LoadingSpinner />;
		}
		return (
			<div
				className={
					textDirection === 'rtl'
						? 'chapter-selection-section rtl'
						: 'chapter-selection-section'
				}
			>
				<div
					ref={(el) => this.handleRef(el, 'container')}
					className="book-container"
				>
					{books.get(BOOK_OLD_TESTAMENT) &&
						this.renderBooksTestament(
							books.get(BOOK_OLD_TESTAMENT),
							'ot',
							'Old Testament',
						)}
					{books.get(BOOK_NEW_TESTAMENT) &&
						this.renderBooksTestament(
							books.get(BOOK_NEW_TESTAMENT),
							'nt',
							'New Testament',
						)}
					{(books.get(BOOK_AP_TESTAMENT) || books.get(BOOK_DEU_TESTAMENT)) &&
						this.renderBooksTestament(
							books.get(BOOK_AP_TESTAMENT) || books.get(BOOK_DEU_TESTAMENT),
							'dc',
							'Deuterocanon',
						)}
					{books.get(BOOK_COVENANT_TESTAMENT) &&
						this.renderBooksTestament(
							books.get(BOOK_COVENANT_TESTAMENT),
							'cv',
							'Covenant Films',
						)}
				</div>
			</div>
		);
	}
}

BooksTable.propTypes = {
	closeBookTable: PropTypes.func,
	books: PropTypes.object,
	audioType: PropTypes.string,
	activeTextId: PropTypes.string,
	activeBookName: PropTypes.string,
	initialBookName: PropTypes.string,
	textDirection: PropTypes.string,
	activeChapter: PropTypes.number,
	loadingBooks: PropTypes.bool,
	active: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
	books: selectBooks(),
	activeTextId: selectActiveTextId(),
	activeBookName: selectActiveBookName(),
	activeChapter: selectActiveChapter(),
	audioObjects: selectAudioObjects(),
	hasTextInDatabase: selectHasTextInDatabase(),
	filesetTypes: selectFilesetTypes(),
	loadingBooks: selectLoadingBookStatus(),
	userAuthenticated: selectAuthenticationStatus(),
	userId: selectUserId(),
	audioType: selectAudioType(),
	// Verses selector
	textDirection: selectTextDirection(),
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(BooksTable);
