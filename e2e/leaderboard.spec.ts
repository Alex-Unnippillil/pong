import { test, expect } from '@playwright/test'

test('leaderboard displays top players', async ({ page }) => {
  await page.goto('http://localhost:3000/leaderboard')
  await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Alice' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Bob' })).toBeVisible()
})
