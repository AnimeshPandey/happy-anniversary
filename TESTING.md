# Testing Checklist

Manual QA checklist for every feature in the anniversary experience.
Run this before every deploy. Check off items as you go.

---

## Environment Setup

- [ ] Open `index.html` directly in Safari on iPhone (primary target device)
- [ ] Also verify in Chrome for Android
- [ ] Desktop: Chrome, Safari, Firefox for completeness
- [ ] Clear `localStorage` before starting a fresh run: `localStorage.clear()` in DevTools console
- [ ] Bump `CACHE` version in `sw.js` and hard-reload to clear service worker on desktop

---

## Phase 0a — Theme Selector

### Display
- [ ] "for Divya, with love" dedication line appears above "Choose Our Love Mood"
- [ ] Orb renders with correct gradient for default theme (PetalPop Parade)
- [ ] Theme name, tagline, and icon display correctly
- [ ] All 9 theme dots render below the orb
- [ ] `<` and `>` chevron buttons are visible and tappable

### Interactions
- [ ] Tap orb cycles to next theme
- [ ] Swipe left on orb cycles to next theme (swipe >20px)
- [ ] Swipe right on orb cycles to previous theme
- [ ] `<` button goes to previous theme (wraps around from first to last)
- [ ] `>` button goes to next theme (wraps around from last to first)
- [ ] Tapping a dot jumps directly to that theme
- [ ] `✦` surprise button picks a random theme that is not the current one
- [ ] Hovering a dot (desktop) shows the theme name preview bubble
- [ ] Theme name, tagline, icon cross-fade on switch (not instant swap)
- [ ] Rapid-fire clicking does not break theme state (second click blocked during 600ms guard)

### Theme visuals
- [ ] Switch through all 9 themes; orb gradient, name, tagline all match each theme
- [ ] SangeetSpark Symphony (index 6) shows dark background in selector
- [ ] Purrfect Pair (index 8) shows lavender/lilac background with paw emoji icon
- [ ] Petal colours change noticeably between themes on the falling petals
- [ ] `<meta name="theme-color">` updates to match the new theme's rose colour (check in DevTools Elements)

### Persistence
- [ ] Select a non-default theme, close tab, reopen — selector starts on the same theme
- [ ] `localStorage.getItem('anniversary-theme-idx')` returns the correct index

### Accessibility
- [ ] Screen reader announces theme name on switch (check `#ts-announce` aria-live region)
- [ ] All dot buttons have `aria-pressed` state matching active theme
- [ ] Arrow buttons have readable `aria-label`

### Begin
- [ ] Tapping the `↓` arrow dismisses selector with 750ms fade
- [ ] Ceremony screen appears after dismissal

---

## Phase 0b — Ceremony

### Display
- [ ] "Happy Anniversary" heading visible
- [ ] Recipient name "Divya" appears below heading (small, gold, italic)
- [ ] Date line "One beautiful year" appears
- [ ] Days counter counts up from 0 to correct number (days since June 2025) over ~1.5s
- [ ] "tap when you are ready" hint fades in below Begin button
- [ ] Begin button is centred and large enough to tap comfortably
- [ ] Countdown ring SVG is visible around the Begin button

### Countdown Ring
- [ ] Countdown ring fills over 10 seconds
- [ ] Tapping Begin before ring completes cancels the auto-advance
- [ ] If not tapped, ring completes and portal transition fires automatically

### Begin Flow
- [ ] Portal overlay expands from tap point (radial gradient, rose/gold colours)
- [ ] Expansion takes ~280ms to fill screen
- [ ] Overlay collapses inward after expansion (~340ms)
- [ ] Journey section fades in (opacity 0 to 1 over 500ms) after portal collapses
- [ ] Total portal transition is ~620ms from tap to journey visible
- [ ] Tapping Begin twice rapidly does NOT double-fire the journey (`_journeyStarted` guard)
- [ ] Auto-fire from countdown ring + manual tap simultaneously does NOT duplicate journey start

---

## Journey — Initial State

- [ ] Scroll starts at position 0 (no flash or jump)
- [ ] Sound toggle button appears (bottom-right), hidden attribute removed
- [ ] Share button appears if `navigator.share` is available (bottom-right)
- [ ] Chapter nav dots appear (20 dots, hidden until in chapter section)
- [ ] Image mode toggle button appears (bottom-right, above sound toggle) — shows 📷 in AI mode, 🎨 in real mode
- [ ] Tapping image mode toggle switches all chapter images between illustrated and real photos
- [ ] Image mode persists across page refreshes (check `localStorage.getItem('image-mode')`)
- [ ] Sound hint toast appears 2 seconds after journey starts ("tap the note for music")
- [ ] Sound hint toast auto-dismisses after 3.5s
- [ ] Sound hint toast does NOT appear on second visit (check `localStorage.getItem('sound-hint-shown')`)
- [ ] Per-theme ambient effects begin approximately 1.8s after journey starts (e.g. fireflies for PetalPop, cat paw prints for Purrfect Pair)

