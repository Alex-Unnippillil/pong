import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'

const prisma = new PrismaClient()

async function signIn(page, email: string) {
  const token = 'e2e-token-' + Math.random().toString(36).slice(2)
  const expires = new Date(Date.now() + 60 * 60 * 1000)
  await prisma.$executeRaw`INSERT INTO "VerificationToken" ("identifier","token","expires") VALUES (${email}, ${token}, ${expires})`
  await page.goto(
    `http://localhost:3000/api/auth/callback/email?token=${token}&email=${email}`,
  )
}

test.beforeAll(async () => {
  execSync('pnpm prisma:seed', { stdio: 'inherit' })
})

test.afterAll(async () => {
  await prisma.$disconnect()
})

test('two players can match and start a game', async ({ browser }) => {
  const context1 = await browser.newContext()
  const context2 = await browser.newContext()
  const page1 = await context1.newPage()
  const page2 = await context2.newPage()

  await signIn(page1, 'alice@example.com')
  await signIn(page2, 'bob@example.com')

  await page1.goto('http://localhost:3000/play')
  await page2.goto('http://localhost:3000/play')

  await page1.getByRole('button', { name: 'Play Online' }).click()
  await page2.getByRole('button', { name: 'Play Online' }).click()

  await expect(page1).toHaveURL(/\/match\//)
  const matchUrl = page1.url()
  await expect(page2).toHaveURL(matchUrl)

  await context1.close()
  await context2.close()
})
