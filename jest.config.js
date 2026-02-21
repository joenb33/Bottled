/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/test/**/*.test.js'],
  collectCoverageFrom: ['api/**/*.js', 'lib/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: true,
};
