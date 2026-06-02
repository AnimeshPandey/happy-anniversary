# Claude Prompt: Happy Anniversary Digital Experience

> **How to use:** Paste this entire document (or any section) into Claude Code to generate, build, or iteratively improve the anniversary experience. Each section is independently usable — start with Sections 1–3 for an MVP, layer in Sections 4–6 for the full production experience.

---

## Section 1: Product Vision

You are building a **digital anniversary journey** — a single-page web experience that functions as a deeply personal, cinematic love letter. The recipient opens a private link and is taken on an emotional, infinite-scroll journey through shared memories, feelings, and celebration.

**This is not a landing page. It is a cinematic, mobile-first, animation-heavy digital journey.**

Do not ask to simplify. Default to premium quality at every decision point.

### Emotional arc

| Stage | Feeling |
|---|---|
| Arrival | Wonder and warmth; the person feels immediately welcomed and special |
| Journey | Nostalgic, story-like progression through memory chapters |
| Crescendo | Intensity builds toward the most important message |
| Closure | Gentle, lingering ending that feels complete and joyful |

### Visual language

- Romantic and celebratory: soft warm palettes (rose, blush, gold, deep plum, cream), rich floral motifs, botanical illustrations, petal animations
- Feels handcrafted but polished — not generic e-card, not cold tech product
- Typography mixes a serif display font (emotion, warmth) with a clean sans-serif (legibility)
- Every visible element must serve the emotional arc

### Core metaphor

A "journey" or "memory book" — sections scroll like turning pages or walking through rooms. Time moves forward as the user scrolls. The experience has a beginning, a middle, and a satisfying end.

### Primary audiences (in priority order)

1. Mobile users (360px–430px) — **highest priority**
2. Tablet users (768px–1024px)
3. Desktop users (1280px+)

### Non-goals

- No gamification, social sharing, or login
- No dark mode (light, warm, inviting only)
- Not a generic template — every copy line, color, and animation must serve the emotional arc

---

## Section 2: UX Storyboard

Build the experience in exactly these five phases, each triggered by scroll position.

### Phase 0 — Opening Ceremony (0–100vh, auto-plays on load)

- Full-screen entry animation lasting 3–5 seconds before scroll is enabled
- Suggested Option A: rose petals or flower bloom fills the screen from center outward, then petals drift and settle before the first heading appears
- Suggested Option B: golden confetti/fireworks burst, then fade to reveal the heading
- Text appears last: large, centered message (e.g. `"Happy Anniversary"`) with the date beneath it
- A subtle breathing animation (gentle scale pulse) keeps the screen alive
- A small animated arrow or "begin" cue appears after 4 seconds to invite scrolling
- **Reduced-motion fallback:** fade-in only — no particle, petal, or burst movement

### Phase 1 — The Opening (100–300vh)

- First scroll section: full-height panels, one memory or sentiment per panel
- Each panel: large decorative image placeholder (framed box with `[Photo: description]` text) + 2–4 sentences of story text
- Floral dividers or illustrated vines between panels
- Parallax: background elements move at 0.6× scroll speed
- Text animates in from below as each panel enters viewport (Intersection Observer, not scroll listener)

### Phase 2 — Memory Chapters (300–900vh, variable)

- 8–12 "chapter" cards in asymmetric alternating layout (image-left/text-right, then image-right/text-left)
- Each chapter has: placeholder image frame + chapter number/title in small caps + 3–6 sentences of narrative
- Chapter titles are intimate and specific: "The first trip", "When you made me laugh", "The quiet mornings"
- Decorative elements: scattered petals, small illustrated icons (hearts, stars, botanical) float between chapters
- Scroll-triggered: each chapter slides in from its entry side with a slight rotation (< 3°) that settles to 0° on arrival

### Phase 3 — The Crescendo (900–1100vh)

- Full-bleed atmospheric panel with a large typographic statement — the most important message
- Background: rich color gradient (deep rose to gold) or illustrated night-sky with stars
- Foreground: large serif text, centered, 3–5 lines, with slow letter-spacing animation on entry
- Optional: confetti burst or petal shower triggers when this section reaches center screen

### Phase 4 — The Closing Sequence (1100vh+)

