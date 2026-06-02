# Happy Anniversary Theme Cycling — Claude Extension Prompt

Copy everything inside the fenced block into Claude Code (or Cursor Agent).  
This is an extension pack prompt to be used **after** the baseline prompt in `claude-prompt-happy-anniversary.md`.

---

## Prompt (copy-paste)

```text
You are extending an existing anniversary experience implementation in the `Anniversary` repo.

Important:
- This is an extension pack, not a full rewrite.
- Preserve all baseline constraints from the first prompt:
  - mobile-first primary experience
  - animation-heavy infinite-scroll anniversary journey
  - GitHub Pages compatibility
  - route target `/happy-anniversary`
  - best-effort hidden-link + noindex behavior

Your mission in this extension:
Build a multi-theme journey system with cute named styles, unique welcomes/animation identities, and a single large mobile-friendly button that cycles themes at touch/click.

---

## Extension Objectives

1. Create Creative Option Packs 2.0 with distinct themed journeys.
2. Add first-step theme selection optimized for mobile users.
3. Add one large cute CTA button that cycles visual themes instantly.
4. Ensure theme changes apply coherently across the full journey (opening, chapters, finale).
5. Keep architecture clean so future 40-50 photos can be reused across all themes.

---

## Creative Option Packs 2.0 (required)

Implement these themed journey packs with distinct welcome, animation language, transitions, and finale feel:

1) PetalPop Parade
- Welcome: flower burst + ribbon sweep intro
- Motion: buoyant petals, confetti pops, spring easing
- Visuals: candy pink, peach, coral, daisy accents
- Transition: petal wipe + soft bloom crossfade
- Finale: “Love in Full Bloom” rose shower

2) MoonlightMithai
- Welcome: dreamy moon glow reveal with tiny lantern sparkles
- Motion: floating lights, gentle drift, slow shimmer
- Visuals: lavender, silver-blue, warm gold
- Transition: silky dissolve with stardust trails
- Finale: star-kissed heart arc and glow collapse

3) CandyCloud Caravan
- Welcome: bouncy cloud card opening with sparkle pops
- Motion: playful bounce, bob, elastic easing
- Visuals: pastel rainbow, cotton-candy gradients
- Transition: cloud puff morph
- Finale: giant soft heart balloon release

4) GulaboGarden Gala
- Welcome: floral gate open animation with marigold rain
- Motion: ornate swirl paths, layered petals, celebratory bursts
- Visuals: rose red, marigold orange, festive pink
- Transition: rangoli-inspired radial wipe
- Finale: grand floral mandala bloom

5) StarrySnuggle Story
- Welcome: night-sky shimmer with handwritten title reveal
- Motion: constellation tracing, subtle parallax stars
- Visuals: navy, violet, champagne highlights
- Transition: star trail pull-through
- Finale: constellations forming anniversary initials

6) ButterflyBlush Bash
- Welcome: butterflies reveal the first chapter by lifting petals
- Motion: flutter choreography, airy drifts, curved trajectories
- Visuals: blush pink, mint, lilac, cream
- Transition: wing-flutter sweep
- Finale: butterfly halo around closing message

7) SangeetSpark Symphony
- Welcome: rhythmic light beats + celebratory glow pulses
- Motion: tempo-synced accents, festive spark streaks
- Visuals: jewel tones, gold glints, neon highlights
- Transition: beat-synced flash cut with graceful easing
- Finale: fireworks crescendo and elegant fade-out

8) VelvetVows Voyage
- Welcome: curtain-style reveal with premium shimmer
- Motion: cinematic glides, depth parallax, slow luxury easing
- Visuals: deep plum, ruby, champagne gold
- Transition: velvet fold peel + light sweep
- Finale: vow text engrave + luminous closure

---

## Theme Selection UX (first step)

Implement a mobile-first first-step entry screen before the journey starts:

- Title: “Choose Our Love Mood”
- Subtitle: “Tap a style to begin your anniversary journey”
- Theme cards/chips preview each style with miniature visual cue
- One default recommended theme badge (without forcing)
- CTA: “Start Journey”

Behavior requirements:
- Selection is required before entering the scroll journey.
- On reload, default to showing selector again so a different style can be chosen.
- Optional enhancement: allow user to enable “Remember this style” mode.

---

## Single Large Cycle Button (core interaction)

Add one large cute persistent button for touch/click cycling:

- Suggested labels:
  - “Next Cute Mood”
  - “Switch Love Theme”
  - “Try Another Magic”
- Size: thumb-friendly mobile target (minimum ~56px height)
- Placement: sticky bottom area above safe zone, non-intrusive to content
- Visual: pill-shaped, gradient, subtle pulse, cute icon (flower/heart/sparkle)

Interaction behavior:
1. Tap/click cycles to next theme in fixed order.
2. Theme transitions immediately with a short coordinated animation.
3. Update all chapter-level styling/motion tokens consistently.
4. Preserve current scroll position and avoid jarring layout jumps.
5. Announce new theme name in accessible manner (aria-live or equivalent).

Reduced-motion behavior:
- Use low-motion crossfade and color/token swap instead of heavy transition bursts.

---

## Technical Architecture Requirements

Define and implement:

1) Theme configuration model
- `id`
- `name`
- `paletteTokens`
- `decorTokens`
- `motionPreset`
- `welcomePreset`
- `transitionPreset`
- `finalePreset`
- `buttonStyleTokens`
- optional `audioMoodTag`

2) Theme runtime controller
- `setTheme(themeId)`
- `cycleTheme()`
- `getCurrentTheme()`
- `applyThemeToJourney(theme)`

3) Separation of concerns
- Keep story/content chapter data independent from theme styles.
- All image placeholders and future real images must render through the same content model across themes.
- Avoid hardcoding chapter visuals directly inside content components.

4) Performance and stability
- Minimize re-render scope during theme switch.
- Use CSS variables/theme tokens where possible.
- Lazy-load heavy decorative assets per theme if needed.

---

## Additional Enhancements Menu (at least 10)

Generate and include these optional upgrades with Effort (S/M/L) and Impact (Low/Med/High):

1. SurpriseMe mode (random theme start)
2. Shuffle cycle order mode
3. Theme intensity slider (Soft / Medium / Extra)
4. Transition speed slider
5. Tiny haptic-like micro-bounce feedback on button tap (visual only fallback)
6. Theme-specific sound stingers (with mute toggle)
7. Theme preview carousel in selector
8. Auto-cycle demo mode
9. Session-only memory toggle
10. Remember-last-theme toggle using localStorage (optional opt-in)
11. Theme lock for uninterrupted full journey
12. Chapter-specific sub-theme accents
13. Accessibility “high readability” theme override
14. Seasonal limited-edition theme slot system
15. One-click reset to baseline default theme

---

## Acceptance Criteria for this extension

1. Minimum 8 named themed journeys, clearly differentiated.
2. First-step mobile selector is implemented and required to enter journey.
3. Single large cute cycle button works on touch/click and updates full experience.
4. Theme switch is smooth, immediate, and scroll-position-safe.
5. Baseline animation-heavy journey remains intact.
6. Code architecture cleanly separates content model from theme model.
7. Enhancement menu includes at least 10 options with effort/impact.

---

## Output Format Required

When done, return:
1) What was added/changed (theme system + UI flow)
2) File-by-file changelog
3) Theme pack matrix (name, welcome, animation vibe, finale)
4) Toggle interaction behavior summary
5) Performance and accessibility notes
6) Remaining optional enhancements

Proceed with implementation now in the existing codebase without discarding prior work.
```

---

## Notes

- This extension prompt is intentionally opinionated to create playful variety while preserving the core romantic narrative.
- The one-tap cycle interaction is optimized for mobile delight and repeat exploration.
