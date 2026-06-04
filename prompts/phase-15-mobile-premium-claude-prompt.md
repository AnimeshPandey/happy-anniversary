
**Target repo path:** `happy-anniversary/` (vanilla static site: `index.html`, `main.js`, `style.css`, `content.js`, `themes.js`, `theme-controller.js`, `sw.js`)  
**Recipient:** Divya (wife). **Author voice:** Animesh, first person → second person (you/Divya).  
**North star:** Premium mobile experience on 390px iPhone Safari — crisp photos, working sound/controls, colourful theme-specific life on all 9 themes.

---

## Paste block (quick invoke)

```text
Implement Happy Anniversary Phase 15 — Mobile Premium Polish.

Read happy-anniversary/prompts/phase-15-mobile-premium-claude-prompt.md in full, then read happy-anniversary/ARCHITECTURE.md, WRITING.md, ROADMAP.md, and THEMING.md.

Mobile-first. Vanilla JS/CSS only — no frameworks. Match existing IIFE patterns in main.js.

Implement in order: P0 bugs → P1 photo stage + mobile dock → P2 theme parity → P3 content/meta → tests → bump sw.js cache.

Real photos default. All 9 themes polished equally. Do not rewrite chapter bodies unless listed in Content fixes.

Run: npx playwright test (150 tests must pass). Report manual iPhone QA checklist results.
```

---

## Your role

You are a **staff frontend engineer + motion/interaction designer** shipping Phase 15 of a personal anniversary gift site. The recipient opens this on her phone. Desktop is secondary.

**You are not:** rewriting the story from scratch, adding React/Vue, adding a backend, or breaking existing ceremony/theme-selector/journey flow.

---

## Read before coding (in order)

1. `happy-anniversary/ARCHITECTURE.md` — data flow, init order, effect modules
2. `happy-anniversary/ROADMAP.md` — mobile-first principles (CORE PRINCIPLE section)
3. `happy-anniversary/THEMING.md` — ThemeController, tokens, ambientEffects
4. `happy-anniversary/WRITING.md` — voice rules (Animesh → Divya)
5. `happy-anniversary/INTERACTIONS.md` — sound, effects, haptics
6. `happy-anniversary/content.js` — SITE + IMAGE_SLOTS (canonical copy)
7. `happy-anniversary/main.js` — buildPlaceholder, showJourneyUI, EFFECT_MODULES, initSound
8. `happy-anniversary/style.css` — image-placeholder, shimmer, bottom fixed UI
9. `happy-anniversary/themes.js` — all 9 themes + ambientEffects arrays
10. `happy-anniversary/TESTING.md` — test expectations

**Do not edit story copy from `Next-steps.md`** — it contains stale third-person drafts. Only `content.js` is canonical.

---

## Locked product decisions

| Decision | Value |
|----------|-------|
| Theme polish scope | All 9 themes equally |
| Default image mode | `real` (actual photos for Divya) |
| AI toggle | Keep — for public sharing |
| Framework | None — extend existing vanilla IIFE |
| Performance floor | Mid-range Android, 55fps scroll |
| Reduced motion | Respect `prefers-reduced-motion: reduce` everywhere new |

---

## Known bugs to fix (P0 — do first)

### P0-A: Center “shine” / blurry photos on mobile

**Root cause:** Image layer stacking + `ph-loaded` race + heavy blur.

In `style.css`:
- `.image-placeholder img` — set `z-index: 3` so photo paints above `::after` shimmer (z-index 1) and below curtain (z-index 4).
- On `@media (max-width: 768px)`: replace `filter: blur(18px)` loading with `opacity: 0 → 1` transition (no blur on mobile).
- Kill shimmer whenever figure contains `img.ph-photo` (not only `.image-placeholder--loaded`).
- After curtain reveal completes, set `.image-curtain { visibility: hidden }` via transitionend to avoid subpixel sliver.

