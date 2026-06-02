# Anniversary Experience — Improvement Roadmap

Saved and updated: 2026-06-02.

---

## CORE PRINCIPLE: Mobile First, Always

**This experience is designed for a phone. Every decision must start there.**

The primary recipient will open this on an iPhone or Android. Desktop is an
afterthought. Every feature, animation, layout choice, and interaction must be
designed for a 390px portrait screen first, then enhanced for wider viewports.

### Mobile design principles to apply in every phase

**Touch, not hover**
- All interactions are tap/swipe/long-press, never hover-dependent
- Touch targets minimum 44×44px (Apple HIG), 48×48px preferred (Material)
- No tooltips, no hover reveals — if information matters, it must be always visible
  or triggered by a tap that a thumb can reach

**Thumb zone awareness**
- The bottom 40% of the screen is the thumb's natural reach (right-hand hold)
- Primary CTAs belong in the bottom 40%: Begin button, cycle button, heart tap
- Avoid placing important interactions at the very top or far corners
- On iOS, bottom safe area (`env(safe-area-inset-bottom)`) must always be respected

**Scroll is the primary verb**
- The experience IS the scroll — do not interrupt it with overlays, modals, or
  forced pauses that block the scroll gesture
- Animations must complete before or during scroll, not after — waiting for
  animations to end before content appears is frustrating on mobile
- Scroll-triggered reveals must fire early enough (`rootMargin: -10% bottom`) that
  content appears before the user reaches it, not as they're already passing it

**Performance is a feature on mobile**
- Mid-range Android (Pixel 4a, Samsung A-series) is the performance floor
- No animation should drop below 55fps on a mid-range Android
- `will-change: transform, opacity` on animated elements
- CSS animations over JS where possible (compositor thread, no jank)
- Avoid animating `width`, `height`, `top`, `left` — only `transform` and `opacity`
  are compositor-safe
- `content-visibility: auto` on chapter articles to skip off-screen paint

**Native iOS/Android feel**
- `touch-action: manipulation` on all interactive elements to remove 300ms tap delay
- Haptic-like feedback via CSS `scale(0.96)` on button press (`:active`)
- `user-select: none` on decorative and interactive elements

**Viewport and safe areas**
- Always use `min-height: 100dvh` (dynamic viewport height) not `100vh`
- Respect `env(safe-area-inset-*)` for notch/Dynamic Island/home indicator spacing
- The ceremony and theme selector are `position: fixed; inset: 0`

---

## Diagnosis (as of Phase 1 + 2 + 3 completion)

Theme switching swaps colour variables, particle shapes, and motion presets.
Staggered reveals, typewriter poem, image frames, crescendo burst, heart confetti,
chapter navigation, and PWA manifest are all implemented. The experience now has
ambient life, premium interactions, and mobile-first haptics. What remains:
cinematic transitions, chapter system depth, sound, personalisation easter eggs,
and technical foundations like offline support and performance optimisations.

---

## Phase 1 — Theme identity + scroll choreography + impact moments
**Status: DONE**

| Item | What was built |
|---|---|
| Per-theme particle shapes | CSS clip-path / border-radius per theme (petal / sparkle / bubble / star5 / star6 / flutter / diamond) |
| Per-theme animation presets | `--motion-duration`, `--motion-ease`, `--motion-stagger`, `--motion-reveal-offset` applied via ThemeController |
| Staggered chapter reveals | Number → Title → Body → Ornament, each staggered by `--motion-stagger` |
| Ceremony particle burst | 32 particles burst radially from bloom center on sequence completion (20 on mobile) |
| Scroll progress indicator | 3px fixed bar on right edge, theme-coloured gradient |

---

## Phase 2 — Ambient life + depth
**Status: DONE**

