# Architecture

A single-page, vanilla HTML/CSS/JS anniversary experience. No build step, no framework, no npm runtime. Works offline via service worker.

---

## File Map

| File | Role |
|------|------|
| `index.html` | All markup. Static shell + injected regions for dynamic content. JSON-LD WebPage schema in `<head>`. |
| `style.css` | All styles (~2350 lines). Base block + Phase additions + ambient effect keyframes + per-theme overrides + `prefers-reduced-motion` block at end. |
| `content.js` | Single `SITE` object + `IMAGE_SLOTS` map. All copy lives here — change text here only. |
| `themes.js` | `THEMES` array — 9 theme objects each with CSS token map, sound profile, pentatonic scale, ambient note pair, ambient effects list, motion config, and particle style. |
| `theme-controller.js` | `ThemeController` IIFE — applies tokens to `:root`, animates content swap, builds dots. |
| `main.js` | All behaviour — init sequence, animations, observers, gestures, synthesised audio, ambient effects. One IIFE, no globals exposed. |
| `sw.js` | Service worker — network-first for HTML navigation, cache-first for static assets. Current cache: `anniversary-v10`. |
| `manifest.json` | PWA manifest for Add to Home Screen. |
| `THEMING.md` | Theme object reference: all token keys, motion presets, adding a new theme. |
| `PHOTOS.md` | Step-by-step guide for adding real photos. |
| `ROADMAP.md` | Feature backlog, completion status, mobile-first principles. |
| `TESTING.md` | Manual QA checklist for every feature. |
| `WRITING.md` | Copy guidelines: no em-dashes, no contractions in chapter bodies, etc. |
| `scripts/process-photos.sh` | Image optimisation pipeline (resizes + converts to WebP). |
| `scripts/ai-image-prompts.md` | AI image generation prompts per theme and slot. |

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
              ├─ initSound()              synthesised ambient toggle + AudioContext unlock
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
                    ├─ initReplay()           replay button (clears ambient effects + stops ambient)
                    └─ initShakeDetection()   shake → confetti

showJourneyUI() (fires after portal transition):
  └─ unlockScroll()
  └─ journey fade-in
  └─ setTimeout(initThemeAmbientEffects, 1800)   per-theme ambient effects start
