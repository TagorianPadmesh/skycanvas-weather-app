module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'utils/**/*.{ts,tsx}',
    'features/**/*.{ts,tsx}',
    'theme/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};