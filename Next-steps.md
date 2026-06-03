# Next Steps — Final Finishing and Refinement Plan

This document covers everything remaining before the experience is gift-ready. All major features are built. What remains is content, photos, polish, and a handful of enhancements. Work is grouped into three tiers: must-do (required for gifting), should-do (meaningful uplift), and nice-to-have.

---

## Current State (as of June 2026)

**What is done:**
- Full 9-theme selector with synthesised Web Audio ambient, per-theme pentatonic scales, and 18 ambient effect modules
- All 12 chapters + hidden chapter, crescendo, closing, heart animation
- Portal transition, ceremony with days counter, countdown ring
- Sound toggle (Web Audio oscillators, no files), chapter chimes, crossfade on theme switch
- Purrfect Pair theme (9th theme) with Mishri + Mochi cat SVG cameos
- 150/150 Playwright tests passing
- Service worker (offline), PWA manifest, JSON-LD schema
- Per-theme CSS type treatments (italic, line-height, letter-spacing)
- All visual polish items complete (ghost chapter numbers, 60/40 columns, shimmer placeholders, side nav, orb 2D float, etc.)

**What is not done:**
- Real photos (all 15 slots are placeholder cards)
- Final personalised copy (chapter bodies are generic placeholder text)
- Blur-up image loading
- Ken Burns pan/zoom on chapter images
- Performance audit on mid-range Android
- OG/share image for link previews

---

## Tier 1 — Must Do (required for gifting)

### 1. Write the final chapter copy

Every chapter in `content.js` needs personalised, finished copy. Current bodies are placeholder text. The writing rules in `WRITING.md` apply strictly:
- No em-dashes (use commas, colons, or a new sentence instead)
- No contractions in chapter bodies
- Second person ("you", "your"), warm, direct
- 3–6 sentences, 50–90 words per chapter
- Build emotionally from chapter to chapter

**Process:**
1. Open `content.js`
2. Find `SITE.chapters` — the 12-element array
3. Edit each `body` field with real, personal copy
4. Update `SITE.crescendo` — the three lines culminating in "Happy first anniversary." — make them specific
5. Update `SITE.closing.message` with a personal closing thought
6. Verify after editing: `document.body.innerText.includes('—')` must return `false` in the browser console

All 12 chapter titles and moods are already set correctly. Only `body` fields need finishing.

---

### 2. Add the real photos

15 image slots are defined in `PHOTOS.md`. Priority order for emotional impact:

| Slot | Ratio | Why it matters |
|------|-------|----------------|
| `closing-hero` | 3:4 | Appears at the emotional peak of the experience |
| `ch1-main` | 4:3 | Sets the tone from the very first chapter |
| `ch6-main` | 3:4 | Mid-point emotional anchor |
| `ch12-main` | 4:3 | The final chapter before the crescendo |
| `ceremony-bg` | 16:9 | Background texture for the ceremony screen |
| Everything else | varies | Fill in as photos become available |

**Process:**
1. Name photos to match slot IDs (e.g. `closing-hero.jpg`)
2. Drop into `assets/images/`
3. In `content.js`, add `src: 'assets/images/closing-hero.jpg'` to the matching `IMAGE_SLOTS` entry
4. Optional: add `thumbSrc` for blur-up (see Tier 2 item 4)
5. Bump `CACHE` in `sw.js` (e.g. `anniversary-v10` to `anniversary-v11`) after adding any photos

Without photos, the experience is still complete — the curtain-wipe animation fires on the gold-framed placeholder cards and looks intentional.

---

### 3. Bump service worker cache before every deploy

On every change to content, photos, or code:
1. Open `sw.js`
2. Increment `var CACHE = 'anniversary-v10'` to `anniversary-v11` (or next)
3. Commit and push — the activate handler deletes old caches automatically

---

## Tier 2 — Should Do (meaningful uplift)

### 4. Blur-up progressive image loading

Prevents the blank-then-snap appearance when photos load on slower connections.

**Step 1 — Generate thumbnails:**
For each real photo, create a tiny 20px-wide, heavily compressed thumbnail:
```bash
convert ch1-main.jpg -resize 20x -quality 20 ch1-main-thumb.jpg
```
(Or use `scripts/process-photos.sh` — check if it supports `--thumb` flag, add if needed.)

**Step 2 — In `content.js`, add thumbSrc:**
```js
'ch1-main': {
  aspectRatio: '4/3',
  placeholder: 'How it started, the very beginning',
  src: 'assets/images/ch1-main.jpg',
  thumbSrc: 'assets/images/ch1-main-thumb.jpg'
}
```

