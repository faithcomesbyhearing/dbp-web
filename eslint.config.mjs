// eslint.config.mjs
import eslint from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reduxSaga from 'eslint-plugin-redux-saga';

export default [
  {
    ignores: ['node_modules/**', '.next/**'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022, // ECMA Script version
      sourceType: 'module', // Enable module type (for ES modules)
      globals: {
        browser: 'readonly', // Define global variables based on environment
        node: 'readonly',
        jest: 'readonly',
        es6: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing in .js and .jsx files
        },
      },
    },
    plugins: {
      'redux-saga': reduxSaga,
      react: reactPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    // Use "airbnb" extension when "eslint-config-airbnb" has support with esling v9
    // extends: [
    //   'airbnb', // Use Airbnb style guide
    // ],
    rules: {
      ...eslint.configs.recommended.rules,
      'react/jsx-uses-react': 'error', // Handle JSX with React
      'react/jsx-uses-vars': 'error',  // Ensure no unused JSX vars
      'arrow-parens': ['error', 'always'],
      'arrow-body-style': ['error', 'as-needed'],
      'class-methods-use-this': 'off',
      'comma-dangle': ['error', 'always-multiline'],
      'no-unused-expressions': ['error', { allowTernary: true }],
      // Use "import/" rule when "eslint-plugin-import" has support with esling v9
      // 'import/imports-first': 'off',
      // 'import/newline-after-import': 'off',
      // 'import/no-dynamic-require': 'off',
      // 'import/no-extraneous-dependencies': 'off',
      // 'import/no-named-as-default': 'off',
      // 'import/no-unresolved': 'error',
      // 'import/no-webpack-loader-syntax': 'off',
      // 'import/prefer-default-export': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/label-has-for': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'no-tabs': 'off',
      'no-else-return': 'off',
      indent: 'off',
      'no-mixed-spaces-and-tabs': 'off',
      'max-len': 'off',
      'newline-per-chained-call': 'off',
      'no-confusing-arrow': 'off',
      'no-console': 'warn',
      'no-undef': 'off',
      'no-use-before-define': 'off',
      'prefer-template': 'error',
      'no-return-assign': 'off',
      'react/forbid-prop-types': 'off',
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      'react/jsx-indent': 'off',
      'react/jsx-indent-props': 'off',
      'react/no-danger': 'off',
      'react/jsx-fragments': 'off',
      'react/jsx-filename-extension': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/jsx-curly-brace-presence': 'off',
      'react/no-unused-state': 'off',
      'react/destructuring-assignment': 'off',
      'react/require-default-props': 'off',
      'react/require-extension': 'off',
      'react/self-closing-comp': 'off',
      'react/sort-comp': 'off',
      'react/jsx-props-no-spreading': 'off',
      'no-restricted-globals': 'off',
      'operator-linebreak': 'off',
      'object-curly-newline': 'off',
      'consistent-return': 'off',
      'prefer-destructuring': 'off',
      'implicit-arrow-linebreak': 'off',
      'function-paren-newline': 'off',
      'redux-saga/no-yield-in-race': 'error',
      'redux-saga/yield-effects': 'error',
      'require-yield': 'off',
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
  },
  
];
