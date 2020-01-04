module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/base',
    'plugin:vue/essential',
    'plugin:vue/recommended',
    '@vue/prettier',
    '@vue/typescript',
  ],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    'prettier/prettier': 'off',
    'no-extra-boolean-cast': 'off',
    'vue/no-v-html': 'off',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'as' },
    ],
  },
  overrides: [
    {
      files: '*.js',
      rules: {
        '@typescript-eslint/prefer-string-starts-ends-with': 'off',
        '@typescript-eslint/await-thenable': 'off',
      },
      parserOptions: {
        parser: 'babel-eslint',
      },
    },
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    warnOnUnsupportedTypeScriptVersion: false,
    project: './tsconfig.json',
  },
}
