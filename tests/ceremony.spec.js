/**
 * Ceremony (Phase 0b) and portal transition tests.
 */

const { test, expect } = require('@playwright/test');

// Helper: advance through selector dismiss + full ceremony sequence.
// begin-btn gets .visible class at 4300ms into runCeremonySequence (starts at +750ms).
async function openCeremony(page) {
  await page.clock.install();
  await page.click('#ts-start-btn', { force: true });
  await page.clock.runFor(5100);
  await page.waitForTimeout(100);
}

// Helper: advance through selector + ceremony + portal into journey.
async function enterJourney(page) {
  await openCeremony(page);
  await page.click('#begin-btn', { force: true });
  await page.clock.runFor(750);
  await page.waitForTimeout(100);
}

test.describe('Ceremony', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    await page.reload();
  });

  // ── Ceremony content ──────────────────────────────────────────────────────

  test('Begin button gets .visible class after ceremony sequence', async ({ page }) => {
    await openCeremony(page);
    const cls = await page.locator('#begin-btn').getAttribute('class');
    expect(cls).toContain('visible');
  });

  test('ceremony shows recipient name "Divya"', async ({ page }) => {
    await openCeremony(page);
    const recipientText = await page.locator('#ceremony-recipient').innerText();
    expect(recipientText).toContain('Divya');
  });

  test('days counter shows a positive integer', async ({ page }) => {
    await openCeremony(page);
    const daysText = await page.locator('#ceremony-days').innerText();
    const match = daysText.match(/(\d+)/);
    expect(match).not.toBeNull();
    const days = parseInt(match[1], 10);
    expect(days).toBeGreaterThan(0);
  });

  test('"tap when you are ready" hint element is in DOM', async ({ page }) => {
    await openCeremony(page);
    const hint = page.locator('#begin-hint');
    await expect(hint).toBeAttached();
    const text = await hint.innerText();
    expect(text.toLowerCase()).toContain('ready');
  });

  // ── Portal + journey entry ─────────────────────────────────────────────────

  test('clicking Begin unlocks scroll (body not position:fixed)', async ({ page }) => {
    await enterJourney(page);
    const bodyPos = await page.evaluate(() => document.body.style.position);
    expect(bodyPos).not.toBe('fixed');
  });

  test('html overflow is cleared after Begin', async ({ page }) => {
    await enterJourney(page);
    const htmlOverflow = await page.evaluate(() => document.documentElement.style.overflow);
    expect(htmlOverflow).not.toBe('hidden');
  });

  test('sound toggle appears after Begin (hidden attr removed)', async ({ page }) => {
    await enterJourney(page);
    const hidden = await page.locator('#sound-toggle').getAttribute('hidden');
    expect(hidden).toBeNull();
  });

  test('chapter nav appears after Begin (hidden attr removed)', async ({ page }) => {
    await enterJourney(page);
    const hidden = await page.locator('#chapter-nav').getAttribute('hidden');
    expect(hidden).toBeNull();
  });

  test('ceremony is hidden after Begin click', async ({ page }) => {
    await openCeremony(page);
    await page.click('#begin-btn', { force: true });
    // dismiss() sets ceremony.style.display = 'none' synchronously
    await page.clock.runFor(10);
    await page.waitForTimeout(50);

    const display = await page.locator('#ceremony').evaluate(el => el.style.display);
    expect(display).toBe('none');
  });

  // ── _journeyStarted guard ─────────────────────────────────────────────────

  test('_journeyStarted guard: countdown ring + manual Begin firing together', async ({ page }) => {
    await openCeremony(page);

    // Click Begin manually, then immediately simulate the countdown ring's internal
    // btn.click() call — the _journeyStarted guard must absorb the second trigger.
    await page.click('#begin-btn', { force: true });
    await page.evaluate(() => {
      // Simulates: setTimeout(() => btn.click(), 10000) from initCountdownRing
      const btn = document.getElementById('begin-btn');
      if (btn) btn.click();
    });

    await page.clock.runFor(750);
    await page.waitForTimeout(100);

    const bodyPos = await page.evaluate(() => document.body.style.position);
    expect(bodyPos).not.toBe('fixed');
  });

  test('countdown ring auto-fire + manual Begin does not leave scroll locked', async ({ page }) => {
    await openCeremony(page);

    await page.click('#begin-btn', { force: true });
    // Fast-forward past both portal (620ms) AND countdown ring auto-fire (10000ms)
    await page.clock.runFor(11000);
    await page.waitForTimeout(100);

    const bodyPos = await page.evaluate(() => document.body.style.position);
    expect(bodyPos).not.toBe('fixed');
  });
});
