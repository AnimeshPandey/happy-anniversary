/**
 * Content validation tests.
 * Guards against accidental em-dashes, wrong names, missing copy.
 */

const { test, expect } = require('@playwright/test');
const { goToJourney } = require('./helpers');

// Clean-state setup: goto → evaluate-clear → reload (no addInitScript so reloads
// within a test don't accidentally clear localStorage again).
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();
});

test.describe('Content validation', () => {
  test('page has a meaningful title', async ({ page }) => {
    await expect(page).toHaveTitle(/Anniversary/i);
  });

  test('no em-dashes (U+2014) anywhere in rendered body text', async ({ page }) => {
    await goToJourney(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).not.toContain('—');
  });

  test('recipient name "Divya" appears in the ceremony section', async ({ page }) => {
    await page.clock.install();
    await page.click('#ts-start-btn', { force: true });
    await page.clock.runFor(5100);
    await page.waitForTimeout(100);

    const recipientText = await page.locator('#ceremony-recipient').innerText();
    expect(recipientText).toContain('Divya');
  });

  test('dedication "for Divya" appears in theme selector', async ({ page }) => {
    await expect(page.locator('.ts-dedication')).toContainText('Divya');
  });

  test('opening poem source copy contains "Divya"', async ({ page }) => {
    await goToJourney(page);

    // Read from SITE global (source of truth) rather than the typewriter-cleared DOM
    const poem = await page.evaluate(() => (window.SITE && window.SITE.opening) ? window.SITE.opening.poem : '');
    expect(poem).toContain('Divya');
    expect(poem.trim().length).toBeGreaterThan(10);
  });

  test('closing section has author "Animesh"', async ({ page }) => {
    await goToJourney(page);
    await expect(page.locator('.closing-author')).toContainText('Animesh');
  });

  test('closing message is present and non-empty', async ({ page }) => {
    await goToJourney(page);
    const msg = await page.locator('#closing-message').innerText();
    expect(msg.trim().length).toBeGreaterThan(10);
  });

  test('closing signoff "Yours" is present', async ({ page }) => {
    await goToJourney(page);
    await expect(page.locator('#closing-signoff')).toContainText('Yours');
  });

  test('SITE has 12 chapters defined', async ({ page }) => {
    await goToJourney(page);
    const count = await page.evaluate(() => (window.SITE && window.SITE.chapters) ? window.SITE.chapters.length : 0);
    expect(count).toBe(12);
  });
});
