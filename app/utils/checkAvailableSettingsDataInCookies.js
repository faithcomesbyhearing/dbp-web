export default function checkAvailableSettingsDataInCookies(data) {
	return (
		data.bible_is_theme ||
		data.bible_is_font_family ||
		data.bible_is_font_size ||
		data.bible_is_userSettings_toggleOptions_readersMode_active ||
		data.bible_is_userSettings_toggleOptions_justifiedText_active ||
		data.bible_is_userSettings_toggleOptions_justifiedText_active ||
		data.bible_is_userSettings_toggleOptions_crossReferences_active ||
		data.bible_is_userSettings_toggleOptions_oneVersePerLine_active
	);
}
