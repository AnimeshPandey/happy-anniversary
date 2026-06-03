# Next Steps — Happy Anniversary

A record of what was planned and executed in this session, plus what still requires your photos before it can run.

---

## Image Guide — How to Share Photos

### How many

**15 photos total.** One per slot. Every slot maps to a specific chapter or section.

### What to name each file

Name each photo to match its slot ID exactly (case-sensitive):

| Slot ID | File name | Aspect | Scene to capture |
|---|---|---|---|
| `hero-main` | `hero-main.jpg` | 9:16 portrait | Your best shot together — the one that says everything |
| `ceremony-bg` | `ceremony-bg.jpg` | 16:9 wide | A beautiful place — soft, blurred background works well |
| `ch1-main` | `ch1-main.jpg` | 4:3 | How it started — the very beginning |
| `ch2-main` | `ch2-main.jpg` | 4:3 | The first yes — or the first time you knew |
| `ch3-main` | `ch3-main.jpg` | 16:9 wide | The moment you were certain |
| `ch4-main` | `ch4-main.jpg` | 4:3 | First adventure together |
| `ch5-main` | `ch5-main.jpg` | 4:3 | The little things — a candid, everyday moment |
| `ch6-main` | `ch6-main.jpg` | 3:4 portrait | The time they made everything better |
| `ch7-main` | `ch7-main.jpg` | 16:9 wide | A quiet moment — stillness, peace |
| `ch8-main` | `ch8-main.jpg` | 4:3 | How they changed you |
| `ch9-main` | `ch9-main.jpg` | 4:3 | An ordinary day that became extraordinary |
| `ch10-main` | `ch10-main.jpg` | 4:3 | A memory you never want to forget |
| `ch11-main` | `ch11-main.jpg` | 16:9 wide | Looking ahead together |
| `ch12-main` | `ch12-main.jpg` | 4:3 | Everything, always — your favourite photo of you two |
| `closing-hero` | `closing-hero.jpg` | 3:4 portrait | THE photo. The most important one. Make it count. |

### Format and quality

- **Accepted formats:** `.jpg`, `.jpeg`, `.png`, `.heic` (iPhone), `.webp`
- **No need to resize** — the processing pipeline handles crops and resizes automatically
- **Keep originals** — share them as-is; the script saves edited copies to `assets/images/` and keeps your originals untouched in a separate folder
- **Minimum recommended resolution:** 1200 px on the longer side
- **iPhone photos:** Share directly, HEIC is supported

### How to share

Put all 15 photos in a single folder on your machine, named exactly as the table shows, then run:

```bash
./scripts/process-photos.sh /path/to/your/photos/folder
```

Or just drop them into a folder and share the path with me — I will run the pipeline and activate each photo in `content.js`.

### After processing

For each processed photo, the pipeline:
1. Centre-crops it to the correct aspect ratio
2. Resizes it to the target dimensions
3. Optimises quality (JPEG 85 / WebP 85)
4. Saves it to `assets/images/<slot-id>.jpg` (or `.webp` if `cwebp` is installed)

Your originals go into `assets/images/originals/` — untouched.

---

## Executed Changes

All changes below have been committed to `main`.

### 1. Service Worker — Network-first for HTML (`sw.js`)

**Problem:** Hard reload (`Ctrl+Shift+R` / `Cmd+Shift+R`) served stale HTML from the service worker cache even when a newer version was deployed.

**Fix:** Navigation requests (HTML page loads) now use network-first: the browser always fetches a fresh `index.html` from the server and caches it as the new fallback. Static assets (JS, CSS) stay cache-first for speed, updated when the SW cache version is bumped.

**Result:** Hard reload = always fresh page. Normal reload = instant from cache. Offline = falls back to cached version.

---

### 2. SEO & Performance (`index.html`)

- Changed `robots` from `noindex, nofollow` to `index, follow` — page is now indexable
- Added `og:image`, `og:image:width/height`, `twitter:image`, `twitter:card: summary_large_image`
  - Points to `assets/og-image.jpg` — **TODO:** create a 1200x630 social preview image (can be done once photos are ready, or a design can be generated)
