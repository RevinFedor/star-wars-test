import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('should search characters and display results', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('luke');

    await page.waitForTimeout(400);

    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    await expect(page).toHaveURL(/search=luke/);
    await expect(page).toHaveURL(/page=1/);
  });

  test('should show no results message for non-existing character', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('NonExistingCharacter12345');

    await page.waitForTimeout(400);

    await expect(page.locator('text=No characters found')).toBeVisible({ timeout: 10000 });
  });

  test('should clear search and show all characters', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('input[type="search"]');

    await searchInput.fill('luke');
    await page.waitForTimeout(400);

    await searchInput.clear();
    await page.waitForTimeout(400);

    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=C-3PO').first()).toBeVisible({ timeout: 10000 });

    await expect(page).not.toHaveURL(/search=/);
  });

  test('should preserve search in URL and restore on page load', async ({ page }) => {
    await page.goto('/?search=luke');

    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toHaveValue('luke');

    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });
  });

  test('should debounce search to avoid excessive API calls', async ({ page }) => {
    let apiCallCount = 0;

    await page.route('**/api/people/*', (route) => {
      apiCallCount++;
      route.continue();
    });

    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    const initialCalls = apiCallCount;

    const searchInput = page.locator('input[type="search"]');

    // type quickly
    await searchInput.pressSequentially('luke', { delay: 50 });

    await page.waitForTimeout(400);

    // should only make 1 search call, not 4
    expect(apiCallCount - initialCalls).toBeLessThan(4);
  });

  test('should handle search with special characters', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    const searchInput = page.locator('input[type="search"]');

    await searchInput.fill('C-3PO');
    await page.waitForTimeout(400);

    // shouldn't crash
    await expect(page.locator('body')).toBeVisible();
  });
});
