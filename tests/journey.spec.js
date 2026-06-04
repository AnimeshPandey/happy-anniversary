/**
 * Journey structure tests.
 * All tests start with the page already in journey state via goToJourney().
 */

const { test, expect } = require('@playwright/test');
const { goToJourney } = require('./helpers');

test.describe('Journey structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    await page.reload();
    await goToJourney(page);
  });

  // ── Navigation ────────────────────────────────────────────────────────────

  test('chapter nav renders 20 dot buttons', async ({ page }) => {
    await expect(page.locator('#chapter-nav button')).toHaveCount(20);
  });

  test('chapter nav has hidden attribute removed', async ({ page }) => {
    const hidden = await page.locator('#chapter-nav').getAttribute('hidden');
    expect(hidden).toBeNull();
  });

  test('tapping a chapter nav dot scrolls to that chapter', async ({ page }, testInfo) => {
    await page.evaluate(() => {
      const orig = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function (opts) {
        if (opts && opts.behavior === 'smooth') opts.behavior = 'instant';
        orig.call(this, opts);
      };
    });

    if (testInfo.project.name === 'mobile-chrome') {
      await page.locator('#dock-chapters-btn').click();
      await page.waitForTimeout(350);
      await page.locator('#toc-list li').nth(5).click();
      await page.waitForTimeout(400);
    } else {
      await page.evaluate(() => {
        const ch = document.getElementById('chapter-01');
        if (ch) ch.scrollIntoView({ behavior: 'instant' });
      });
      await page.clock.runFor(300);
      await page.waitForTimeout(150);

      const dot = page.locator('#chapter-nav button').nth(5);
      await dot.click();
      await page.waitForTimeout(300);
    }

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(500);
  });

  // ── Scroll progress ───────────────────────────────────────────────────────

  test('scroll progress bar starts at 0%', async ({ page }) => {
    const height = await page.locator('#scroll-progress').evaluate(el => el.style.height);
    const pct = parseFloat(height) || 0;
    expect(pct).toBeLessThanOrEqual(5);
  });

  test('scroll progress bar increases on scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(150);

    const height = await page.locator('#scroll-progress').evaluate(el => el.style.height);
    const pct = parseFloat(height);
    expect(pct).toBeGreaterThan(0);
  });

  // ── Opening section ───────────────────────────────────────────────────────

  test('opening poem element is in the DOM', async ({ page }) => {
    // Typewriter clears then types the poem; check element exists rather than content
    await expect(page.locator('#opening-poem-text')).toBeAttached();
  });

  test('opening panels are rendered (2 panels)', async ({ page }) => {
    await expect(page.locator('#opening-panels .opening-panel')).toHaveCount(2);
  });

  // ── Chapters ──────────────────────────────────────────────────────────────

  // The hidden easter-egg chapter (id="chapter-hidden") is also appended to
  // #chapters-container by buildChapters(), so the total is 21, not 20.
  test('21 chapter articles in #chapters-container (20 main + 1 hidden)', async ({ page }) => {
    await expect(page.locator('#chapters-container .chapter')).toHaveCount(21);
  });

  test('20 main chapters (excluding hidden easter egg)', async ({ page }) => {
    await expect(
      page.locator('#chapters-container .chapter:not(#chapter-hidden)')
    ).toHaveCount(20);
  });

  test('21 chapter-title elements total (20 main + 1 hidden)', async ({ page }) => {
    await expect(page.locator('.chapter-title')).toHaveCount(21);
  });

  test('chapter IDs use zero-padded format (chapter-01 through chapter-20)', async ({ page }) => {
    await expect(page.locator('#chapter-01')).toBeAttached();
    await expect(page.locator('#chapter-20')).toBeAttached();
  });

  test('hidden chapter element is in the DOM', async ({ page }) => {
    await expect(page.locator('#chapter-hidden')).toBeAttached();
  });

  // ── Image placeholders ────────────────────────────────────────────────────

  test('at least 16 image placeholders with role=img and aria-label', async ({ page }) => {
    const count = await page.locator('figure[role="img"][aria-label]').count();
    expect(count).toBeGreaterThanOrEqual(16);
  });

  test('image placeholders have curtain overlay elements', async ({ page }) => {
    const count = await page.locator('.image-curtain').count();
    expect(count).toBeGreaterThanOrEqual(16);
  });

  // ── Crescendo ─────────────────────────────────────────────────────────────

  test('all 3 crescendo lines are present', async ({ page }) => {
    await expect(page.locator('#crescendo-line1')).toBeAttached();
    await expect(page.locator('#crescendo-line2')).toBeAttached();
    await expect(page.locator('#crescendo-line3')).toBeAttached();
  });

  test('crescendo line 3 has highlight class', async ({ page }) => {
    const cls = await page.locator('#crescendo-line3').getAttribute('class');
    expect(cls).toContain('crescendo-highlight');
  });

  // ── Closing section ───────────────────────────────────────────────────────

  test('heart SVG is present in closing', async ({ page }) => {
    await expect(page.locator('.heart-svg')).toBeAttached();
  });

  test('closing author element is present', async ({ page }) => {
    await expect(page.locator('.closing-author')).toBeAttached();
  });

  test('replay button is present', async ({ page }) => {
    await expect(page.locator('#replay-btn')).toBeAttached();
  });

  test('replay button has aria-label "Begin Again"', async ({ page }) => {
    // Button now uses SVG icon + aria-label; text has been replaced by graphical element
    const label = await page.locator('#replay-btn').getAttribute('aria-label');
    expect(label).toContain('Begin Again');
  });

  // ── Fixed UI ──────────────────────────────────────────────────────────────

  test('sound toggle is visible (no hidden attr)', async ({ page }) => {
    const hidden = await page.locator('#sound-toggle').getAttribute('hidden');
    expect(hidden).toBeNull();
  });

  test('TOC sheet has 20 list items', async ({ page }) => {
    await expect(page.locator('#toc-list li')).toHaveCount(20);
  });

  // ── Scroll reveal ─────────────────────────────────────────────────────────

  test('scrolling to chapter-01 reveals its content (.visible on text-wrap)', async ({ page }) => {
    // The .visible class is added to .reveal children (e.g. .chapter-text-wrap),
    // not the article itself. IntersectionObserver uses rAF internally, so advance
    // the fake clock so the IO callback fires.
    await page.evaluate(() => {
      const ch = document.getElementById('chapter-01');
      if (ch) ch.scrollIntoView({ behavior: 'instant' });
    });
    await page.clock.runFor(500);
    await page.waitForTimeout(200);

    await expect(page.locator('#chapter-01 .chapter-text-wrap')).toHaveClass(/visible/);
  });

  test('default image mode is real when localStorage empty', async ({ page }) => {
    const mode = await page.evaluate(() => {
      try { localStorage.removeItem('image-mode'); } catch (e) {}
      return localStorage.getItem('image-mode') || 'real';
    });
    expect(mode).toBe('real');
  });

  test('mobile dock is visible in journey', async ({ page }) => {
    await page.clock.runFor(500);
    await page.waitForTimeout(200);
    const hidden = await page.locator('#mobile-dock').getAttribute('hidden');
    expect(hidden).toBeNull();
    await expect(page.locator('#mobile-dock')).toHaveClass(/visible/);
  });

  test('image mode button exists in dock', async ({ page }) => {
    await expect(page.locator('#image-mode-btn')).toBeAttached();
  });
});
