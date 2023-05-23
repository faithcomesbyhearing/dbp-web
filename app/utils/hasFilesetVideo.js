const hasFilesetVideo = (filesets) => filesets.some((fileset) => fileset.type.includes('video'));

export default hasFilesetVideo;
