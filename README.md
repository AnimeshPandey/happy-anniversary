# Happy Anniversary

A personal anniversary digital experience, built as a single-page vanilla HTML/CSS/JS site. No framework, no build step. Designed for mobile-first, works offline via service worker.

Live at [anmshpndy.com/happy-anniversary](https://anmshpndy.com/happy-anniversary).

---

## What it is

A love letter as a scrollable experience. The recipient chooses a visual mood (theme), watches a ceremony, then scrolls through 12 chapters of memories, a crescendo, a closing message, and a heart animation. Everything is themed: colours, falling petals, chapter animations, ambient sound, and live ambient visual effects.

---

## Running locally

No build step needed. Serve the root directory with any static file server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Or with Node:

```bash
npx serve .
```

---

## Editing copy

All text content lives in `content.js`. Open it and find the `SITE` object:

- `SITE.opening` — poem text and the two opening panels
- `SITE.chapters` — array of 12 chapter objects (`title`, `body`, `mood`)
- `SITE.crescendo` — three closing crescendo lines
- `SITE.closing` — closing message, signoff, recipient name, author

Never edit copy in `index.html` or `main.js` — `content.js` is the single source of truth.

See `WRITING.md` for copy style rules (no em-dashes, no contractions in chapter bodies, etc.).

---

## Themes

There are 9 themes. Each theme defines CSS tokens, a sound profile, a pentatonic scale, ambient oscillator notes, ambient effect modules, particle shapes, and motion presets.

All theme configuration lives in `themes.js`. See `THEMING.md` for:
- Full token key reference
- How to add a new theme
- Per-theme CSS override patterns
- The current theme index table

---

## Adding photos

See `PHOTOS.md` for the step-by-step guide. In brief:

1. Name your photo to match a slot ID (e.g. `ch1-main.jpg`)
2. Drop it in `assets/images/`
3. Add a `src` field to the matching slot in `content.js`
4. Commit and push

AI image prompts for each slot and theme are in `scripts/ai-image-prompts.md`.

---

## Running tests

```bash
npm test
# or
npx playwright test
```

150 Playwright tests across Chromium and mobile-Chrome. See `TESTING.md` for the manual QA checklist.

---

## Deploying

Push to `main`. GitHub Actions deploys to GitHub Pages automatically (`.github/workflows/deploy.yml`).

Before every deploy:
1. Bump `CACHE` in `sw.js` (e.g. `anniversary-v10` → `anniversary-v11`)
2. Verify `git config user.name` returns `AnimeshPandey`

---

## File overview

| File | Role |
|------|------|
| `index.html` | All markup |
| `style.css` | All styles |
| `content.js` | All copy and image slot definitions |
| `themes.js` | All theme configs (9 themes) |
| `theme-controller.js` | Theme application logic |
| `main.js` | All behaviour: animations, audio, interactions |
| `sw.js` | Service worker (offline support) |
| `manifest.json` | PWA manifest |

Docs: `ARCHITECTURE.md`, `THEMING.md`, `INTERACTIONS.md`, `TESTING.md`, `WRITING.md`, `PHOTOS.md`, `ROADMAP.md`
