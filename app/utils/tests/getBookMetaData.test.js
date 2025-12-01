import getBookMetadata from '../getBookMetaData';

/**
 * Mock universalFetch with test data
 * Returns realistic book metadata for different fileset types
 */
jest.mock('../universalFetch', () => {
	const mockApiProxy = {
		get: jest.fn(async (endpoint, params = {}) => {
			// Mock responses for different filesets
			const mockData = {
				'/bibles/filesets/ENGNIVN1DA/books': {
					data: [
						{
							book_id: 'MAT',
							book_id_usfx: 'MT',
							name: 'Matthew',
							testament: 'NT',
							testament_order: 1,
							book_order: 41,
							chapters: [1, 2, 3, 4, 5],
						},
						{
							book_id: 'MRK',
							book_id_usfx: 'MR',
							name: 'Mark',
							testament: 'NT',
							testament_order: 2,
							book_order: 42,
							chapters: [1, 2, 3],
						},
					],
				},
				'/bibles/filesets/ENGNIVO1DA/books': {
					data: [
						{
							book_id: 'GEN',
							book_id_usfx: 'GN',
							name: 'Genesis',
							testament: 'OT',
							testament_order: 1,
							book_order: 1,
							chapters: [1, 2, 3, 4, 5],
						},
					],
				},
				'/bibles/filesets/ENGNIVN2DA/books': {
					data: [
						{
							book_id: 'MAT',
							book_id_usfx: 'MT',
							name: 'Matthew',
							testament: 'NT',
							testament_order: 1,
							book_order: 41,
							chapters: [1, 2, 3],
						},
					],
				},
				'/bibles/filesets/ENGNIVO2DA/books': {
					data: [
						{
							book_id: 'GEN',
							book_id_usfx: 'GN',
							name: 'Genesis',
							testament: 'OT',
							testament_order: 1,
							book_order: 1,
							chapters: [1, 2, 3],
						},
					],
				},
				'/bibles/filesets/ENGNIV/books': {
					data: [
						{
							book_id: 'GEN',
							book_id_usfx: 'GN',
							name: 'Genesis',
							testament: 'OT',
							testament_order: 1,
							book_order: 1,
							chapters: [1, 2, 3, 4, 5, 6, 7],
						},
						{
							book_id: 'MAT',
							book_id_usfx: 'MT',
							name: 'Matthew',
							testament: 'NT',
							testament_order: 1,
							book_order: 41,
							chapters: [1, 2, 3, 4, 5, 6, 7],
						},
					],
				},
				'/bibles/filesets/ENGNIVP2DV/books': {
					data: [
						{
							book_id: 'MAT',
							book_id_usfx: 'MT',
							name: 'Matthew',
							testament: 'NT',
							testament_order: 1,
							book_order: 41,
							chapters: [1, 2, 3],
						},
						{
							book_id: 'MRK',
							book_id_usfx: 'MR',
							name: 'Mark',
							testament: 'NT',
							testament_order: 2,
							book_order: 42,
							chapters: [1, 2],
						},
					],
				},
			};

			console.log(`[Mock] Fetching ${endpoint} with params:`, params);

			// Return mock data if available
			if (mockData[endpoint]) {
				return mockData[endpoint];
			}

			// Return empty data for unknown endpoints
			return { data: [] };
		}),
	};

	return {
		__esModule: true,
		default: mockApiProxy,
	};
});

const idsForBookMetadata = [
	['audio', 'ENGNIVN1DA'],
	['audio', 'ENGNIVO1DA'],
	['audio_drama', 'ENGNIVN2DA'],
	['audio_drama', 'ENGNIVO2DA'],
	['text_plain', 'ENGNIV'],
	['video_stream', 'ENGNIVP2DV'],
];

describe('getBookMetaData utility function', () => {
	it('should return two arrays', async () => {
		const [filteredData, allData] = await getBookMetadata({
			idsForBookMetadata,
		});
		expect(Array.isArray(filteredData)).toEqual(true);
		expect(Array.isArray(allData)).toEqual(true);
	});
});
