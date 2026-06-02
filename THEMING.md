# Theming Reference

How themes work, how to add one, and what every property does.

---

## How Themes Work

1. `themes.js` exports `THEMES` — an array of theme objects.
2. On load, `ThemeController.init()` applies `THEMES[0]` and builds the dot indicators.
3. `ThemeController.set(index)` applies a theme: all CSS variables are set on `:root` via `style.setProperty`, then the selector UI text cross-fades.
4. The selected index is persisted to `localStorage('anniversary-theme-idx')` and restored on the next page load.

---

## Theme Object Structure

```js
{
  id:       'my-theme',           // unique kebab-case, applied as data-theme attr on <html>
  name:     'Theme Display Name', // shown in theme selector
  tagline:  'Short poetic description',
  icon:     '✿',                  // emoji, shown above the name

  particleStyle: {                // shapes applied to falling petals
    borderRadius: '50%',          // CSS border-radius (optional)
    clipPath: 'polygon(...)',     // CSS clip-path (optional, alternative to borderRadius)
    transform: 'rotate(45deg)',   // CSS transform applied at creation (optional)
  },

  motion: {
    duration:      '0.8s',        // CSS transition/animation duration for reveals
    ease:          'cubic-bezier(0.0, 0.0, 0.2, 1)', // CSS easing function
    stagger:       80,            // ms delay between staggered children (number)
    revealOffset:  '30px',        // translateY/X start offset for reveal animation
  },

  tokens: {
    // --- Backgrounds ---
    '--bg':             '#FFF0F3',   // page background
    '--bg-warm':        '#FDF5F0',   // warmer variant used in radial gradient overlay
    '--cream':          '#FDF3E3',   // used in ceremony background + closing gradient

    // --- Primary accent (rose family) ---
    '--rose':           '#C0185F',   // main accent: headings, borders, icons
    '--rose-light':     '#F4A0B0',   // lighter: dot indicators, subtle borders
    '--rose-mid':       '#E8789A',   // midpoint: placeholders, hover states
    '--rose-dark':      '#8B1A4A',   // darker: orb gradient deepest stop

    // --- Secondary accent (gold family) ---
    '--gold':           '#D4A017',   // chapter numbers, labels, date, underlines
    '--gold-light':     '#F0D080',   // orb highlight, crescendo last line

    // --- Typography ---
    '--text':           '#3D2B1F',   // body text
    '--text-soft':      '#6B5040',   // secondary text, captions, subtle labels

    // --- Crescendo section ---
    '--crescendo-dark': '#1C000D',   // gradient start (top-left)
    '--crescendo-mid':  '#6B0A35',   // gradient mid stop

    // --- Theme selector ---
    '--orb-shadow':     'rgba(192,24,95,0.35)', // box-shadow glow colour for orb
    '--selector-bg-a':  'var(--bg)',  // background colour of selector screen
    '--ts-start-bg':    'rgba(255,255,255,0.65)', // begin button background (now unused — arrow btn has no bg)

    // --- Image placeholders ---
    '--ph-bg-start':    '#FBE8F0',   // placeholder gradient start
    '--ph-bg-end':      '#EFC0D5',   // placeholder gradient end

    // --- Falling petals (6 colours used in rotation) ---
    '--petal-1': '#F4A0B0',
    '--petal-2': '#E8789A',
    '--petal-3': '#FBBEC9',
    '--petal-4': '#D4A0B8',
    '--petal-5': '#F9C4D4',
    '--petal-6': '#EFAABF',
  }
}
```

---

## Adding a New Theme

1. Open `themes.js`.
2. Add a new object to the `THEMES` array.
3. Pick an unused `id` (kebab-case, no spaces).
4. Fill in all required token keys (copy an existing theme as template).
5. Choose a `particleStyle` — three options work well:
   - **Circles**: `{ borderRadius: '50%' }`
   - **Petals**: `{ borderRadius: '60% 40% 60% 40% / 40% 60% 40% 60%' }`
   - **Stars**: `{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }`
   - **Diamonds**: `{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', borderRadius: '2px' }`
6. Choose a `motion` preset:
   - **Snappy**: `{ duration: '0.35s', ease: 'cubic-bezier(0.4,0,0.2,1)', stagger: 50, revealOffset: '20px' }`
   - **Springy**: `{ duration: '0.55s', ease: 'cubic-bezier(0.34,1.56,0.64,1)', stagger: 80, revealOffset: '20px' }`
   - **Cinematic**: `{ duration: '1.5s', ease: 'cubic-bezier(0.0,0.0,0.1,1)', stagger: 250, revealOffset: '50px' }`

The new theme will automatically appear as a dot in the selector without any HTML or JS changes needed.

---

## Dark Themes

For dark themes (like `SangeetSpark`), set `--bg` and `--cream` to dark values. The selector background (`--selector-bg-a`) and placeholder gradient (`--ph-bg-start`, `--ph-bg-end`) should also be dark. Set `--ts-start-bg` to `rgba(255,255,255,0.12)` for the glass-effect button (now unused but kept for fallback).

Dark themes need `--text` and `--text-soft` to be light colours for contrast.

---

## Per-Theme CSS Overrides

If a specific theme needs CSS rules beyond token changes, add them in `style.css` using the `[data-theme="your-theme-id"]` attribute selector:

```css
[data-theme="sangeetspark"] .chapter-title {
  text-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}
```

---

## Motion Tokens

These four `--motion-*` tokens are read by `style.css` for reveal animations and stagger delays:

```css
.reveal {
  transition:
    opacity   var(--motion-duration) var(--motion-ease),
    transform var(--motion-duration) var(--motion-ease);
}
.chapter-text-wrap.visible .reveal-child:nth-child(2) {
  transition-delay: var(--motion-stagger);
}
```

The `revealOffset` sets `--motion-reveal-offset` which is the starting `translateY` before a reveal. A larger value (e.g. `50px`) creates a more dramatic entrance; a smaller value (e.g. `15px`) is subtle.

---

## Current Theme Index

| Index | ID | Name |
|-------|----|------|
| 0 | `petalpop` | PetalPop Parade |
| 1 | `moonlight-mithai` | Moonlight Mithai |
| 2 | `candy-cloud` | CandyCloud Caravan |
| 3 | `gulabo-garden` | Gulabo Garden Gala |
| 4 | `starry-snuggle` | Starry Snuggle Story |
| 5 | `butterfly-blush` | ButterflyBlush Bash |
| 6 | `sangeetspark` | SangeetSpark Symphony |
| 7 | `velvet-vows` | VelvetVows Voyage |
