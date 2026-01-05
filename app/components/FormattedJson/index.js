/**
 *
 * FormattedJson Component
 *
 */
import React, { useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getItemClasses } from './styles';
import {
	calculateVerseProps,
	findSubtypeRecursively,
	extractTextRecursive,
	extractFootnotesWithIndexKey,
} from '../../containers/Text/formattedJsonUtils';

/**
 * RenderContentItem
 * Recursively renders content items, handling strings and objects differently.
 * Handles verse labels, chapter labels, footnotes, and other markers.
 */
const RenderContentItem = React.memo(
	({
		item,
		bookCode, // Receive bookCode
		currentVerseNumberInScope, // Scope passed from PARENT or preceding sibling
		currentChapterNumberInScope,
		// Other state/props passed down
		currentPlayingVerse,
		currentSelectedVerse, // Needed for verseId fallback in original code? Review this.
		annotations,
		// Event handlers passed down
		onVerseClick,
		onVerseMouseDown,
		onVerseMouseUp,
		onNoteClick,
		onBookmarkClick,
		onFootnoteClick,
		fontSize,
		blockIndex,
		itemIndex, // Unique identifier for this item instance
		activeVerseInfo,
	}) => {
		if (!item) return null;

		// --- Handle Strings ---
		if (typeof item === 'string') {
			// Construct verseId using the *correct* scope passed to this instance
			// Using the format from your index_js.txt (note the fallback to currentSelectedVerse, ensure this logic is intended)
			const verseId =
				bookCode && currentChapterNumberInScope && currentVerseNumberInScope
					? `${bookCode}${currentChapterNumberInScope}_${currentVerseNumberInScope}`
					: null; // Removed fallback to currentSelectedVerse here for clarity, add back if specifically needed for strings

			const verseProps = calculateVerseProps(
				currentVerseNumberInScope,
				currentPlayingVerse,
				currentSelectedVerse,
				annotations,
			);
			// Only clickable/selectable if within a valid verse scope
			const isClickable =
				verseProps.isSelectable && !!currentVerseNumberInScope;
			const highlightColor = verseProps.highlightData?.highlighted_color;
			const classes = getItemClasses(null, {
				isSelectable: isClickable,
				isPlaying: verseProps.isPlaying,
				highlightColor: !!highlightColor,
				isActive: activeVerseInfo?.verse === currentVerseNumberInScope,
			});
			const inlineStyle = highlightColor
				? { backgroundColor: highlightColor }
				: {};
			const verseInfo = isClickable
				? {
						chapter: currentChapterNumberInScope,
						verse: currentVerseNumberInScope,
					}
				: null;

			return (
				<span
					className={classes}
					style={inlineStyle}
					data-id={verseId} // Add data-id
					data-verse-number={currentVerseNumberInScope} // Add verse number
					onMouseDown={
						isClickable ? (e) => onVerseMouseDown(e, verseInfo) : undefined
					}
					onMouseUp={
						isClickable ? (e) => onVerseMouseUp(e, verseInfo) : undefined
					}
					onClick={isClickable ? (e) => onVerseClick(e, verseInfo) : undefined}
				>
					{item}
				</span>
			);
		}

		let verseNumber = currentVerseNumberInScope; // Verse scope for THIS item
		let chapterNumber = currentChapterNumberInScope; // Chapter scope for THIS item
		let ElementType = 'span';
		let isVerseLabel = false;
		let isChapterLabel = false;
		let isFootnote = false;
		let isXref = false;

		// Update scope based on THIS item's type/subtype
		if (item?.subtype === 'verses_label' && item?.atts?.number) {
			verseNumber = parseInt(item.atts.number, 10);
			isVerseLabel = true;
			ElementType = 'span';
		} else if (item?.subtype === 'chapter_label' && item?.atts?.number) {
			chapterNumber = parseInt(item.atts.number, 10);
			isChapterLabel = true;
			ElementType = 'h1'; // Or other prominent tag
		} else if (item?.subtype === 'footnote') {
			isFootnote = true;
			ElementType = 'sup';
		} else if (item?.subtype === 'xref') {
			isXref = true;
			ElementType = 'sup';
		} else if (
			['usfm:p', 'usfm:m', 'usfm:pi', 'usfm:q', 'usfm:q1', 'usfm:q2'].includes(
				item.subtype,
			)
		) {
			ElementType = 'p';
		} else if (
			[
				'usfm:mt1',
				'usfm:mt',
				'usfm:s',
				'usfm:s1',
				'usfm:ms',
				'title',
				'heading',
			].includes(item.subtype)
		) {
			ElementType = 'div';
			// Adjust H levels later or via CSS
		} else if (item.subtype === 'usfm:b') {
			return <div className="verse-blank-line" />;
		}

		const verseId =
			bookCode && chapterNumber && (verseNumber ?? currentSelectedVerse)
				? `${bookCode}${chapterNumber}_${verseNumber ?? currentSelectedVerse}`
				: null;

		const verseProps = calculateVerseProps(
			verseNumber,
			currentPlayingVerse,
			currentSelectedVerse,
			annotations,
		);
		const highlightColor = verseProps.highlightData?.highlighted_color;
		// Pass verseProps for class generation
		const classes = getItemClasses(item, {
			...verseProps,
			highlightColor: !!highlightColor,
		});
		const inlineStyle = highlightColor
			? { backgroundColor: highlightColor }
			: {};
		// Ensure key is unique, incorporating itemIndex which is now more detailed
		const key = `item-${blockIndex}-${itemIndex}-${item.subtype || item.type}-${
			verseId || chapterNumber
		}`;

		if (isVerseLabel) {
			const verseInfo = { chapter: chapterNumber, verse: verseNumber };
			// Use verseId constructed above for this specific label
			return (
				<ElementType // span
					key={key}
					className={classes} // Includes verse-number-label
					style={inlineStyle}
					data-verse-number={verseNumber}
					data-id={verseId} // Add data-id HERE
					onMouseDown={(e) => onVerseMouseDown(e, verseInfo)}
					onMouseUp={(e) => onVerseMouseUp(e, verseInfo)}
					onClick={(e) => onVerseClick(e, verseInfo)}
				>
					{/* Icons using SVG */}
					{verseProps.hasNote && (
						<svg
							className="icon icon-note"
							aria-label="Note"
							onClick={(e) => {
								e.stopPropagation();
								onNoteClick(e, verseInfo);
							}}
							width="1em"
							height="1em"
						>
							<use
								xmlnsXlink="http://www.w3.org/1999/xlink"
								xlinkHref="/svglist.svg#note_in_verse"
							>
								{/* Note icon */}
							</use>
						</svg>
					)}
					{verseProps.hasBookmark && (
						<svg
							className="icon bookmark-in-verse"
							aria-label="Bookmark"
							onClick={(e) => {
								e.stopPropagation();
								onBookmarkClick(e, verseInfo);
							}}
							width="1em"
							height="1em"
						>
							<use
								xmlnsXlink="http://www.w3.org/1999/xlink"
								xlinkHref="/svglist.svg#bookmark_in_verse"
							></use>
						</svg>
					)}
					{item?.atts?.number} {/* Render the number */}
					&nbsp;
				</ElementType>
			);
		}

		if (isChapterLabel) {
			return (
				<ElementType
					key={key}
					className={classes}
					data-chapter-number={chapterNumber}
					data-id={verseId}
				>
					{item?.atts?.number}
					{/* Recursively render content if chapter label has nested content? Optional. */}
				</ElementType>
			);
		}

		if (isFootnote || isXref) {
			let marker = '?'; // Default marker
			let footnoteText = '';

			try {
				// Extract content based on the observed graft structure
				const footnoteBlockContent = item.sequence?.blocks?.[0]?.content;

				if (Array.isArray(footnoteBlockContent)) {
					// Find Caller (assuming it's always the '+' inside note_caller graft)
					const callerGraft = footnoteBlockContent.find(
						(c) => c?.type === 'graft' && c?.subtype === 'note_caller',
					);
					// Extract deeply nested caller symbol
					marker = callerGraft?.sequence?.blocks?.[0]?.content?.[0] || marker;

					// Find Text Wrapper (usfm:ft)
					const textWrapper = footnoteBlockContent.find(
						(c) => c?.type === 'wrapper' && c?.subtype === 'usfm:ft',
					);
					if (textWrapper?.content) {
						footnoteText = extractTextRecursive(textWrapper.content);
					}
				}
			} catch (e) {
				console.error('Error parsing footnote graft structure:', e, item); // eslint-disable-line no-console
			}

			// Information to pass to the click handler
			const footnoteIdForHandler = `fn-${footnoteText.replace(/\s+/g, '_')}`;
			// Since text is available, we pass it directly. No need for ID lookup.
			const clickInfo = {
				footnoteId: footnoteIdForHandler,
				caller: marker,
				text: footnoteText,
			};

			return (
				<sup
					key={key} // Ensure unique key
					className={classes} // Apply classes ('verse-content-item', 'verse-footnote-marker')
					title={footnoteText || 'Footnote'} // Show full text on hover
					onClick={(e) => {
						e.stopPropagation(); // Prevent parent clicks if necessary
						onFootnoteClick(e, clickInfo); // Pass extracted info
					}}
					style={{ cursor: 'pointer' }} // Indicate it's clickable
				>
					{marker} {/* Display the extracted marker ('+') */}
				</sup>
			);
		}

		const renderChildren = () => {
			const contentArray = item.content; // Content of THIS item
			// Initialize tracker with the verse scope determined for THIS item
			let lastSeenVerseInContent = verseNumber;
			const childrenElements = [];

			if (!Array.isArray(contentArray)) {
				return null;
			}
			// Iterate over children of this item
			contentArray.forEach((childItemData, index) => {
				// const childItemData = contentArray[i];
				// Verse scope for this child defaults to the last seen number
				let verseScopeForChild = lastSeenVerseInContent;

				// Check if this child item *is* a verse label to update scope for *next* siblings
				if (
					typeof childItemData === 'object' &&
					childItemData?.subtype === 'verses_label' &&
					childItemData?.atts?.number
				) {
					const currentChildVerseNumber = parseInt(
						childItemData.atts.number,
						10,
					);
					// The label uses its own number for its scope
					verseScopeForChild = currentChildVerseNumber;
					// Update tracker for subsequent siblings
					lastSeenVerseInContent = currentChildVerseNumber;
				}
				// If it's a string or other object, it uses the tracked verseScopeForChild
				const childKey = `child-${itemIndex}-${index}`;
				childrenElements.push(
					<RenderContentItem
						// Use a more detailed key combining parent itemIndex and child index
						key={childKey}
						item={childItemData}
						bookCode={bookCode}
						// Pass the correctly tracked verse scope for THIS child
						currentVerseNumberInScope={verseScopeForChild}
						// Chapter scope is passed down
						currentChapterNumberInScope={chapterNumber}
						// Pass down all other necessary props
						currentPlayingVerse={currentPlayingVerse}
						currentSelectedVerse={currentSelectedVerse} // Pass down for potential use in verseId fallback or props calc
						annotations={annotations}
						onVerseClick={onVerseClick}
						onVerseMouseDown={onVerseMouseDown}
						onVerseMouseUp={onVerseMouseUp}
						onNoteClick={onNoteClick}
						onBookmarkClick={onBookmarkClick}
						onFootnoteClick={onFootnoteClick}
						fontSize={fontSize}
						blockIndex={blockIndex} // Keep original blockIndex from parent
						itemIndex={`${itemIndex}-${index}`} // Create nested itemIndex string
					/>,
				);
			});
			return childrenElements;
		};

		return (
			<ElementType
				key={key}
				className={classes}
				style={inlineStyle}
				data-id={verseId}
				data-verse-number={verseNumber}
			>
				{renderChildren()}
			</ElementType>
		);
	},
);

