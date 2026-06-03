import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // the parser is pure (no DOM), so the lightweight node environment is fine
    environment: 'node',
  },
});