---

## Opening Section

- [ ] Opening poem text appears ("Every love story is beautiful, / But Divya, ours is my favourite.")
- [ ] Typewriter effect plays character-by-character when poem enters viewport
- [ ] SVG underline draws beneath poem after typewriter completes
- [ ] Two opening panels render with correct copy and image placeholders

---

## Chapter Sections (1-20)

### Per-chapter checks (spot-check chapters 1, 10, 20)
- [ ] Chapter number appears with odometer-flip animation on entry
- [ ] Chapter breadcrumb (e.g. "01 / 20") appears below number in gold
- [ ] Chapter title words stagger in individually (word-level animation)
- [ ] Chapter body text fades/slides in (reveal animation)
- [ ] Mood tag pill renders below ornament
- [ ] Ornament dot at bottom fires 8-particle pop when it reaches 75% in view
- [ ] Image placeholder renders with camera icon, description text, gold frame corners, and curtain overlay
- [ ] Image curtain wipes right-to-left (scaleX 1 to 0) on image entering view

### Navigation
- [ ] Chapter nav dots (bottom) highlight the active chapter as you scroll
- [ ] Tapping a nav dot smooth-scrolls to that chapter
- [ ] Chapter header (top bar) appears when scrolling down through chapters
- [ ] Chapter header hides on scroll-up
- [ ] Chapter header shows correct number and title for current chapter
- [ ] Long-pressing nav bar for >= 500ms opens TOC bottom sheet

### TOC Sheet
- [ ] All 20 chapters listed with mood emoji
- [ ] Active chapter is highlighted in TOC
- [ ] Tapping a TOC item scrolls to that chapter and closes the sheet
- [ ] Tapping the backdrop closes the sheet
- [ ] Swiping down on the sheet closes it

### Scroll Progress Bar
- [ ] Right-edge bar is 0% at top of journey
- [ ] Bar grows as you scroll down
- [ ] Bar reaches ~100% at bottom of page

### Chapter Chimes
- [ ] A soft two-note chime plays when each chapter enters view (after AudioContext is unlocked)
- [ ] Same chapter does not re-chime on scroll back
- [ ] No errors in console related to AudioContext

---

## Crescendo Section

- [ ] Crescendo background is dark gradient
- [ ] Three text lines reveal with stagger (line 1, then 2, then 3)
- [ ] Third line ("Happy first anniversary.") gets highlight styling
- [ ] White particle burst fires on section entry
- [ ] Concentric pulse rings animate outward from section center

---

## Closing Section

- [ ] Closing image placeholder renders with frame
- [ ] Closing message text fades in ("With all of my love...")
- [ ] Closing signoff ("Yours, always") fades in
- [ ] SVG underline draws beneath signoff on entry at 70% threshold
- [ ] "Animesh" author byline appears in Playfair italic, rose colour
- [ ] SVG heart outline draws (stroke from 255px dashoffset to 0) when 50% in view
- [ ] Heart fills with rose colour 1.7s after draw starts
- [ ] Heart pulses 5 times at 1.2s cadence after fill
- [ ] "Happy first anniversary, Divya." dedication text fades in 2.5s after heart enters view
- [ ] 8 slow petals cascade after dedication appears
- [ ] "Begin Again" button is visible below heart

---

## Gestures and Easter Eggs

### Double-tap images
- [ ] Double-tapping any image placeholder spawns a floating heart from the tap point
- [ ] Heart floats upward and fades out
- [ ] Works on chapter images, opening panel images, and closing image

### Tap heart
- [ ] Tapping the SVG heart fires a confetti burst
- [ ] Haptic feedback fires (`navigator.vibrate`) if supported

### Triple-tap ch20 ornament
- [ ] Three taps within 650ms on chapter 20 ornament reveals hidden chapter "infinity"
- [ ] Hidden chapter slides in / appears with dark background
- [ ] Confetti fires on reveal
- [ ] Page scrolls to hidden chapter

### Pull to restart
- [ ] At scrollY === 0, pulling down shows the "Release to restart" indicator
- [ ] Releasing at >= 90px triggers `window.location.reload()`
- [ ] Only active on mobile (skipped on desktop)

