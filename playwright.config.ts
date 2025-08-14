import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: {
    command: 'bash -ac "set -a; source .env.ci; pnpm dev"',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  testDir: 'e2e',
})
