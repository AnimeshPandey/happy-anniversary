# Next Steps — Happy Anniversary
## The Premium Experience Upgrade Plan

All executed changes from prior sessions are live on `anmshpndy.com/happy-anniversary`.
This document plans the next wave of improvements, in implementation order.

---

## 0. One Remaining Item — Your Photos

Provide 15 photos (see Image Guide section at the bottom). Once you share the folder path, I will run the processing pipeline, update `content.js`, commit and push.

---

## 1. Sound System Overhaul

### 1a. Fix the sound toggle button (broken ambient)

**Root cause:** The `<audio id="ambient-audio">` points to `ambient.mp3`, which does not exist. When the button is clicked, `audio.play()` throws a rejected Promise, caught silently. The `playing` flag stays `false`, so `btn.classList.add('playing')` never runs — the SVG state never switches from X to waves. Visually it looks dead.

**Fix — synthesise ambient using Web Audio API, no file needed:**
Create `playAmbient()` / `stopAmbient()` in `main.js` that generate a drone-pad entirely from oscillators and filters — no audio file required.

Architecture of the synthesised ambient:
```
Two detuned sine oscillators (root + 5th interval)
  → GainNode (very low, 0.035)
  → BiquadFilterNode (lowpass, 800 Hz, Q=0.7)  — removes harshness
  → ConvolverNode (short impulse reverb)         — adds room
  → destination
```
The oscillator frequencies are chosen per theme (each theme gets its own root note, see §1b below). The result is a barely-audible, continuous harmonic hum that changes character with the theme.

Additionally, the existing `<audio>` element should be removed from `index.html` — it serves no purpose once we synthesise everything.

**Sound toggle state machine:**
- Idle (not started): X icon, aria-label "Play ambient music"
- Playing: waves icon + `soundWavePulse` animation on wave-2, aria-label "Pause ambient music"
- First click always resumes AudioContext and starts ambient
- Second click suspends oscillators (keeps them alive, just suspended) for instant resume
- After replay, ambient stops and the button resets to idle

---

### 1b. Per-theme ambient root note

Each theme has a distinct musical identity. Map the ambient drone to a specific root + fifth, expressed as base frequencies:

| Theme | Root | Interval | Character |
|---|---|---|---|
| PetalPop Parade | E4 (329.6 Hz) | B4 (493.9 Hz) | Bright, playful |
| Moonlight Mithai | A3 (220 Hz) | E4 (329.6 Hz) | Dreamy, floaty |
| CandyCloud Caravan | G4 (392 Hz) | D5 (587.3 Hz) | Bubbly, light |
| Gulabo Garden Gala | C4 (261.6 Hz) | G4 (392 Hz) | Warm, grounded |
| Starry Snuggle Story | F#3 (185 Hz) | C#4 (277.2 Hz) | Intimate, deep |
| ButterflyBlush Bash | D4 (293.7 Hz) | A4 (440 Hz) | Airy, fresh |
| SangeetSpark Symphony | D3 (146.8 Hz) | A3 (220 Hz) | Festive, resonant |
| VelvetVows Voyage | Bb2 (116.5 Hz) | F3 (174.6 Hz) | Cinematic, heavy |

When the user switches themes while ambient is playing, crossfade the oscillators: ramp old gain to 0 over 1.2s, start new oscillators from 0, ramp up over 1.2s. This is done with `AudioParam.linearRampToValueAtTime()`.

---

### 1c. New sound triggers — full list

Every interaction that deserves a sound, in order of user journey:

**Theme selector phase:**
| Trigger | Sound | Implementation |
|---|---|---|
| Orb click (theme advance) | Already exists (`playThemeSelect`) | Improve: make it a 2-note arpeggio (root + third), not a single note |
| Start button (↓ arrow) | Soft downward glide tone | New: `playStartDescent()` — sine, 880→440 Hz over 0.4s |

**Ceremony phase:**
| Trigger | Sound | Implementation |
|---|---|---|
| Title "Happy Anniversary" fade in | Soft bell | New: `playCeremonyBell()` — sine, C5, gain 0.08, decay 2.5s |
| Begin button appear | Gentle heartbeat | New: `playHeartbeat()` — two quick low thumps (60 Hz, 0.12s apart) |
| Countdown ring tick (each second) | Inaudible (skip — would be annoying) | N/A |
| Portal entry (Begin tapped) | Already exists (`playPortalEntry`) | Improve: 4 notes instead of 3, add tiny reverb tail |

