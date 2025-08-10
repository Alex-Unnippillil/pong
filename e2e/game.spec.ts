import { test, expect } from '@playwright/test'

test('game canvas renders and accepts input', async ({ page }) => {
  await page.goto('http://localhost:3000')
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await canvas.click()
  await page.keyboard.press('ArrowUp')
})
