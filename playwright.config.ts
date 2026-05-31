// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.E2E_TARGET_URL ?? 'https://ssac.io',
    headless: true,
    screenshot: 'on',
    trace: 'on',
    video: 'off',
    extraHTTPHeaders: {
      'Accept-Language': 'ko-KR',
    },
  },
  outputDir: 'scripts/e2e-diagnose/output',
});
