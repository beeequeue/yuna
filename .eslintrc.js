module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', '@vue/prettier', '@vue/typescript'],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    'prettier/prettier': 'off',
    'no-extra-boolean-cast': 'off',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      { overrides: { constructors: 'no-public' } },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'as' },
    ],
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    warnOnUnsupportedTypeScriptVersion: false,
    project: './tsconfig.json',
  },
}
