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

export const applyFontFamilyToClass = async (name, className) => {
  if (name) {
    const existingClassStyle = document.querySelector(`style[${DATA_FONT_CLASS_FAMILY_ID}="${className}"]`);
    if (existingClassStyle) {
      return;
    }

    // Apply the new font family to the specific class
    const classStyle = document.createElement('style');
    classStyle.setAttribute(DATA_FONT_CLASS_FAMILY_ID, className); // Identifier for class-specific style
    classStyle.appendChild(document.createTextNode(`
      .${className} .chapter {
      font-family: '${name}';
      }
    `));
    document.head.appendChild(classStyle);
  }
};

export const removeFontFamily = (className) => {
  const styleSheets = Array.from(document.styleSheets);

  styleSheets.forEach((styleSheet) => {
    try {
      const rules = Array.from(styleSheet.cssRules);

      const ruleIndex = rules.findIndex(
        (rule) => rule.selectorText === `.${className}` && rule.style.fontFamily
      );

      if (ruleIndex !== -1) {
        styleSheet.deleteRule(ruleIndex);
      }
    } catch (error) {
      console.warn('Unable to access stylesheet:', error); // eslint-disable-line no-console
    }
  });

  // Remove the class-specific font-family rule
  const classStyleElement = document.querySelector(`style[${DATA_FONT_CLASS_FAMILY_ID}="${className}"]`);
  if (classStyleElement) {
    classStyleElement.parentNode.removeChild(classStyleElement);
  }

  // Remove the name-specific font-family rule
  const fontStyleElement = document.querySelector(`style[${DATA_FONT_NAME_FAMILY_ID}="${className}"]`);
  if (fontStyleElement) {
    fontStyleElement.parentNode.removeChild(fontStyleElement);
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

export const injectFont = (font) => {
  // Check if the font has already been injected
  const existingFontStyle = document.querySelector(`style[${DATA_FONT_NAME_FAMILY_ID}="${font.name}"]`);
  if (existingFontStyle) {
    return;
  }

  const fontFace = `
    @font-face {
    font-family: '${font.name}';
    src: url(data:font/${font.type};base64,${font.data}) format('${font.type}');
    font-weight: normal;
    font-style: normal;
    }
  `;

  const style = document.createElement('style');
  style.setAttribute(DATA_FONT_NAME_FAMILY_ID, font.name); // Add a unique identifier to the style element
  style.appendChild(document.createTextNode(fontFace));
  document.head.appendChild(style);
};
