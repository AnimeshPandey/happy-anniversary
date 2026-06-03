# Polish Plan — Anniversary Experience

Ultra-detailed improvements prioritised by impact and correctness. Groups A–H, executed in priority order.

---

## Priority 1 — Critical Correctness Bugs

### A1 · Fix hardcoded floral divider colours
**Problem**: `index.html` floral dividers and `buildFlourish()` in `main.js` use hardcoded hex values (`#D4A017`, `#F4A0B0`, `#C0185F`) as SVG `fill`/`stroke` attributes. These are ignored by CSS — on every non-default theme, the dividers look wrong.
**Fix**: Add CSS classes (`.floral-gold`, `.floral-rose-light`, `.floral-rose`) to each SVG element; set `fill`/`stroke` via `style.css` using `var(--gold)`, `var(--rose-light)`, `var(--rose)`. Remove hardcoded attributes.

### B8 · Remove redundant chapter breadcrumb
**Problem**: `buildChapters()` prepends a `.chapter-breadcrumb` `<p>` that reads "Chapter 01" — duplicating the already-present `.chapter-number` label.
**Fix**: Delete the breadcrumb creation + `textWrap.appendChild(breadcrumb)` lines from `main.js`.

### D1 · Add `text-wrap: balance`
**Problem**: Long chapter titles, ceremony title, crescendo lines, and theme name wrap unevenly.
**Fix**: Add `text-wrap: balance` to `.chapter-title`, `.ceremony-title`, `.crescendo-line`, `.ts-name` in `style.css`.

### H4 · Remove global `scroll-behavior: smooth`
**Problem**: `html { scroll-behavior: smooth }` in `style.css` causes `window.scrollTo({top:0,behavior:'instant'})` to still animate on some WebKit builds, and makes `scrollIntoView` calls jerk on iOS.
**Fix**: Remove `scroll-behavior: smooth` from `html`. Add `behavior: 'smooth'` explicitly to all intentional smooth-scroll calls in `main.js` (TOC items, chapter nav dot clicks, replay button).

---

## Priority 2 — Mobile Spacing & Interactions

### B1 · Adaptive chapter nav dots
**Problem**: 12 dots + active pill in a row can clip on narrow phones (<375px). No visual hint about long-press for TOC.
**Fix**: Cap nav at 7 visible dots (3 before + active + 3 after, looped); add a subtle `…` indicator when chapter count overflows. Add a hint label "hold for menu" on first long-press.

### B3 · Ceremony spacing on tall phones
**Problem**: On phones taller than 812px (e.g. iPhone 14 Pro Max), the ceremony content sits too high, leaving dead space below.
**Fix**: Change `.ceremony-inner` from `padding: 2rem` to `padding: clamp(2rem, 8dvh, 5rem)` so it breathes proportionally on tall screens.

### B4 · Theme selector spacing on tall phones
**Problem**: `.ts-inner` has fixed `padding: 2rem` top/bottom, so on tall phones the selector looks compressed at top with dead space at bottom.
**Fix**: Change `.ts-inner` padding to `clamp(1.5rem, 6dvh, 4rem) var(--pad-x)`.

### B12 · TOC discoverability
**Problem**: Long-press on chapter nav to open TOC is completely undiscovered by users.
**Fix**: After `showJourneyUI()`, show a 2-second tooltip above the chapter nav reading "hold to see all chapters"; auto-hides after first long-press or 4s.

---

## Priority 3 — Desktop Layout

### C1 · Desktop breakpoints (1280px+)
**Problem**: Layout maxes at 900px (`--max-w`) but on 1440px screens, chapters and text feel narrow.
**Fix**: At `min-width: 1280px`, raise `--max-w` to 1100px and `--pad-section` to 8rem.

### C3 · 60/40 chapter columns
**Problem**: Chapters use `1fr 1fr` grid — image and text always equal. Text-heavy chapters need more reading space.
**Fix**: At `min-width: 768px`, use `grid-template-columns: 55fr 45fr`. Image col stays 45%; text gets 55%.

### C7 · Side navigation for desktop
**Problem**: Chapter nav (bottom pill) is intended for mobile. On desktop it floats awkwardly at the bottom-centre.
**Fix**: At `min-width: 1024px`, reposition `#chapter-nav` to `left: 1.5rem; bottom: 50%; transform: translateY(50%); flex-direction: column`.

---

## Priority 4 — Visual Component Richness

### E1 · Premium image placeholder
**Problem**: Current placeholder is a simple dashed box with a tiny camera icon.
**Fix**: Add a soft inner glow effect; make the icon larger (40px); add a theme-coloured shimmer sweep animation (`@keyframes shimmer`) on the placeholder background.

### E4 · Closing section enrichment
**Problem**: The closing section has a single image + message + signoff — very sparse.
**Fix**: Add a thin decorative rule (same as floral divider but simpler) between the message and signoff; increase `.closing-message` line-height to 2.1.