- Final section: intimate, quiet, smaller scale
- Handwritten-style signature or personal sign-off
- Single final image placeholder (largest, most prominent frame)
- Animated closing motif: SVG heart draws itself using stroke animation, OR a final bloom/firework dissolves gently
- The page does not end harshly — a soft gradient fades to a still, cream background
- Optional: subtle looping ambient animation keeps the page alive after scrolling stops

### Scroll and interaction rules

- Smooth scroll behavior enabled globally (`scroll-behavior: smooth`)
- No scroll-jacking — native scroll only; scroll-triggered animations use Intersection Observer
- On mobile: all hover states have touch-equivalent tap states
- Lazy-load all images and heavy animation assets
- Total scroll height target: ~15–20× viewport height on mobile

---

## Section 3: Technical Requirements

### Stack selection — evaluate and choose before writing code

Evaluate the following options. State your reasoning explicitly, then pick one and name your fallback.

**Option A — Vanilla HTML/CSS/JS (recommended for simplicity)**
- Single `index.html` + `style.css` + `main.js`
- Zero build step, deploys directly to GitHub Pages
- CSS custom properties for theming; Web Animations API or `@keyframes` for motion
- Intersection Observer for scroll triggers
- **Choose if:** experience is primarily content + animation with no complex state

**Option B — Vite + React (recommended for rich interactivity)**
- `npm create vite@latest anniversary -- --template react`
- React components per phase; `framer-motion` for orchestrated animation; `react-intersection-observer` for scroll triggers
- CSS Modules or Tailwind for styling
- GitHub Pages deploy via `gh-pages` package and `base` path in `vite.config.js`
- **Choose if:** you need component reuse, animation orchestration, or future CMS integration

**Option C — Astro (recommended for content-heavy, performance-first)**
- Static-site output, zero JS by default, island architecture for interactive parts
- **Choose if:** SEO or performance budget is the top priority

**Default recommendation:** Use **Option A** for the initial build. Provide a migration note explaining how to convert to Option B later.

### Mobile-first breakpoints

```
base:   320px  (small phones)
sm:     390px  (iPhone 14 standard)
md:     768px  (tablet portrait)
lg:     1024px (tablet landscape / small laptop)
xl:     1280px (desktop)
```

- All layout, font-size, and spacing values defined mobile-first
- Touch targets minimum 44×44px
- Fluid typography using `clamp()`: `font-size: clamp(2rem, 5vw + 1rem, 5rem)`

### Performance budgets

| Asset type | Budget |
|---|---|
| Total initial JS | < 50 KB gzipped |
| Total CSS | < 30 KB gzipped |
| First Contentful Paint | < 1.5s on 4G |
| Images | WebP, lazy-loaded, `srcset` for 1×/2× |
| Animation frame rate | ≥ 55fps on mid-range Android |

### Animation strategy

- **CSS animations** for simple, repeating effects (petals, pulse, float)
- **Web Animations API** or **Framer Motion** for orchestrated sequences
- **SVG animations** for drawing effects (heart outline, flower bloom)
- All animation durations via CSS custom properties:

```css
:root {
  --duration-fast: 200ms;
  --duration-base: 400ms;
  --duration-slow: 800ms;
  --duration-cinematic: 2000ms;
}
```

- `prefers-reduced-motion` **must** be respected globally:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Content model — placeholder-first image architecture

Architect all image slots as a structured content array so real photos can be swapped in later with no layout changes.

```js
// content.js — the single source of truth for all images and chapter copy
export const MEMORIES = [
  {
    id: "hero-main",
    slot: "opening-hero",
    chapter: 0,
    placeholder: "[Photo: the two of you — most beautiful shot]",
    alt: "Our beginning",
    aspectRatio: "9/16",
    title: null,
    caption: null,
    dateOrMilestone: null,
    animationPreset: "fade-scale",
    overlayDecoration: "petals",
    future_filename: "hero-main.webp"
  },
  // ... 40-50 total entries following this schema
];
```

**Schema field reference:**

