import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // jsdom gives us localStorage, document, etc. in the test environment
    environment: 'jsdom',
  },
});
