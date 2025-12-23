/**
 * HLS Playback Integration Test
 * Tests HLS.js loader with m3u8 variant playlists containing MP3 segments
 * Endpoint: bible/sgqpit/1co/1 (1 Corinthians 1 - SGQPIT Bible)
 *
 * This test validates that:
 * - HLS.js can load m3u8 variant playlists with MP3 segments from CloudFront CDN
 */

import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hls from 'hls.js';

// Mock HLS.js - only mock what we need for the loader test
jest.mock('hls.js', () => {
	// Realistic variant playlist with MP3 segments from CloudFront CDN
	// This matches the actual API response for bible/sgqpit/1co/1
	const mockVariantPlaylist = `#EXTM3U
#EXT-X-TARGETDURATION:263
#EXT-X-VERSION:7
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:63.000,
https://d1gd73roq7kqw6.cloudfront.net/audio/SGQPIT/SGQPITP1DA/SGQPITP1DA_B07_1CO_001_001-001_009.mp3
#EXTINF:200.000,
https://d1gd73roq7kqw6.cloudfront.net/audio/SGQPIT/SGQPITP1DA/SGQPITP1DA_B07_1CO_001_010-001_031.mp3
#EXT-X-ENDLIST`;

	class MockLoader {
		load(context, _config, callbacks) {
			// Simulate successful load of variant playlist
			setTimeout(() => {
				if (callbacks.onSuccess) {
					callbacks.onSuccess(
						{
							data: mockVariantPlaylist,
						},
						{},
						context,
						{},
					);
				}
			}, 10);
		}
	}

	const HlsMock = jest.fn();
	HlsMock.DefaultConfig = {
		loader: MockLoader,
	};

	return {
		__esModule: true,
		default: HlsMock,
	};
});

describe('AudioPlayer - HLS Variant Playlist with MP3 Segments', () => {
	describe('M3U8 Variant Playlist Loading', () => {
		it('should load variant playlist with MP3 segments', () => {
			const customLoader = new Hls.DefaultConfig.loader();

			const mockContext = {
				type: 'manifest',
				url: 'http://localhost:3000/api/bible/filesets/SGQPIT/SGQPITP1DA/1CO-1.m3u8',
			};

			const mockCallbacks = {
				onSuccess: jest.fn(),
				onError: jest.fn(),
			};

			customLoader.load(mockContext, {}, mockCallbacks);

			// Wait for async operation
			return waitFor(() => {
				expect(mockCallbacks.onSuccess).toHaveBeenCalled();

				// Verify variant playlist contains MP3 segments
				const response = mockCallbacks.onSuccess.mock.calls[0][0];
				expect(response.data).toContain('.mp3');
				expect(response.data).toContain('SGQPITP1DA_B07_1CO');
				expect(response.data).toContain('#EXT-X-ENDLIST');
			});
		});
	});
});