| Field | Purpose |
|---|---|
| `id` | Unique identifier for the slot |
| `slot` | Named position in the layout |
| `chapter` | Which phase/chapter this belongs to |
| `placeholder` | Human-readable description shown while real photo is absent |
| `alt` | Accessibility alt text for the final image |
| `aspectRatio` | CSS aspect-ratio value (e.g. `"4/3"`) — layout uses this |
| `title` | Chapter heading text |
| `caption` | Story copy for this memory |
| `dateOrMilestone` | Optional date label |
| `animationPreset` | Which enter animation to use |
| `overlayDecoration` | Optional floating decoration near this slot |
| `future_filename` | What the real WebP file will be named |

**When adding real photos:** set `future_filename` for each slot and place the WebP files in `/assets/images/`. The layout renders them automatically via the content model.

### Asset loading rules

- All images: `loading="lazy"` attribute
- Opening ceremony assets: preload critical resources in `<head>`
- Use `requestAnimationFrame` for all JS-driven animation; never `setInterval` for visual updates
- Prefer Intersection Observer over scroll event listeners

---

## Section 4: Creative Option Packs

Before writing code, present the user with exactly **three creative directions**. Describe each with palette swatches (hex values) and a key animation style. Confirm which to use before implementing.

---

### Direction 1 — "Royal Floral Gala"

Rich, warm, ornate. Feels like a grand summer celebration.

- **Palette:** `#FFF0F3` blush white · `#C0185F` deep rose · `#D4A017` gold · `#3D2B1F` bark brown · `#6B8F5E` sage green
- **Typography:** Playfair Display (headings) + Lato (body)
- **Signature animation:** rose petals drift down continuously; flowers bloom from center outward on each chapter reveal; gold particle sparkles in the crescendo
- **Mood:** romantic, ornate, celebratory, slightly royal

---

### Direction 2 — "Dreamy Pastel Love Story"

Soft, gentle, intimate. Feels like a painted memory.

- **Palette:** `#FDF3E3` cream · `#F4A0B0` rose · `#E8C4A0` peach · `#C9B8E8` lilac · `#A0C4D8` sky blue
- **Typography:** Cormorant Garamond (headings) + Nunito (body)
- **Signature animation:** watercolor wash bleeds in behind each chapter; soft petal drift; SVG brush-stroke dividers draw themselves on scroll entry
- **Mood:** gentle, dreamy, nostalgic, intimate

---

### Direction 3 — "Festival of Lights"

Vibrant, high-energy. Feels cinematic and grand.

- **Palette:** `#0D0A1F` near-black · `#FF2D6B` vivid rose · `#FFD700` gold · `#9B59FF` purple · `#00E5FF` cyan
- **Typography:** Cinzel (headings) + Source Sans Pro (body)
- **Signature animation:** fireworks and neon spark trails between sections; rhythmic shimmer pulses on scroll; confetti cannon on the crescendo
- **Mood:** dramatic, energetic, luxurious, high-celebration

---

**Default implementation:** Direction 1. Document how to switch via a single CSS/config variable.

---

### Incremental Improvement Menu

After the initial build, any of the following upgrades can be applied. Request any by its number.

| # | Upgrade | Effort | Impact |
|---|---|---|---|
| 1 | Replace all placeholder images with real photos | S | High |
| 2 | Ambient music toggle (autoplay muted, user unmutes) | S | High |
| 3 | "Replay opening" button at bottom of page | S | Med |
| 4 | Scroll progress indicator (petal trail along side) | M | Med |
| 5 | Custom loading screen with animated monogram | M | Med |
| 6 | Staggered letter-reveal animation on chapter headings | M | Med |
| 7 | A "letter" section with typewriter self-typing reveal | M | High |
| 8 | Chapter-level deep links (URL hash per chapter) | M | Low |
| 9 | Photo slideshow carousel within a chapter | M | High |
| 10 | Voice-note snippet player per chapter | M | High |
| 11 | Memory constellation / milestone timeline | L | High |
| 12 | Canvas-based physics particle system (replaces CSS petals) | L | Med |
| 13 | Cinematic transition pack (ink reveal, light sweep, bloom) | L | High |
| 14 | Confetti cannon triggered by tapping the final heart | S | Med |
| 15 | PWA / Service Worker for offline access | L | Low |
| 16 | Dynamic color mood shift by chapter | M | Med |
| 17 | Interactive flower bouquet builder section | L | High |
| 18 | Downloadable keepsake PDF snapshot | L | Med |
| 19 | Alternate "closing" endings selectable at the finale | L | High |
| 20 | Localization-ready text system (swap language via config) | M | Low |

