import { defineConfig } from 'vitest/config';

/** Les tests E2E utilisent le suffixe `.e2e.ts`. */
export default defineConfig({
  test: {
    include: ['e2e/**/*.e2e.ts'],
    hookTimeout: 20000,
    testTimeout: 20000,
  },
});
