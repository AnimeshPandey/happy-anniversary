# Architecture

A single-page, vanilla HTML/CSS/JS anniversary experience. No build step, no framework, no npm. Works offline via service worker.

---

## File Map

| File | Role |
|------|------|
| `index.html` | All markup. Static shell + injected regions for dynamic content. |
| `style.css` | All styles. Base block (lines 1–700) then Phase 4-13 additions (~1010+). |
| `content.js` | Single `SITE` object + `IMAGE_SLOTS` map. All copy lives here — change text here only. |
| `themes.js` | `THEMES` array — 8 theme objects each with CSS token map + motion config + particle style. |
| `theme-controller.js` | `ThemeController` IIFE — applies tokens to `:root`, animates content swap, builds dots. |
| `main.js` | All behaviour — init sequence, animations, observers, gestures, audio. One IIFE, no globals. |
| `sw.js` | Service worker — cache-first strategy. Bump `CACHE` version on every deploy. |
| `manifest.json` | PWA manifest for Add to Home Screen. |
| `PHOTOS.md` | Step-by-step guide for adding real photos. |
| `ROADMAP.md` | Feature backlog + mobile-first principles. |
| `TESTING.md` | Manual QA checklist for every feature. |
| `scripts/process-photos.sh` | Image optimisation pipeline (resizes + converts to WebP). |

---

## Initialisation Sequence

```
HTML parsed
  └─ content.js   (SITE, IMAGE_SLOTS globals)
  └─ themes.js    (THEMES global)
  └─ theme-controller.js  (ThemeController global)
  └─ main.js IIFE
        └─ DOMContentLoaded → init()
              ├─ initPetals()             falling petal layer (18 mobile / 28 desktop)
              ├─ initThemeSelector()      lockScroll(), build dots, attach gestures
              ├─ buildOpeningPanels()     DOM from SITE.opening (poem + panels)
              ├─ buildChapters()          DOM from SITE.chapters + hiddenChapter
              ├─ buildCrescendo()         text from SITE.crescendo
              ├─ buildClosing()           text + author + image from SITE.closing
              ├─ initBeginButton()        portal transition handler
              ├─ initScrollProgress()     scroll bar
              ├─ initOrientationGuard()   landscape overlay
              ├─ initShare()              Web Share API
              ├─ initSound()              ambient audio toggle + AudioContext unlock
              ├─ initPullToRestart()      pull-down gesture
              └─ raf2(→)                  deferred after 2 animation frames
                    ├─ initReveal()           IntersectionObserver for .reveal elements
                    ├─ initHeart()            SVG draw + fill + confetti + dedication reveal
                    ├─ initTypewriter()       poem character animation
                    ├─ initChapterNav()       12 fixed dot nav buttons
                    ├─ initFloats()           desktop-only floating SVGs (skipped on mobile)
                    ├─ initChapterHeader()    scroll-direction chapter header
                    ├─ initTOCSheet()         bottom sheet + long-press to open
                    ├─ initHiddenChapter()    triple-tap easter egg on ch12 ornament
                    ├─ initOrnamentsObserver()  chapter-complete particle pop
                    ├─ initDoubleTapLove()    double-tap image → floating heart
                    ├─ initClosingSignoff()   SVG underline on signoff
                    ├─ initReplay()           replay button
                    └─ initShakeDetection()   shake → confetti
```

---

## Phase Flow

```
Phase 0a: Theme Selector  (#theme-selector, z-index 300, scroll locked via body-lock)
Phase 0b: Ceremony        (#ceremony, z-index 200, scroll still locked)
Phase 1:  Portal bloom    (#portal-overlay, z-index 350, ~620ms: 280ms expand + 340ms collapse)
Phase 2+: Journey         (#journey, scroll unlocked, opacity 0→1 fade-in)
```

### Scroll Lock (iOS-safe body-lock)

During phases 0a and 0b, `lockScroll()` sets `body { position: fixed; top: 0; left: 0; right: 0; overflow: hidden }` and `html { overflow: hidden }`. This is the only pattern that reliably prevents iOS Safari rubber-band scrolling through the fixed overlay layers.

When `showJourneyUI()` fires, `unlockScroll()` clears all those properties. Because the body was `position: fixed; top: 0`, the scroll position is always 0 when unlocked — no flash or jump can occur.

`showJourneyUI()` is guarded by a `_journeyStarted` boolean that prevents double-calls (e.g., from the countdown ring auto-firing at the same time as a manual Begin tap).

---

## CSS Custom Property System

All visual tokens are CSS custom properties on `:root`. Themes override them via `ThemeController.applyTokens()`. Core tokens:

