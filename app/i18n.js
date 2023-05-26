/**
 * i18n.js
 *
 * This will setup the i18n language files and locale data for your app.
 *
 */
import { DEFAULT_LOCALE } from './containers/LanguageProvider/constants';
import enTranslationMessages from './translations/en.json';
import arTranslationMessages from './translations/ar.json';
import thTranslationMessages from './translations/th.json';
import ruTranslationMessages from './translations/ru.json';
import esTranslationMessages from './translations/es.json';

export const appLocales = ['en', 'ar', 'th', 'ru', 'es'];

export const formatTranslationMessages = (locale, messages) => {
	const defaultFormattedMessages =
		locale !== DEFAULT_LOCALE
			? formatTranslationMessages(DEFAULT_LOCALE, enTranslationMessages)
			: {};
	return Object.keys(messages).reduce((formattedMessages, key) => {
		let message = messages[key];
		if (!message && locale !== DEFAULT_LOCALE) {
			message = defaultFormattedMessages[key];
		}
		return Object.assign(formattedMessages, { [key]: message });
	}, {});
};

export const translationMessages = {
	en: formatTranslationMessages('en', enTranslationMessages),
	ar: formatTranslationMessages('ar', arTranslationMessages),
	th: formatTranslationMessages('th', thTranslationMessages),
	ru: formatTranslationMessages('ru', ruTranslationMessages),
	es: formatTranslationMessages('es', esTranslationMessages),
};