- Added `<link rel="preload" as="style">` for style.css — reduces render-blocking
- Added `defer` to all `<script>` tags — JS downloads in parallel with HTML parsing, then executes in correct order
- Added `link rel="icon"` for SVG favicon support

---

### 3. Theme-specific Audio (`themes.js` + `main.js`)

Each theme now has a `sound` configuration:

| Theme | Waveform | Pitch shift | Decay | Character |
|---|---|---|---|---|
| PetalPop Parade | triangle | +20% | short (0.85s) | Bright, playful |
| Moonlight Mithai | sine | -20% | long (1.8s) | Soft, dreamy |
| CandyCloud Caravan | sine | +10% | medium (1.0s) | Bubbly, airy |
| Gulabo Garden Gala | sine | -5% | medium (1.3s) | Floral, gentle |
| Starry Snuggle Story | triangle | +40% | very short (0.7s) | Sparkly, intimate |
| ButterflyBlush Bash | sine | +15% | short (0.95s) | Delicate, fluttery |
| SangeetSpark Symphony | triangle | -15% | medium (1.2s) | Festive, warm |
| VelvetVows Voyage | sine | -35% | very long (2.2s) | Deep, romantic |

New sound triggers added:
- **Theme selection** — a single muted tone plays when switching themes (dots, prev/next, orb)
- **Portal entry** — a 3-note ascending shimmer plays when Begin is tapped
- **Replay start** — a 2-note descending tone plays when Begin Again is tapped

The existing chapter chimes now use the active theme's waveform, pitch, and decay characteristics.

---

### 4. Graphical UI — Buttons (`index.html` + `main.js` + `style.css`)

Replaced large-text buttons with graphical elements:

| Element | Before | After |
|---|---|---|
| `#begin-btn` | Text "BEGIN" in a rectangular box | Circular button with lotus bloom SVG — elegant, iconic |
| `#replay-btn` | Text "↺ BEGIN AGAIN" (uppercase) | SVG circular arrow + tiny "again" label |
| `#sound-toggle` | Text "♪" / "♫" | SVG speaker icon — muted state (X) / playing state (animated waves) |

Accessibility is preserved via `aria-label` on all buttons; screen readers announce the action.

---

### 5. Secret Easter Egg — Portfolio (`AnimeshPandey.github.io`)

Added a hidden `❤` link in the portfolio footer copyright line.

- Invisible at rest (`opacity: 0.12`)
- On hover: fades to visible + gentle pulse animation
- Clicking navigates to `https://anmshpndy.com/happy-anniversary/`
- No visible label, no indication it exists unless you hover over the footer

---

### 6. Caching Update

Service worker bumped to `anniversary-v8` to invalidate caches after all JS/HTML changes in this session.

---

## Pending — Needs Your Photos

### 7. Image processing

Once you provide the 15 photos (see Image Guide above):

1. Run `./scripts/process-photos.sh /path/to/photos`
   - Originals will be copied to `assets/images/originals/`
   - Processed versions (cropped, resized, optimised) go to `assets/images/`
2. For each slot, I will update `content.js` to add the `src` field
3. The `buildPlaceholder()` function in `main.js` already handles `src` presence — it will render a real `<img>` element automatically
4. Commit and push

### 8. OG social preview image

After photos are ready, a 1200x630 social preview image should be created:
- Option A: A collage of 3-4 of the best photos with a rose/pink gradient overlay
- Option B: A standalone design with the anniversary title and a key photo
- Save as `assets/og-image.jpg`
- The `og:image` meta tag already points to it

---

## Notes

- The `process-photos.sh` script requires macOS (`sips`) — run it locally before pushing
- All sound features require a user gesture to unlock (browser policy) — chimes work because they wait for the first click/tap
- The portfolio easter egg is in `/Users/animeshpandey/Documents/Codebases/AnimeshPandey.github.io/index.html` — commit and push that repo separately
