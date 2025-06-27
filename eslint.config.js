export default [
  {
    ignores: ['.graveyard/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022, // Use latest ECMAScript features
      sourceType: 'module', // or 'script' if not using ES modules
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'eqeqeq': 'error',
    },
  },
];
