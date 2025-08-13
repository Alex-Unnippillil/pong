import { test, expect } from '@playwright/test'

test('game continues offline after service worker registration', async ({
  page,
}) => {
  await page.goto('http://localhost:3000')
  await page.waitForSelector('canvas')
  await page.waitForFunction(() => navigator.serviceWorker?.controller)

  await page.context().setOffline(true)
  await expect(await page.evaluate(() => navigator.onLine)).toBe(false)
  await expect(page.locator('canvas')).toBeVisible()

  const frame1 = await page.evaluate(() =>
    document.querySelector('canvas')?.toDataURL(),
  )
  await page.waitForTimeout(500)
  const frame2 = await page.evaluate(() =>
    document.querySelector('canvas')?.toDataURL(),
  )
  expect(frame1).not.toBe(frame2)
})
