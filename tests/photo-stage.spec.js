/**
 * Photo stage overlay tests.
 */

const { test, expect } = require('@playwright/test');
const { goToJourney } = require('./helpers');

test.describe('Photo stage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    await page.reload();
    await goToJourney(page);
  });

  test('single tap on chapter image opens photo stage', async ({ page }) => {
    const wrap = page.locator('#chapter-01 .chapter-image-wrap').first();
    await wrap.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await wrap.click();
    await page.waitForTimeout(350);
    const stage = page.locator('#photo-stage.open');
    await expect(stage).toBeVisible();
    await expect(page.locator('.photo-stage-img')).toBeVisible();
  });

  test('escape closes photo stage', async ({ page }) => {
    const wrap = page.locator('#chapter-01 .chapter-image-wrap').first();
    await wrap.scrollIntoViewIfNeeded();
    await wrap.click();
    await page.waitForTimeout(350);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await expect(page.locator('#photo-stage.open')).toHaveCount(0);
  });
});
