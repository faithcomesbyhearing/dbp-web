const env = require('./env-config');

module.exports = {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-runtime',
    ],
    env: {
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
