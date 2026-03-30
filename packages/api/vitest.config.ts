import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['src/__integration_tests__/**'],
    env: {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '1h',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    },
  },
});
