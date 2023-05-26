const env = require('./env-config');

module.exports = {
	env: {
		development: {
			presets: ['next/babel'],
			plugins: ['lodash', ['transform-define', env]],
		},
		production: {
			presets: ['next/babel'],
			plugins: ['lodash', ['transform-define', env]],
		},
		test: {
			presets: [
				'@babel/preset-env',
				'@babel/preset-react',
			],
			plugins: [
				'lodash',
				['transform-define', env],
				'@babel/plugin-transform-runtime',
				'@babel/plugin-proposal-class-properties',
			],
		},
	},
};
