const todo = {
  'import/no-unresolved': 'off',
  'semi': 'off',
};

module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
  ],
  rules: {
    ...todo,
    '@typescript-eslint/indent': ['error', 2],
    'indent': 'off',
    'lines-between-class-members': 'off',
  },
};
