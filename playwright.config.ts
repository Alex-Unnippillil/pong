import { defineConfig } from '@playwright/test'

const withEnv = (cmd: string) => `bash -ac "set -a; source .env.ci; ${cmd}"`

export default defineConfig({
  webServer: {

    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  testDir: 'e2e',
})
