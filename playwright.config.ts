import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      AUTH_SECRET: 'testsecret',
      EMAIL_SERVER: 'smtp://user:pass@localhost:587',
      EMAIL_FROM: 'noreply@example.com',
      GITHUB_ID: 'id',
      GITHUB_SECRET: 'secret',
      GOOGLE_ID: 'id',
      GOOGLE_SECRET: 'secret',
      UPSTASH_REDIS_URL: 'http://localhost',
      UPSTASH_REDIS_TOKEN: 'token',
      NEXTAUTH_URL: 'http://localhost:3000',
    },
  },
  testDir: 'e2e',
})
