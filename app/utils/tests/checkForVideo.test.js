import checkForVideo from '../checkForVideoAsync';

/**
 * Mock apiProxy with test data
 * Uses predefined test data for video filesets
 */
jest.mock('../apiProxy', () => {
	const mockApiProxy = {
		get: jest.fn(async (endpoint, params = {}) => {
			// Mock responses for video filesets
			const mockData = {
				'/bibles/filesets/ENGESVP2DV/books': {
					data: [
						{
							book_id: 'MRK',
							book_id_usfx: 'MR',
							book_id_osis: 'Mrk',
							name: 'Mark',
							testament: 'NT',
							testament_order: 2,
							book_order: 42,
							book_group: 'Gospels',
							chapters: [6, 7],
						},
					],
				},
				'/bibles/filesets/ENGNIVP2DV/books': {
					data: [
						{
							book_id: 'MAT',
							book_id_usfx: 'MT',
							book_id_osis: 'Mat',
							name: 'Matthew',
							testament: 'NT',
							testament_order: 1,
							book_order: 41,
							book_group: 'Gospels',
							chapters: [1, 2, 3],
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

// Not sure if this should depend on the api returning correctly or be mocked...
describe('check for video utility function', () => {
	it('should return true if there is video', async () => {
		const result = await checkForVideo('ENGNIVP2DV', 'MAT', 1);
		expect(result).toEqual(true);
	});
	it('should return true if there is video', async () => {
		const result = await checkForVideo('ENGESVP2DV', 'MRK', 6);
		expect(result).toEqual(true);
	});
	it('should return false if there is an invalid fileset id', async () => {
		const result = await checkForVideo('a', 'MAT', 1);
		expect(result).toEqual(false);
	});
	it('should return false if there is no fileset id', async () => {
		const result = await checkForVideo('', 'MAT', 1);
		expect(result).toEqual(false);
	});
	it('should return false if there is an invalid bookid', async () => {
		const result = await checkForVideo('ENGESVP2DV', 'aaa', 1);
		expect(result).toEqual(false);
	});
	it('should return false if the chapter does not have video', async () => {
		const result = await checkForVideo('ENGESVP2DV', 'MRK', 1);
		expect(result).toEqual(false);
	});
});
