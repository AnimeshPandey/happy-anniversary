# Architecture

A single-page, vanilla HTML/CSS/JS anniversary experience. No build step, no framework, no npm. Works offline via service worker.

---

## File Map

| File | Role |
|------|------|
| `index.html` | All markup. Static shell + injected regions for dynamic content. |
| `style.css` | All styles. Two blocks: base styles (lines 1–675) and Phase 4-13 additions (lines ~1010+). |
| `content.js` | Single `SITE` object + `IMAGE_SLOTS` map. All copy lives here — change text here only. |
| `themes.js` | `THEMES` array — 8 theme objects each with CSS token map + motion config + particle style. |
| `theme-controller.js` | `ThemeController` IIFE — applies tokens to `:root`, animates content swap, builds dots. |
| `main.js` | All behaviour — init sequence, animations, observers, gestures, audio. One IIFE, no globals. |
| `sw.js` | Service worker — cache-first strategy. Bump `CACHE` version on every deploy. |
| `manifest.json` | PWA manifest for Add to Home Screen. |
| `PHOTOS.md` | Step-by-step guide for adding real photos. |
| `ROADMAP.md` | Feature backlog + mobile-first principles. |
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
              ├─ initPetals()             falling petal layer
              ├─ initThemeSelector()      lock scroll, build dots, attach gestures
              ├─ buildOpeningPanels()     DOM from SITE.opening
              ├─ buildChapters()          DOM from SITE.chapters + hiddenChapter
              ├─ buildCrescendo()         text from SITE.crescendo
              ├─ buildClosing()           text + image from SITE.closing
              ├─ initBeginButton()        portal transition handler
              ├─ initScrollProgress()     scroll bar
              ├─ initOrientationGuard()   landscape overlay
              ├─ initShare()              Web Share API
              ├─ initSound()              ambient audio toggle + AudioContext unlock
              ├─ initPullToRestart()      pull-down gesture
              └─ raf2(→)
                    ├─ initReveal()           IntersectionObserver for .reveal elements
                    ├─ initHeart()            SVG draw + fill + confetti
                    ├─ initTypewriter()       poem character animation
                    ├─ initChapterNav()       fixed dot nav
                    ├─ initFloats()           desktop-only floating SVGs
                    ├─ initChapterHeader()    scroll-direction chapter header
                    ├─ initTOCSheet()         bottom sheet + long-press to open
                    ├─ initHiddenChapter()    triple-tap easter egg
                    ├─ initOrnamentsObserver()  chapter-complete particle pop
                    ├─ initDoubleTapLove()    double-tap image → floating heart
                    ├─ initClosingSignoff()   SVG underline on signoff
                    ├─ initReplay()           replay button
                    └─ initShakeDetection()   shake → confetti
```

---

## Phase Flow

```
Phase 0a: Theme Selector  (#theme-selector, z-index 300, scroll locked)
Phase 0b: Ceremony        (#ceremony, z-index 200, scroll still locked)
Phase 1:  Portal bloom    (#portal-overlay, z-index 350, ~860ms)
Phase 2+: Journey         (#journey, scroll unlocked, scrollTo top)
```

---

## CSS Custom Property System

All visual tokens are CSS custom properties on `:root`. Themes override them via `ThemeController.applyTokens()`. Core tokens:

```
--bg --bg-warm --cream            background layers
--rose --rose-light --rose-mid --rose-dark   primary accent
--gold --gold-light               secondary accent
--text --text-soft                typography
--crescendo-dark --crescendo-mid  crescendo gradient
--orb-shadow                      orb glow colour
--selector-bg-a                   theme selector background
--ph-bg-start --ph-bg-end         image placeholder gradient
--petal-1 … --petal-6             falling petal colours
--motion-duration --motion-ease --motion-stagger --motion-reveal-offset
```

Motion tokens are per-theme — `Moonlight Mithai` is slow and dreamy, `SangeetSpark` is snappy.

---

## Data Flow

```
content.js (SITE)
  → buildChapters()   → DOM articles with .chapter, .chapter-text-wrap, etc.
  → buildClosing()    → DOM with closing message/signoff
  → IMAGE_SLOTS       → buildPlaceholder(imageId) → figure.image-placeholder

themes.js (THEMES)
  → ThemeController.init()  → applyTokens(THEMES[0]) + buildDots()
  → ThemeController.set(i)  → applyTokens(theme) + animateContent(updateUI)
  → main.js saves index     → localStorage('anniversary-theme-idx')
```

---

## Service Worker

Cache strategy: **cache-first, network fallback**. On cache miss, fetches from network and stores response.

- Cache name: `anniversary-v4` (bump on every deploy to bust old caches)
- Cached assets: `./`, `./index.html`, `./style.css`, `./main.js`, `./themes.js`, `./content.js`, `./theme-controller.js`, `./manifest.json`
- Photos are NOT pre-cached — they load from network and get cached on first view.

**Whenever you deploy**: increment `CACHE` in `sw.js` (e.g. `anniversary-v5`). The activate handler deletes all old caches automatically.

---

## Key Constraints

- No build step — edit files directly, test in browser.
- No em-dashes in copy (`WRITING.md`).
- Mobile-first: design for 390px portrait, enhance for desktop.
- `content.js` is the single source of truth for all copy and image slots.
- `themes.js` is the single source of truth for all visual tokens and motion presets.
