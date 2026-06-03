# Interactions Reference

Every user-facing gesture and interaction, how it's triggered, and where the code lives.

---

## Theme Selector (Phase 0a)

The theme selector is the first screen on every page load. Scroll is locked via body-lock
(`position: fixed; top: 0; left: 0; right: 0; overflow: hidden`) until the user advances.

A dedication line "for Divya, with love" appears above the "Choose Our Love Mood" label.

| Interaction | Trigger | Effect |
|-------------|---------|--------|
| Cycle forward | Tap/click orb | Next theme (wraps). `orbWrap click` in `initThemeSelector()`. |
| Cycle forward | Swipe left on orb | Next theme. Touch swipe >20px. |
| Cycle backward | Swipe right on orb | Previous theme. Touch swipe >20px. |
| Previous | `<` chevron button | Previous theme. `ts-prev-btn click`. |
| Next | `>` chevron button | Next theme. `ts-next-btn click`. |
| Select specific | Tap a dot | Jumps to that theme. `ts-dot click`. |
| Surprise | `✦` icon on orb | Random theme (not current). `ts-surprise-btn click` in `initSurpriseMe()`. |
| Begin | Tap `↓` arrow | Dismisses selector (750ms fade), triggers `runCeremonySequence()`. |
| Preview label | Hover/focus dot | Shows bubble with theme name. `initThemePreview()`. |

**Theme persistence**: selected index saved to `localStorage('anniversary-theme-idx')` and restored on next load.

**Theme-color meta tag**: `<meta name="theme-color">` updates to the active theme's `--rose` value every time a theme is applied. This colours the iOS Safari status bar.

**ThemeController guard**: `ThemeController.set()` is guarded by an `isTransitioning` boolean (600ms cooldown). Rapid-fire dot taps only apply the first switch; subsequent taps are ignored until the animation completes. CSS tokens apply synchronously; the selector text (name, tagline, icon) cross-fades over 580ms (180ms exit + 400ms enter).

---

## Ceremony (Phase 0b)

The ceremony screen shows the title, recipient name, date, days-together counter, and Begin button.
Below the button a faint hint reads "tap when you are ready" (fades in 400ms after Begin appears).

| Interaction | Trigger | Effect |
|-------------|---------|--------|
| Begin journey | Tap `Begin` button | Portal bloom transition (620ms: 280ms expand + 340ms collapse), then `showJourneyUI()`. |
| Auto-advance | 10s countdown ring completes | Same as tapping Begin. `initCountdownRing()`. |

**Portal transition detail**: clicking Begin records the tap coordinates as CSS variables `--pcx`/`--pcy`.
`#portal-overlay` gets class `expanding` (clip-path `circle(0 → 200vmax)` in 280ms). After 280ms the class
swaps to `collapsing` (`circle(200vmax → 0)` in 340ms). `showJourneyUI()` fires after the full 620ms.

**`_journeyStarted` guard**: `showJourneyUI()` is protected by a boolean flag. Both the Begin button
and the countdown ring auto-fire call the same function; the guard ensures the journey starts exactly
once even if both fire simultaneously.

---

## Journey — Scroll Behaviours

| Behaviour | How |
|-----------|-----|
| Reveal animations | `.reveal` elements fade/slide in via IntersectionObserver when >= 12% in viewport. `initReveal()`. |
| Chapter title word animation | Each word staggers in with 55ms delay on chapter text-wrap entering view. `animateTitleWords()`. |
| Chapter number odometer | Rotates from below on chapter entry. `.odometer-flip` class + CSS animation. |
| Image curtain wipe | `.image-curtain` slides right on image-wrap entering view. CSS `scaleX(1 to 0)`. Duration 0.8s. |
| Poem typewriter | Characters type one-by-one when poem enters viewport. `initTypewriter()`. Underline SVG draws on complete. |
| Scroll progress bar | Right-edge vertical bar grows with scroll depth. `initScrollProgress()`. |
| Chapter header | Slim top bar shows current chapter number + title when scrolling down through chapters. Hides on scroll-up. `initChapterHeader()`. |
| Ornament pop | Tiny 8-particle burst when chapter ornament (bottom of chapter) reaches 75% in view. `initOrnamentsObserver()`. |
| Crescendo burst | White particle spray when crescendo section enters view. `fireCrescendoBurst()`. |
| Crescendo rings | Expanding ring animation activates 800ms after crescendo enters view. `.rings-active` on `.crescendo-inner`. |
| Heart draw | SVG stroke animates 0 to full length (255px dasharray) when closing heart enters view at 50% threshold. `initHeart()`. |
| Heart fill | Solid rose fill + heartFill animation appears 1.7s after draw starts. `.heart-wrap` then pulses 5x at 1.2s. |
| Heart dedication | 2.5s after heart enters view, `.anniversary-dedication` element ("Happy first anniversary, Divya.") fades in below. |
| Slow petal cascade | `fireSlowCascade()` spawns 8 themed petals as a final celebratory rain after the dedication appears. |
| Signoff underline | SVG path draws under the closing signoff when it enters view at 70% threshold. `initClosingSignoff()`. |
| Chapter chimes | Web Audio sine wave note on each new chapter entering view. `playChime(idx)`. Deduplicated per chapter. AudioContext unlocked on first user gesture. |

