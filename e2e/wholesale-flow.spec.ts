import { test, expect } from '@playwright/test';

test('Wholesale storefront loads tenant shop branding and quantity break catalogue', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header')).toContainText('Acme Industrial & Electrical Supplies');
  await expect(page.locator('body')).toContainText('Acme ProGuard 32A SPN C-Curve MCB');
});