| Item | What was built |
|---|---|
| Floating decorative SVGs | Anchored to sections, slow floatDrift animation, desktop only |
| Crescendo viewport burst | 60 particles (30 mobile) on crescendo section entry |
| Typewriter poem | Character-by-character reveal with blinking cursor; disabled on reduced-motion |
| Ornamental SVG image frames | Gold corner brackets on every image placeholder |
| Grain/noise texture overlay | SVG feTurbulence at opacity 0.022, fixed layer |
| Font preload | Stylesheet preload link for faster load on mobile |
| Chapter image depth | 0.8° rotation + box-shadow on images (481px+ only) |
| Parallax | Intentionally skipped — CSS background-attachment:fixed breaks iOS |

---

## Phase 3 — Premium interactions
**Status: DONE**

| Item | What was built |
|---|---|
| Word-level title reveal | Per-word span with staggered transition-delay |
| Heart fill animation | SVG stroke draw → fill after transitionend |
| Heart confetti + haptic | Tap/touchend fires confetti burst + navigator.vibrate |
| Sound toggle | Bottom-right fixed button, connects to ambient.mp3 |
| Chapter anchor navigation | Bottom dot strip, tracks active chapter via IntersectionObserver |
| Chapter number odometer flip | 3D rotateX animation on chapter entry |

---

## Phase 4 — Cinematic transitions + ceremony depth
**Status: DONE**

### 4.1 Bloom-into-portal Begin transition `S` `High`
When Begin is pressed, an expanding circle clip-path (anchored to the bloom center)
floods rose colour across the screen, briefly filling it completely, then collapses
inward into the journey. The "zoom into the flower" moment. Uses `clip-path: circle()`
animated from 0px to 200vmax then back to 0px. Two-phase: expand 350ms, collapse
350ms. Reveal occurs between the two phases.

### 4.2 Days-together counter `S` `High`
Calculate `Math.floor((Date.now() - anniversaryStartDate) / 86400000)` and count
up from 0 to the real value over 1.5s using requestAnimationFrame with easing. Lands
just before the Begin button appears, below the ceremony date. Shows "365 days of us."

### 4.3 Personalised recipient name `S` `High`
`content.js` exposes `recipientName`. The ceremony shows "For Divya" below the
title, fading in between the date and the Begin button. Small, gold, italic.
The page `<title>` updates to include the name.

### 4.4 Auto-advance countdown ring `S` `Med`
An SVG arc ring around the Begin button fills over 10 seconds after the button
appears. On ring completion, Begin auto-fires. Cancelled immediately if user
interacts with the button. Uses `stroke-dashoffset` animation. Communicates to
the recipient that they can just watch passively.

### 4.5 Crescendo line stagger reveal `S` `High`
Each of the three crescendo lines reveals independently with 400ms stagger:
line 1, then line 2, then the highlight "Happy first anniversary." Each line is
a `reveal-child` element. The highlight line gets a slow scale-up on entry.

---

## Phase 5 — Chapter system depth
**Status: DONE**

### 5.1 Chapter completion micro-celebration `S` `High`
When the ornament at the bottom of a chapter enters the viewport, 8 tiny particles
pop out of the ornament dot like a small firework. Lasts 400ms. The dot briefly
scales up and glows. Rewarding without interrupting flow.

### 5.2 Chapter mood tags `S` `Med`
Each chapter in `content.js` has a `mood` emoji and descriptive word (e.g., `'🌸'`).
Rendered as a small pill beneath the chapter ornament in `--gold` colour. Multiple
moods per chapter are possible. Adds emotional metadata without cluttering the prose.

### 5.3 Chapter breadcrumb `S` `Med`
A small "01 / 12" position indicator beneath each chapter number, in `--gold` at
0.7rem. Never intrusive but gives the recipient a sense of progress and scale.

### 5.4 Double-tap to love a chapter image `S` `High`
Instagram-style: double-tapping (two taps within 300ms) any image placeholder spawns
a heart emoji that scales up from the tap point and floats upward before fading. Triggers
`navigator.vibrate(20)`. Pure ephemeral delight — no persistent state.

