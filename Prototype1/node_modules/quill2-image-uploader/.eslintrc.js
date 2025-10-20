/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-prettier',
  ],
  env: {
    'vue/setup-compiler-macros': true,
  },
  rules: {
    'no-prototype-builtins': 'off',
    'linebreak-style': ['error', 'windows'],
    'vue/require-default-prop': 'off',
    semi: ['error', 'never'],
    'global-require': 'off',
    'no-plusplus': 'off',
    'constructor-super': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'no-param-reassign': 'off',
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { multiline: true, consistent: true },
        ObjectPattern: { multiline: true, consistent: true },
      },
    ],

    'prettier/prettier': [
      'error',
      {
        tabWidth: 2,
        singleQuote: true,
        printWidth: 80,
        bracketSpacing: true,
        semi: false,
        trailingComma: 'all',
        endOfLine: 'auto',
        useTabs: false,
      },
    ],
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  parser: 'vue-eslint-parser',
}
