import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // game.js is pure — no DOM needed
    environment: 'node',
  },
});