### 5.5 Table of contents slide-up sheet `M` `High`
Long-pressing (500ms+) the chapter navigation bar slides up a bottom sheet with all
12 chapter titles. Tap any to navigate. Dismissed by tapping the backdrop or swiping
down. On desktop, the long-press can be triggered by right-click or a dedicated icon.

### 5.6 Hidden easter egg chapter `M` `High`
Tapping the chapter 12 ornament dot three times in quick succession reveals a secret
final chapter (number "∞") that slides in from below. The content is a deeply personal
closing thought that isn't part of the main flow. Accessible via URL hash `#chapter-hidden`.

---

## Phase 6 — Image system
**Status: DONE**

### 6.1 Curtain reveal animation `S` `High`
Each image placeholder reveals via a themed curtain: a `div.image-curtain` element
covers the image with `var(--rose)` background at `scaleX(1)`. When the
`chapter-image-wrap` gets `.visible`, the curtain transitions to `scaleX(0)` from
`transform-origin: right`. Duration 0.8s. Gives a cinematic frame-wipe reveal to
every image. When a real photo is swapped in, the curtain still fires.

### 6.2 Blur-up progressive image loading
When real photos are added, show a tiny (20px wide) blurred thumbnail immediately,
then load the full-resolution image. Transition from `filter: blur(20px)` to
`blur(0)` with 400ms ease on load. Prevents layout shift.

### 6.3 Ken Burns pan/zoom (planned)
When a chapter image is in the viewport, apply a slow Ken Burns animation:
`scale(1.08) translateX(-2%)` → `scale(1) translateX(2%)` over 10s loop.
Disabled on `prefers-reduced-motion`.

---

## Phase 7 — Crescendo + closing upgrades
**Status: DONE**

### 7.1 Pulse rings behind crescendo text `S` `High`
Concentric circle rings pulse outward from the crescendo section center using CSS
`::before` and `::after` pseudo-elements. Four rings with staggered animation-delay
values. `border: 1px solid rgba(255,255,255,0.15)`. Creates the feel of a signal
or heartbeat radiating from the words.

### 7.2 Heart pulse after fill `S` `High`
After the closing heart fills with rose colour, the `.heart-wrap` pulses rhythmically
at `scale(1.06)` with a 1.2s ease-in-out loop, 5 times total. Mirrors a real heartbeat
cadence. Adds life to the moment after the stroke draw animation completes.

### 7.3 Heart expand-to-fill on tap `M` `High`
On the first tap of the filled heart, a rose-coloured circle expands via clip-path
from the heart center to fill the entire viewport (200vmax), then collapses back
inward — a "love fills everything" climax moment. One-shot, never repeats.

### 7.4 Ink-signature closing signoff `S` `High`
The "Yours," signoff appears as if hand-written: character by character via a
typewriter effect, then an SVG wavy underline draws beneath it.

---

## Phase 8 — Sound + sensory
**Status: DONE (Web Audio, no files needed)**

### 8.1 Heartbeat sound `S` `High`
When the SVG heart fills, a "lub-dub" heartbeat plays via Web Audio API: two sine
wave pulses at 80Hz and 60Hz, 100ms apart, then repeated 5 times at 1.2s intervals.
No audio file needed — pure OscillatorNode synthesis. Only plays after user has
interacted with the page (AudioContext unlock policy).

### 8.2 Chapter transition chime `S` `Med`
A soft, brief synthesised chime plays when each chapter enters the viewport. Frequency
maps to chapter index (higher chapters = slightly higher pitch). Built with
OscillatorNode + GainNode. Debounced to max once per second. Only if audioCtx is
already unlocked by user interaction.

### 8.3 Shake to confetti `S` `High`
DeviceMotionEvent acceleration delta > 25 m/s² triggers a full-width confetti burst
from the top of the screen. iOS 13+ requires DeviceMotionEvent.requestPermission()
which is chained to the sound-toggle click. Android fires immediately. "Shake the
phone to celebrate" is a joyful interaction.

