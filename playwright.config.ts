import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: {
    command: 'bash -c "set -a && source .env.ci && set +a && pnpm dev"',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  testDir: 'e2e',
})