**Step 3 — In `buildPlaceholder()` in `main.js`, replace the img creation logic with:**
```js
if (slot.src) {
  var img = document.createElement('img');
  img.alt = slot.placeholder;
  img.loading = 'lazy';
  img.style.filter = 'blur(20px)';
  img.style.transition = 'filter 0.4s ease';
  if (slot.thumbSrc) {
    img.src = slot.thumbSrc;
    var full = new Image();
    full.onload = function() {
      img.src = slot.src;
      img.style.filter = 'blur(0)';
    };
    full.src = slot.src;
  } else {
    img.src = slot.src;
    img.onload = function() { img.style.filter = 'blur(0)'; };
  }
  fig.innerHTML = '';
  fig.appendChild(img);
}
```

---

### 5. Ken Burns pan/zoom on chapter images

Adds cinematic life to photos. Only activate when real photos are present (`has-photo` class).

**In `buildPlaceholder()`, add `has-photo` class to `.chapter-image-wrap` when `slot.src` is set:**
```js
if (slot.src) {
  fig.closest('.chapter-image-wrap').classList.add('has-photo');
}
```

**In `style.css`, append:**
```css
@keyframes kenBurns {
  0%   { transform: scale(1.08) translateX(-1.5%) translateY(-1%); }
  50%  { transform: scale(1.00) translateX( 1.5%) translateY( 1%); }
  100% { transform: scale(1.08) translateX(-1.5%) translateY(-1%); }
}

.chapter-image-wrap.has-photo img {
  animation: kenBurns 14s ease-in-out infinite;
  will-change: transform;
}

/* Suppress during curtain wipe */
.chapter-image-wrap.has-photo:not(.visible) img {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .chapter-image-wrap.has-photo img { animation: none; }
}
```

---

### 6. OG / share image for link previews

When the URL is shared on WhatsApp or iMessage, no image preview appears. Fix this:

1. Generate a 1200x630 image that captures the theme-selector or ceremony at its best
   - Option A: take a browser screenshot at exactly 1200x630 and save as `assets/og-image.jpg`
   - Option B: run `node scripts/generate-og-image.js` (the script exists — verify it outputs the right file)
2. In `index.html`, fill in the OG image tags (already present but pointing to placeholder):
   ```html
   <meta property="og:image" content="https://anmshpndy.com/happy-anniversary/assets/og-image.jpg">
   <meta property="og:image:width" content="1200">
   <meta property="og:image:height" content="630">
   <meta name="twitter:image" content="https://anmshpndy.com/happy-anniversary/assets/og-image.jpg">
   ```
3. Bump SW cache after adding the image

**Recommended OG image content**: PetalPop Parade theme selector, zoomed to the orb + name, on the pink background. Instantly recognisable and warm.

---

### 7. Performance audit on mid-range Android

Run Lighthouse with "Simulated throttling — Applied Slow 4G throttling" (or test on a real Pixel 4a / Samsung A32):

**Targets:**
- Performance score >= 85
- First Contentful Paint <= 2.5s
- Total Blocking Time <= 300ms
- Cumulative Layout Shift <= 0.05

**Known areas to check:**
- `will-change: transform` on petals: currently all petals get it; limit to visible viewport petals only to reduce compositor layer count
- Ambient effect element count: each module should create at most 15 elements; check `initFireflies()`, `initConstellations()`, `initKittyPaws()` for bounds
- Font loading: Playfair Display is preloaded via `<link rel="preload">` in `index.html` — verify it is present and the path is correct
- Verify `content-visibility: auto` on `.chapter` in `style.css` — check it is present with `contain-intrinsic-size: 0 500px`

---

### 8. Final accessibility pass (VoiceOver + axe)

Before gifting on a real iPhone:

**VoiceOver on iPhone (iOS Settings > Accessibility > VoiceOver):**
1. Navigate through theme selector — each theme change should announce the theme name via the `#ts-announce` aria-live region
2. Verify the "Begin" button is reachable and its label is announced
3. Verify chapter images have meaningful alt text (they use `aria-label` on the `<figure>`)
4. Verify the sound toggle announces its state (playing / stopped)
5. Verify the TOC sheet (`role="dialog"`, `aria-modal="true"`) traps focus correctly when open

**axe DevTools (Chrome extension) on desktop:**
1. Install axe DevTools
2. Run on the theme selector, ceremony, and journey sections
3. Fix any Critical or Serious violations (Moderate is acceptable)

---

