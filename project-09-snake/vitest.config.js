import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // game.js is pure
  },
});
