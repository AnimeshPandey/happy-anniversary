/**
 * Interaction tests — replay, hints, TOC, theme switch.
 */

const { test, expect } = require('@playwright/test');
const { goToJourney } = require('./helpers');

// Helper: clean state (goto → clear → reload) without a persistent addInitScript,
// so further navigations within a test preserve localStorage.
async function cleanGoto(page) {
  await page.goto('/');
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();
}

// Helper: pre-set a localStorage key before loading the page.
// Navigate once to set the key, then navigate again so the page sees it on load.
async function gotoWithStorage(page, key, value) {
  await page.goto('/');
  await page.evaluate((args) => { try { localStorage.setItem(args[0], args[1]); } catch (e) {} }, [key, value]);
  await page.goto('/');
}

test.describe('Replay', () => {
  test.beforeEach(async ({ page }) => {
    await cleanGoto(page);
    await goToJourney(page);
  });

  test('replay button label is "Begin Again"', async ({ page }) => {
    // Use textContent (not innerText) to avoid CSS text-transform uppercase
    const text = await page.locator('#replay-btn').evaluate(el => el.textContent);
    expect(text).toContain('Begin Again');
  });

  test('clicking Begin Again re-locks scroll and restores ceremony', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(100);

    await page.locator('#replay-btn').click();

    // Replay has a 700ms setTimeout before restoring UI
    await page.clock.runFor(800);
    await page.waitForTimeout(100);

    const bodyPos = await page.evaluate(() => document.body.style.position);
    expect(bodyPos).toBe('fixed');

    const ceremonyDisplay = await page.locator('#ceremony').evaluate(el => el.style.display);
    expect(ceremonyDisplay).not.toBe('none');
  });

  test('after replay, Begin can re-enter journey (_journeyStarted reset)', async ({ page }) => {
    await page.locator('#replay-btn').click();
    await page.clock.runFor(800);
    await page.waitForTimeout(100);

    // After replay, theme selector is shown again — must click ts-start-btn
    await page.click('#ts-start-btn', { force: true });
    await page.clock.runFor(5100);
    await page.waitForTimeout(100);

    await page.click('#begin-btn', { force: true });
    await page.clock.runFor(750);
    await page.waitForTimeout(100);

    const bodyPos = await page.evaluate(() => document.body.style.position);
    expect(bodyPos).not.toBe('fixed');
  });

  test('chapter nav is hidden after replay', async ({ page }) => {
    await page.locator('#replay-btn').click();
    await page.clock.runFor(800);
    await page.waitForTimeout(100);

    const hidden = await page.locator('#chapter-nav').getAttribute('hidden');
    expect(hidden).not.toBeNull();
  });

  test('sound toggle is hidden after replay', async ({ page }) => {
    await page.locator('#replay-btn').click();
    await page.clock.runFor(800);
    await page.waitForTimeout(100);

    const hidden = await page.locator('#sound-toggle').getAttribute('hidden');
    expect(hidden).not.toBeNull();
  });
});

test.describe('One-time hints', () => {
  test('sound hint toast appears 2s after journey starts (first visit)', async ({ page }) => {
    await cleanGoto(page);
    await goToJourney(page);

    // Toast fires 2000ms after showJourneyUI()
    await page.clock.runFor(2200);
    await page.waitForTimeout(100);

    const toastVisible = await page.evaluate(() => {
      const t = document.querySelector('.sound-hint-toast');
      return t ? t.classList.contains('visible') : false;
    });
    expect(toastVisible).toBe(true);
  });

  test('sound hint toast is not shown on second visit', async ({ page }) => {
    // Pre-set the flag so the page sees it on load
    await gotoWithStorage(page, 'sound-hint-shown', '1');
    await goToJourney(page);

    await page.clock.runFor(3000);
    await page.waitForTimeout(100);

    const count = await page.locator('.sound-hint-toast').count();
    expect(count).toBe(0);
  });

  test('TOC hint appears 3.5s after journey starts (first visit)', async ({ page }) => {
    await cleanGoto(page);
    await goToJourney(page);

    // TOC hint fires 3500ms after showJourneyUI, gets .visible at +100ms
    await page.clock.runFor(3700);
    await page.waitForTimeout(100);

    const hintVisible = await page.evaluate(() => {
      const h = document.querySelector('.chapter-nav-hint');
      return h ? h.classList.contains('visible') : false;
    });
    expect(hintVisible).toBe(true);
  });

  test('TOC hint is not created on second visit', async ({ page }) => {
    await gotoWithStorage(page, 'toc-hint-shown', '1');
    await goToJourney(page);

    await page.clock.runFor(5000);
    await page.waitForTimeout(100);

    const count = await page.locator('.chapter-nav-hint').count();
    expect(count).toBe(0);
  });
});

