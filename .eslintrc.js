module.exports = {
  globals: {
    __PATH_PREFIX__: true
  },
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'prettier',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'object-curly-newline': 'off',
    'prefer-const': 'error',
    'jest/prefer-expect-assertions': 'off'
  }
};
