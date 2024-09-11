/**
 * generator/index.js
 *
 * Exports the generators so plop knows them
 */

const fs = require('fs');
const path = require('path');
const componentGenerator = require('./component/index');
const containerGenerator = require('./container/index');
const languageGenerator = require('./language/index');

module.exports = (plop) => {
	plop.setGenerator('component', componentGenerator);
	plop.setGenerator('container', containerGenerator);
	plop.setGenerator('language', languageGenerator);
	plop.addHelper('directory', (comp) => {
		try {
			fs.accessSync(path.join(__dirname, `../../app/containers/${comp}`), fs.F_OK);
			return `containers/${comp}`;
		} catch (e) {
			/* eslint-disable no-console */
			console.error(
				'Error to have access directory',
				e,
			);
			/* eslint-enable no-console */
			return `components/${comp}`;
		}
	});
	plop.addHelper('curly', (object, open) => (open ? '{' : '}'));
};
