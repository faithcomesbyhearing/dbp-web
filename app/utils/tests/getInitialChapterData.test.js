import axios from 'axios';
import getInitialChapterData from '../getInitialChapterData';

/**
 * Mock universalFetch using real API calls
 * This fetches actual data from the DBP API and caches it as mock responses
 */
jest.mock('../universalFetch', () => {
	const realApiCache = new Map();

	const mockUniversalFetch = {
		get: jest.fn(async (url) => {
			// Return cached responses if available
			if (realApiCache.has(url)) {
				return realApiCache.get(url);
			}

			try {
				// Build request to real API
				const baseUrl = process.env.BASE_API_ROUTE || 'https://api.digitalbibleplatform.com';
				const apiKey = process.env.DBP_API_KEY;

				let fullUrl = url;

				// If it's a relative path, build full API URL
				if (!url.startsWith('http')) {
					fullUrl = `${baseUrl}${url}?key=${apiKey}&v=4`;
				}

				// Make real API call
				const response = await axios.get(fullUrl);

				// Cache the response
				realApiCache.set(url, response.data);

				return response.data;
			} catch {
				// Return empty response for invalid filesets to allow graceful handling
				if (url.includes('asdf')) {
					return [];
				}
				return [];
			}
		}),
	};

	return {
		__esModule: true,
		default: mockUniversalFetch,
	};
});

const params = {
	plainFilesetIds: ['ENGESVN_ET'],
	formattedJsonFilesetIds: ['ENGESVN_ET-json'],
	formattedFilesetIds: ['ENGESVN_ET-usx'],
	bookId: 'MAT',
	chapter: 1,
};

describe('get initial chapter data utility function', () => {
	it('should return an object with three key/value pairs', async () => {
		jest.setTimeout(15000);
		const result = await getInitialChapterData(params);

		expect(result).toHaveProperty('plainText');
		expect(result).toHaveProperty('plainTextJson');
		expect(result).toHaveProperty('formattedText');
		expect(result).toHaveProperty('formattedJsonText');
	});
	it('should return correct default data with no filesets given', async () => {
		const result = await getInitialChapterData({
			...params,
			plainFilesetIds: [],
			formattedFilesetIds: [],
			formattedJsonFilesetIds: [],
		});

		expect(result).toHaveProperty('plainText', []);
		expect(result).toHaveProperty('plainTextJson', JSON.stringify({}));
		expect(result).toHaveProperty('formattedText', '');
		expect(result).toHaveProperty('formattedJsonText', '');
	});
	it('should return correct default data on errors', async () => {
		const result = await getInitialChapterData({
			...params,
			plainFilesetIds: ['asdf'],
			formattedFilesetIds: ['asdf'],
			formattedJsonFilesetIds: ['asdf'],
		});

		expect(result).toHaveProperty('plainText', []);
		expect(result).toHaveProperty('plainTextJson', JSON.stringify({}));
		expect(result).toHaveProperty('formattedText', '');
		expect(result).toHaveProperty('formattedJsonText', '');
	});
});
