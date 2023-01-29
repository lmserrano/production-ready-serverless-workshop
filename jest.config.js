module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test_cases/**/*'],
  setupFiles: ["./tests/setup/setup-tests.js"],
  testTimeout: 5000 // Default: 5000 milliseconds
}
