import axios from 'axios';
import getAudioAsyncCall from '../getAudioAsyncCall';
import {
	engesv,
	ntpotp,
	seawbt,
	filesets3,
	filesets4,
	filesets5,
	filesets6,
	filesets7,
	filesets8,
} from '../testUtils/filesetsForAudioCall';

/**
 * Mock apiProxy using real API calls
 * This fetches actual audio file paths from the DBP API and caches them
 */
jest.mock('../apiProxy', () => {
	const realApiCache = new Map();

	const mockApiProxy = {
		get: jest.fn(async (endpoint, params = {}) => {
			// Build cache key from endpoint and params
			const queryString = new URLSearchParams(params).toString();
			const cacheKey = `${endpoint}?${queryString}`;

			// Return cached responses if available
			if (realApiCache.has(cacheKey)) {
				return realApiCache.get(cacheKey);
			}

			// Build request to real API
			const baseUrl = process.env.BASE_API_ROUTE || 'https://api.digitalbibleplatform.com';
			const apiKey = process.env.DBP_API_KEY;

			// Build query string from params
			const queryParams = new URLSearchParams(params);
			queryParams.append('key', apiKey);
			queryParams.append('v', '4');

			const fullUrl = `${baseUrl}${endpoint}?${queryParams.toString()}`;

			// Make real API call
			const response = await axios.get(fullUrl);

			// Cache the response - return object with data property to match apiProxy response format
			const cachedResponse = { data: response.data };
			realApiCache.set(cacheKey, cachedResponse.data);

			return cachedResponse.data;
		}),
	};

	return {
		__esModule: true,
		default: mockApiProxy,
	};
});

const types = {
	drama: 'audio_drama',
	plain: 'audio',
	ntDrama: 'N2DA',
	otDrama: 'O2DA',
	ntPlain: 'N1DA',
	otPlain: 'O1DA',
	ntPartialDrama: 'P2DA',
	otPartialDrama: 'P2DA',
	ntPartialPlain: 'P1DA',
	otPartialPlain: 'P1DA',
};

describe('Get audio async call utility function test', () => {
	it('should return expected audio object with valid parameters', async () => {
		jest.setTimeout(20000);
		const result = await getAudioAsyncCall(engesv, 'MAT', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
		expect(result.audioPaths[0].includes(types.ntDrama)).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(engesv, 'MAT', 1, types.plain);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
		expect(result.audioPaths[0].includes(types.ntPlain)).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(engesv, 'GEN', 1, types.plain);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
		expect(result.audioPaths[0].includes(types.otPlain)).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(engesv, 'GEN', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
		expect(result.audioPaths[0].includes(types.otDrama)).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(engesv, 'GEN', 1);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
		expect(result.audioPaths[0].includes(types.otDrama)).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(engesv, 'MAT', 1);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
		expect(result.audioPaths[0].includes(types.ntDrama)).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(ntpotp, 'MRK', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(ntpotp, 'GEN', 1, types.plain);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(ntpotp, 'GEN', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(ntpotp, 'MAT', 1, types.plain);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(seawbt, 'GEN', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(seawbt, 'ACT', 1, types.plain);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(filesets3, 'GEN', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(filesets4, 'MAT', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(filesets5, 'GEN', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(filesets6, 'MAT', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(filesets7, 'MAT', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(filesets8, 'GEN', 1, types.drama);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
	it('should return expected audio object with valid parameters', async () => {
		const result = await getAudioAsyncCall(
			[{ id: 'ENGESVN2DA', size: 'C', type: types.drama }],
			'GEN',
			1,
			types.drama,
		);

		expect(result).toHaveProperty('type', 'loadaudio');
		expect(result).toHaveProperty('audioPaths');
		expect(Array.isArray(result.audioPaths)).toEqual(true);
		expect(result.audioPaths.length).toBeTruthy();
	});
});