### 8.4 Per-theme ambient audio (planned)
Each theme has its own ambient .mp3 loop: petalpop → wind chimes, moonlight → piano,
candy-cloud → ukulele, gulabo-garden → tabla, starry-snuggle → ambient pads,
butterfly-blush → acoustic guitar, sangeetspark → sitar, velvet-vows → strings.
Files at `audio/[theme-id].mp3`. Toggle crossfades between them via Web Audio.

---

## Phase 9 — Theme system upgrades
**Status: DONE**

### 9.1 Theme persistence `S` `High`
`localStorage.setItem('anniversary-theme', theme.id)` on theme select. On next load,
start the theme selector on the remembered theme. The selector still shows so the
user can change, but starts on their previous choice.

### 9.2 SurpriseMe mode `S` `Med`
A "✦ Surprise Me" text button below the theme dots picks a random theme instantly
with a flash transition. Good for first-time openers who don't know what to pick.

### 9.3 Theme preview on dot hover `S` `High`
Hovering (or long-pressing on mobile) a theme dot shows a floating tooltip above it:
the theme's orb gradient, name, and tagline. Preview uses the theme's own colour
tokens so the user sees the real palette. Disappears on mouseout / second tap.

### 9.4 Theme flash transition `S` `Med`
When switching themes, a brief rose-coloured overlay flashes across the screen (opacity
0 → 0.3 → 0, over 300ms). Makes the theme switch feel intentional and physical rather
than just variables changing. Works on top of the existing CSS token transition.

### 9.5 Theme intensity slider (planned) `M` `Med`
Soft / Medium / Extra intensity mode modifies `--rose` saturation and particle count
by a multiplier. Stored in localStorage alongside theme ID.

### 9.6 Seasonal auto-suggest (planned) `S` `Med`
Check `new Date().getMonth()` on load and suggest a matching theme with a subtle
"Suggested for June ✦" label. June → butterfly-blush, December → velvet-vows, etc.

---

## Phase 10 — Navigation + wayfinding
**Status: DONE**

### 10.1 Scroll-direction-aware chapter header `S` `High`
A slim 50px fixed header that shows the current chapter number and title. Hidden on
scroll-down (translate up out of view), revealed on scroll-up. Updates chapter title
as chapters scroll into view. Hides entirely when not in the chapters section.

### 10.2 Replay opening button `S` `Med`
At the very bottom of the page, below the heart, a small "↺ Replay Opening" text link.
Scrolls to top and re-runs the ceremony sequence without reloading the page. Restores
all ceremony elements and re-fires the animation timeline.

### 10.3 Pull-to-restart `M` `High`
When at `scrollY === 0` and the user pulls down beyond 80px, a "↺" indicator slides
down from the top. On release at threshold, `window.location.reload()` fires. Gives
a native iOS-like restart gesture. Only active on mobile.

### 10.4 Deep-link to chapter (planned) `M` `Med`
URL hash `#chapter-05` scrolls directly to that chapter after ceremony dismisses.
"Continue to Chapter 5" replaces "Begin Our Journey" if a hash is present.

---

## Phase 11 — Mobile-specific features
**Status: DONE**

### Previously shipped
- Web Share API button
- navigator.vibrate haptic on heart
- Orientation lock guidance overlay
- PWA manifest.json (standalone + portrait)
- viewport-fit=cover for Dynamic Island/notch
- env(safe-area-inset-*) on fixed UI
- touch-action: manipulation globally

### 11.1 Shake to confetti
DeviceMotionEvent acceleration shake detection. Chained to sound toggle for iOS
permission prompt. See Phase 8.3.

### 11.2 Add-to-Home-Screen banner (planned) `M` `High`
After 30 seconds on the page, if not already installed, show a soft bottom banner:
"Add to home screen for the best experience +" with an iOS-style share icon. Triggers
`beforeinstallprompt` on Chrome/Android. iOS shows manual instructions.