```
--bg --bg-warm --cream            background layers
--rose --rose-light --rose-mid --rose-dark   primary accent
--gold --gold-light               secondary accent
--text --text-soft                typography
--crescendo-dark --crescendo-mid  crescendo gradient stops
--orb-shadow                      orb glow colour
--selector-bg-a                   theme selector background
--ph-bg-start --ph-bg-end         image placeholder gradient
--petal-1 … --petal-6             falling petal colours
--motion-duration --motion-ease --motion-stagger --motion-reveal-offset
```

Motion tokens are per-theme — `Moonlight Mithai` uses 1.2s cinematic reveals, `SangeetSpark Symphony` uses 0.35s snappy reveals.

---

## Data Flow

```
content.js (SITE)
  → buildOpeningPanels()  → DOM article.opening-panel × 2
  → buildChapters()       → DOM article.chapter × 12 + #chapter-hidden
  → buildClosing()        → DOM with closing message / signoff / .closing-author (Animesh)
  → IMAGE_SLOTS           → buildPlaceholder(imageId) → figure.image-placeholder

themes.js (THEMES)
  → ThemeController.init()  → applyTokens(THEMES[0]) + buildDots() + updateUI(THEMES[0])
  → ThemeController.set(i)  → applyTokens(theme) + animateContent(updateUI)
                              isTransitioning guard: one change per 600ms
  → main.js saves index     → localStorage('anniversary-theme-idx')
  → main.js updates meta    → meta[name="theme-color"] content = theme.tokens['--rose']
```

---

## Key Component Details

### ThemeController (`theme-controller.js`)

- `init()` — builds dot buttons, applies theme 0 tokens + UI
- `set(index)` — guarded by `isTransitioning` (600ms cooldown). Calls `applyTokens()` synchronously (instant CSS var update), then `animateContent()` (180ms fade-out → text swap → 400ms fade-in)
- `current()` — returns the active theme object
- `cycle()` — shorthand for `set(currentIndex + 1)`

### Image Placeholders (`buildPlaceholder()`)

Each `IMAGE_SLOTS` entry generates a `<figure role="img" aria-label="...">` with:
- SVG camera icon
- Placeholder description text
- Gold corner bracket ornament (`<svg class="image-frame">`)
- `.image-curtain` overlay (rose-coloured, `scaleX(1→0)` on `.visible`)

When a real photo is added (see `PHOTOS.md`), an `<img>` inside the figure replaces the camera icon; the curtain still animates.

### Portal Transition (`initBeginButton()`)

1. Ceremony `display: none` (instant)
2. `#portal-overlay` gets CSS class `expanding` → `clip-path: circle(0→200vmax)` over 280ms
3. After 280ms: class swapped to `collapsing` → `circle(200vmax→0)` over 340ms
4. After 340ms: `showJourneyUI()` fires

The portal background uses a radial gradient from `--gold-light` through `--rose` to `--rose-dark`, anchored to the click/tap point via `--pcx` / `--pcy` CSS variables.

### Heart + Closing Sequence (`initHeart()`)

1. `IntersectionObserver` triggers when `.heart-wrap` is 50% in view
2. `strokeDashoffset` transitions 255→0 (1.6s) — the draw animation
3. After 1.7s: `filled` class added (rose fill, `heartFill` animation)
4. `.heart-wrap` gets `heart-done` class → 5× pulse at 1.2s
5. After 2.5s: `.anniversary-dedication` element created and faded in
6. `fireSlowCascade()` spawns 8 themed petals for a final celebratory cascade

---

## Service Worker

Cache strategy: **cache-first, network fallback**. On cache miss, fetches from network and stores response.

- Cache name: `anniversary-v6` — **bump this on every deploy** to bust old caches
- Cached assets: `./`, `./index.html`, `./style.css`, `./main.js`, `./themes.js`, `./content.js`, `./theme-controller.js`, `./manifest.json`
- Photos are NOT pre-cached — they load from network and get cached on first view.

**On every deploy**: increment `CACHE` in `sw.js`. The activate handler deletes all old caches automatically.

---

## Key Constraints

- No build step — edit files directly, test in browser.
- No em-dashes in copy — use commas, colons, or hyphens (`WRITING.md`).
- Mobile-first: design for 390px portrait, enhance for desktop.
- `content.js` is the single source of truth for all copy and image slots.
- `themes.js` is the single source of truth for all visual tokens and motion presets.
- All commits use `user.name = AnimeshPandey` / `user.email = animeshpandey1909@gmail.com`.
