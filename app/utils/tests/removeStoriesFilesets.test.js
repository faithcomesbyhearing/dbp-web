import removeStoriesFilesets from '../removeStoriesFilesets';
import { FILESET_SIZE_STORIES } from '../../constants/bibleFileset';

const setTypesAllowed = { text_plain: true, audio: true };
const ids = (filesets) => filesets.map((fileset) => fileset.id);

describe('removeStoriesFilesets', () => {
	it('drops a stories fileset when there is more than one fileset', () => {
		const filesets = [
			{ id: 'NT_TEXT', type: 'text_plain', size: 'NT' },
			{ id: 'STORIES_AUDIO', type: 'audio', size: FILESET_SIZE_STORIES },
			{ id: 'OT_AUDIO', type: 'audio', size: 'OT' },
		];
		expect(ids(removeStoriesFilesets(filesets, setTypesAllowed))).toEqual([
			'NT_TEXT',
			'OT_AUDIO',
		]);
	});

	it('drops a fileset whose type is not allowed when there is more than one fileset', () => {
		const filesets = [
			{ id: 'NT_TEXT', type: 'text_plain', size: 'NT' },
			{ id: 'NT_VIDEO', type: 'video_stream', size: 'NT' },
		];
		expect(ids(removeStoriesFilesets(filesets, setTypesAllowed))).toEqual([
			'NT_TEXT',
		]);
	});

	it('keeps a lone fileset, even a stories fileset of a type not allowed', () => {
		const filesets = [
			{ id: 'STORIES_VIDEO', type: 'video_stream', size: FILESET_SIZE_STORIES },
		];
		expect(ids(removeStoriesFilesets(filesets, setTypesAllowed))).toEqual([
			'STORIES_VIDEO',
		]);
	});

	it('returns an empty list for no filesets', () => {
		expect(removeStoriesFilesets([], setTypesAllowed)).toEqual([]);
	});
});