In `main.js` — `buildPlaceholder()` and `refreshAllImages()`:
```javascript
function markPhotoLoaded(img) {
  if (img.complete && img.naturalWidth > 0) img.classList.add('ph-loaded');
}
img.onload = function () { img.classList.add('ph-loaded'); };
img.onerror = function () {
  img.classList.add('ph-loaded'); // remove blur trap
  img.closest('.image-placeholder').classList.remove('image-placeholder--loaded');
};
img.src = imgSrc;
markPhotoLoaded(img);
```

### P0-B: Image mode toggle appears broken

- Change default: `localStorage.getItem('image-mode') || 'real'`.
- On mode switch in `refreshAllImages()`: if `existing.src === newSrc`, force reload: `existing.src = ''; existing.src = newSrc;` or append `?v=` + Date.now().
- Always call `markPhotoLoaded(existing)` after src set.
- Replace emoji button text with inline SVG icons (camera / palette).
- First journey start: one-time toast “Showing your real photos · tap icon for illustrated mode”.

### P0-C: Sound button inaudible / “doesn’t work”

- In `startAmbient()`: mobile gain peak **0.10** (desktop 0.06–0.08). Detect via `window.matchMedia('(max-width: 768px)')` at runtime, not parse-time `isMobile`.
- Unlock AudioContext on **Begin ceremony tap** (in addition to sound button): `getAudioCtx().resume()`.
- `initSound()`: bind both `click` and `touchend` (preventDefault on touchend to avoid double-fire).
- Toggle feedback: haptic(15) + 2s toast “Music on” / “Music off”.
- Optional: if Web Audio unavailable, skip silently — do not throw.

### P0-D: Missing theme effect modules (silent no-ops)

`themes.js` references these but `EFFECT_MODULES` in `main.js` lacks them:

| Module key | Theme | Implement |
|------------|-------|-----------|
| `marigold-garland` | Gulabo Garden | Drifting marigold circles/strings along top 15% viewport |
| `mint-leaves` | Butterfly Blush | Soft green leaf shapes drifting diagonally |
| `elephant` | SangeetSpark | Small elephant silhouette walks across bottom every 45–70s |

Register in `EFFECT_MODULES`. Each returns cleanup function like existing modules. Use `#theme-effects-layer`, `pointer-events: none`, mobile-reduced counts at **70% of desktop** (not 40%).

### P0-E: Cat cameo disabled on mobile

Remove `if (isMobile || reducedMotion) return` guard at top of `initCatCameo()`. Instead: smaller SVGs (60px), spawn from bottom safe area, interval 60–90s on mobile, respect `reducedMotion` only.

### P0-F: Static `isMobile` at parse time

Replace `var isMobile = matchMedia(...).matches` with:
```javascript
function getIsMobile() {
  return window.matchMedia('(max-width: 768px)').matches;
}
```
Update all `isMobile` references to `getIsMobile()` for rotation/resize correctness.

---

## P1 — Mobile image theatre (highest visual impact)

### P1-A: Photo stage overlay

Add `openPhotoStage(imageId, sourceRect)` and `closePhotoStage()` in `main.js`.

**Markup:** inject `#photo-stage` into `index.html` (or create once in JS):
- Backdrop: `position:fixed; inset:0; z-index:400; background: linear-gradient(180deg, var(--crescendo-dark), var(--rose-dark))`
- Photo: `object-fit: contain; max-height: 75dvh`
- Caption: slot `placeholder` text, Playfair italic
- Close: backdrop tap, swipe-down (80px threshold), Escape key

**Entry animation:** FLIP from tapped image `getBoundingClientRect()` to centered stage (300ms, `--ease-spring`).

**While open:**
- Ken Burns: `scale(1) → scale(1.06)` + 2% translate over 12s (CSS animation on `.photo-stage-img`, disabled for reduced-motion)
- Theme particle burst via existing `fireConfetti()` using theme token colours
- Themed rotating border: CSS `conic-gradient` on pseudo-element using `--rose`, `--gold`, `--petal-1..6`

