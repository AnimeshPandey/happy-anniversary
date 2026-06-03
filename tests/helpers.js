/**
 * Shared test helpers.
 *
 * goToJourney() drives the page from initial load through the full ceremony
 * and into the journey (scroll unlocked, nav dots visible).
 *
 * Timing notes (all are setTimeout durations in main.js):
 *   750ms   — theme selector fades out, runCeremonySequence() called
 *   +1200   — ceremony heading visible
 *   +1900   — recipient name visible
 *   +2600   — date line visible
 *   +3200   — days counter visible + initDaysCounter() starts tick chain
 *   +4300   — Begin button gets .visible class, countdown ring starts (10s)
 *   = 5050ms total from ts-start-btn click to Begin button visible
 *
 * Portal (after Begin click):
 *   +280ms  — portal expanding
 *   +340ms  — portal collapses, showJourneyUI() fires
 *   +50ms   — journey opacity transition starts
 *   = ~670ms from Begin click to journey scroll-unlocked
 *
 * We use page.clock.runFor() (fires nested timers) to advance through all of
 * this in ~200ms of real wall time instead of 6+ real seconds.
 *
 * Important:
 * - page.clock.install() is called AFTER page.goto() so the init sequence's
 *   rAF callbacks run normally with real timers.
 * - We use { force: true } on button clicks because CSS animations on the
 *   theme-selector elements keep them "unstable" per Playwright's checks.
 * - page.clock.runFor() (not fastForward) fires timer callbacks INCLUDING
 *   timers scheduled by other timer callbacks (nested chains).
 */

/**
 * @param {import('@playwright/test').Page} page
 */
async function goToJourney(page) {
  // Install fake clock AFTER page load — init sequence rAF already ran
  await page.clock.install();

  // Dismiss theme selector. Use force:true because the button has a CSS bounce
  // animation that keeps Playwright's stability check from resolving.
  await page.click('#ts-start-btn', { force: true });

  // Run fake timers through: 750ms (selector fade) + 4300ms (ceremony) = 5050ms
  // runFor fires nested timer callbacks too, so the whole chain completes.
  await page.clock.runFor(5100);

  // Let DOM mutations settle (class additions, layout)
  await page.waitForTimeout(100);

  // Click Begin. Force true because the button may have a visible-state animation.
  await page.click('#begin-btn', { force: true });

  // Run fake timers through portal: 280ms expand + 340ms collapse + 50ms fade = 670ms
  await page.clock.runFor(750);

  // Let rAF callbacks and DOM settle
  await page.waitForTimeout(100);
}

module.exports = { goToJourney };
