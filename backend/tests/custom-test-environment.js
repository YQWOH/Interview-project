/**
 * Custom Jest test environment to fix localStorage issue
 */
const NodeEnvironment = require('jest-environment-node').TestEnvironment;

class CustomTestEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    
    // Mock localStorage to prevent SecurityError
    this.global.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    };
  }

  async setup() {
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }
}

module.exports = CustomTestEnvironment;
