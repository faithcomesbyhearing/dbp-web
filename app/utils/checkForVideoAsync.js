import apiProxy from './apiProxy';

export default async (filesetId, bookId, chapter) => {
	if (!filesetId) return false;

	try {
		const res = await apiProxy.get(`/bibles/filesets/${filesetId}/books`, {
			fileset_type: 'video_stream',
		});

		if (res.data) {
			const hasVideo = !!res.data.filter(
				(stream) =>
					stream.book_id === bookId && stream.chapters.includes(chapter),
			).length;

			return hasVideo;
		}
		return false;
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.log('Error checking for context', err); // eslint-disable-line no-console
		}
		return false;
	}
};
