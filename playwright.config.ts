import { defineConfig } from '@playwright/test'
import { CI } from './src/env'

export default defineConfig({
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !CI,
    timeout: 120000,
  },
  testDir: 'e2e',
})
