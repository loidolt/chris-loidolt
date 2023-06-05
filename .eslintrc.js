module.exports = {
  globals: {
    __PATH_PREFIX__: true
  },
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: ['eslint:recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'object-curly-newline': 'off',
    'prefer-const': 'error',
    'jest/prefer-expect-assertions': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
