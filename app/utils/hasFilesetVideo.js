const hasFilesetVideo = (filesets) =>
	Object.values(filesets).some((filesetBucket) =>
		filesetBucket.some((fileset) => fileset.type.includes('video')),
	);

export default hasFilesetVideo;