---

## Journey — Tap / Gesture Behaviours

| Interaction | Trigger | Effect |
|-------------|---------|--------|
| Double-tap image | Double-tap any `.chapter-image-wrap`, `.panel-image`, or `.closing-image-wrap` within 300ms | Floating `♥` heart animates up and fades. `initDoubleTapLove()`. |
| Tap heart | Tap `.heart-wrap` at bottom of closing | Confetti burst + chime. |
| Triple-tap ch12 ornament | Three taps within 650ms on the ornament at bottom of chapter 12 | Reveals hidden chapter `infinity`, confetti, scroll to it. `initHiddenChapter()`. |
| Pull to restart | Pull down from top (>= 90px, mobile only) | Reloads page. Indicator appears during pull. `initPullToRestart()`. |
| Shake | Shake device (accelerometer delta > 25) | Confetti burst at top-centre. Throttled to once per 1.5s. `initShakeDetection()`. iOS 13+ requires permission — silently skipped if not granted. |
| Long-press nav bar | Hold chapter nav bar (>= 500ms) | Opens TOC bottom sheet. `initTOCSheet()`. |
| Replay | Tap `Begin Again` button | Smooth scroll to top, restores theme selector and ceremony after 700ms. `_journeyStarted` reset to `false`. |

---

## Fixed UI

| Element | Visibility | Behaviour |
|---------|-----------|-----------|
| Sound toggle (`note` symbol) | Appears after Begin, bottom-right | Plays/pauses `ambient.mp3`. Also unlocks AudioContext for chimes. |
| Share button | Appears after Begin if `navigator.share` available | Calls Web Share API. |
| Chapter nav dots | Visible while scrolling through chapters | Tap to jump to chapter. Long-press to open TOC. Hides when outside chapters section. |
| Chapter header | Visible while scrolling down through chapters | Shows `chapter number + title`. Hides on scroll-up or outside chapters. |
| TOC sheet | Opens on long-press nav, closes on backdrop tap | Lists all 12 chapters with mood emoji. Active chapter highlighted. |
| Orientation overlay | Auto-shown in landscape on small screens (< 500px height) | Asks user to rotate. |
| Pull-to-restart indicator | Shown during downward pull at top of page | Shows `Release to restart`. |
| Sound hint toast | Appears once, 2s after journey starts | Bottom-right overlay reading "tap the note for music". Shown only once per device (keyed by `localStorage('sound-hint-shown')`). Auto-dismisses after 3.5s. |

---

## TOC Discovery Hint

The first time the journey is entered (keyed by `localStorage('toc-hint-shown')`), the chapter
navigation bar briefly pulses a glow effect to signal its existence. This hint fires once and
never repeats.

---

## Closing Sequence

After all chapters, the closing section shows:
1. Closing image (photo placeholder or real photo)
2. Closing message text
3. Closing signoff ("Yours, always") with SVG underline
4. Closing author ("Animesh") in Playfair italic, rose colour
5. SVG heart (draw animation triggers on 50% viewport entry)
6. Anniversary dedication fades in 2.5s after heart enters view
7. Slow petal cascade fires alongside the dedication
8. "Begin Again" replay button below the heart

---

## AudioContext Notes

Web Audio (`OscillatorNode`) is used for chimes. iOS and some browsers suspend the AudioContext
until a user gesture. The context is created lazily on first use, and resumed:

- Automatically when `playChime()` is called and `ctx.state !== 'running'`
- Explicitly on sound-toggle button click (also unlocks ambient audio)

If chimes are silent on first scroll: tap the sound button once to unlock.

---

## Replay Flow

Tapping "Begin Again":
1. Smooth scroll to `scrollY === 0`
2. After 700ms: `lockScroll()` re-applied, `_journeyStarted = false`, ceremony fades in, theme selector fades in
3. The days counter re-animates; the countdown ring resets
4. All deferred inits (reveals, heart, typewriter) were already run — they re-trigger naturally on scroll

---

## Reduced Motion

When `prefers-reduced-motion: reduce` is set:
- All CSS animations and transitions are disabled (0.01ms duration)
- Petals hidden
- `.reveal` elements start visible
- Typewriter cursor hidden
- `initTypewriter()`, `animateTitleWords()`, `fireCrescendoBurst()`, `fireChapterCompletionPop()`, `fireConfetti()`, `flashThemeTransition()` all exit early
- Days counter shows final value instantly (no count-up)
- Slow petal cascade is skipped
