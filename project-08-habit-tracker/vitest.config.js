import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // streak.js is pure date math — no DOM needed
    environment: 'node',
  },
});