RenderContentItem.propTypes = {
	item: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
	bookCode: PropTypes.string,
	currentVerseNumberInScope: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
	]),
	currentChapterNumberInScope: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
	]),
	currentPlayingVerse: PropTypes.any,
	currentSelectedVerse: PropTypes.any,
	annotations: PropTypes.object,
	onVerseClick: PropTypes.func,
	onVerseMouseDown: PropTypes.func,
	onVerseMouseUp: PropTypes.func,
	onNoteClick: PropTypes.func,
	onBookmarkClick: PropTypes.func,
	onFootnoteClick: PropTypes.func,
	fontSize: PropTypes.number,
	blockIndex: PropTypes.number,
	itemIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	activeVerseInfo: PropTypes.object,
};

function FormattedJson({
	userNotes,
	bookmarks,
	highlights,
	userSettings,
	activeVerseInfo,
	activeChapter, // Prop from parent
	activeBookId, // Prop from parent
	formattedSource, // Assuming this prop provides the JSON data now
	// Event Handlers passed from parent container:
	openFootnote,
	setFootnotes,
	handleMouseUp,
	getFirstVerse,
	handleNoteClick,
}) {
	const chapterJson = formattedSource;

	// Extract footnotes into a map with generated keys when chapterJson changes
	const footnotesMapWithIndex = useMemo(() => {
		if (chapterJson) {
			return extractFootnotesWithIndexKey(chapterJson);
		}
		return {};
	}, [chapterJson]);

	// Call setFootnotes when the map changes
	useEffect(() => {
		// Check if setFootnotes is provided and the map is not empty
		if (setFootnotes && Object.keys(footnotesMapWithIndex).length > 0) {
			// Initialize footnotes object to store extracted text
			const footnotes = {};
			Object.keys(footnotesMapWithIndex).forEach((key) => {
				const { text } = footnotesMapWithIndex[key] || {};
				footnotes[key] = text;
			});
			setFootnotes(footnotes);
		}
	}, [footnotesMapWithIndex, setFootnotes]);

	useEffect(() => {
		if (!activeVerseInfo?.verse) {
			document.querySelectorAll('.active-verse').forEach((node) => {
				node.classList.remove('active-verse');
			});
		}
	}, [activeVerseInfo]);

	// Select player/selection state from Redux store (adjust paths as needed)
	const currentPlayingVerse = useSelector(
		(state) => state.player?.currentVerse,
	);
	const currentSelectedVerse = useSelector(
		(state) => state.selection?.selectedVerse,
	);

	// Consolidate annotations
	const annotations = useMemo(
		() => ({
			notes: userNotes || [],
			bookmarks: bookmarks || [],
			highlights: highlights || [],
		}),
		[userNotes, bookmarks, highlights],
	);

	// Extract metadata (use props like activeBookId/activeChapter as fallback if needed)
	const bookCode = useMemo(
		() => chapterJson?.metadata?.document?.bookCode || activeBookId,
		[chapterJson, activeBookId],
	);

	const chapterNumberFromJson = useMemo(
		() =>
			parseInt(
				chapterJson?.metadata?.document?.properties?.chapters || '0',
				10,
			) || activeChapter,
		[chapterJson, activeChapter],
	);

	// --- Define Wrapper Handlers ---
	const handleVerseMouseDownWrapper = useCallback(
		(event, verseInfo) => {
			if (getFirstVerse && verseInfo) {
				getFirstVerse(event, verseInfo.verse);
			}
		},
		[getFirstVerse],
	);

	const handleVerseMouseUpWrapper = useCallback(
		(event) => {
			if (handleMouseUp) {
				handleMouseUp(event);
			}
		},
		[handleMouseUp],
	);

	const handleNoteIconClickWrapper = useCallback(
		(event, verseInfo) => {
			if (handleNoteClick && verseInfo) {
				event.stopPropagation();
				annotations?.notes?.forEach((annotation, index) => {
					if (annotation.verse_start === verseInfo.verse) {
						// Assuming the note click handler uses the index to identify the note
						handleNoteClick(index, false);
					}
				});
			}
		},
		[handleNoteClick, annotations],
	);

	const handleBookmarkIconClickWrapper = useCallback(
		(event, verseInfo) => {
			if (handleNoteClick && verseInfo) {
				// Assuming same handler
				event.stopPropagation();
				handleNoteClick(verseInfo, true);
			}
		},
		[handleNoteClick],
	);

	const handleFootnoteClickWrapper = useCallback(
		(event, footnoteInfo) => {
			if (openFootnote && footnoteInfo.text) {
				// Pass the extracted text and caller symbol directly
				event.stopPropagation();
				if (typeof window !== 'undefined') {
					const rightEdge = window.innerWidth - 300;
					const x = rightEdge < event.clientX ? rightEdge : event.clientX;
					openFootnote({
						id: footnoteInfo.footnoteId,
						coords: { x, y: event.clientY },
					});
				}
			} else {
				/* eslint-disable no-console */
				console.warn(
					'Cannot open footnote, missing text or handler:',
					footnoteInfo,
				);
				/* eslint-disable no-console */
			}
		},
		[openFootnote],
	);

	const justifiedText =
		userSettings?.toggleOptions?.justifiedText?.active || false;
	const fontSize = userSettings?.toggleOptions?.readersFontScale?.active || 16;

	const renderedBlocks = useMemo(() => {
		// Ensure we have the JSON data structure expected
		if (!chapterJson?.sequence?.blocks) {
			// Handle case where data might still be in old HTML format or loading
			if (typeof chapterJson?.main === 'string') {
				console.warn(
					// eslint-disable no-console
					'FormattedJson received HTML string, expected JSON object.',
				);
				// Optionally render the old HTML as a fallback during transition?
				// return <div dangerouslySetInnerHTML={{ __html: chapterJson.main }} />;
				return <div>Error: Invalid data format. Expected JSON.</div>;
			}
			return <div>Loading...</div>;
		}

		let currentChapterCtx = chapterNumberFromJson; // Use chapter number derived from JSON/props

		return chapterJson.sequence.blocks.map((block, blockIndex) => {
			if (
				['remark', 'introduction'].includes(block?.sequence?.type) ||
				block?.subtype === 'orphanTokens'
			) {
				return null;
			}

			let BlockElementType = 'div';
			const blockSubtype =
				block.subtype || (block.type === 'graft' ? block.sequence?.type : null);
			if (
				[
					'usfm:p',
					'usfm:m',
					'usfm:pi',
					'usfm:q',
					'usfm:q1',
					'usfm:q2',
				].includes(blockSubtype)
			)
				BlockElementType = 'div';
			else if (
				[
					'usfm:mt1',
					'usfm:mt',
					'usfm:s',
					'usfm:s1',
					'usfm:ms',
					'title',
					'heading',
				].includes(blockSubtype)
			)
				BlockElementType = 'div';

			const blockClasses = getItemClasses(block);
			const key = `block-${blockIndex}-${block.type}-${
				blockSubtype || block?.sequence?.type
			}`;

			const chapterLabel = findSubtypeRecursively(
				block.content,
				'chapter_label',
			);
			if (chapterLabel?.atts?.number) {
				currentChapterCtx = parseInt(chapterLabel.atts.number, 10);
			}

			const contentSource =
				block.type === 'graft' ? block.sequence?.blocks : block.content;

			const handleVerseOnClick = (event, verseInfo) => {
				// Check if verseInfo has valid chapter and verse
				if (verseInfo?.verse && verseInfo?.chapter) {
					document.querySelectorAll('.active-verse').forEach((node) => {
						if (node !== event.target) {
							node.classList.remove('active-verse');
						}
					});
					const verseId = `${bookCode}${verseInfo.chapter}_${verseInfo.verse}`;
					// Then add the class to the target element if its data-id matches the verseId
					if (event.target.dataset.id === verseId) {
						event.target.classList.add('active-verse');
					}
				}
			};
			return (
				<BlockElementType key={key} className={blockClasses}>
					{Array.isArray(contentSource) &&
						contentSource.map((item, itemIndex) => {
							const keyItem = `item-${blockIndex}-${itemIndex}`;
							return (
								<RenderContentItem
									key={keyItem}
									item={item}
									bookCode={bookCode} // Pass bookCode
									currentVerseNumberInScope={null} // Verse scope starts within item's content
									currentChapterNumberInScope={currentChapterCtx} // Pass chapter context
									currentPlayingVerse={currentPlayingVerse}
									currentSelectedVerse={currentSelectedVerse}
									annotations={annotations}
									// Pass down the wrapper handlers
									onVerseClick={handleVerseOnClick}
									onVerseMouseDown={handleVerseMouseDownWrapper}
									onVerseMouseUp={handleVerseMouseUpWrapper}
									onNoteClick={handleNoteIconClickWrapper}
									onBookmarkClick={handleBookmarkIconClickWrapper}
									onFootnoteClick={handleFootnoteClickWrapper}
									fontSize={fontSize}
									blockIndex={blockIndex}
									itemIndex={itemIndex.toString()} // Ensure itemIndex is a string for key generation
									activeVerseInfo={activeVerseInfo} // Pass active verse info if needed
								/>
							);
						})}
				</BlockElementType>
			);
		});
	}, [
		chapterJson,
		currentPlayingVerse,
		currentSelectedVerse,
		annotations,
		fontSize,
		bookCode,
		chapterNumberFromJson,
		handleVerseMouseDownWrapper,
		handleVerseMouseUpWrapper,
		handleNoteIconClickWrapper,
		handleBookmarkIconClickWrapper,
		handleFootnoteClickWrapper,
		activeVerseInfo,
	]);

	return (
		<div
			className={`chapter bible-chapter-view ${justifiedText ? 'justify' : ''}`}
			style={fontSize ? { fontSize: `${fontSize}pt` } : {}}
		>
			{renderedBlocks}
		</div>
	);
}

FormattedJson.propTypes = {
	userNotes: PropTypes.array,
	bookmarks: PropTypes.array,
	highlights: PropTypes.array,
	userSettings: PropTypes.object,
	activeVerseInfo: PropTypes.object,
	activeChapter: PropTypes.number,
	activeBookId: PropTypes.string,
	// Ensure formattedSource provides the JSON object now
	formattedSource: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // Allow string initially? Best to ensure it's object.
	// Handler Props from Parent:
	openFootnote: PropTypes.func.isRequired,
	setFootnotes: PropTypes.func,
	handleMouseUp: PropTypes.func.isRequired,
	getFirstVerse: PropTypes.func.isRequired,
	handleNoteClick: PropTypes.func.isRequired,
};

// Default export
export default FormattedJson;
