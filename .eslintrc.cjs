module.exports = {
  extends: [
    '@depasquale/eslint-config/typescript',
  ],
  parserOptions: {
    project: ['./tsconfig.json'],
    extraFileExtensions: ['.cjs', '.html'],
    tsconfigRootDir: __dirname, // This is necessary for VS Code
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/scripts/**/*.js'] }],
  },
};