**Per-theme stage accents** — dispatch table `STAGE_ACCENTS[theme.id]`:

| theme.id | Accent |
|----------|--------|
| purrfect-pair | Paw prints in corners; lavender outer glow |
| petalpop | Cherry petals fall inside stage |
| moonlight-mithai | Moon halo top-right |
| candy-cloud | Sprinkles orbit frame |
| gulabo-garden | Marigold drape top edge |
| starry-snuggle | Firefly dots orbit |
| butterfly-blush | 2 butterflies cross |
| sangeetspark | Diya flicker bottom |
| velvet-vows | Candle vignette + gold leaf |

### P1-B: In-flow mobile image polish

In `style.css` `@media (max-width: 768px)`:
- `.image-placeholder--loaded.ph-loaded` (or img.ph-loaded parent): `box-shadow: 0 0 60px color-mix(in srgb, var(--rose) 35%, transparent)`
- Ken Burns in scroll: IntersectionObserver at threshold 0.6 adds `.ken-burns-active` to `.chapter-image-wrap`; CSS `@keyframes kenBurns` using only `transform`
- Optional `.chapter--polaroid` modifier for chapters 01–05: white 8px border, chapter number in `--gold` bottom-right

### P1-C: Tap vs double-tap

In `initDoubleTapLove()` area:
- Single tap (280ms wait) → `openPhotoStage`
- Double tap within 280ms → existing heart popup (keep)

---

## P1 — Mobile action dock

Replace bottom clutter (share left, 20 dots center, image+sound right) with unified dock on `max-width: 768px`:

**`#mobile-dock`** fixed bottom, safe-area, `z-index: 70`, frosted pill:
`[Share] [Sound] [Photo mode] [Chapters ▴]`

- Move `#sound-toggle` and image mode btn into dock in `index.html` — stop `document.body.appendChild` for image btn in `showJourneyUI()`.
- Chapters button shows `"Ch {n} · {title}"` from active chapter IntersectionObserver; tap opens existing TOC sheet (`initTOCSheet`).
- Hide `#chapter-nav` dot strip on mobile; keep desktop side-rail at `min-width: 1024px`.
- All buttons min 48×48px touch targets.

Remove duplicate `z-index` on `#sound-toggle` (currently 55 !important then 50).

---

## P2 — Theme parity (all 9 themes)

For **each** theme in `themes.js`, verify and implement:

| Upgrade | Action |
|---------|--------|
| A. Ambient density | Mobile effect counts = 70% of desktop values |
| B. Scroll burst | On chapter image entering viewport (threshold 0.5): 8 particles from image centre, theme colours |
| C. Themed image frame | Replace generic gold bracket SVG with theme-specific corner motif (9 variants, selected by `ThemeController.current().id`) |
| D. Crescendo readability | Spot-check gradient on OLED; adjust `--crescendo-mid` if text contrast fails |

Add shared `chapter-image-aura` effect: radial pulse behind active chapter image, `--rose` at 15% opacity, once per chapter.

Theme selector mobile: larger icon/tagline; ripple on dot tap using existing `flashThemeTransition()`.

---

## P2 — Additional animations

| Feature | Implementation |
|---------|----------------|
| Scroll parallax | Mobile only: ±8px translateY on `.chapter-image-wrap` via rAF-throttled scroll listener |
| Mood pill bounce | `.chapter-mood` fade-up + spring on chapter text reveal |
| Closing lock-screen | Closing section: blurred `closing-hero` bg, large “365 days” (or computed days from SITE.date), heart pulse |
| Haptic vocabulary | Chapter entry 10ms, photo stage 25ms, crescendo 40ms via existing `haptic()` |
| Theme switch in journey | `crossfadeAmbient()` + `clearThemeEffects()` + `initThemeAmbientEffects()` + flash (already partial — verify) |