### E5 · TOC sheet redesign
**Problem**: TOC list items are plain text. Active item only changes colour.
**Fix**: Active TOC item gets a left accent bar (3px `var(--rose)` border-left); add a subtle scale transform (1.02) on active item.

---

## Priority 5 — Typography

### D3 · Title size ramp
**Problem**: `.chapter-title` uses `clamp(1.625rem, 4.5vw, 2.625rem)` — starts too small on mobile.
**Fix**: Change to `clamp(1.75rem, 5vw, 2.875rem)`.

### D5 · Closing signoff size
**Problem**: `.closing-signoff` at `1.3125rem` is smaller than the message it follows.
**Fix**: Raise to `clamp(1.375rem, 3.5vw, 1.75rem)`.

---

## Priority 6 — Animation Polish

### F1 · Orb 2D float
**Problem**: Current `orbFloat` only moves Y. Feels flat.
**Fix**: Change `@keyframes orbFloat` to also shift X slightly: `50% { transform: translateY(-14px) translateX(5px) scale(1.04); }`.

### F2 · Orb pulse on theme switch
**Problem**: No visual feedback on the orb itself when theme changes.
**Fix**: Add `@keyframes orbPulse { 0% { box-shadow: 0 0 70px 18px var(--orb-shadow); } 50% { box-shadow: 0 0 100px 35px var(--orb-shadow); } 100% { box-shadow: 0 0 70px 18px var(--orb-shadow); } }` and apply it for 0.6s via a CSS class toggled in `applyThemeChange()`.

### F4 · Image curtain easing
**Problem**: `image-curtain` uses `var(--motion-ease)` which is `cubic-bezier(0,0,0.2,1)` — starts fast, decelerates. For a curtain wipe, an ease-in feels more natural.
**Fix**: Change curtain `transition` to use `cubic-bezier(0.4,0,0.8,0)` (ease-in).

---

## Priority 7 — Desktop Premium Details

### C2 · Desktop theme selector
**Problem**: On desktop, the theme selector is wide but uses the same narrow column.
**Fix**: At `min-width: 768px`, limit `.ts-inner` to `max-width: 420px` centred — this is already done via `max-width: 460px`. Keep as-is.

### C4 · Ghost chapter numbers
**Problem**: No large decorative number in chapter backgrounds on desktop.
**Fix**: At `min-width: 768px`, add `.chapter::before { content: attr(data-num); position: absolute; font-family: var(--font-display); font-size: clamp(6rem, 12vw, 12rem); color: var(--rose); opacity: 0.04; right: -1rem; top: 50%; transform: translateY(-50%); pointer-events: none; }`. Set `data-num` on each chapter article in `buildChapters()`.

### C5 · Image hover states
**Problem**: Images don't respond to hover — feels static on desktop.
**Fix**: `.chapter-image-wrap:hover .image-placeholder { transform: scale(1.015) rotate(0deg) !important; transition: transform 0.5s var(--ease-spring); }`.

---

## Priority 8 — End-State Experience

### G2 · Love heart cascade on double-tap
**Problem**: Double-tap produces a single floating heart. Could be more celebratory.
**Fix**: In `initDoubleTapLove()`, fire 3 hearts with 80ms stagger and slight X offset variation.

### G4 · Heart escalation on repeated taps
**Problem**: Tapping the closing heart always fires the same confetti.
**Fix**: Track tap count in `initHeart()`; after 3 taps, fire a larger confetti burst (2× count) and change heart to gold via `#heart-path { fill: var(--gold); }`.

### G5 · End-state visual
**Problem**: After the heart animation completes, the page just... sits there.
**Fix**: After heart fill, add a soft confetti rain (12 petals, `position:fixed`, using petal colours) that loops for 4s then fades.

---

## Priority 9 — Performance

### H1 · Reduce petal `will-change`
**Problem**: All 28 petals have `will-change: transform, opacity` — creates 28 GPU compositor layers, memory pressure on mobile.
**Fix**: Remove `will-change` from `.petal` in CSS; add it only in JS on the 6 petals currently visible in the viewport.

### H4 · See Priority 1 above.

---

## Implementation Checklist

- [x] A1 — Floral divider CSS vars
- [x] B8 — Remove breadcrumb
- [x] D1 — `text-wrap: balance`
- [x] H4 — Remove global scroll-behavior smooth
- [x] B3 — Ceremony spacing
- [x] B4 — Selector spacing
- [x] C1 — Desktop max-width
- [x] C3 — 60/40 columns
- [x] C4 — Ghost chapter numbers
- [x] C5 — Image hover
- [x] C7 — Side nav desktop
- [x] D3 — Title size ramp
- [x] D5 — Signoff size
- [x] E1 — Placeholder shimmer
- [x] E4 — Closing enrichment
- [x] E5 — TOC active style
- [x] F1 — Orb 2D float
- [x] F2 — Orb pulse
- [x] F4 — Curtain easing
- [x] G2 — Heart cascade
- [x] H1 — Petal will-change