```

---

## Phase Flow

```
Phase 0a: Theme Selector  (#theme-selector, z-index 300, scroll locked via body-lock)
Phase 0b: Ceremony        (#ceremony, z-index 200, scroll still locked)
Phase 1:  Portal bloom    (#portal-overlay, z-index 350, ~620ms: 280ms expand + 340ms collapse)
Phase 2+: Journey         (#journey, scroll unlocked, opacity 0→1 fade-in)
          └─ After 1.8s: per-theme ambient effects layer activates
```

### Scroll Lock (iOS-safe body-lock)

During phases 0a and 0b, `lockScroll()` sets `body { position: fixed; top: 0; left: 0; right: 0; overflow: hidden }` and `html { overflow: hidden }`. This is the only pattern that reliably prevents iOS Safari rubber-band scrolling through the fixed overlay layers.

When `showJourneyUI()` fires, `unlockScroll()` clears all those properties.

`showJourneyUI()` is guarded by a `_journeyStarted` boolean that prevents double-calls.

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

Motion tokens are per-theme — `Moonlight Mithai` uses 1.2s cinematic reveals, `SangeetSpark Symphony` uses 0.35s snappy reveals, `Purrfect Pair` uses 0.85s with a natural cubic-bezier.

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
  → main.js crossfades audio → crossfadeAmbient(newTheme) if ambient is playing
  → main.js updates effects  → clearThemeEffects() + initThemeAmbientEffects(newTheme)
```

---

## Key Component Details

### ThemeController (`theme-controller.js`)

- `init()` — builds dot buttons, applies theme 0 tokens + UI
- `set(index)` — guarded by `isTransitioning` (600ms cooldown). Calls `applyTokens()` synchronously (instant CSS var update), then `animateContent()` (180ms fade-out → text swap → 400ms fade-in)
- `current()` — returns the active theme object
- `cycle()` — shorthand for `set(currentIndex + 1)`

### Synthesised Ambient Audio (`main.js`)

No audio files — the ambient system uses the Web Audio API exclusively:

- `startAmbient(theme)` — creates two detuned `OscillatorNode` (sine, root + fifth from `theme.ambientNote`), a `GainNode` (peak 0.035), and a `BiquadFilterNode` (lowpass, 820 Hz). Ramps gain up over 1.2s.
- `stopAmbient()` — linear ramp to 0 over 0.8s, then `osc.stop()`.
- `crossfadeAmbient(newTheme)` — ramps old gain to 0 over 0.6s, starts new oscillators after 600ms. Called when theme switches while ambient is playing.
- `_ambientOn` / `_ambientNodes` — module-level state tracking playback and active nodes.
- `initSound()` — wires the sound toggle button; `AudioContext` is created lazily and resumed on first user interaction.

### Per-Theme Chimes (`playChime()`)

Each chapter entry triggers a two-note arpeggio using the active theme's `scale` array (12-note pentatonic/modal). Root note = `scale[chapterIndex % scale.length]`, chord note = `scale[(idx+2) % scale.length]`, played 45ms apart. Deduplicated per chapter via a `Set`.

### Per-Theme Ambient Effects

Effect modules registered in `EFFECT_MODULES` dispatch table (18 modules):

| Module name | What it does |
|---|---|
| `fireflies` | 8–14 fixed glowing orbs with CSS `fireflyDrift` + `fireflyGlow` |
| `shooting-stars` | Timed shooting star respawn every 4–12s |
| `moon-glow` | Single moon element with `moonFloat` animation |
| `cherry-gusts` | Burst of 6–13 petals every 5–13s |
| `butterfly-flutter` | RAF sinusoidal flight path, CSS wing flap |
| `drifting-clouds` | Cloud elements with `cloudDrift` CSS animation |
| `diyas` | 5–8 fixed `.diya-wrap` elements at screen bottom |
| `firework-bursts` | Fixed spark elements appended to body every 4–10s |
| `candle-flicker` | 4–6 `.candle-wrap` elements at bottom |
| `gold-leaf-dust` | `.gold-leaf` elements spawned every 1.8–5s |
| `peacock` | `.peacock-wrap` emoji walking across bottom |
| `ladybird` | 3–5 🐞 emoji elements with `ladybirdHop` |
| `constellations` | 20–35 `.constellation-dot` elements with `starTwinkle` |
| `sprinkles` | `.sprinkle` elements every 400–1200ms |
| `kitty-paws` | SVG paw prints, sequential walk sequences (desktop) |
| `yarn-ball` | `.yarn-ball` with `yarnRoll` every 22–40s |
| `floating-whiskers` | SVG `<line>` elements with `whiskerFloat` |
| `cat-cameo` | Full sequence: Mishri or Mochi SVG enters, blinks, pops a heart, exits |

All modules follow the signature `function initX(layer) { if (reducedMotion) return function(){}; ... return function cleanup() {}; }`.

`clearThemeEffects()` runs all cleanup functions, clears `#theme-effects-layer innerHTML`, and removes any firework sparks appended directly to `<body>`.

### Image Placeholders (`buildPlaceholder()`)

Each `IMAGE_SLOTS` entry generates a `<figure role="img" aria-label="...">` with:
- SVG camera icon + placeholder description text
- Gold corner bracket ornament (`<svg class="image-frame">`)
- `.image-curtain` overlay (rose-coloured, `scaleX(1→0)` on `.visible`)

### Portal Transition (`initBeginButton()`)

1. Ceremony `display: none` (instant)
2. `#portal-overlay` gets CSS class `expanding` → `clip-path: circle(0→200vmax)` over 280ms
3. After 280ms: class swapped to `collapsing` → `circle(200vmax→0)` over 340ms
4. After 340ms: `showJourneyUI()` fires

The portal background uses a radial gradient from `--gold-light` through `--rose` to `--rose-dark`, anchored to the click/tap point via `--pcx` / `--pcy` CSS variables.

### Heart + Closing Sequence (`initHeart()`)

1. `IntersectionObserver` triggers when `.heart-wrap` is 50% in view
2. `strokeDashoffset` transitions 255→0 (1.6s)
3. After 1.7s: `filled` class added (rose fill)
4. `.heart-wrap` gets `heart-done` class → 5× pulse at 1.2s
5. After 2.5s: `.anniversary-dedication` element created and faded in
6. `fireSlowCascade()` spawns 8 themed petals for a final celebratory cascade

---

## Service Worker

Cache strategy: **network-first for HTML navigation** (hard reload always gets fresh page), **cache-first for static assets**.

- Cache name: `anniversary-v10` — bump this on every deploy
- Cached assets: `./`, `./index.html`, `./style.css`, `./main.js`, `./themes.js`, `./content.js`, `./theme-controller.js`, `./manifest.json`
- Photos are NOT pre-cached — they load from network and get cached on first view.

**On every deploy**: increment `CACHE` in `sw.js`. The activate handler deletes all old caches automatically.

---

## Key Constraints

- No build step — edit files directly, test in browser.
- No em-dashes in copy — use commas, colons, or hyphens (`WRITING.md`).
- Mobile-first: design for 390px portrait, enhance for desktop.
- `content.js` is the single source of truth for all copy and image slots.
- `themes.js` is the single source of truth for all visual tokens, motion presets, and ambient effect configuration.
- All commits use `user.name = AnimeshPandey` / `user.email = animeshpandey1909@gmail.com`.
