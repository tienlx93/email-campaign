import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    include: ['src/__integration_tests__/**/*.test.ts'],
    globalSetup: ['src/__integration_tests__/setup/global.setup.ts'],
    testTimeout: 120000,
    env: {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '1h',
    },
  },
});
