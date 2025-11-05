import { test, expect } from '@playwright/test';

test.describe('Critical User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // clear localstorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should complete full edit and save flow', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/star-wars/i);

    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    // click on luke's card
    await page.locator('text=Luke Skywalker').first().click();
    await page.waitForURL(/\/character\/\d+/);

    await expect(page.locator('h1:has-text("Luke Skywalker")')).toBeVisible({ timeout: 10000 });

    await page.locator('button:has-text("Edit")').click();

    // edit name
    const nameInput = page.locator('input').first();
    await nameInput.clear();
    await nameInput.fill('Luke Skywalker Modified');

    await page.locator('button:has-text("Save")').click();

    await expect(page.locator('text=Luke Skywalker Modified')).toBeVisible();

    // check localstorage
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('star-wars-character-edits');
    });

    expect(localStorageData).toBeTruthy();
    const edits = JSON.parse(localStorageData!);
    expect(edits['1']).toBeDefined();
    expect(edits['1'].name).toBe('Luke Skywalker Modified');

    // go back
    await page.locator('button:has-text("Back to Characters")').click();
    await page.waitForURL('/');

    // badge should appear
    await expect(page.locator('text=Edited').first()).toBeVisible({ timeout: 10000 });
  });

  test('should cancel edit without saving', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    await page.locator('text=Luke Skywalker').first().click();
    await page.waitForURL(/\/character\/\d+/);

    await page.locator('button:has-text("Edit")').click();

    const nameInput = page.locator('input').first();
    await nameInput.clear();
    await nameInput.fill('Should Not Save');

    await page.locator('button:has-text("Cancel")').click();

    // original name should still be there
    await expect(page.locator('h1:has-text("Luke Skywalker")')).toBeVisible();
    await expect(page.locator('text=Should Not Save')).not.toBeVisible();

    // localstorage should be empty
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('star-wars-character-edits');
    });

    expect(localStorageData).toBeNull();
  });

  test('should reset edits to original values', async ({ page }) => {
    // make an edit first
    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    await page.locator('text=Luke Skywalker').first().click();
    await page.waitForURL(/\/character\/\d+/);

    await page.locator('button:has-text("Edit")').click();

    const nameInput = page.locator('input').first();
    await nameInput.clear();
    await nameInput.fill('Luke Modified');

    await page.locator('button:has-text("Save")').click();
    await expect(page.locator('text=Luke Modified')).toBeVisible();

    let localStorageData = await page.evaluate(() => {
      return localStorage.getItem('star-wars-character-edits');
    });
    expect(localStorageData).toBeTruthy();

    // now reset
    await page.locator('button:has-text("Reset")').click();

    await expect(page.locator('h1:has-text("Luke Skywalker")')).toBeVisible();
    await expect(page.locator('text=Luke Modified')).not.toBeVisible();

    // localstorage should be cleared for this character
    localStorageData = await page.evaluate(() => {
      return localStorage.getItem('star-wars-character-edits');
    });

    if (localStorageData) {
      const edits = JSON.parse(localStorageData);
      expect(edits['1']).toBeUndefined();
    }
  });
});
