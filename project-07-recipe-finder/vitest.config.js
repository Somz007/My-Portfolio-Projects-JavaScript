import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // storage.js uses localStorage, so jsdom is needed
    environment: 'jsdom',
  },
});
