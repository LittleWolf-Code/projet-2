import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    // Vitest configuration
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',           // Exclude e2e directory (Playwright tests)
      '**/*.spec.js'          // Exclude Playwright spec files
    ],
    include: [
      '**/*.test.js'          // Only include Vitest test files
    ],
    globals: true,
    environment: 'jsdom'      // Use jsdom for Vue component testing
  }
})