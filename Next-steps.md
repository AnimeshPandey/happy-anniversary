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

## 9. New Theme — Purrfect Pair (Two Persian Cats)

### Overview

A ninth theme built entirely around two specific persian cats that appear throughout the experience as hand-crafted SVG illustrations. The palette is pulled directly from their fur, eyes, and noses. The mood is soft, cozy, whiskery-warm — like an afternoon nap on a cushion with two fluffy cats purring in your lap.

---

### The Two Cats

**Cat 1 — "Mishri"** (the pink-nosed one)
- Pure snow-white fur, long and fluffy
- Sapphire-blue eyes (deep, vivid blue)
- Soft pink nose (the most distinctive feature)
- Pink-lined inner ears, barely visible through the white fur
- Round flat Persian face, slightly squished snout
- Curly fluffy tail
- Smaller and rounder of the two

**Cat 2 — "Mochi"** (the darker-faced one)
- Cream/ivory body fur with a slightly darker shading on the face (classic Persian "shaded" coloring — the face muzzle area is a warm beige/chamois, while the forehead is lighter)
- Lighter periwinkle-blue eyes (slightly greyer/softer blue than Mishri)
- Jet-black nose
- Grey-lilac ears (inner ear dusky grey-purple, outer ear grey)
- Slightly more rectangular face shape
- Longer, fluffier tail
- Slightly bigger and calmer-looking

---

### Theme Identity

| Property | Value |
|---|---|
| **ID** | `purrfect-pair` |
| **Name** | Purrfect Pair |
| **Tagline** | Soft, whiskery, cozy-warm |
| **Icon** | `🐾` |
| **Waveform** | sine |
| **pitchShift** | 0.92 |
| **Motion duration** | 0.85s |
| **Motion ease** | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (gentle ease-out) |
| **Stagger** | 100ms |
| **revealOffset** | 30px |

---

### Color Palette

All colors derived from the cats' physical features:

| Token | Value | Derivation |
|---|---|---|
| `--bg` | `#FAF8FF` | White fur in soft lamplight — barely-lavender white |
| `--bg-warm` | `#F5F2FF` | Slightly deeper lavender undertone |
| `--cream` | `#FFF9F5` | Mishri's pure white coat under warm light |
| `--rose` | `#D994B8` | Mishri's pink nose — dusty rose, not harsh pink |
| `--rose-light` | `#F2C8DC` | Pink inner ear highlight |
| `--rose-mid` | `#C87EA8` | Deeper nose-pink |
| `--rose-dark` | `#9C5080` | Shadow under chin, deep velvet rose |
| `--gold` | `#9BB4DC` | Mishri's sapphire-blue eyes, slightly desaturated |
| `--gold-light` | `#C8DCF5` | Mochi's periwinkle eyes |
| `--text` | `#2A2445` | Deep blue-purple (like staring into their eyes) |
| `--text-soft` | `#5C4E78` | Soft purple-grey for body text |
| `--crescendo-dark` | `#0D0820` | Very deep blue-black |
| `--crescendo-mid` | `#3A2860` | Dark indigo-violet |
| `--orb-shadow` | `rgba(155,180,220,0.50)` | Blue-eye glow |
| `--selector-bg-a` | `#E8E0FF` | Pale lavender for theme selector bg |
| `--ph-bg-start` | `#EEE8FF` | Placeholder start — lavender |
| `--ph-bg-end` | `#D8C8F0` | Placeholder end — deeper lavender |
| `--ts-start-bg` | `rgba(255,255,255,0.70)` | Start button backdrop |
| `--petal-1` | `#F2C8DC` | Pale pink (Mishri's ears) |
| `--petal-2` | `#C8DCF5` | Soft blue (Mochi's eye) |
| `--petal-3` | `#E8E0FF` | Lavender white (fur) |
| `--petal-4` | `#C8C0D8` | Grey (Mochi's ear) |
| `--petal-5` | `#F0E0F8` | Blush lavender |
| `--petal-6` | `#D4C4E8` | Dusty purple |

---

### Sound Profile

```js
sound: { waveform: 'sine', pitchShift: 0.92, gainPeak: 0.10, attackTime: 0.04, decayTime: 1.60 }
```

**Scale — F major pentatonic (gentle, warm, domestic):**
`F3, G3, A3, C4, D4, F4, G4, A4, C5, D5, F5, G5`
In Hz: `174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99`

F major pentatonic has no dissonant intervals — every note sounds warm and agreeable, like a contented purr.

**Ambient note:**
```js
ambientNote: { root: 174.61, fifth: 261.63 }
```
F3 and C4 — very gentle low hum, like cats purring on a lap.

**Special sound — `playPurrSound()`:**
A very short, low-frequency rumble (55–90 Hz) filtered noise burst, lasting 400ms, gain 0.04 — mimics a purr vibration. Triggered when the user first opens the theme selector.

---

### Particle Style

```js
particleStyle: { borderRadius: '50% 45% 50% 45% / 45% 50% 45% 50%' }
```
Rounded organic shapes — like soft paw pads or fur tufts. Mix of pale pink and soft blue particles.

---

### Ambient Effects — Full List

```js
ambientEffects: ['kitty-paws', 'yarn-ball', 'floating-whiskers', 'cat-cameo']
```

#### Effect 1 — `initKittyPaws()`

Soft paw print marks fade in and out across the screen surface, as though invisible cats are padding around.

**Visual:**
- Each paw print: 1 large oval pad (12×10px) + 4 small toe-bean ovals (5×4px each), arranged in the classic paw pattern
- Color: alternates between `#F2C8DC` (Mishri — pink) and `#C8C0D8` (Mochi — grey)
- Opacity 0 → 0.55 → 0 over 4–6s
- Size: 22px total width
- Occasional "walk sequence": 4 paws appear in a diagonal pattern (left-front, right-front, left-back, right-back) with 300ms stagger — looks like a cat walked across the screen

**CSS animation: `pawAppear`**
```css
@keyframes pawAppear {
  0%   { opacity: 0; transform: scale(0.6) rotate(-8deg); }
  20%  { opacity: 0.55; transform: scale(1.0) rotate(0deg); }
  75%  { opacity: 0.45; }
  100% { opacity: 0; transform: scale(0.85); }
}
```

**JS: `initKittyPaws()`**
- Spawns a paw (or walk sequence) every 3–7 seconds
- Position: random across full viewport
- Walk sequences biased toward bottom half (more realistic)
- Maximum 8 paw prints in DOM at once
- Mobile: single paws only (no walk sequences), max 4

---

#### Effect 2 — `initYarnBall()`

A yarn ball rolls and bounces across the bottom of the screen periodically.

**Visual:**
- CSS circle, 28px, with a `conic-gradient` or diagonal `repeating-linear-gradient` to suggest wound yarn
- Colors: alternates between the two cats' primary colors (`--rose` for Mishri's pink, `--gold` for the blue)
- Has a very slight squish on "bounce" (scaleY 1.0 → 0.85 → 1.0 on floor contact)
- Leaves a tiny "trail" of 3 yarn loop dots (3px circles) that fade behind it
- Triggers every 25s on desktop, 40s on mobile

**CSS animations:**
```css
@keyframes yarnRoll {
  0%   { transform: translateX(-40px)  translateY(0)     rotate(0deg); }
  15%  { transform: translateX(15vw)   translateY(-22px) rotate(108deg); }
  30%  { transform: translateX(30vw)   translateY(0)     rotate(216deg); }
  45%  { transform: translateX(45vw)   translateY(-18px) rotate(324deg); }
  60%  { transform: translateX(60vw)   translateY(0)     rotate(432deg); }
  75%  { transform: translateX(75vw)   translateY(-14px) rotate(540deg); }
  100% { transform: translateX(115vw)  translateY(0)     rotate(720deg); }
}
@keyframes yarnSquish {
  0%, 100% { transform: scaleX(1.0) scaleY(1.0); }
  50%       { transform: scaleX(1.2) scaleY(0.82); }
}
```

---

#### Effect 3 — `initFloatingWhiskers()`

Delicate SVG whisker lines slowly drift upward and fade, as if stray whiskers are floating off two sleepy cats.

**Visual:**
- Each whisker: a thin SVG `<line>` element, 36–48px long, 1px stroke
- Color: `rgba(200,192,216,0.35)` (very muted grey-lavender)
- Slight random rotation (-15° to +15°)
- Float straight up over 5–8s, fade in at 0 and out at top
- 3–5 whiskers visible at once

**CSS animation: `whiskerFloat`**
```css
@keyframes whiskerFloat {
  0%   { transform: translateY(0)    rotate(var(--whr, 5deg)); opacity: 0;    }
  15%  { opacity: 0.30; }
  85%  { opacity: 0.20; }
  100% { transform: translateY(-90px) rotate(var(--whr, 5deg)); opacity: 0; }
}
```

**Implementation:**
- Spawn every 2.5–5s at random position
- Maximum 5 in DOM
- Mobile: max 3

---

#### Effect 4 — `initCatCameo()`

The star feature: on desktop, both cats appear together as a composite SVG illustration at the bottom of the screen. They "sit" for 10 seconds (with blinking animations), then one walks off-screen and the other follows. Repeats every 70s.

**Cat SVG Design — Mishri (white, pink nose, pink ears):**

Full SVG at 100×100 viewBox, intended to display at 80px tall:

```svg
<!-- Mishri: white persian, pink nose, pink ears -->
<g id="mishri">
  <!-- Fluffy body -->
  <ellipse cx="50" cy="68" rx="34" ry="26" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.6" opacity="0.95"/>
  <!-- Chest floof -->
  <ellipse cx="50" cy="60" rx="20" ry="18" fill="#FFFFFF"/>
  <!-- Head -->
  <circle cx="50" cy="35" r="26" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.6"/>
  <!-- Head fur tufts (subtle bumps) -->
  <path d="M24 28 Q28 22 32 28" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.5"/>
  <path d="M68 28 Q72 22 76 28" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.5"/>
  <!-- Left ear outer -->
  <path d="M26 18 L18 2 L38 14Z" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.6"/>
  <!-- Left ear inner (pink) -->
  <path d="M27 16 L22 5 L36 13Z" fill="#F4A8C0" opacity="0.80"/>
  <!-- Right ear outer -->
  <path d="M74 18 L82 2 L62 14Z" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.6"/>
  <!-- Right ear inner (pink) -->
  <path d="M73 16 L78 5 L64 13Z" fill="#F4A8C0" opacity="0.80"/>
  <!-- Left eye (sapphire blue) -->
  <ellipse cx="40" cy="33" rx="6" ry="6.5" fill="#4A90D9"/>
  <ellipse cx="40" cy="33" rx="3" ry="5.5" fill="#1C2A50" class="cat-pupil"/>
  <circle  cx="38" cy="31" r="1.5" fill="white" opacity="0.9"/>
  <!-- Right eye (sapphire blue) -->
  <ellipse cx="60" cy="33" rx="6" ry="6.5" fill="#4A90D9"/>
  <ellipse cx="60" cy="33" rx="3" ry="5.5" fill="#1C2A50" class="cat-pupil"/>
  <circle  cx="58" cy="31" r="1.5" fill="white" opacity="0.9"/>
  <!-- Eye highlights: top sheen -->
  <path d="M36 29 Q40 27 44 29" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
  <path d="M56 29 Q60 27 64 29" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
  <!-- Pink nose (heart-shaped hint) -->
  <path d="M46 41 Q50 38 54 41 Q50 44 46 41Z" fill="#F490B4"/>
  <!-- Mouth -->
  <path d="M47 44 Q50 47 53 44" fill="none" stroke="#D4A0B8" stroke-width="0.9" stroke-linecap="round"/>
  <!-- Whiskers left -->
  <line x1="22" y1="39" x2="43" y2="41" stroke="#C8B8C8" stroke-width="0.7" opacity="0.65"/>
  <line x1="22" y1="43" x2="43" y2="43" stroke="#C8B8C8" stroke-width="0.7" opacity="0.55"/>
  <line x1="24" y1="47" x2="43" y2="45" stroke="#C8B8C8" stroke-width="0.7" opacity="0.45"/>
  <!-- Whiskers right -->
  <line x1="78" y1="39" x2="57" y2="41" stroke="#C8B8C8" stroke-width="0.7" opacity="0.65"/>
  <line x1="78" y1="43" x2="57" y2="43" stroke="#C8B8C8" stroke-width="0.7" opacity="0.55"/>
  <line x1="76" y1="47" x2="57" y2="45" stroke="#C8B8C8" stroke-width="0.7" opacity="0.45"/>
  <!-- Paws -->
  <ellipse cx="33" cy="90" rx="10" ry="7" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.5"/>
  <ellipse cx="67" cy="90" rx="10" ry="7" fill="#FFFFFF" stroke="#EDD8E0" stroke-width="0.5"/>
  <!-- Paw toe beans (Mishri's are pink) -->
  <circle cx="28" cy="91" r="2.2" fill="#F4B8CC" opacity="0.7"/>
  <circle cx="33" cy="93" r="2.5" fill="#F4B8CC" opacity="0.7"/>
  <circle cx="38" cy="91" r="2.2" fill="#F4B8CC" opacity="0.7"/>
  <circle cx="62" cy="91" r="2.2" fill="#F4B8CC" opacity="0.7"/>
  <circle cx="67" cy="93" r="2.5" fill="#F4B8CC" opacity="0.7"/>
  <circle cx="72" cy="91" r="2.2" fill="#F4B8CC" opacity="0.7"/>
  <!-- Curly tail -->
  <path d="M84 65 Q100 55 96 42 Q92 30 84 40 Q82 50 88 60" fill="none" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round"/>
  <path d="M84 65 Q100 55 96 42 Q92 30 84 40 Q82 50 88 60" fill="none" stroke="#F0E8F0" stroke-width="8" stroke-linecap="round"/>
</g>
```

**Cat SVG Design — Mochi (cream, black nose, grey ears):**

```svg
<!-- Mochi: cream persian, black nose, grey ears -->
<g id="mochi">
  <!-- Fluffy body -->
  <ellipse cx="50" cy="68" rx="36" ry="28" fill="#F5EEE0" stroke="#D8CEC0" stroke-width="0.6"/>
  <!-- Face shading (darker muzzle area -- Persian coloring) -->
  <ellipse cx="50" cy="44" rx="16" ry="12" fill="#E8DCC8" opacity="0.55"/>
  <!-- Chest floof -->
  <ellipse cx="50" cy="60" rx="22" ry="18" fill="#FBF5EC"/>
  <!-- Head -->
  <circle cx="50" cy="35" r="27" fill="#F5EEE0" stroke="#D8CEC0" stroke-width="0.6"/>
  <!-- Forehead lighter than muzzle -->
  <ellipse cx="50" cy="26" rx="18" ry="12" fill="#FBF5EC" opacity="0.5"/>
  <!-- Left ear outer (grey) -->
  <path d="M25 17 L17 1 L37 13Z" fill="#B8B2C8" stroke="#A0A0B8" stroke-width="0.5"/>
  <!-- Left ear inner (dusky grey-purple) -->
  <path d="M26 15 L20 4 L35 12Z" fill="#8C88A8" opacity="0.75"/>
  <!-- Right ear outer (grey) -->
  <path d="M75 17 L83 1 L63 13Z" fill="#B8B2C8" stroke="#A0A0B8" stroke-width="0.5"/>
  <!-- Right ear inner -->
  <path d="M74 15 L80 4 L65 12Z" fill="#8C88A8" opacity="0.75"/>
  <!-- Left eye (periwinkle blue, slightly greyer) -->
  <ellipse cx="40" cy="33" rx="6" ry="6.5" fill="#7090C4"/>
  <ellipse cx="40" cy="33" rx="3" ry="5.5" fill="#1C2040" class="cat-pupil"/>
  <circle  cx="38" cy="31" r="1.5" fill="white" opacity="0.9"/>
  <!-- Right eye -->
  <ellipse cx="60" cy="33" rx="6" ry="6.5" fill="#7090C4"/>
  <ellipse cx="60" cy="33" rx="3" ry="5.5" fill="#1C2040" class="cat-pupil"/>
  <circle  cx="58" cy="31" r="1.5" fill="white" opacity="0.9"/>
  <!-- Eye sheen -->
  <path d="M36 29 Q40 27 44 29" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>
  <path d="M56 29 Q60 27 64 29" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>
  <!-- Black nose -->
  <path d="M46 41 Q50 38 54 41 Q50 44 46 41Z" fill="#2A2438"/>
  <!-- Nose highlight -->
  <circle cx="49" cy="40" r="0.8" fill="rgba(255,255,255,0.35)"/>
  <!-- Mouth -->
  <path d="M47 44 Q50 47 53 44" fill="none" stroke="#8A7A8A" stroke-width="0.9" stroke-linecap="round"/>
  <!-- Whiskers left -->
  <line x1="21" y1="39" x2="43" y2="41" stroke="#C0B4B0" stroke-width="0.7" opacity="0.55"/>
  <line x1="21" y1="43" x2="43" y2="43" stroke="#C0B4B0" stroke-width="0.7" opacity="0.50"/>
  <line x1="23" y1="47" x2="43" y2="45" stroke="#C0B4B0" stroke-width="0.7" opacity="0.40"/>
  <!-- Whiskers right -->
  <line x1="79" y1="39" x2="57" y2="41" stroke="#C0B4B0" stroke-width="0.7" opacity="0.55"/>
  <line x1="79" y1="43" x2="57" y2="43" stroke="#C0B4B0" stroke-width="0.7" opacity="0.50"/>
  <line x1="77" y1="47" x2="57" y2="45" stroke="#C0B4B0" stroke-width="0.7" opacity="0.40"/>
  <!-- Paws -->
  <ellipse cx="33" cy="91" rx="11" ry="7" fill="#F5EEE0" stroke="#D8CEC0" stroke-width="0.5"/>
  <ellipse cx="67" cy="91" rx="11" ry="7" fill="#F5EEE0" stroke="#D8CEC0" stroke-width="0.5"/>
  <!-- Paw toe beans (Mochi's are grey) -->
  <circle cx="28" cy="92" r="2.2" fill="#C0B8C8" opacity="0.65"/>
  <circle cx="33" cy="94" r="2.5" fill="#C0B8C8" opacity="0.65"/>
  <circle cx="38" cy="92" r="2.2" fill="#C0B8C8" opacity="0.65"/>
  <circle cx="62" cy="92" r="2.2" fill="#C0B8C8" opacity="0.65"/>
  <circle cx="67" cy="94" r="2.5" fill="#C0B8C8" opacity="0.65"/>
  <circle cx="72" cy="92" r="2.2" fill="#C0B8C8" opacity="0.65"/>
  <!-- Long fluffy tail -->
  <path d="M16 65 Q0 55 4 40 Q8 26 18 36 Q22 46 16 58" fill="none" stroke="#F5EEE0" stroke-width="13" stroke-linecap="round"/>
  <path d="M16 65 Q0 55 4 40 Q8 26 18 36 Q22 46 16 58" fill="none" stroke="#EDE4D4" stroke-width="9" stroke-linecap="round"/>
</g>
```

**Cat Cameo Behavior:**
1. Both cats appear from below the bottom edge, sliding up over 0.8s (`catEnter` animation)
2. They sit side by side for 8–12 seconds
3. Eyes blink every 3–5s (`catBlink` animation: scaleY 1 → 0.08 → 1 over 0.2s)
4. After 3s, a tiny ♡ speech bubble appears between them (fades in, holds 2s, fades out)
5. Mochi turns to walk left (flip via scaleX(-1)), walks off in 2s
6. Mishri watches for 1s, then follows
7. The whole sequence repeats every 70s

**CSS animations required:**
```css
@keyframes catEnter {
  from { transform: translateY(120px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
@keyframes catExit {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(120px); opacity: 0; }
}
@keyframes catBlink {
  0%, 92%, 100% { transform: scaleY(1); }
  96%           { transform: scaleY(0.06); }
}
@keyframes pawAppear {
  0%   { opacity: 0; transform: scale(0.6) rotate(-8deg); }
  20%  { opacity: 0.55; transform: scale(1.0) rotate(0deg); }
  75%  { opacity: 0.40; }
  100% { opacity: 0;   transform: scale(0.85); }
}
@keyframes whiskerFloat {
  0%   { transform: translateY(0)    rotate(var(--whr, 5deg)); opacity: 0; }
  15%  { opacity: 0.28; }
  85%  { opacity: 0.18; }
  100% { transform: translateY(-90px) rotate(var(--whr, 5deg)); opacity: 0; }
}
@keyframes yarnRoll {
  0%   { transform: translateX(-50px) translateY(0)     rotate(0deg); }
  14%  { transform: translateX(14vw)  translateY(-26px) rotate(100deg); }
  28%  { transform: translateX(28vw)  translateY(0)     rotate(200deg); }
  42%  { transform: translateX(42vw)  translateY(-20px) rotate(302deg); }
  57%  { transform: translateX(57vw)  translateY(0)     rotate(405deg); }
  71%  { transform: translateX(71vw)  translateY(-16px) rotate(508deg); }
  85%  { transform: translateX(85vw)  translateY(0)     rotate(610deg); }
  100% { transform: translateX(115vw) translateY(0)     rotate(720deg); }
}
```

**JS — `initCatCameo()` structure:**
```js
function initCatCameo() {
  if (isMobile || reducedMotion) return function () {};
  // Build SVG element with both cats side by side
  // Position: fixed, bottom: 0, left: 50%, transform: translateX(-50%)
  // Run sequence: enter → blink loop → heart → mochi exits → mishri follows
  // Cleanup: remove element when both exit
  // Schedule: setTimeout(spawnCameo, 8000) first, then repeat every 70s
}
```

---

### Themes.js Entry

```js
{
  id: 'purrfect-pair',
  name: 'Purrfect Pair',
  tagline: 'Soft, whiskery, cozy-warm',
  icon: '🐾',
  sound: { waveform: 'sine', pitchShift: 0.92, gainPeak: 0.10, attackTime: 0.04, decayTime: 1.60 },
  /* F major pentatonic — warm, gentle, domestic */
  scale: [174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99],
  ambientNote: { root: 174.61, fifth: 261.63 },
  ambientEffects: ['kitty-paws', 'yarn-ball', 'floating-whiskers', 'cat-cameo'],
  particleStyle: { borderRadius: '50% 45% 50% 45% / 45% 50% 45% 50%' },
  motion: { duration: '0.85s', ease: 'cubic-bezier(0.25,0.46,0.45,0.94)', stagger: 100, revealOffset: '30px' },
  tokens: {
    '--bg':             '#FAF8FF',
    '--bg-warm':        '#F5F2FF',
    '--cream':          '#FFF9F5',
    '--rose':           '#D994B8',
    '--rose-light':     '#F2C8DC',
    '--rose-mid':       '#C87EA8',
    '--rose-dark':      '#9C5080',
    '--gold':           '#9BB4DC',
    '--gold-light':     '#C8DCF5',
    '--text':           '#2A2445',
    '--text-soft':      '#5C4E78',
    '--crescendo-dark': '#0D0820',
    '--crescendo-mid':  '#3A2860',
    '--orb-shadow':     'rgba(155,180,220,0.50)',
    '--selector-bg-a':  '#E8E0FF',
    '--ph-bg-start':    '#EEE8FF',
    '--ph-bg-end':      '#D8C8F0',
    '--ts-start-bg':    'rgba(255,255,255,0.70)',
    '--petal-1': '#F2C8DC', '--petal-2': '#C8DCF5',
    '--petal-3': '#E8E0FF', '--petal-4': '#C8C0D8',
    '--petal-5': '#F0E0F8', '--petal-6': '#D4C4E8'
  }
}
```

---

### Per-Theme CSS Overrides for Purrfect Pair

```css
/* Airy line height — like a lazy cat stretching */
[data-theme="purrfect-pair"] .chapter-body {
  line-height: 1.88;
}

/* Italic titles — everything feels softly playful */
[data-theme="purrfect-pair"] .chapter-title {
  font-style: italic;
  letter-spacing: 0.015em;
}

/* Soft scroll bar in theme rose color */
[data-theme="purrfect-pair"] #scroll-progress {
  background: linear-gradient(to bottom, var(--rose-light), var(--rose));
}

/* Cat-themed chapter ornament dots */
[data-theme="purrfect-pair"] .chapter-ornament-dot {
  background: var(--gold);
  box-shadow: 0 0 8px 2px var(--gold-light);
}
```

---

### Performance Notes for Cat Effects

| Effect | Desktop | Mobile |
|---|---|---|
| `initKittyPaws` | max 8 paw prints, walk sequences | max 4, single paws only |
| `initYarnBall` | enabled, 25s interval | enabled, 40s interval |
| `initFloatingWhiskers` | max 5 | max 3 |
| `initCatCameo` | enabled, 70s interval | DISABLED (complex SVG) |

All effects check `if (reducedMotion) return function () {};` as first line.
Cat cameo SVG is pre-built as a string constant and inserted as `innerHTML` — no DOM thrash.

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