### Shake
- [ ] Shaking device (or simulating via DevTools Sensors) fires confetti burst
- [ ] Only fires once per 1.5s (throttled)

---

## Sound and Ambient

### Sound toggle
- [ ] Tapping sound button starts synthesised ambient (two sine oscillators, per-theme pitch)
- [ ] Button icon changes to indicate playing state (crossed-out note when off)
- [ ] Tapping again stops ambient with a smooth fade-out
- [ ] Chapter chimes play after sound button has been tapped (AudioContext unlocked)
- [ ] Sound does not auto-play without user interaction
- [ ] Switching theme while ambient is playing crossfades to new theme's ambient frequencies smoothly

### Per-theme ambient effects
- [ ] PetalPop Parade — fireflies and cherry petal gusts visible in journey
- [ ] Purrfect Pair — kitty paw prints, yarn ball, floating whiskers visible; cat cameo appears within ~90s
- [ ] SangeetSpark Symphony — firework bursts and diyas visible
- [ ] VelvetVows Voyage — candle flicker, gold leaf dust, peacock visible
- [ ] Switching theme clears previous effects and starts new ones
- [ ] Replay clears all effects and stops ambient

---

## Share

- [ ] Tapping share button calls `navigator.share()` with correct title and URL
- [ ] No errors on platforms without `navigator.share` (button hidden)

---

## Replay

- [ ] Tapping "Begin Again" smooth-scrolls to top of page
- [ ] Ambient effects clear and ambient audio stops immediately on tap
- [ ] After 700ms: ceremony and theme selector reappear
- [ ] Days counter re-animates
- [ ] Countdown ring resets
- [ ] Journey can be entered again (portal fires correctly)
- [ ] Per-theme effects re-initialise 1.8s after re-entering the journey
- [ ] Reveals re-trigger on scroll (reveal items already visible stay visible)

---

## Orientation

- [ ] Rotating to landscape on a small screen (< 500px height) shows overlay
- [ ] Rotating back to portrait dismisses overlay

---

## Petals

- [ ] Petals fall continuously in background
- [ ] Petal colours match the active theme
- [ ] Petal shape matches the active theme (petal, sparkle, bubble, etc.)
- [ ] 18 petals on mobile, 28 on desktop

---

## Accessibility

- [ ] Skip link ("Skip to story") appears on focus and skips to `#journey`
- [ ] All image placeholders have `role="img"` and descriptive `aria-label`
- [ ] Interactive elements have readable `aria-label` (sound toggle, share, chapter dots)
- [ ] TOC sheet has `role="dialog"` and `aria-modal="true"`
- [ ] No `aria-hidden` on elements that receive keyboard focus

### Reduced Motion
- [ ] Enable `prefers-reduced-motion: reduce` in OS settings
- [ ] Petals are hidden
- [ ] All reveal elements appear immediately (no slide-in)
- [ ] Typewriter effect skips (poem appears all at once)
- [ ] Particle bursts do not fire
- [ ] Days counter shows final number immediately
- [ ] All ambient effect modules produce no elements (modules return empty cleanup immediately)

---

## Performance

- [ ] Page loads without layout shift on iOS Safari (check for no scroll-position jump)
- [ ] No console errors on first load
- [ ] Service worker registers without error (`navigator.serviceWorker` in console)
- [ ] Second load (with SW cache) loads instantaneously

---

## Offline

- [ ] After first full load: disable network in DevTools
- [ ] Reload page — all text, styles, and scripts load from cache
- [ ] Image placeholders still display (photos not pre-cached, OK to fail)

---

## Content Validation

- [ ] No em dashes (`—`) anywhere in rendered page text (`document.body.innerText.includes('—')` returns false)
- [ ] Recipient name "Divya" appears in ceremony, closing dedication
- [ ] Author "Animesh" appears in closing
- [ ] Anniversary date is correct
- [ ] Days counter lands on the correct number

---

## Pre-Deploy Checklist

- [ ] `CACHE` version bumped in `sw.js` (currently `anniversary-v10`, bump to v11 on next deploy)
- [ ] `git config user.name` returns `AnimeshPandey` before committing
- [ ] All 9 themes verified visually in theme selector
- [ ] No console errors in Chrome, Safari, Firefox
- [ ] Lighthouse accessibility score >= 90
- [ ] Deploy pushed to `gh-pages` branch or `main` (per hosting setup)
- [ ] Run `npx playwright test` — all 150 tests should pass
