import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    env: {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '1h',
    },
  },
});
