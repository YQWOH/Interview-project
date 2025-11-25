/**
 * Jest setup file to configure test environment
 */

// Suppress console warnings during tests
globalThis.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock localStorage if needed
if (typeof localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1d';
