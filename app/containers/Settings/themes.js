import customThemes from '../../../theme_config/theme.json';
import customFonts from '../../../theme_config/fonts.json';
import customFontSizes from '../../../theme_config/fontSize.json';

export const paper = customThemes.customLightTheme;

export const dark = customThemes.customDarkTheme;

export const red = customThemes.customColoredTheme;

export const themes = {
	paper,
	dark,
	red,
};

export const fonts = {
	sans: customFonts.sans,
	serif: customFonts.serif,
	slab: customFonts.slab,
};

export const sizes = {
	0: customFontSizes.smallest,
	18: customFontSizes.small,
	42: customFontSizes.medium,
	69: customFontSizes.large,
	100: customFontSizes.largest,
};

export const toggleWordsOfJesus = (state) => {
	document.documentElement.style.setProperty(
		'--application-words-of-jesus',
		state ? '#A00' : 'inherit',
	);
	document.cookie = `bible_is_words_of_jesus=${state};path=/`;
};

export const applyFontFamily = (fontFamily) => {
	document.documentElement.style.setProperty(
		'--application-font-family',
		fonts[fontFamily],
	);
	document.cookie = `bible_is_font_family=${fontFamily};path=/`;
};

export const applyFontSize = (fontSize) => {
	document.documentElement.style.setProperty(
		'--application-base-font-size',
		sizes[fontSize],
	);
	document.cookie = `bible_is_font_size=${fontSize};path=/`;
};

const DATA_FONT_CLASS_FAMILY_ID = 'data-font-class-bible-is';
const DATA_FONT_NAME_FAMILY_ID = 'data-font-name-bible-is';

export const MAIN_TEXT_WRAPPER_CLASS = 'main-text-wrapper';

export const applyFontFamilyToClass = async (name, className) => {
	if (name) {
		const existingClassStyle = document.querySelector(
			`style[${DATA_FONT_CLASS_FAMILY_ID}="${className}"]`,
		);
		if (existingClassStyle) {
			return;
		}

		// Apply the new font family to the specific class
		const classStyle = document.createElement('style');
		classStyle.setAttribute(DATA_FONT_CLASS_FAMILY_ID, className); // Identifier for class-specific style
		classStyle.appendChild(
			document.createTextNode(`
      .${className} .chapter {
      font-family: '${name}';
      }
    `),
		);
		document.head.appendChild(classStyle);
	}
};

export const removeFontFamily = (className) => {
	// 1. Find the style tag that contains the font rule for the given class.
	const classStyleTag = document.querySelector(
		`[${DATA_FONT_CLASS_FAMILY_ID}="${className}"]`,
	);
	let fontName = null;

	if (classStyleTag) {
		// 2. If found, get the font-family from the first CSS rule in this style tag.
		const sheet = classStyleTag.sheet; // CSSStyleSheet object for this style element
		if (sheet && sheet.cssRules.length > 0) {
			const rule = sheet.cssRules[0]; // the CSS rule (for .<className>)
			if (rule?.style?.fontFamily) {
				// Extract the first font name (strip quotes and any fallback fonts after a comma).
				fontName = rule.style.fontFamily
					.split(',')[0]
					.trim()
					.replace(/(^['"]+|['"]+$)/g, '');
			}
		}
		// Remove the class-specific style element from the DOM.
		classStyleTag.parentNode.removeChild(classStyleTag);
	}

	// 3. If a font name was determined, find the corresponding @font-face style tag and remove it.
	if (fontName) {
		const fontFaceTag = document.querySelector(
			`[${DATA_FONT_NAME_FAMILY_ID}="${fontName}"]`,
		);
		if (fontFaceTag) {
			fontFaceTag.parentNode.removeChild(fontFaceTag);
		}
	}
};

export const applyTheme = (theme) => {
	if (themes[theme]) {
		Object.entries(themes[theme]).forEach((property) => {
			document.documentElement.style.setProperty(property[0], property[1]);
		});
		document.cookie = `bible_is_theme=${theme};path=/`;
	}
};


/**
 * Injects a base64‐encoded font into the document, but first verifies
 * that the browser can actually load & render it.
 *
 * @param  {object} font
 * @param  {string} font.name  — the CSS font‐family name
 * @param  {string} font.type  — the file type (e.g. 'woff2')
 * @param  {string} font.data  — base64 payload
 * @returns {Promise<boolean>} — true if the font was injected & loaded
 */
export async function injectFont(font) {
	const { name, type, data } = font;
	if (!name || !type || !data) return false;

	// 1 Don’t re-inject
	if (document.querySelector(`style[${DATA_FONT_NAME_FAMILY_ID}="${name}"]`)) {
		return true;
	}

  	// Pick a more standard MIME for woff2/woff/ttf:
  	const formatMap = {
		woff2: "woff2",
		woff:  "woff",
		ttf:   "truetype",
		otf:   "opentype",
	};
	const mimeMap = {
		woff2: "application/font-woff2",
		woff:  "application/font-woff",
		ttf:   "font/ttf",
		otf:   "font/otf",
	};

	const mime = mimeMap[type] || `font/${type}`;
	const fmt  = formatMap[type] || type;
	// Helper to inject a <style> fallback
	const css = `
		@font-face {
		font-family: '${name}';
		src: url("data:${mime};base64,${data}") format('${fmt}');
		font-weight: normal;
		font-style: normal;
		}
	`;
	const fallbackStyle = () => {
		const s = document.createElement('style');
		s.setAttribute(DATA_FONT_NAME_FAMILY_ID, name);
		s.textContent = css;
		document.head.appendChild(s);
		return s;
	};

  	// 2 Try FontFace API with data URI (correct MIME)
	if ('FontFace' in window && document.fonts?.add) {
		try {
		const face = new FontFace(
			name,
			`url("data:${mime};base64,${data}") format('${fmt}')`,
		);
		await face.load();
		document.fonts.add(face);

		if (document.fonts.check(`1em "${name}"`)) {
			return true;
		}
		// If check fails, fall through to binary path
		} catch (err) {
			console.warn(`FontFace(data URI) failed for "${name}":`, err); // eslint-disable-line no-console
			// continue to next strategy
		}

		// 3 Try FontFace API with raw binary
		try {
		// decode base64 to ArrayBuffer
			const binary = Uint8Array.from(
				atob(data),
				(c) => c.charCodeAt(0),
			);
			const face = new FontFace(name, binary);
			await face.load();
			document.fonts.add(face);
			if (document.fonts.check(`1em "${name}"`)) {
				return true;
			}
		} catch (err) {
			console.warn(`FontFace(binary) failed for "${name}":`, err); // eslint-disable-line no-console
		}
  	}

	// 4 Final fallback: inject CSS and hope for the best
	const styleEl = fallbackStyle();

	// give the browser a moment to recognize the @font-face
	await new Promise((r) => setTimeout(r, 100));

	// quick canvas‐width test
	const test = 'abcdefghijklmnopqrstuvwxyz';
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	ctx.font = '16px serif';
	const fallbackWidth = ctx.measureText(test).width;

	ctx.font = `16px "${name}", serif`;
	const customWidth = ctx.measureText(test).width;

	if (customWidth !== fallbackWidth) {
		return true;
	}

	// it didn’t actually load; clean up
	styleEl.remove();
	return false;
}
