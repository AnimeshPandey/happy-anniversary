# Interactions Reference

Every user-facing gesture and interaction, how it's triggered, and where the code lives.

---

## Theme Selector (Phase 0a)

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

---

## Ceremony (Phase 0b)

| Interaction | Trigger | Effect |
|-------------|---------|--------|
| Begin journey | Tap `BEGIN` button | Portal bloom transition (860ms), then `showJourneyUI()`. |
| Auto-advance | 10s countdown ring completes | Same as tapping Begin. `initCountdownRing()`. |

---

## Journey — Scroll Behaviours

| Behaviour | How |
|-----------|-----|
| Reveal animations | `.reveal` elements fade/slide in via IntersectionObserver when ≥12% in viewport. `initReveal()`. |
| Chapter title word animation | Each word staggers in with 55ms delay on chapter text-wrap entering view. `animateTitleWords()`. |
| Chapter number odometer | Rotates from below on chapter entry. `.odometer-flip` class + CSS animation. |
| Image curtain wipe | `.image-curtain` slides right on image-wrap entering view. CSS `scaleX(1 → 0)`. |
| Poem typewriter | Characters type one-by-one when poem enters viewport. `initTypewriter()`. Underline draws on complete. |
| Scroll progress bar | Right-edge vertical bar grows with scroll depth. `initScrollProgress()`. |
| Chapter header | Slim top bar shows current chapter number + title when scrolling down through chapters. `initChapterHeader()`. |
| Ornament pop | Tiny particle burst when chapter ornament (bottom of chapter) reaches 75% in view. `initOrnamentsObserver()`. |
| Crescendo burst | White particle spray when crescendo section enters view. `fireCrescendoBurst()`. |
| Crescendo rings | Expanding ring animation activates 800ms after crescendo enters view. `.rings-active` on `.crescendo-inner`. |
| Heart draw | SVG stroke animates 0→full length when closing heart enters view. `initHeart()`. |
| Heart fill | Solid fill appears 1.7s after draw starts (matching CSS transition). |
| Signoff underline | SVG path draws under "Yours," when it enters view at 70% threshold. `initClosingSignoff()`. |
| Chapter chimes | Web Audio sine wave note on each new chapter entering view. `playChime(idx)`. Deduplicated — same chapter won't re-trigger. AudioContext unlocked on first user gesture (sound toggle or any interaction after Begin). |

---

## Journey — Tap / Gesture Behaviours

| Interaction | Trigger | Effect |
|-------------|---------|--------|
| Double-tap image | Double-tap any `.chapter-image-wrap`, `.panel-image`, or `.closing-image-wrap` | Floating `♥` heart animates up and fades. `initDoubleTapLove()`. |
| Tap heart | Tap `.heart-wrap` at bottom of closing | Confetti burst + chime. |
| Triple-tap ch12 ornament | Three taps within 650ms on the ornament at bottom of chapter 12 | Reveals hidden chapter `∞`, confetti, scroll to it. `initHiddenChapter()`. |
| Pull to restart | Pull down from top (≥90px, mobile only) | Reloads page. Indicator appears during pull. `initPullToRestart()`. |
| Shake | Shake device (accelerometer delta >25) | Confetti burst at top-centre. Throttled to once per 1.5s. `initShakeDetection()`. iOS 13+ requires permission — silently skipped if not granted. |
| Long-press nav bar | Hold chapter nav bar (≥500ms) | Opens TOC bottom sheet. `initTOCSheet()`. |
| Replay | Tap `↺ Replay Opening` button | Smooth scroll to top, restores theme selector and ceremony after 700ms. |

---

## Fixed UI

| Element | Visibility | Behaviour |
|---------|-----------|-----------|
| Sound toggle (`♪`/`♫`) | Appears after Begin, bottom-right | Plays/pauses `ambient.mp3`. Also unlocks AudioContext for chimes. |
| Share button | Appears after Begin if `navigator.share` available | Calls Web Share API. |
| Chapter nav dots | Visible while scrolling through chapters | Tap to jump to chapter. Long-press to open TOC. Hides when outside chapters section. |
| Chapter header | Visible while scrolling down through chapters | Shows `chapter number + title`. Hides on scroll-up or outside chapters. |
| TOC sheet | Opens on long-press nav, closes on backdrop tap | Lists all 12 chapters with mood emoji. Active chapter highlighted. |
| Orientation overlay | Auto-shown in landscape on small screens (<500px height) | Asks user to rotate. |
| Pull-to-restart indicator | Shown during downward pull at top of page | Shows `↺ Release to restart`. |

---

## AudioContext Notes

Web Audio (`OscillatorNode`) is used for chimes. iOS and some browsers suspend the AudioContext until a user gesture. The context is created lazily on first use, and resumed:

- Automatically when `playChime()` is called and `ctx.state !== 'running'`
- Explicitly on sound-toggle button click (also unlocks ambient audio)

If chimes are silent on first scroll: tap the `♪` button once to unlock.

---

## Reduced Motion

When `prefers-reduced-motion: reduce` is set:
- All CSS animations and transitions are disabled (0.01ms duration)
- Petals hidden
- `.reveal` elements start visible
- Typewriter cursor hidden
- `initTypewriter()`, `animateTitleWords()`, `fireCrescendoBurst()`, `fireChapterCompletionPop()`, `fireConfetti()`, `flashThemeTransition()` all exit early
- Days counter shows final value instantly (no count-up)
