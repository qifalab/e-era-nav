import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { ojs } from '../src/oj/OjData'

test('刷题导航可访问、可筛选且没有严重无障碍问题', async ({ page }) => {
  await page.goto('/oj/')

  await expect(
    page.getByRole('heading', { level: 1, name: /让每一次\s*刷题都更高效/ }),
  ).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(ojs.length)
  await expect(page.locator('.oj-card').last()).toHaveCSS('opacity', '1')
  await expect(page.locator('.oj-reveal__line').first()).toHaveCSS('opacity', '1')

  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(accessibility.violations).toEqual([])

  await page.getByRole('searchbox', { name: '搜索刷题平台' }).fill('Codeforces')
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByRole('link', { name: '访问 Codeforces' })).toHaveAttribute(
    'href',
    'https://codeforces.com/',
  )
})