**Journey phase:**
| Trigger | Sound | Implementation |
|---|---|---|
| Chapter scroll chime | Already exists (`playChime`) | Improve: use chord (root + third) rather than single note |
| Image curtain wipe (each image enters) | Soft cloth-swish synth | New: `playCurtainSwish()` — filtered noise burst, 80ms, low pass sweep 4000→400 Hz |
| Chapter completion pop (all text revealed) | Already exists (`fireChapterCompletionPop`) | Add sound: `playChapterPop()` — triangle, root note × 1.5, short attack, 0.4s decay |
| Double-tap love heart | Already exists (spawns floating hearts) | Add sound: `playLovePop()` — sine, E5→G5 glide, 0.3s, tiny |
| Crescendo line 1 reveal | Rising tone | New: `playCrescendoRise(1)` — triangle, C4→E4, 0.8s |
| Crescendo line 2 reveal | Sustained chord | New: `playCrescendoRise(2)` — triangle, E4+G4 together, 1s |
| Crescendo line 3 reveal (highlight) | Swelling chord + shimmer | New: `playCrescendoRise(3)` — sine, C5+E5+G5 (C major triad), staggered 0ms/80ms/160ms, gain 0.20, decay 2s |
| Heart SVG draw (stroke animation) | Pen scratch hiss | New: `playHeartDraw()` — very short filtered noise, 0.3s, freq sweep 2000→800 Hz |
| Heart fill | Warm bloom | New: `playHeartBloom()` — sine, root note +1 octave, soft attack 0.15s, gain 0.14, decay 1.5s |
| Confetti burst (after heart) | Sparkle shimmer | New: `playConfettiShimmer()` — 5 random triangle notes in the pentatonic scale, 50ms apart, tiny gain 0.06 each |
| Replay tapped | Already exists (`playReplayStart`) | Keep |
| TOC sheet opens | Soft whoosh up | New: `playTOCOpen()` — sine, 200→600 Hz, 0.25s, gain 0.07 |
| TOC sheet closes | Soft whoosh down | New: `playTOCClose()` — sine, 600→200 Hz, 0.20s, gain 0.06 |
| Shake detection | Rattle burst | New: `playShakeRattle()` — noise, 0.15s, high-pass 3000 Hz |
| Share button tap | Soft ding | New: `playShareDing()` — sine, A5, 0.05s attack, 0.8s decay, gain 0.09 |

**Implementation helper — `playNoise(durationMs, filterType, freqStart, freqEnd, gain)`:**
Reusable utility that creates a BufferSourceNode with white noise, routes through a BiquadFilter with a frequency ramp, and auto-disconnects. Called by curtain swish, heart draw, shake.

**Performance notes:**
- Cap simultaneous oscillator count at 6. Before creating a new tone, check `_activeTones` count; if at limit, skip (no error).
- All tones auto-disconnect via `onended`. No memory leaks.
- All sound creation is gated behind `if (!getAudioCtx()) return;`

---

### 1d. Sound quality improvements — existing chimes

The existing `playChime(chapterIndex)` uses a note array `[C5, D5, E5, G5, A5, B5, C6...]`. Upgrade to **themed note scales**:

