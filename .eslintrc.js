module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', '@vue/prettier', '@vue/typescript'],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
}
