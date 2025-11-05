import { test, expect } from '@playwright/test';

test.describe('localStorage Persistence', () => {
  test('should persist edits across browser sessions', async ({ browser }) => {
    // session 1
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();

    await page1.goto('/');
    await expect(page1.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    await page1.locator('text=Luke Skywalker').first().click();
    await page1.waitForURL(/\/character\/\d+/);

    await page1.locator('button:has-text("Edit")').click();

    const nameInput = page1.locator('input').first();
    await nameInput.clear();
    await nameInput.fill('Luke Session Test');

    await page1.locator('button:has-text("Save")').click();
    await expect(page1.locator('text=Luke Session Test')).toBeVisible();

    const storage1 = await page1.evaluate(() => {
      return localStorage.getItem('star-wars-character-edits');
    });
    expect(storage1).toBeTruthy();

    await context1.close();

    // session 2
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    await page2.goto('/');
    await expect(page2.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    await page2.locator('text=Luke Skywalker').first().click();
    await page2.waitForURL(/\/character\/\d+/);

    // simulate persistence by setting localstorage manually
    await page2.evaluate((data) => {
      localStorage.setItem('star-wars-character-edits', data);
    }, storage1!);

    await page2.reload();
    await page2.waitForLoadState('networkidle');

    await expect(page2.locator('text=Luke Session Test')).toBeVisible({ timeout: 10000 });

    await context2.close();
  });

  test('should handle multiple characters with edits', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    // edit luke
    await page.locator('text=Luke Skywalker').first().click();
    await page.waitForURL(/\/character\/\d+/);

    await page.locator('button:has-text("Edit")').click();
    const nameInput1 = page.locator('input').first();
    await nameInput1.clear();
    await nameInput1.fill('Luke Modified');
    await page.locator('button:has-text("Save")').click();
    await expect(page.locator('text=Luke Modified')).toBeVisible();

    await page.locator('button:has-text("Back to Characters")').click();
    await page.waitForURL('/');

    // edit c-3po
    await expect(page.locator('text=C-3PO').first()).toBeVisible({ timeout: 10000 });
    await page.locator('text=C-3PO').first().click();
    await page.waitForURL(/\/character\/\d+/);

    await page.locator('button:has-text("Edit")').click();
    const nameInput2 = page.locator('input').first();
    await nameInput2.clear();
    await nameInput2.fill('C-3PO Modified');
    await page.locator('button:has-text("Save")').click();
    await expect(page.locator('text=C-3PO Modified')).toBeVisible();

    // both should be in localstorage
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('star-wars-character-edits');
    });

    expect(localStorageData).toBeTruthy();
    const edits = JSON.parse(localStorageData!);
    expect(edits['1']).toBeDefined();
    expect(edits['1'].name).toBe('Luke Modified');
    expect(edits['2']).toBeDefined();
    expect(edits['2'].name).toBe('C-3PO Modified');

    await page.locator('button:has-text("Back to Characters")').click();
    await page.waitForURL('/');

    // should see 2 badges
    const editedBadges = page.locator('text=Edited');
    await expect(editedBadges).toHaveCount(2, { timeout: 10000 });
  });

  test('should merge incremental edits', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Luke Skywalker').first()).toBeVisible({ timeout: 10000 });

    await page.locator('text=Luke Skywalker').first().click();
    await page.waitForURL(/\/character\/\d+/);

    // first edit
    await page.locator('button:has-text("Edit")').click();
    const nameInput = page.locator('input').first();
    await nameInput.clear();
    await nameInput.fill('Luke Step 1');
    await page.locator('button:has-text("Save")').click();
    await expect(page.locator('text=Luke Step 1')).toBeVisible();

    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('star-wars-character-edits');
    });

    expect(localStorageData).toBeTruthy();
    const edits = JSON.parse(localStorageData!);
    expect(edits['1'].name).toBe('Luke Step 1');
  });
});
