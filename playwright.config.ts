import { defineConfig } from '@playwright/test'
import { env } from './src/env'

export default defineConfig({
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !env.CI,
    timeout: 120000,
  },
  testDir: 'e2e',
})