| Theme | Scale | Quality |
|---|---|---|
| PetalPop | C major pentatonic (C D E G A) | Cheerful, open |
| Moonlight Mithai | A minor pentatonic (A C D E G) | Wistful, floating |
| CandyCloud Caravan | G major pentatonic (G A B D E) | Bouncy, bright |
| Gulabo Garden Gala | C Lydian (C D E F# G A B) | Radiant, festive |
| Starry Snuggle Story | B minor pentatonic (B D E F# A) | Deep, intimate |
| ButterflyBlush Bash | D Dorian (D E F G A B C) | Airy, flowing |
| SangeetSpark Symphony | D Mixolydian (D E F# G A B C) | Festive, Indian folk |
| VelvetVows Voyage | Bb Aeolian (Bb C Db Eb F Gb Ab) | Cinematic, lush |

Each chime plays the note at position `chapterIndex % scaleLength` in the scale. Different chapters play different notes within the theme's scale character.

Also upgrade chime to a **2-note chord**: play root + third simultaneously (the third being 2 scale steps up). This immediately sounds richer without extra cost.

---

## 2. Per-Theme Premium Visual Upgrades

### Architecture — theme-aware particle system

Currently `initPetals()` creates generic `<div>` elements styled by `particleStyle` from `themes.js`. The upgrade adds a `particles` array to each theme in `themes.js` that specifies per-theme particle types as SVG paths or emoji characters. A new `buildThemeParticle(type)` function returns an `<svg>` element instead of a `<div>`.

Each theme also gains an `ambientEffects` array: a list of named ambient effect modules to activate (e.g. `['fireflies', 'stars']`). Each module is a self-contained JS function in `main.js` that spawns/animates its own DOM elements.

---

### Theme 1: PetalPop Parade

**Visual identity:** A warm spring day in a Japanese garden. Cherry blossoms, ladybirds, and gentle petal rain.

**Particle upgrade:**
Replace generic rounded divs with 4-petal SVG cherry blossom shapes:
```svg
<!-- Cherry blossom petal: 5-petal flower -->
<path d="M12 2C12 2 9 5 9 8 C6 7 3 9 3 9 C3 9 6 11 9 11 C8 14 9 18 9 18 C9 18 11 15 12 15 C13 15 15 18 15 18 C15 18 16 14 15 11 C18 11 21 9 21 9 C21 9 18 7 15 8 C15 5 12 2 12 2Z"/>
```
Particles: 12 cherry blossom flowers, 6 individual petals, 4 floating dandelion wisps.

**Ambient effect — `initCherryBlossomWind()`:**
Wind gusts that periodically sweep extra petals horizontally. Every 6–9s, spawn 8 petals from the left edge with high horizontal velocity (`--drift: 200px`) and short fall time. CSS: `petalGust` keyframe that translates X more aggressively than the normal fall.

**Ambient effect — `initLadybird()`:**
A single SVG ladybird (🐞) crawls up the left edge of the screen over 12s, pauses, then fades out. Repeats every 25s. Uses a CSS `path()` motion-path animation along a gentle sine curve. The ladybird SVG: red circle, black dots, two antenna lines. Small (22px), opacity 0.75. On mobile, disabled.

**Chapter section effect:**
Each chapter that scrolls into view triggers a micro-burst of 3 blossom petals from the chapter number element — they drift upward and fade out over 1.8s. CSS animation `petalMicroBurst`. Spawned in `initReveal()` observer callback.

---

### Theme 2: Moonlight Mithai

**Visual identity:** A velvet-dark night sky full of silver stars, with a crescent moon, floating mithai (sweet) shapes.

**Particle upgrade:**
Star shapes using `clipPath: polygon(50% 0%,55% 45%,100% 50%,55% 55%,50% 100%,45% 55%,0% 50%,45% 45%)` (already partially there). Upgrade: vary star sizes more dramatically (4px–18px), add occasional large "sparkle star" (25px) with `starTwinkle` CSS animation (scale 1 → 1.4 → 1 over 2s, sine timing). Add 3 extra "shooting star" elements that occasionally cross the screen.

**Ambient effect — `initShootingStars()`:**
Every 7–12s, animate one `<div class="shooting-star">` that streaks from top-right to bottom-left over 0.6s. The shooting star is a 2px × 60px `<div>` with a gradient from white to transparent, rotated 45°. After reaching bottom-left, it fades out.

**Ambient effect — `initMoonGlow()`:**
A large, very faint crescent moon SVG (80px) positioned in the top-right corner, `position: fixed`, `opacity: 0.12`. As the user scrolls, the moon's opacity gently increases to 0.20 (parallax-style, tied to `scrollY / document.body.scrollHeight`). The moon has a `moonFloat` CSS animation (translateY 0→8px→0, 8s ease-in-out infinite).

**Particle shapes — mithai:**
Add 4 mithai-shaped particles: a small ladoo circle (`border-radius: 50%`, gold background), a barfi diamond (`clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`), a jalebi spiral (SVG circle with stroke-dasharray to look like a spiral). These float up instead of falling down — invert the fall keyframe with `--end-translate-y: -120vh`.

---

### Theme 3: CandyCloud Caravan

**Visual identity:** A candy-colour carnival sky with fluffy clouds drifting by, rainbow sprinkles raining down, and small floating hearts.

**Particle upgrade:**
Current: circles. Upgrade: mix of:
- 8 small cloud SVGs (3 overlapping circles of different sizes)
- 6 rainbow sprinkle rects (2×8px, rounded, random hues from --petal-1 through -6)
- 4 tiny star puffs (5-pointed, 8–12px)

**Ambient effect — `initDriftingClouds()`:**
2–3 large cloud SVGs (60–100px wide) float horizontally from right to left, `position: fixed`, very slow (30–45s to cross the screen), `opacity: 0.18`. Each cloud is 3 circles at different heights/sizes composited together. When a cloud exits left, it resets to the right. On mobile: 1 cloud only.

**Ambient effect — `initRainbowSprinkles()`:**
Every 3s, spawn 5 tiny sprinkle rects at the top of the screen, each at a random hue (using `hue-rotate` CSS filter on a base pink), falling with slight rotation. They are smaller (3×10px) and faster-falling than petals. 20 sprinkles max in DOM at once.

**Section effect:** When a chapter enters the viewport, a tiny cloud puff bursts from the chapter ornament — 5 cloud puff divs radiate outward and fade in 0.8s.

---

### Theme 4: Gulabo Garden Gala

**Visual identity:** An Indian garden party — marigold garlands, peacock feathers, rangoli patterns, lotus flowers.

**Particle upgrade — peacock feather eyes:**
Replace star particles with peacock feather "eye" shapes. Each feather-eye is a small SVG: a teal/blue outer ellipse, a lighter inner ellipse, a dark centre dot, and radiating lines (feather barbules). Size: 16–28px. These drift slowly downward, rotating.

```svg
<!-- Feather eye SVG path (simplified) -->
<ellipse cx="12" cy="12" rx="8" ry="11" fill="#00897B" opacity="0.8"/>
<ellipse cx="12" cy="13" rx="4" ry="5.5" fill="#26C6DA" opacity="0.9"/>
<circle cx="12" cy="14" r="2" fill="#1A237E"/>
<!-- 6 radiating lines for barbules -->
<line x1="12" y1="1" x2="12" y2="4" stroke="#00897B" stroke-width="0.8" opacity="0.6"/>
```

**Ambient effect — `initPeacock()`:**
Every 40s, a peacock walks across the bottom of the screen on desktop. This is an SVG animation:
- The peacock body: oval shape in teal/gold
- Tail: 7 feather-eye paths fanned out behind the body in a semicircle
- Walk animation: the whole group translates from right: -150px to right: 100vw over 15s
- The body bobs up-down 3px (walking bob) with a faster cycle animation
- Tail feathers spread open (`scaleX: 0.8 → 1.1`) using a `tailSpread` animation with 3s period
- `position: fixed; bottom: 0; z-index: 5;`
- Opacity 0.85, mobile: disabled

**Ambient effect — `initMarigoldGarland()`:**
A string of marigold flower dots decorates the top of the screen — `position: fixed; top: 0;` — a horizontal line of 12 small marigold SVGs (each a 5-petal yellow/orange flower, 14px) connected by a thin gold thread line. The garland sways gently (wave animation on each flower, staggered delay). Very light opacity (0.25).

**Section effect — rangoli ring:**
When a chapter enters the viewport, a rangoli ring briefly appears behind the chapter title: a CSS-only 8-point star pattern using `box-shadow` on a pseudo-element, that appears, scale-pulses once (0.8 → 1.0 → 1.05 → 1.0), then fades out over 2s. Pure CSS, no DOM mutation.

---

### Theme 5: Starry Snuggle Story

**Visual identity:** A late-night sky full of stars, constellations, fireflies in a quiet meadow, and a crescent moon.

**Particle upgrade — sparkle stars:**
Current sparkle particles are 12-point polygon shapes. Upgrade:
- 6 large sparkle stars (18–24px) with `starTwinkle` animation (opacity 0.3 → 1.0 → 0.3, random period 2–5s per star)
- 8 tiny point stars (4–8px), static
- 4 "firefly" particles: warm white circles (6px, border-radius: 50%, background: #FFFDE7), with `fireflyFloat` animation (random bezier path, opacity 0.1 → 0.9 → 0.1, 4–7s)

**Ambient effect — `initFireflies()`:**
20 firefly elements, `position: fixed`, randomly positioned across the lower 60% of the screen. Each has:
- `fireflyGlow` CSS animation: opacity 0.05 → 0.85 → 0.05 (random 2–5s period, staggered delay)
- `fireflyDrift` CSS animation: translate(random 15px, random 20px) over 6–10s ease-in-out infinite
- A tiny `box-shadow: 0 0 6px 2px rgba(255,253,200,0.6)` for the glow effect
- On mobile: 10 fireflies instead of 20

**Ambient effect — `initConstellations()`:**
3 constellation SVGs (`position: fixed`, `opacity: 0.08`), placed at different corners. Each is a `<svg>` with:
- 5–7 `<circle>` dots (r="2") at positions of a real constellation (Orion, Cassiopeia, Big Dipper)
- `<line>` elements connecting the dots (stroke-width: 0.8, opacity: 0.6)
- A very slow `constellationPulse` animation: opacity 0.06 → 0.12 → 0.06, 10s period
- On mobile: 1 constellation, smaller

---

### Theme 6: ButterflyBlush Bash

**Visual identity:** A garden party with butterflies of every colour fluttering between flowers, and delicate mint-green leaves.

**Particle upgrade — butterflies:**
Replace rhombus particles with animated butterfly SVGs. Each butterfly has two wings:
```svg
<g class="butterfly">
  <!-- Left wing -->
  <path d="M12 12 C8 6 2 4 2 8 C2 12 8 14 12 12Z" fill="var(--rose-light)" opacity="0.85"/>
  <!-- Right wing -->  
  <path d="M12 12 C16 6 22 4 22 8 C22 12 16 14 12 12Z" fill="var(--rose)" opacity="0.85"/>
  <!-- Body -->
  <ellipse cx="12" cy="12" rx="1.5" ry="5" fill="var(--text)" opacity="0.7"/>
</g>
```
The wings have a `wingFlap` CSS animation: `scaleX(1) → scaleX(0.1) → scaleX(1)` on each wing (opposite phases) at 0.35–0.55s period (random per butterfly). This creates the flapping illusion.

Each butterfly also has a `butterflyPath` animation: a bezier curve flight path that crosses the screen over 12–18s (random). Use `offset-path: path(...)` with CSS Motion Path.

**Ambient effect — `initMintLeaves()`:**
8 mint leaf SVGs (`<path>` of a simple oval leaf with a centre vein) in light mint green, positioned at chapter section edges. They slowly rotate 0→8° and back on a 4s loop. Opacity 0.15.

**Section effect:** When a butterfly particle is near the screen centre, increase its opacity to 0.95 and slow its wingbeat to 0.7s for 2s, then return to normal — as if it "landed" for a moment.

---

### Theme 7: SangeetSpark Symphony

**Visual identity:** A vibrant Indian wedding night — diyas (oil lamps) flickering, fireworks, dancing elephants, dhol beats, rose garlands.

**Particle upgrade — sparks and diyas:**
Replace diamond particles with:
- 6 golden spark trails (2×16px gradient rects, `sparkFall` animation with strong end-rotate)
- 4 diya flames: orange/yellow teardrop SVG shapes with a `divaFlicker` animation (opacity 0.75→1.0→0.80→1.0, scale 1→1.1→1→1.15→1, 0.8s)
- 3 small firework bursts: spawn periodically (every 8s), 8 sparks that radiate from a centre point and fade

**Ambient effect — `initDiyas()`:**
4 diya (oil lamp) SVGs placed at bottom corners and bottom centre of the screen, `position: fixed`. Each diya:
- Base: a small semicircle in gold/ochre
- Flame: an orange teardrop with `divaFlicker` CSS animation (transform-origin: bottom centre)
- Glow: a radial box-shadow in warm orange
- `opacity: 0.65` overall

**Ambient effect — `initDancingElephant()`:**
Every 50s on desktop: an elephant walks from left to right along the bottom of the page. The elephant SVG:
- Body: rounded grey ellipse
- Head: smaller circle
- Trunk: curved bezier path (the fun part!)
- Ear: teardrop shape
- 4 column legs with a walking cycle (each leg shifts up/down, 2 legs alternating)
- Decorative caparison: coloured diamond pattern on the body in theme gold/rose tones
- A flower/garland on the head
- Walk animation: `translateX(-150px → 110vw)` over 20s
- `position: fixed; bottom: 10px; z-index: 5;`
- Mobile: disabled

**Ambient effect — `initFireworkBursts()`:**
Every 10s (throttled to avoid overlap): spawn a firework burst at a random position in the upper half of the screen. Each burst: a `<div>` positioned at (cx, cy) that spawns 10 child sparks, each animated with `fireworkSpark` keyframe (translate to random distance at random angle, opacity 1→0 over 0.8s). After 1.5s, remove the burst div. Maximum 2 active at once.

---

### Theme 8: VelvetVows Voyage

**Visual identity:** A cinematic romantic evening — deep velvet, floating rose petals, gold leaf dust, candlelight, slow snow of rose petals.

**Particle upgrade — rose petals:**
Replace diamond particles with rose petal SVGs. A rose petal has a distinctly organic shape:
```svg
<path d="M12 4 C14 2 20 4 20 10 C20 16 14 18 12 18 C10 18 4 16 4 10 C4 4 10 2 12 4Z"/>
```
Particles fall slowly (12–20s duration), drift gently, rotate fully. Colours cycle through --petal-1 through -4 (deep rose, plum, mauve, blush).

**Ambient effect — `initGoldLeafDust()`:**
12 tiny gold leaf particles (`<div>`, 3×5px, background: `var(--gold-light)`, border-radius: 2px 5px 2px 5px). They drift diagonally across the screen from top-right to bottom-left over 25–40s, very slowly. `opacity: 0.25`. They use a `leafTumble` animation: combined translation + slow continuous rotation.

**Ambient effect — `initCandleFlicker()`:**
2 candle SVGs at the bottom corners of the page, `position: fixed`, `opacity: 0.45`. Each candle:
- Wax cylinder: rounded rect in cream/ivory
- Flame: teardrop in gold/amber with `candleFlicker` animation (scaleY 1→0.85→1.1→0.9→1, random timing 0.3s–0.5s). The flame has a warm glow effect via `box-shadow`.
- The candle flickers independently (different animation-duration, 0.3s vs 0.5s).
- Mobile: 1 candle only, bottom-right

**Section effect — velvet reveal:**
When a chapter section enters the viewport, the chapter title gets a very brief velvet shimmer — a CSS `::after` pseudo-element with a `linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)` translates left-to-right across the text in 0.6s, then disappears. This is a scan-line gloss effect triggered by adding a `shimmer` class.

---

## 3. Premium Theme Token Upgrades

Each theme needs slight refinements to make it feel more luxurious. These are pure colour/value changes in `themes.js`:

### PetalPop Parade
- Current `--rose: #FF6B9D` feels slightly digital. Upgrade to `#F5547A` — more saturated, deeper, more "real petal"
- Add `--orb-shadow-2` (a second, larger, softer glow ring) for depth
- Motion: slightly reduce `stagger` from 80ms to 60ms for snappier reveal

### Moonlight Mithai  
- Background too cool/grey. Shift `--bg: #F4F0FF` to `#F6F2FF` — just a touch warmer
- Add a subtle indigo note to `--gold: #C9AD60` → `#B4A0D8` (silver-lavender instead of gold) — more moonlit
- Motion: increase `revealOffset` from 40px to 50px for more dramatic slide-in

### CandyCloud Caravan
- `--gold: #FFD166` is a bit flat. Upgrade to `#FFBE3A` — richer, more sherbet-orange
- `--bg` barely distinct from PetalPop. Shift to `#FFF8FE` — just a hint more violet

### Gulabo Garden Gala
- The current dark red `--rose: #D42B2B` can read as "warning". Shift to a richer crimson: `#C41E3A` — more like a gulabi rose
- `--gold: #F4900C` → `#E8850A` — slightly more burned/saffron

### Starry Snuggle Story
- Current purple `--rose: #7C3AED` is fine. Add a `--rose-glow` token for the sparkle shadow color: `rgba(167,139,250,0.5)` — used on particle box-shadow
- `--bg-warm: #F0EEFF` → `#EEEAFF` — a touch deeper purple for contrast

### ButterflyBlush Bash
- `--gold: #68D391` (mint) is refreshing but doesn't read as "premium". Consider adding a secondary token `--accent-warm: #FFD166` for butterfly wing highlight spots
- `--bg: #F5FFF8` → `#F0FFF5` — deeper fresh mint

### SangeetSpark Symphony (dark theme — extra care needed)
- The dark background `--bg: #1A0A00` can feel oppressive. Add `--bg-gradient-stop: #2A1200` for gradient use in ceremony
- `--text: #FDF3E3` → `#FFF8E7` — creamier, less grey
- `--orb-shadow` intensity: 0.50 → 0.60 — the golden orb should really blaze

### VelvetVows Voyage
- `--rose: #9D174D` (plum) is strong but feels a bit "Valentine's Day". Shift to `#8B1152` — deeper, more genuine velvet burgundy
- `--gold: #C4956A` → `#BF8C5A` — more antique gold, less orange

---

## 4. Premium CSS Polish — Per-Theme Overrides

These CSS additions make each theme's journey feel distinctly different beyond just colour:

### SangeetSpark — dark theme chapter text
The dark background needs special typography treatment:
```css
[data-theme="sangeetspark"] .chapter-text-wrap {
  background: rgba(255,248,231,0.04);
  border: 1px solid rgba(245,158,11,0.12);
  border-radius: 8px;
  padding: 1.5rem;
  /* gives text a subtle lantern-lit card feel */
}
[data-theme="sangeetspark"] .chapter-text { color: var(--text); /* creamy */ }
```

### VelvetVows — cinematic chapter titles
```css
[data-theme="velvet-vows"] .chapter-title {
  letter-spacing: 0.04em; /* slightly wider spacing for gravitas */
  font-size: clamp(1.75rem, 5.5vw, 2.8rem); /* slightly larger */
}
```

### Moonlight Mithai — italic taglines
```css
[data-theme="moonlight-mithai"] .chapter-text {
  font-style: italic; /* everything reads as a dream */
  opacity: 0.92;
}
```

### PetalPop — energetic chapter number
```css
[data-theme="petalpop"] .chapter-number {
  font-size: 0.65rem;
  letter-spacing: 0.4em;
  /* The number pops more */
}
```

### All dark themes (SangeetSpark) — scroll progress bar
```css
[data-theme="sangeetspark"] #scroll-progress {
  background: var(--gold); /* gold instead of rose */
}
```

---

## 5. CSS Animations Required (new keyframes)

All new keyframes to add to `style.css`. Documented here for implementation reference:

```css
/* Cherry blossom wind gust */
@keyframes petalGust {
  from { transform: translateX(0) translateY(0) rotate(0deg); opacity: 0.8; }
  to   { transform: translateX(220px) translateY(100vh) rotate(720deg); opacity: 0; }
}

/* Star twinkle */
@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50%       { opacity: 1.0; transform: scale(1.4); }
}

/* Shooting star */
@keyframes shootingStar {
  0%   { transform: translate(0, 0) scaleX(1); opacity: 1; }
  100% { transform: translate(-200px, 150px) scaleX(0); opacity: 0; }
}

/* Firefly drift (random via CSS custom properties --dx, --dy) */
@keyframes fireflyDrift {
  0%, 100% { transform: translate(0, 0); }
  33%       { transform: translate(var(--dx1), var(--dy1)); }
  66%       { transform: translate(var(--dx2), var(--dy2)); }
}
@keyframes fireflyGlow {
  0%, 100% { opacity: 0.05; }
  50%       { opacity: 0.85; }
}

/* Butterfly wing flap (applied to each wing with scaleX transform-origin at wing root) */
@keyframes wingFlapLeft {
  0%, 100% { transform: scaleX(1) skewY(0deg); }
  50%       { transform: scaleX(0.08) skewY(5deg); }
}
@keyframes wingFlapRight {
  0%, 100% { transform: scaleX(-1) skewY(0deg); }
  50%       { transform: scaleX(-0.08) skewY(-5deg); }
}

/* Diya (lamp) flame flicker */
@keyframes divaFlicker {
  0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
  20%       { transform: scaleY(1.15) scaleX(0.88); opacity: 1.0; }
  40%       { transform: scaleY(0.9)  scaleX(1.05); opacity: 0.8; }
  70%       { transform: scaleY(1.1)  scaleX(0.92); opacity: 1.0; }
}

/* Candle flicker (similar but different rhythm) */
@keyframes candleFlicker {
  0%, 100% { transform: scaleY(1); }
  30%       { transform: scaleY(0.85) rotate(2deg); }
  60%       { transform: scaleY(1.12) rotate(-1.5deg); }
  80%       { transform: scaleY(0.92) rotate(1deg); }
}

/* Gold leaf tumble */
@keyframes leafTumble {
  0%   { transform: translate(0, 0) rotate(0deg); opacity: 0; }
  10%  { opacity: 0.25; }
  90%  { opacity: 0.20; }
  100% { transform: translate(-120px, 80vh) rotate(320deg); opacity: 0; }
}

/* Moon float */
@keyframes moonFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(8px); }
}

/* Peacock tail spread */
@keyframes tailSpread {
  0%, 100% { transform: scaleX(0.85) scaleY(0.9); }
  50%       { transform: scaleX(1.1) scaleY(1.05); }
}

/* Velvet shimmer scan-line */
@keyframes velvetScan {
  from { transform: translateX(-100%); }
  to   { transform: translateX(200%); }
}

/* Firework spark */
@keyframes fireworkSpark {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--fx), var(--fy)) scale(0); opacity: 0; }
}

/* Walking bounce for creatures */
@keyframes walkBob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}

/* Mithai float up */
@keyframes mithaiFloat {
  0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
  10%  { opacity: 0.75; }
  90%  { opacity: 0.70; }
  100% { transform: translateY(-100vh) rotate(180deg); opacity: 0; }
}
```

---

## 6. Performance Guarantees

All new effects must respect these constraints or be conditionally disabled:

| Constraint | Rule |
|---|---|
| `prefers-reduced-motion: reduce` | All CSS `animation` already has `reducedMotion` JS check. New effects: wrap `initFireflies()`, `initPeacock()`, `initDancingElephant()` in `if (reducedMotion) return;` |
| Mobile CPU | Complex SVG creatures (peacock, elephant) disabled on `isMobile`. Firefly count halved. Butterflies: max 4 instead of 8. |
| Max particles in DOM | Existing petal cap: 28 desktop / 18 mobile. New particles: separate counter, cap at 20 additional elements per effect module |
| No layout thrash | All new elements are `position: fixed` or `position: absolute` — zero reflow impact |
| CSS animations only | All motion via CSS keyframes + `will-change: transform, opacity` on particle containers. No JS `requestAnimationFrame` loops for visual effects |
| IntersectionObserver | Section effects only trigger when section is in viewport. All IO instances use `{ once: true }` where appropriate |
| Memory cleanup | All spawned particles that are one-shot (shooting stars, firework sparks, gusts) are auto-removed via `animationend` event or `setTimeout` |
| AudioContext | One shared `audioCtx`. Max 6 simultaneous tone nodes. All nodes auto-disconnect on `onended` |

---

## 7. Implementation Order

Execute in this exact sequence to minimise regression risk:

1. **Sound toggle fix** (§1a) — highest user-visible bug. 30 min.
2. **New sound triggers** (§1c) — curtain swish, crescendo sounds, heart sounds. 45 min.
3. **Per-theme ambient tone** (§1b) — crossfade ambient on theme switch. 30 min.
4. **Themed chime scales** (§1d) — improve existing chimes. 20 min.
5. **CSS keyframes** (§5) — add all new keyframes to `style.css`. 30 min.
6. **Theme 7 SangeetSpark effects** (diyas, fireworks, elephant) — most dramatic, dark theme so easiest to see bugs. 60 min.
7. **Theme 4 Gulabo Garden effects** (peacock, marigolds). 60 min.
8. **Theme 5 Starry Snuggle effects** (fireflies, constellations). 45 min.
9. **Theme 2 Moonlight Mithai effects** (shooting stars, moon). 30 min.
10. **Theme 6 ButterflyBlush effects** (butterfly SVGs, mint leaves). 45 min.
11. **Theme 1 PetalPop effects** (cherry blossoms, ladybird). 30 min.
12. **Theme 3 CandyCloud effects** (drifting clouds, sprinkles). 30 min.
13. **Theme 8 VelvetVows effects** (rose petals, candles, gold leaf). 30 min.
14. **Token upgrades** (§3) — colour refinements. 20 min.
15. **Per-theme CSS overrides** (§4) — typography polish. 20 min.
16. **Bump SW cache to v10**, full Playwright test run, commit, push.

Total estimated: ~7 hours of implementation.

---

## 8. Image Guide — How to Share Your Photos

### 15 slots, one per chapter

| Slot ID | File name | Aspect | Scene |
|---|---|---|---|
| `hero-main` | `hero-main.jpg` | 9:16 portrait | Your best shot together — the one that says everything |
| `ceremony-bg` | `ceremony-bg.jpg` | 16:9 wide | A beautiful place — soft, blurred background |
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
| `closing-hero` | `closing-hero.jpg` | 3:4 portrait | THE photo. Make it count. |

### How to share
Name each file exactly as above. Drop them in one folder. Share the path:
```
./scripts/process-photos.sh /path/to/your/photos/folder
```