## Tier 3 — Nice to Have

### 9. Seasonal auto-suggest theme label

On page load, surface a subtle "Suggested for June" label on the dot that best matches the current month:

```js
// In initThemeSelector(), after building dots:
var SEASONAL = { 2: 2, 3: 5, 4: 5, 5: 0, 6: 5, 8: 4, 11: 7 }; // month (0-based) → theme index
var suggestedIdx = SEASONAL[new Date().getMonth()];
if (suggestedIdx !== undefined) {
  var dots = document.querySelectorAll('#ts-dots .ts-dot');
  if (dots[suggestedIdx]) dots[suggestedIdx].setAttribute('data-seasonal', 'true');
}
```

```css
/* In style.css */
.ts-dot[data-seasonal]::after {
  content: 'Suggested';
  position: absolute;
  top: -1.6rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.55rem;
  color: var(--gold);
  white-space: nowrap;
  pointer-events: none;
}
```

---

### 10. Deep-link to chapter via URL hash

Allow linking directly to a chapter: `anmshpndy.com/happy-anniversary#chapter-05`

In `showJourneyUI()`, after the fade-in is complete (inside the `setTimeout` at ~600ms):
```js
var hash = window.location.hash;
if (hash && hash.startsWith('#chapter-')) {
  var target = document.querySelector(hash);
  if (target) {
    setTimeout(function() {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  }
}
```

No URL changes needed — purely hash-based.

---

### 11. Document title updates per chapter

As chapters scroll into view, update `document.title` for browser-tab context:

```js
// Add to the IntersectionObserver callback inside initChapterHeader():
document.title = '\u{1F495} Chapter ' + chapterNum + ' · Happy Anniversary';
// On scroll past closing section:
document.title = 'Happy Anniversary, Divya \u{1F49C}';
// Reset at top (scrollY < 100):
document.title = 'Happy Anniversary \u{1F339}';
```

---

### 12. Konami code easter egg

`ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a`

Triggers a 5-second 8-bit mode: monospace font swap, `image-rendering: pixelated` on photos, square-wave chiptune jingle via Web Audio.

```js
var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
              'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
var ki = 0;
document.addEventListener('keydown', function(e) {
  ki = (e.key === KONAMI[ki]) ? ki + 1 : 0;
  if (ki === KONAMI.length) {
    ki = 0;
    document.documentElement.classList.add('konami-mode');
    // play square-wave jingle here via Web Audio
    setTimeout(function() {
      document.documentElement.classList.remove('konami-mode');
    }, 5000);
  }
});
```

CSS:
```css
.konami-mode * { font-family: monospace !important; }
.konami-mode img { image-rendering: pixelated; filter: saturate(0); }
```

---

## Pre-Gifting Final Checklist

Run through this list before sharing the URL:

- [ ] All 12 chapter bodies are final, personal, and proofread
- [ ] `document.body.innerText.includes('—')` returns `false` (no em-dashes)
- [ ] `SITE.crescendo` lines are personal and specific
- [ ] `SITE.closing.message` is personal
- [ ] Days counter shows the correct number (verify `anniversaryStartDate` in `content.js`)
- [ ] All photos are in place (or a conscious decision to gift without them)
- [ ] `sw.js` CACHE version is bumped to the next increment
- [ ] `git config user.name` returns `AnimeshPandey`
- [ ] `npx playwright test` — all 150 tests pass
- [ ] Manual smoke test on real iPhone Safari: selector > ceremony > first 3 chapters > sound toggle > heart
- [ ] OG share image is set (test the URL in WhatsApp or iMessage first)
- [ ] No console errors on iPhone Safari (check Safari > Develop > [device])
- [ ] Service worker registers successfully (Application tab, first load, no errors)
- [ ] Lighthouse accessibility score >= 90

---

## Effort Estimate

| Task | Effort |
|------|--------|
| Write 12 chapter bodies | 2–4 hours (cannot be automated — the most personal work) |
| Finalise crescendo + closing copy | 30 minutes |
| Collect and process photos | 2–6 hours (depends on availability of good shots) |
| Add photos to content.js | 20 minutes |
| Blur-up loading implementation | 1 hour |
| Ken Burns CSS addition | 30 minutes |
| OG share image | 30 minutes |
| Performance audit + fixes | 1 hour |
| Accessibility pass | 45 minutes |
| **Total (Tier 1 + Tier 2)** | **~8–14 hours** |

The bottleneck is personal copy and photos — everything else is mechanical. The site can go live without Tier 2 and still deliver a complete, polished experience.
