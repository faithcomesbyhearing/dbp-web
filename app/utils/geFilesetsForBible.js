const geFilesetsForBible = (filesets) => {
	const allFilesets = [];

	Object.values(filesets).forEach((filsetBucket) => {
		if (Array.isArray(filsetBucket) && filsetBucket.length > 0) {
			allFilesets.push(...filsetBucket);
		}
	});

	return allFilesets;
};

export default geFilesetsForBible;