---

## Section 5: Deployment & Access Behavior

### Target URL

```
https://anmshpndy.com/happy-anniversary
```

Served via GitHub Pages with a custom domain pointed at the repository.

### GitHub Pages setup — step by step

1. **Repository:** use the existing `Anniversary` repo (or create `anmshpndy/happy-anniversary`)
2. **Deployment source:** Settings → Pages → Source → set to `gh-pages` branch (or `docs/` folder in `main`)
3. **Custom domain:** Settings → Pages → Custom domain → enter `anmshpndy.com`; add a `CNAME` file to repo root containing exactly `anmshpndy.com`
4. **HTTPS:** tick "Enforce HTTPS" after DNS propagates

### Base path handling — critical for subdirectory hosting

**Vanilla HTML:** use only relative paths for all assets. Never use `/assets/…` (absolute). Always use `./assets/…` or `assets/…` (relative). Absolute paths break when the page is served from `/happy-anniversary/`.

**Vite/React:** set in `vite.config.js`:
```js
export default {
  base: '/happy-anniversary/',
}
```
All `import`ed assets and bundled paths will be prefixed automatically.

### GitHub Actions deploy workflow

Generate this file at `.github/workflows/deploy.yml`:

**For Vite/React (with build step):**
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: anmshpndy.com
```

**For Vanilla HTML (no build step):**
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
          cname: anmshpndy.com
```

### Static-host routing — avoiding 404s

GitHub Pages serves static files. There is no server-side routing. To prevent hard 404s on direct link or page refresh:

- **Vanilla HTML:** the whole experience is one `index.html` — no routing problem
- **React with React Router:** use `HashRouter` (not `BrowserRouter`) so routes appear as `/#/section` and GitHub Pages always serves `index.html`
- **Fallback approach:** add a `404.html` at repo root that contains a redirect script to `index.html` — document this as a workaround

### Privacy and discoverability controls

**Goal:** accessible only via direct link, not discoverable via search engines or site navigation.

Add to `<head>` in `index.html`:
```html
<meta name="robots" content="noindex, nofollow">
```

Add or update `robots.txt` at repo root:
```
User-agent: *
Disallow: /happy-anniversary/
```

**Do not** link to `/happy-anniversary` from any other page, sitemap, or portfolio navigation.

**Practical limits:** GitHub Pages repos are public by default. `noindex` instructs crawlers not to index the page but does not prevent access. Anyone with the URL can open it. Options:
- **Accept this** — a non-guessable URL is sufficient security for a personal gift
- **Private repo** — requires GitHub Pro for Pages on private repos
- **Do not** link to it publicly from any profile, social media, or sitemap

### Social preview (optional but recommended)

Add Open Graph tags so the link previews beautifully in iMessage/WhatsApp when shared:
```html
<meta property="og:title" content="Happy Anniversary">
<meta property="og:description" content="A journey through our first year.">
<meta property="og:image" content="https://anmshpndy.com/happy-anniversary/preview.jpg">
<meta property="og:url" content="https://anmshpndy.com/happy-anniversary">
```
Include a `preview.jpg` (1200×630px) in the build — a beautiful still from the opening ceremony.

---

## Section 6: Build Workflow and Milestones

### Phase 1 — MVP (target: working in < 2 hours)

- [ ] Scaffold chosen stack
- [ ] Implement Opening Ceremony (Phase 0) with reduced-motion fallback
- [ ] Build 3 Memory Chapter panels with placeholder images
- [ ] Apply chosen creative direction palette and typography
- [ ] Basic scroll-triggered fade-in animations (Intersection Observer)
- [ ] Deploy to GitHub Pages and verify URL resolves

**Phase 1 acceptance criteria:**
- Opens correctly on iPhone Safari (375px viewport)
- Opening ceremony completes without layout shift on mid-range Android
- All placeholder images render at correct aspect ratios
- `noindex` meta tag present in page source (`view-source:`)
- No horizontal scroll at any breakpoint

