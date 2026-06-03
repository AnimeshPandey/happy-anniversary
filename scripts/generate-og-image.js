/**
 * Generates assets/og-image.jpg (1200x630) using Playwright.
 * Run: node scripts/generate-og-image.js
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    font-family: 'Georgia', 'Times New Roman', serif;
    background: linear-gradient(135deg, #ffe0ee 0%, #ffd6e7 25%, #f9c1d8 50%, #fce4ec 75%, #fff0f6 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Decorative circles — depth */
  .circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.18;
  }
  .c1 { width: 520px; height: 520px; background: radial-gradient(circle at 30% 30%, #FFB3CC, #C0185F); top: -120px; right: -80px; }
  .c2 { width: 340px; height: 340px; background: radial-gradient(circle at 60% 60%, #FFD700, #D4A017); bottom: -100px; left: -60px; }
  .c3 { width: 180px; height: 180px; background: radial-gradient(circle at 50% 50%, #FF6B9D, #A0185F); top: 80px; left: 120px; opacity: 0.12; }

  /* Grain texture */
  .grain {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.4;
    pointer-events: none;
  }

  /* Floral top ornament */
  .ornament {
    position: absolute;
    top: 36px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    color: #D4A017;
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    opacity: 0.7;
  }
  .ornament-line { width: 60px; height: 1px; background: linear-gradient(to right, transparent, #D4A017); }
  .ornament-line.right { background: linear-gradient(to left, transparent, #D4A017); }

  /* Central content */
  .content {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 0 80px;
    max-width: 900px;
  }

  /* Top label */
  .label {
    font-family: 'Arial', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #D4A017;
    margin-bottom: 28px;
    opacity: 0.85;
  }

  /* Main title */
  .title {
    font-size: 80px;
    font-style: italic;
    color: #8B0A3B;
    line-height: 1.05;
    margin-bottom: 22px;
    font-weight: 400;
    text-shadow: 0 2px 20px rgba(192,24,95,0.12);
  }

  /* Tagline */
  .tagline {
    font-family: 'Arial', sans-serif;
    font-size: 18px;
    font-weight: 300;
    color: #6B3050;
    letter-spacing: 0.08em;
    line-height: 1.6;
    margin-bottom: 36px;
    opacity: 0.82;
  }

  /* Heart + divider row */
  .divider-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-bottom: 28px;
  }
  .divider-line { width: 80px; height: 1px; background: linear-gradient(to right, transparent, rgba(192,24,95,0.35)); }
  .divider-line.right { background: linear-gradient(to left, transparent, rgba(192,24,95,0.35)); }
  .heart { color: #C0185F; font-size: 20px; opacity: 0.7; }

  /* Sub-tagline */
  .sub {
    font-family: 'Arial', sans-serif;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #8B4060;
    opacity: 0.6;
  }

  /* Floating petals */
  .petal {
    position: absolute;
    border-radius: 50% 0 50% 0;
    opacity: 0.22;
    transform: rotate(var(--r));
  }
  .p1 { width: 28px; height: 42px; background: #FF6B9D; top: 110px; left: 200px; --r: -30deg; }
  .p2 { width: 22px; height: 34px; background: #FFB3CC; top: 380px; left: 160px; --r: 15deg; }
  .p3 { width: 18px; height: 28px; background: #D4A017; top: 220px; right: 200px; --r: 45deg; }
  .p4 { width: 26px; height: 38px; background: #FF6B9D; bottom: 120px; right: 240px; --r: -60deg; }
  .p5 { width: 14px; height: 22px; background: #FFB3CC; top: 70px; left: 380px; --r: 25deg; }
  .p6 { width: 20px; height: 30px; background: #D4A017; bottom: 80px; left: 310px; --r: -45deg; opacity: 0.15; }

  /* Bottom URL */
  .url {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Arial', sans-serif;
    font-size: 12px;
    letter-spacing: 0.25em;
    color: #8B4060;
    opacity: 0.45;
    text-transform: lowercase;
  }
</style>
</head>
<body>
  <div class="grain"></div>
  <div class="circle c1"></div>
  <div class="circle c2"></div>
  <div class="circle c3"></div>
  <div class="petal p1"></div>
  <div class="petal p2"></div>
  <div class="petal p3"></div>
  <div class="petal p4"></div>
  <div class="petal p5"></div>
  <div class="petal p6"></div>

  <div class="ornament">
    <div class="ornament-line"></div>
    <span>&#10045;</span>
    <span>One Beautiful Year</span>
    <span>&#10045;</span>
    <div class="ornament-line right"></div>
  </div>

  <div class="content">
    <p class="label">A Digital Love Letter</p>
    <h1 class="title">Happy<br>Anniversary</h1>
    <p class="tagline">Twelve chapters. One beautiful year.<br>A journey through everything we are.</p>
    <div class="divider-row">
      <div class="divider-line"></div>
      <span class="heart">&#10084;</span>
      <div class="divider-line right"></div>
    </div>
    <p class="sub">Tap to begin your journey</p>
  </div>

  <div class="url">anmshpndy.com/happy-anniversary</div>
</body>
</html>`;

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(HTML, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const outPath = path.resolve(__dirname, '../assets/og-image.jpg');
  await page.screenshot({
    path: outPath,
    type: 'jpeg',
    quality: 92,
    clip: { x: 0, y: 0, width: 1200, height: 630 }
  });

  await browser.close();
  console.log('OG image saved to', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
