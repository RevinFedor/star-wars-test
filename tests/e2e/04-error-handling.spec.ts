import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('should handle API errors gracefully on list page', async ({ page }) => {
    await page.route('**/api/people/*', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Error' })).toBeVisible({ timeout: 10000 });
  });

  test('should handle API errors on detail page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    await page.route('**/api/people/1/', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not Found' }),
      });
    });

    await page.goto('/character/1');

    await expect(page.getByRole('heading', { name: 'Error' })).toBeVisible({ timeout: 10000 });

    const backButton = page.locator('button:has-text("Back to Characters")');
    await expect(backButton).toBeVisible();
  });

  test('should handle missing image gracefully', async ({ page }) => {
    await page.route('**/akabab.github.io/**', (route) => {
      route.fulfill({ status: 404 });
    });

    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    await page.locator('text=Luke Skywalker').first().click();
    await page.waitForURL(/\/character\/\d+/);

    await expect(page.locator('h1:has-text("Luke Skywalker")')).toBeVisible({ timeout: 10000 });

    await expect(page.locator('text=No image available')).toBeVisible();
  });

  test('should navigate back to list after error', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    await page.route('**/api/people/999/', (route) => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ error: 'Not Found' }),
      });
    });

    await page.goto('/character/999');

    await expect(page.getByRole('heading', { name: 'Error' })).toBeVisible({ timeout: 10000 });

    await page.locator('button:has-text("Back to Characters")').click();

    await page.waitForURL('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });
  });
});
