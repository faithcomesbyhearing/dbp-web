/* eslint-disable */
/**
 * This script will extract the internationalization messages from all components
   and package them in the translation json files in the translations file.
 */
const fs = require('fs');
const nodeGlob = require('glob');
const { transform } = require('@babel/core');
const babelPluginFormatjs = require('babel-plugin-formatjs'); // Updated to use babel-plugin-formatjs

const animateProgress = require('./helpers/progress');
const addCheckmark = require('./helpers/checkmark');

const i18n = require('../../app/i18n');
const { DEFAULT_LOCALE } = require('../../app/containers/App/constants');

require('shelljs/global');

// Glob to match all js files except test files
const FILES_TO_PARSE = 'app/**/!(*.test).js';
const locales = i18n.appLocales;

const newLine = () => process.stdout.write('\n');

// Progress Logger
let progress;
const task = (message) => {
  progress = animateProgress(message);
  process.stdout.write(message);

  return (error) => {
    if (error) {
      process.stderr.write(error);
    }
    clearTimeout(progress);
    return addCheckmark(() => newLine());
  }
};

// Wrap async functions below into a promise
const glob = (pattern) => new Promise((resolve, reject) => {
  nodeGlob(pattern, (error, value) => (error ? reject(error) : resolve(value)));
});

const readFile = (fileName) => new Promise((resolve, reject) => {
  fs.readFile(fileName, (error, value) => (error ? reject(error) : resolve(value)));
});

const writeFile = (fileName, data) => new Promise((resolve, reject) => {
  fs.writeFile(fileName, data, (error ? reject(error) : resolve(value)));
});

// Store existing translations into memory
const oldLocaleMappings = [];
const localeMappings = [];
for (const locale of locales) {
  oldLocaleMappings[locale] = {};
  localeMappings[locale] = {};
  const translationFileName = `app/translations/${locale}.json`;
  try {
    const messages = JSON.parse(fs.readFileSync(translationFileName));
    const messageKeys = Object.keys(messages);
    for (const messageKey of messageKeys) {
      oldLocaleMappings[locale][messageKey] = messages[messageKey];
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      process.stderr.write(`There was an error loading this translation file: ${translationFileName}\n${error}`);
    }
  }
}

const extractFromFile = async (fileName) => {
  try {
    const code = await readFile(fileName);
    // Use Babel plugin to extract instances where react-intl (now FormatJS) is used
    const { metadata: result } = transform(code, {
      plugins: [[babelPluginFormatjs, { extractSourceLocation: true }]],
    });

    if (result?.['formatjs']?.messages) {
      for (const message of result['formatjs'].messages) {
        for (const locale of locales) {
          const oldLocaleMapping = oldLocaleMappings[locale][message.id];
          const newMsg = locale === DEFAULT_LOCALE ? message.defaultMessage : '';
          localeMappings[locale][message.id] = oldLocaleMapping || newMsg;
        }
      }
    }
  } catch (error) {
    process.stderr.write(`Error transforming file: ${fileName}\n${error}`);
  }
};

(async function main() {
  const memoryTaskDone = task('Storing language files in memory');
  const files = await glob(FILES_TO_PARSE);
  memoryTaskDone();

  const extractTaskDone = task('Run extraction on all files');
  await Promise.all(files.map((fileName) => extractFromFile(fileName)));
  extractTaskDone();

  mkdir('-p', 'app/translations');
  for (const locale of locales) {
    const translationFileName = `app/translations/${locale}.json`;
    try {
      const localeTaskDone = task(`Writing translation messages for ${locale} to: ${translationFileName}`);

      // Sort the translation JSON file so that git diffing is easier
      let messages = {};
      Object.keys(localeMappings[locale]).sort().forEach(function(key) {
        messages[key] = localeMappings[locale][key];
      });

      const prettified = `${JSON.stringify(messages, null, 2)}\n`;
      await writeFile(translationFileName, prettified);

      localeTaskDone();
    } catch (error) {
      process.stderr.write(`There was an error saving this translation file: ${translationFileName}\n${error}`);
    }
  }

  process.exit();
})();
   