---

## Phase 12 — Personalisation + easter eggs
**Status: DONE**

### 12.1 Hidden easter egg chapter
Triple-tap on chapter 12 ornament reveals chapter "∞". See Phase 5.6.

### 12.2 Konami code (planned) `S` `High`
↑↑↓↓←→←→BA triggers a brief "8-bit" aesthetic: monospace font, pixel filter on
images, particles become emoji, chiptune melody via Web Audio. Reverts after 5s.

### 12.3 Page title per chapter `S` `Med`
`document.title` updates to "💕 Chapter 3 — How I knew · Happy Anniversary" as
chapters scroll into view. Resets at top and bottom. Gives context in browser tab.

---

## Phase 13 — Technical foundations
**Status: DONE**

### 13.1 Service Worker + offline cache `M` `High`
`sw.js` caches all static assets on install. Cache-first strategy for all GET
requests. Falls back to network on cache miss and updates the cache. The experience
works fully offline after first load — essential for gifting (recipient may open on
a plane, in a tunnel, or on a poor connection on an important day).

### 13.2 `content-visibility: auto` on chapters `S` `Med`
Added to `.chapter` elements with `contain-intrinsic-size: 0 500px`. Off-screen
chapters are skipped in rendering, reducing paint time significantly on lower-end
Android devices with 12+ chapters.

### 13.3 Print stylesheet (planned) `S` `Low`
`@media print` styles lay out the experience as a printable love letter: hide
ceremony + theme selector, print all chapters full-width with ornaments, crescendo
text in large bold type, heart in outline form.

---

## Future upgrades (original extension menu)

- SurpriseMe mode: random theme on load ✅ Done
- Theme intensity slider (Soft / Medium / Extra)
- Transition speed slider
- Replay opening button at bottom (thumb zone) ✅ Done
- Real photo: blur-up loading (blurry → sharp as photo loads)
- Season-specific limited-edition theme slot
- Shareable private link variants
- PWA / Service Worker offline support ✅ Done
- Per-theme ambient audio loops
- Konami code easter egg
- 3D card tilt on chapter images (desktop)
- Magnetic cursor attraction (desktop)
- Cursor petal trail (desktop)
- Memory quiz between chapters
- Scrollable map of places visited together
- iOS lock screen aesthetic for closing section
- Save-as-image / PDF export

---

## Priority Matrix

| Priority | Feature | Effort | Why |
|---|---|---|---|
| ✅ Done | Portal transition | S | Most cinematic ceremony moment |
| ✅ Done | Days-together counter | S | Personal, high emotional impact |
| ✅ Done | Crescendo stagger | S | Missing from Phase 3 |
| ✅ Done | Heart pulse | S | Natural extension of heart code |
| ✅ Done | Theme persistence | S | UX essential |
| ✅ Done | Service Worker | M | Offline = reliable gifting |
| ✅ Done | Curtain reveal | S | Most visually distinctive image upgrade |
| ✅ Done | Chapter completion pop | S | Rewarding micro-interaction |
| ✅ Done | Heart expand-to-fill | M | Single best "wow" interaction |
| ✅ Done | TOC slide-up sheet | M | Navigation at 12 chapters |
| ✅ Done | Pull-to-restart | M | Native mobile feel |
| 🟡 Next | Per-theme audio loops | L | Needs .mp3 assets |
| 🟡 Next | Blur-up photo loading | M | Needs real photos first |
| 🟡 Next | Ken Burns on images | M | Needs real photos to shine |
| 🟢 Later | 3D card tilt | S | Desktop only, lower reach |
| 🟢 Later | Konami code | S | Fun but not essential |
| 🟢 Later | Memory quiz | L | Needs content design |
| 🟢 Later | Map of places | M | Needs coordinate data |