test.describe('TOC sheet', () => {
  test.beforeEach(async ({ page }) => {
    await cleanGoto(page);
    await goToJourney(page);
  });

  test('long-pressing chapter nav opens the TOC sheet', async ({ page }) => {
    // Scroll so the chapter nav is visible in viewport
    await page.evaluate(() => {
      const ch = document.getElementById('chapter-01');
      if (ch) ch.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(200);

    // Simulate long-press: mousedown → advance 600ms fake time → mouseup
    const nav = page.locator('#chapter-nav');
    const box = await nav.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.clock.runFor(600);
      await page.waitForTimeout(100);
      await page.mouse.up();
      await page.waitForTimeout(100);
    }

    const isHidden = await page.locator('#toc-sheet').getAttribute('hidden');
    expect(isHidden).toBeNull();
  });

  test('TOC sheet has 12 items', async ({ page }) => {
    await expect(page.locator('#toc-list li')).toHaveCount(12);
  });

  test('tapping TOC backdrop closes the sheet', async ({ page }) => {
    // Open sheet directly via JS for test isolation
    await page.evaluate(() => {
      const sheet = document.getElementById('toc-sheet');
      if (sheet) { sheet.removeAttribute('hidden'); sheet.classList.add('open'); }
    });

    // force:true bypasses pointer-events:none that may be on backdrop when sheet is closed
    await page.locator('#toc-backdrop').click({ force: true });

    // closeTOC has a 420ms setTimeout to re-add the hidden attr
    await page.clock.runFor(500);
    await page.waitForTimeout(100);

    const isHidden = await page.locator('#toc-sheet').getAttribute('hidden');
    expect(isHidden).not.toBeNull();
  });
});

test.describe('Meta theme-color invariant', () => {
  test('meta theme-color matches current theme rose token', async ({ page }) => {
    await cleanGoto(page);
    await goToJourney(page);

    const metaColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    const themeRose = await page.evaluate(() => {
      return window.ThemeController ? window.ThemeController.current().tokens['--rose'] : null;
    });
    expect(metaColor).toBe(themeRose);
  });

  test('meta theme-color updates when theme dot is clicked', async ({ page }) => {
    await cleanGoto(page);
    // Check the meta before entering journey (theme selector phase)
    await page.clock.install();

    const colorBefore = await page.locator('meta[name="theme-color"]').getAttribute('content');

    // Click dot 1 — dot handler now updates meta (bug fixed in main.js)
    await page.locator('#ts-dots .ts-dot').nth(1).click();
    await page.clock.runFor(700);
    await page.waitForTimeout(100);

    const colorAfter = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(colorAfter).not.toEqual(colorBefore);
  });
});

test.describe('Pull-to-restart indicator', () => {
  test('indicator element exists in DOM on load', async ({ page }) => {
    await cleanGoto(page);
    await expect(page.locator('#pull-restart-indicator')).toBeAttached();
  });

  test('pull indicator label text contains "restart"', async ({ page }) => {
    await cleanGoto(page);
    const text = await page.locator('.pull-label').innerText();
    expect(text.toLowerCase()).toContain('restart');
  });
});
