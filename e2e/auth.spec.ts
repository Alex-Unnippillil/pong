import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'

const prisma = new PrismaClient()

async function createVerificationToken(email: string, token: string) {
  const expires = new Date(Date.now() + 60 * 60 * 1000)
  await prisma.$executeRaw`INSERT INTO "VerificationToken" ("identifier","token","expires") VALUES (${email}, ${token}, ${expires})`
}

test.beforeAll(async () => {
  execSync('pnpm prisma:seed', { stdio: 'inherit' })
})

test.afterAll(async () => {
  await prisma.$disconnect()
})

test('user can sign in, view profile and sign out', async ({ page }) => {
  const email = 'alice@example.com'
  const token = 'e2e-token-' + Date.now()
  await createVerificationToken(email, token)

  await page.goto(
    `http://localhost:3000/api/auth/callback/email?token=${token}&email=${email}`,
  )
  await page.goto('http://localhost:3000')
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()

  await page.goto('http://localhost:3000/profile')
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})