**Skip:** Konami code, memory quiz, map, 3D tilt, cursor effects.

---

## P3 — Content and meta fixes

In `content.js` only:
- `ch20-main` placeholder: “the two of us at Mysore” (not “you”)
- Optional opening panel 2: “the two of us, one quiet start” (not “two people”)

In `index.html`, `manifest.json`, JSON-LD:
- “Twenty chapters” (not twelve)

In `Next-steps.md`:
- Add banner at top: `⚠️ STALE — edit content.js only for story copy`

Do **not** rewrite chapter bodies — POV audit confirmed live copy is correct Animesh → Divya.

---

## P3 — AI images (secondary, for sharing mode)

13 slots still have empty `aiSrc` in `content.js`:
`hero-main`, `ceremony-bg`, `ch1-main`, `ch2-main`, `ch5-main`, `ch6-main`, `ch7-main`, `ch10-main`, `ch16-main`, `ch18-main`, `ch20-main`, `closing-hero`, `hidden-ch`

**If you cannot generate images:** skip generation but wire `aiSrc` paths and document in commit message. **If you can:** use prompts in `happy-anniversary/scripts/ai-image-prompts.md` and `Next-steps.md` Part 5. Style: vibrant anime illustration, Indian aesthetic, warm saturated colours, recognisable likenesses. Save to `assets/images/ai/<slot>.jpg`.

After any asset change: bump `sw.js` cache version.

---

## Tests and QA

### Automated
- Update `tests/journey.spec.js`: default `_imageMode` is `'real'` (or localStorage empty → real photos shown)
- Add `tests/photo-stage.spec.js`: tap image → `#photo-stage` visible → escape closes
- Add test: cached image gets `.ph-loaded` without onload (mock complete)

Run: `npx playwright test` — all tests must pass.

### Manual iPhone checklist
- [ ] No permanent blur/shimmer on any of 20 chapter photos
- [ ] Tap photo → fullscreen stage with theme accent; swipe down closes
- [ ] Sound audible on first tap after Begin
- [ ] Photo mode toggle swaps ch3/ch4/ch12 visibly
- [ ] All 9 themes show distinct ambient effects within 3s
- [ ] Dock: all 4 buttons reachable with thumb
- [ ] Hidden chapter ∞ still works (triple-tap ch12 ornament)
- [ ] Read ch07, ch12, ch20 — voice still Animesh to Divya

### Docs
- Add **Phase 15** section to `ROADMAP.md` listing what shipped
- Update `TESTING.md` with photo stage + dock cases

---

## Code conventions (mandatory)

- Extend existing IIFE in `main.js` — no ES modules unless already used
- CSS custom properties from themes — no hardcoded rose/gold hex in new code except effect particles
- `will-change: transform, opacity` on animated elements; never animate width/height/top/left
- `touch-action: manipulation` on new interactive elements
- `env(safe-area-inset-*)` on all new fixed UI
- `content-visibility: auto` on `.chapter` — do not remove
- Minimal diff — do not refactor unrelated ceremony/theme-selector code
- No exclamation marks in user-facing story copy
- British spelling: favourite

---

## Do NOT

- Do not change chapter body text except items in P3 content fixes
- Do not edit from `Next-steps.md` story duplicates
- Do not add npm dependencies or build step
- Do not remove service worker or break offline cache
- Do not disable reduced-motion paths
- Do not force AI mode as default
- Do not remove real photo paths from IMAGE_SLOTS

---

## Definition of done

Phase 15 is complete when:
1. All P0 bugs fixed on mobile viewport
2. Photo stage + mobile dock shipped
3. All 9 themes have working ambientEffects (including marigold-garland, mint-leaves, elephant)
4. Real photos default; toggle works with visible swap on AI-ready slots
5. Content/meta POV fixes applied
6. Playwright green
7. Manual checklist above verified (report results)
8. `sw.js` cache bumped
9. `ROADMAP.md` Phase 15 documented