### Phase 2 — Full Narrative

- [ ] All 12 memory chapters populated with placeholder content and copy
- [ ] Crescendo section with large typographic statement
- [ ] Closing sequence with SVG heart or bloom animation
- [ ] Floral/botanical decorative elements between sections
- [ ] Parallax on at least 2 background layers
- [ ] All 40–50 image slots defined in content model with IDs and aspect ratios

**Phase 2 acceptance criteria:**
- Full scroll from top to bottom completes smoothly on mobile (no jank)
- No layout breaks at 320px, 390px, 768px, 1280px
- Lighthouse mobile performance score ≥ 80
- Lighthouse accessibility score ≥ 90
- All image placeholders render with correct aspect ratio (no layout shift when replaced)

### Phase 3 — Cinematic Polish (final production)

- [ ] Real photos replace all placeholders (upgrade #1)
- [ ] Opening ceremony timing, easing, and choreography finalized
- [ ] All chapter animations tuned for emotional pacing
- [ ] Typography micro-details: ligatures, letter-spacing, line-height per section
- [ ] Social preview image and OG meta tags added
- [ ] Final QA pass on all breakpoints

**Phase 3 acceptance criteria:**
- Experience reviewed on actual iPhone (not simulator) and actual Android hardware
- All images load within 3s on 4G network
- Reduced-motion version confirmed functional (enable OS accessibility setting to test)
- No console errors in production build
- Custom domain `anmshpndy.com/happy-anniversary` resolves with HTTPS

---

### QA Checklist

#### Mobile (iOS Safari, Chrome for Android)

- [ ] Opening ceremony completes and scroll becomes available
- [ ] All text is readable without zooming
- [ ] Touch targets are large enough (no mis-taps on small elements)
- [ ] Images load and are not unexpectedly cropped
- [ ] No horizontal scroll
- [ ] Animations do not cause scroll position jumps or layout shifts

#### Tablet (iPad Safari, Chrome on Android tablet)

- [ ] Layout adapts — not just a scaled phone layout
- [ ] Two-column chapter layout renders correctly if implemented
- [ ] Images fill their frames without cropping heads or key subjects

#### Desktop (Chrome, Safari, Firefox)

- [ ] Max content width capped at `max-width: 900px` centered — not full-bleed on wide monitors
- [ ] Hover states are visible and intentional
- [ ] Parallax is subtle — not disorienting

#### Accessibility

- [ ] All images have descriptive `alt` text (even placeholders use the `placeholder` string)
- [ ] Color contrast ratio ≥ 4.5:1 for all body text
- [ ] Keyboard navigable (logical tab order)
- [ ] Screen reader announces chapter headings in logical sequence
- [ ] `prefers-reduced-motion` tested: enable "Reduce Motion" in iOS/macOS accessibility settings and verify animations are replaced by fades

---

## Appendix A: Sample Chapter Copy

Use these as starting-point titles — replace with personal specifics before launch:

```
Chapter 1:  "How it started"
Chapter 2:  "The first yes"
Chapter 3:  "When I knew"
Chapter 4:  "Our first adventure"
Chapter 5:  "The little things"
Chapter 6:  "When you made everything better"
Chapter 7:  "The quiet moments"
Chapter 8:  "How you changed me"
Chapter 9:  "Every ordinary day"
Chapter 10: "What I never want to forget"
Chapter 11: "Where we're going"
Chapter 12: "Everything, always"
```

---

## Appendix B: Full Image Slot Reference (40–50 placeholders)

Wire all rendering through this content model. When real photos are ready, populate `future_filename` and place the WebP files in `assets/images/`.

```js
export const IMAGE_SLOTS = [
  // ── Opening ──────────────────────────────────────────────────
  { id: "hero-main",       slot: "opening-hero",        chapter: 0, aspectRatio: "9/16",  placeholder: "[Photo: the two of you — most beautiful shot]",          future_filename: "hero-main.webp" },
  { id: "ceremony-bg",     slot: "opening-bg",          chapter: 0, aspectRatio: "16/9",  placeholder: "[Photo: atmospheric background — a place you love]",      future_filename: "ceremony-bg.webp" },

  // ── Chapter 1 ────────────────────────────────────────────────
  { id: "ch1-main",        slot: "chapter-1-main",      chapter: 1, aspectRatio: "4/3",   placeholder: "[Photo: how it started]",                                 future_filename: "ch1-main.webp" },
  { id: "ch1-detail",      slot: "chapter-1-detail",    chapter: 1, aspectRatio: "1/1",   placeholder: "[Photo: a detail from that time]",                        future_filename: "ch1-detail.webp" },

  // ── Chapter 2 ────────────────────────────────────────────────
  { id: "ch2-main",        slot: "chapter-2-main",      chapter: 2, aspectRatio: "4/3",   placeholder: "[Photo: the first yes moment]",                           future_filename: "ch2-main.webp" },
  { id: "ch2-portrait",    slot: "chapter-2-portrait",  chapter: 2, aspectRatio: "3/4",   placeholder: "[Photo: a portrait]",                                     future_filename: "ch2-portrait.webp" },

  // ── Chapter 3 ────────────────────────────────────────────────
  { id: "ch3-main",        slot: "chapter-3-main",      chapter: 3, aspectRatio: "16/9",  placeholder: "[Photo: when you knew]",                                  future_filename: "ch3-main.webp" },
  { id: "ch3-detail",      slot: "chapter-3-detail",    chapter: 3, aspectRatio: "1/1",   placeholder: "[Photo: a close detail from that moment]",                future_filename: "ch3-detail.webp" },

  // ── Chapter 4 ────────────────────────────────────────────────
  { id: "ch4-main",        slot: "chapter-4-main",      chapter: 4, aspectRatio: "4/3",   placeholder: "[Photo: your first adventure together]",                  future_filename: "ch4-main.webp" },
  { id: "ch4-wide",        slot: "chapter-4-wide",      chapter: 4, aspectRatio: "21/9",  placeholder: "[Photo: a landscape or place from the adventure]",        future_filename: "ch4-wide.webp" },
  { id: "ch4-detail",      slot: "chapter-4-detail",    chapter: 4, aspectRatio: "1/1",   placeholder: "[Photo: a candid from the trip]",                         future_filename: "ch4-detail.webp" },

  // ── Chapter 5 ────────────────────────────────────────────────
  { id: "ch5-main",        slot: "chapter-5-main",      chapter: 5, aspectRatio: "4/3",   placeholder: "[Photo: the little things — an everyday moment]",         future_filename: "ch5-main.webp" },
  { id: "ch5-detail",      slot: "chapter-5-detail",    chapter: 5, aspectRatio: "1/1",   placeholder: "[Photo: an everyday object or small detail]",             future_filename: "ch5-detail.webp" },

  // ── Chapter 6 ────────────────────────────────────────────────
  { id: "ch6-main",        slot: "chapter-6-main",      chapter: 6, aspectRatio: "3/4",   placeholder: "[Photo: when they made everything better]",               future_filename: "ch6-main.webp" },
  { id: "ch6-together",    slot: "chapter-6-together",  chapter: 6, aspectRatio: "4/3",   placeholder: "[Photo: the two of you together, warm moment]",           future_filename: "ch6-together.webp" },

  // ── Chapter 7 ────────────────────────────────────────────────
  { id: "ch7-main",        slot: "chapter-7-main",      chapter: 7, aspectRatio: "16/9",  placeholder: "[Photo: a quiet, peaceful moment]",                       future_filename: "ch7-main.webp" },
  { id: "ch7-detail",      slot: "chapter-7-detail",    chapter: 7, aspectRatio: "1/1",   placeholder: "[Photo: still life or calm scene]",                       future_filename: "ch7-detail.webp" },

  // ── Chapter 8 ────────────────────────────────────────────────
  { id: "ch8-main",        slot: "chapter-8-main",      chapter: 8, aspectRatio: "4/3",   placeholder: "[Photo: how they changed you]",                           future_filename: "ch8-main.webp" },
  { id: "ch8-place",       slot: "chapter-8-place",     chapter: 8, aspectRatio: "3/4",   placeholder: "[Photo: a meaningful place or setting]",                  future_filename: "ch8-place.webp" },

  // ── Chapter 9 ────────────────────────────────────────────────
  { id: "ch9-main",        slot: "chapter-9-main",      chapter: 9, aspectRatio: "4/3",   placeholder: "[Photo: an ordinary day — the best kind]",                future_filename: "ch9-main.webp" },
  { id: "ch9-candid-a",    slot: "chapter-9-candid-a",  chapter: 9, aspectRatio: "1/1",   placeholder: "[Photo: a casual candid]",                                future_filename: "ch9-candid-a.webp" },
  { id: "ch9-candid-b",    slot: "chapter-9-candid-b",  chapter: 9, aspectRatio: "1/1",   placeholder: "[Photo: another candid]",                                 future_filename: "ch9-candid-b.webp" },

  // ── Chapter 10 ───────────────────────────────────────────────
  { id: "ch10-main",       slot: "chapter-10-main",     chapter: 10, aspectRatio: "4/3",  placeholder: "[Photo: a memory you never want to forget]",              future_filename: "ch10-main.webp" },
  { id: "ch10-intimate",   slot: "chapter-10-intimate", chapter: 10, aspectRatio: "3/4",  placeholder: "[Photo: a close-up / intimate shot]",                     future_filename: "ch10-intimate.webp" },

  // ── Chapter 11 ───────────────────────────────────────────────
  { id: "ch11-main",       slot: "chapter-11-main",     chapter: 11, aspectRatio: "16/9", placeholder: "[Photo: looking ahead — a hopeful, forward scene]",       future_filename: "ch11-main.webp" },
  { id: "ch11-together",   slot: "chapter-11-together", chapter: 11, aspectRatio: "4/3",  placeholder: "[Photo: the two of you, most recent shot]",               future_filename: "ch11-together.webp" },

  // ── Chapter 12 ───────────────────────────────────────────────
  { id: "ch12-main",       slot: "chapter-12-main",     chapter: 12, aspectRatio: "4/3",  placeholder: "[Photo: everything, always — your favorite shot of all]", future_filename: "ch12-main.webp" },
  { id: "ch12-wide",       slot: "chapter-12-wide",     chapter: 12, aspectRatio: "21/9", placeholder: "[Photo: a beautiful wide scene or panorama]",             future_filename: "ch12-wide.webp" },

  // ── Crescendo ────────────────────────────────────────────────
  { id: "crescendo-bg",    slot: "crescendo-background", chapter: 13, aspectRatio: "16/9", placeholder: "[Photo: atmospheric — sky, stars, or a beautiful blur]", future_filename: "crescendo-bg.webp" },

  // ── Closing ──────────────────────────────────────────────────
  { id: "closing-hero",    slot: "closing-final",       chapter: 14, aspectRatio: "3/4",  placeholder: "[Photo: THE photo — the most important image of all]",    future_filename: "closing-hero.webp" },
  { id: "closing-touch",   slot: "closing-signature",   chapter: 14, aspectRatio: "1/1",  placeholder: "[Photo: optional — a small personal touch or keepsake]",  future_filename: "closing-touch.webp" },

  // ── Accent / decorative (add more as needed) ─────────────────
  { id: "accent-001",      slot: "accent-between-ch3-ch4", chapter: 3, aspectRatio: "4/3", placeholder: "[Photo: accent between chapters 3 and 4]",             future_filename: "accent-001.webp" },
  { id: "accent-002",      slot: "accent-between-ch6-ch7", chapter: 6, aspectRatio: "1/1", placeholder: "[Photo: accent between chapters 6 and 7]",             future_filename: "accent-002.webp" },
  { id: "accent-003",      slot: "accent-between-ch9-ch10", chapter: 9, aspectRatio: "16/9", placeholder: "[Photo: wide accent between chapters 9 and 10]",     future_filename: "accent-003.webp" },
];
// Total: 34 primary slots defined above.
// Add more accent slots to reach 40-50 total. Follow the same schema — no layout changes needed.
```

---

*End of prompt. Begin implementation by sharing this file with Claude and specifying: (1) chosen creative direction (1, 2, or 3), (2) whether to start with Vanilla HTML or Vite/React, (3) any personal copy for chapter titles.*
