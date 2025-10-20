import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'src/__tests__/**/*.{test,spec}.{ts,tsx}',
      'src/**/__tests__/**/*.{ts,tsx}',
    ],
    setupFiles: ['src/vitest.setup.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage-vitest',
      reporter: ['text', 'lcov', 'html'],
    },
  },
});
