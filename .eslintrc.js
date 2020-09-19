module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/recommended',
    'plugin:vue/vue3-recommended',
    '@vue/prettier',
    '@vue/typescript',
  ],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    'prettier/prettier': 'off',
    'no-extra-boolean-cast': 'off',
    'vue/no-v-html': 'off',
    // good to have
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/await-thenable': 'error',
    // consistency
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'as' },
    ],
    // vue 3 only
    'vue/no-deprecated-v-on-native-modifier': 'off',
    'vue/require-explicit-emits': 'off',
  },
  ignorePatterns: ['jest.*.ts'],
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
    {
      files: ['src/**/*.test.ts'],
      env: {
        jest: true,
      },
    },
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    warnOnUnsupportedTypeScriptVersion: false,
    project: './tsconfig.json',
  },
}
