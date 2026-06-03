/**
 * Theme selector (Phase 0a) tests.
 */

const { test, expect } = require('@playwright/test');

// Clean-state setup without addInitScript so that reloads within a test
// do NOT automatically clear localStorage (important for persistence tests).
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();
});

test.describe('Theme selector', () => {
  // ── Display ────────────────────────────────────────────────────────────────

  test('selector is visible on page load', async ({ page }) => {
    await expect(page.locator('#theme-selector')).toBeVisible();
  });

  test('dedication line contains "Divya"', async ({ page }) => {
    await expect(page.locator('.ts-dedication')).toContainText('Divya');
  });

  test('exactly 8 theme dots are rendered', async ({ page }) => {
    await expect(page.locator('#ts-dots .ts-dot')).toHaveCount(8);
  });

  test('theme name and tagline are non-empty on load', async ({ page }) => {
    const name    = await page.locator('#ts-name').innerText();
    const tagline = await page.locator('#ts-tagline').innerText();
    expect(name.trim().length).toBeGreaterThan(0);
    expect(tagline.trim().length).toBeGreaterThan(0);
  });

  test('orb and surprise button are visible', async ({ page }) => {
    await expect(page.locator('#ts-surprise-btn')).toBeVisible();
    await expect(page.locator('#ts-orb-wrap')).toBeVisible();
  });

  // ── Cycling ───────────────────────────────────────────────────────────────

  test('next button cycles to a different theme', async ({ page }) => {
    await page.clock.install();

    const initialName = await page.locator('#ts-name').innerText();
    await page.click('#ts-next-btn');

    // ThemeController guard 600ms; text crossfade 180ms+400ms
    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    const newName = await page.locator('#ts-name').innerText();
    expect(newName).not.toEqual(initialName);
  });

  test('prev button cycles to a different theme', async ({ page }) => {
    await page.clock.install();

    const initialName = await page.locator('#ts-name').innerText();
    await page.click('#ts-prev-btn');

    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    const newName = await page.locator('#ts-name').innerText();
    expect(newName).not.toEqual(initialName);
  });

  test('clicking a dot makes it aria-pressed=true, all others false', async ({ page }) => {
    await page.clock.install();

    const dot = page.locator('#ts-dots .ts-dot').nth(3);
    await dot.click();
    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    await expect(dot).toHaveAttribute('aria-pressed', 'true');
    const pressed = await page.locator('#ts-dots .ts-dot[aria-pressed="true"]').count();
    expect(pressed).toBe(1);
  });

  test('orb click cycles theme forward', async ({ page }) => {
    await page.clock.install();

    const initialName = await page.locator('#ts-name').innerText();
    await page.click('#ts-orb-wrap', { force: true });
    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    const newName = await page.locator('#ts-name').innerText();
    expect(newName).not.toEqual(initialName);
  });

  test('surprise button sets a valid (non-empty) theme name', async ({ page }) => {
    await page.clock.install();

    await page.click('#ts-surprise-btn');
    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    const name = await page.locator('#ts-name').innerText();
    expect(name.trim().length).toBeGreaterThan(0);
  });

  test('rapid clicks are guarded — only one dot is aria-pressed=true', async ({ page }) => {
    await page.clock.install();

    for (let i = 0; i < 5; i++) {
      await page.click('#ts-next-btn');
    }
    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    const pressedDots = await page.locator('#ts-dots .ts-dot[aria-pressed="true"]').count();
    expect(pressedDots).toBe(1);

    const name = await page.locator('#ts-name').innerText();
    expect(name.trim().length).toBeGreaterThan(0);
  });

  // ── Persistence ───────────────────────────────────────────────────────────

  test('selected theme index is saved to localStorage', async ({ page }) => {
    await page.clock.install();

    await page.locator('#ts-dots .ts-dot').nth(3).click();
    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    const saved = await page.evaluate(() => localStorage.getItem('anniversary-theme-idx'));
    expect(parseInt(saved, 10)).toBe(3);
  });

  test('selected theme is restored after re-navigation', async ({ page }) => {
    await page.clock.install();

    // Select theme at index 2
    await page.locator('#ts-dots .ts-dot').nth(2).click();
    await page.clock.runFor(700);
    await page.waitForTimeout(100);
    const nameBeforeNav = await page.locator('#ts-name').innerText();

    // Navigate to a fresh page WITHOUT clearing localStorage (no addInitScript)
    await page.goto('/');
    await page.waitForLoadState('load');
    // With fake clock active, ThemeController.set(savedIdx) fires animateContent()
    // whose 180ms setTimeout won't auto-fire — advance fake time to let it settle
    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    const nameAfterNav = await page.locator('#ts-name').innerText();
    expect(nameAfterNav).toEqual(nameBeforeNav);
  });

  // ── meta theme-color ──────────────────────────────────────────────────────

  test('meta[name=theme-color] has a hex value on load', async ({ page }) => {
    const color = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(color).toBeTruthy();
    expect(color).toMatch(/^#[0-9A-Fa-f]{3,8}$/);
  });

  test('meta[name=theme-color] updates when next button cycles theme', async ({ page }) => {
    await page.clock.install();

    const colorBefore = await page.locator('meta[name="theme-color"]').getAttribute('content');

    // Use the next button which calls applyThemeChange() → meta update
    await page.click('#ts-next-btn');
    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    const colorAfter = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(colorAfter).not.toEqual(colorBefore);
  });

  test('meta[name=theme-color] updates when dot is clicked', async ({ page }) => {
    await page.clock.install();

    const colorBefore = await page.locator('meta[name="theme-color"]').getAttribute('content');

    // Click dot 1 — main.js dot handler now also updates meta (bug-fixed)
    await page.locator('#ts-dots .ts-dot').nth(1).click();
    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    const colorAfter = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(colorAfter).not.toEqual(colorBefore);
  });
});
