import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { fromJS } from 'immutable';
import VersionListSection from '..'; // Assuming the path is correct
import {
	itemsParser,
	filterFunction,
	getTexts,
} from './versionListSectionUtils';

const filterText = '';
const activeTextId = 'ENGESV';
const activeBookId = 'MAT';
const activeChapter = 1;

const items = [
	{
		path: { textId: 'ENGESV', bookId: 'MAT', chapter: 1 },
		key: 'ENGESV2001',
		className: '',
		title: 'English Standard Version',
		text: 'English Standard Version',
		altText: '',
		types: {
			audio_drama: true,
			text_plain: true,
			audio: true,
			text_format: true,
		},
		clickHandler: jest.fn(),
	},
	{
		path: { textId: 'ENGNIV', bookId: 'MAT', chapter: 1 },
		key: 'ENGNIV1978',
		className: 'active-version',
		title: 'New International Version',
		text: 'New International Version',
		altText: '',
		types: {
			text_plain: true,
			audio: true,
			audio_drama: true,
			video_stream: true,
		},
		clickHandler: jest.fn(),
	},
	{
		path: { textId: 'ENGKJV', bookId: 'MAT', chapter: 1 },
		key: 'ENGKJV1611',
		className: '',
		title: 'King James Version',
		text: 'King James Version',
		altText: '',
		types: { audio: true, audio_drama: true, text_plain: true },
		clickHandler: jest.fn(),
	},
	{
		path: { textId: 'ENGNAB', bookId: 'MAT', chapter: 1 },
		key: 'ENGNAB1970',
		className: '',
		title: 'New American Bible',
		text: 'New American Bible',
		altText: '',
		types: { text_format: true, audio_drama: true, text_plain: true },
		clickHandler: jest.fn(),
	},
	{
		path: { textId: 'ENGWEB', bookId: 'MAT', chapter: 1 },
		key: 'ENGWEB1997',
		className: '',
		title: 'World English Bible',
		text: 'World English Bible (Hosanna audio)',
		altText: 'World English Bible',
		types: { text_plain: true, text_format: true, audio_drama: true },
		clickHandler: jest.fn(),
	},
	{
		path: { textId: 'ENGWWH', bookId: 'MAT', chapter: 1 },
		key: 'ENGWWH1997',
		className: '',
		title: 'World English Bible (Afred Henson)',
		text: 'World English Bible (Afred Henson)',
		altText: '',
		types: { audio_drama: true, text_plain: true },
		clickHandler: jest.fn(),
	},
	{
		path: { textId: 'ENGNIVA', bookId: 'MAT', chapter: 1 },
		key: 'ENGNIVAnull',
		className: '',
		title: 'New International Version (Anglicised)',
		text: 'New International Version (Anglicised)',
		altText: '',
		types: { audio_drama: true, audio: true, text_plain: true },
		clickHandler: jest.fn(),
	},
];

describe('<VersionListSection />', () => {
	it('Should match previous snapshot with valid props', () => {
		const { asFragment, queryAllByText } = render(<VersionListSection items={items} />);

		// Check if accordion items are rendered
		expect(queryAllByText('Non-Dramatized Version').length).toEqual(4); // Update the number based on the expected count of buttons
		expect(queryAllByText('Dramatized Version').length).toEqual(4); // Update the number based on the expected count of buttons

		// Ensure the snapshot matches
		expect(asFragment()).toMatchSnapshot();
	});

	it('Should match previous snapshot using data from API', async () => {
		const apiItems = await getTexts({ languageCode: 6414 });

		const sectionItems = itemsParser(
			fromJS(apiItems),
			activeTextId,
			activeBookId,
			activeChapter,
			filterText,
			filterFunction,
			(bible, audioType) => `${bible}_${audioType}`,
		);

		const { asFragment } = render(<VersionListSection items={sectionItems} />);

		// Ensure the snapshot matches
		expect(asFragment()).toMatchSnapshot();
	});

	it('Should handle clicking on audio drama button', () => {
		const { queryAllByText } = render(<VersionListSection items={items} />);

		// Simulate clicking the "Dramatized Version" button
		const audioDramaButtons = queryAllByText('Dramatized Version');
		fireEvent.click(audioDramaButtons[0]);

		// Verify that the clickHandler was called
		expect(items[0].clickHandler).toHaveBeenCalledWith('audio_drama');
	});

	it('Should handle clicking on non-dramatized version button', () => {
		const { queryAllByText } = render(<VersionListSection items={items} />);

		// Simulate clicking the "Non-Dramatized Version" button
		const nonDramatizedButtons = queryAllByText('Non-Dramatized Version');
		fireEvent.click(nonDramatizedButtons[0]);

		// Verify that the clickHandler was called
		expect(items[0].clickHandler).toHaveBeenCalledWith('audio');
	});

	it('Should match previous snapshot using data from api and language ID 17045 English: USA', async () => {
		const apiItems = await getTexts({ languageCode: 17045 });

		const sectionItems = itemsParser(
			fromJS(apiItems),
			activeTextId,
			activeBookId,
			activeChapter,
			filterText,
			filterFunction,
			(bible, audioType) => `${bible}_${audioType}`,
		);

		const { container } = render(<VersionListSection items={sectionItems} />);
		const bibles = container.querySelectorAll('.accordion-body-style');
		expect(bibles.length).toEqual(3);
	});
});
