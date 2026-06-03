import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // board.js is pure
  },
});
