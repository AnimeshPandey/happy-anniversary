# Anniversary Experience — Improvement Roadmap

Saved from planning session on 2026-06-02.

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
- No animation should drop below 55fps on a mid-range Android (Chrome DevTools
  "Low-end mobile" throttle is the test)
- `will-change: transform, opacity` on animated elements
- CSS animations over JS where possible (compositor thread, no jank)
- Avoid animating `width`, `height`, `top`, `left` — only `transform` and `opacity`
  are compositor-safe
- Lazy-load all images; load no more than 2 sections worth of content in DOM at once
  if the experience grows beyond 20 chapters

**Native iOS/Android feel**
- `scroll-behavior: smooth` for programmatic scrolls only; never fight native scroll
- `-webkit-overflow-scrolling: touch` for any custom scroll containers
- `touch-action: manipulation` on all interactive elements to remove 300ms tap delay
- Haptic-like feedback via CSS `scale(0.96)` on button press (`:active`) — no device
  API needed, the visual bounce feels physical
- `user-select: none` on decorative and interactive elements to prevent text
  selection on long-press

**Viewport and safe areas**
- Always use `min-height: 100dvh` (dynamic viewport height) not `100vh` — on iOS
  Safari, `100vh` includes the address bar and causes layout overflow
- Respect `env(safe-area-inset-*)` for notch/Dynamic Island/home indicator spacing
- The ceremony and theme selector are `position: fixed; inset: 0` — they must fill
  the real viewport, not the document height

**Typography at mobile scale**
- Minimum readable body font size: 15px (0.9375rem) — never go below this
- `clamp()` for all font sizes so they scale from 320px to 1280px without media
  query breakpoints per font rule
- Line-height 1.7–1.9 for body copy at mobile sizes — tighter leading is harder
  to track on small screens
- Chapter titles: aim for max 2 lines at 390px — a 3-line title breaks the rhythm

**Image loading on mobile**
- All images `loading="lazy"` and `decoding="async"`
- Provide `width` and `height` attributes on `<img>` to prevent layout shift (CLS)
- WebP with JPEG fallback; target under 200KB per image on mobile connections
- Consider `srcset` with 1× and 2× for retina display

**Motion and reduced motion**
- `prefers-reduced-motion: reduce` removes ALL animations globally — already done
- On mobile, "reduce motion" is more commonly enabled than on desktop
- Ensure the no-animation experience is still beautiful, not just legible

---

## Diagnosis (as of Phase 1 completion)

Theme switching feels cosmetic because themes currently only swap CSS color variables.
Particles are the same shape across all themes. Reveal animations are identical (single
translateY + opacity block). No ambient life between sections. Ceremony and crescendo
lack impact moments. Every chapter reveals as one block — no choreography.

---

## Phase 1 — Theme identity + scroll choreography + impact moments
**Status: DONE**

| Item | What was built |
|---|---|
| Per-theme particle shapes | SVG paths (petal / sparkle / bubble / star / 6pt-star / heart / flame / diamond) |
| Per-theme animation presets | `--motion-duration`, `--motion-ease`, `--motion-stagger`, `--motion-reveal-offset` per theme |
| Staggered chapter reveals | Number → Title → Body → Ornament, each staggered by `--motion-stagger` |
| Ceremony particle burst | 32 particles burst radially from bloom center on sequence completion |
| Scroll progress indicator | 3px fixed bar on right edge, theme-colored gradient |

---

## Phase 2 — Ambient life + depth

**Mobile considerations for each item:**

| # | Item | Effort | Impact | Mobile note |
|---|---|---|---|---|
| 1 | Floating decorative SVGs anchored to sections | M | High | `pointer-events: none`, no layout impact; test on 390px first |
| 2 | Crescendo viewport burst (60 particles on entry) | M | High | Reduce to 30 particles on mobile via `matchMedia` |
| 3 | Opening poem typewriter character-by-character reveal | S | Med | Disable if reduced motion; ensure full text visible before scroll leaves section |
| 4 | Ornamental SVG image frames replacing plain dashed boxes | M | High | Frame must not overflow on 320px; use `overflow: hidden` on container |
| 5 | Subtle grain/noise texture overlay on page background | S | Med | Use `opacity: 0.025` on mobile (lower than desktop) — noise is more visible on OLED |
| 6 | Font preload + `font-display: swap` to prevent FOUC | S | Med | Critical on mobile — slow connections hit FOUC hardest |
| 7 | Chapter image `box-shadow` depth + 1° rotation | S | Med | Skip rotation below 480px — subtle rotation on small screens clips easily |
| 8 | Parallax background layers (0.3×/0.5×/0.8× scroll) | M | Med | **Disable entirely on mobile** (`matchMedia(max-width: 768px)`) — CSS `background-attachment: fixed` breaks on iOS; JS parallax costs battery |

---

## Phase 3 — Premium interactions

**Mobile considerations for each item:**

| # | Item | Effort | Impact | Mobile note |
|---|---|---|---|---|
| 1 | Letter-by-letter title reveal per chapter | M | High | Max 30 chars at 390px before it looks broken; skip for long titles, use word-level instead |
| 2 | Heart fill animation after draw completes | S | High | Pure CSS SVG — no mobile concerns |
| 3 | **Tap** closing heart to fire confetti burst | S | Med | Design for tap first; use `touchend` not `click` for snappier feel |
| 4 | Sound toggle — ambient piano loop, autoplay muted | L | High | iOS requires user gesture to unlock audio; the unmute button IS the gesture. Place in thumb zone (bottom-right) |
| 5 | Chapter anchor navigation (dots / hidden TOC) | M | Med | On mobile, show as a bottom sheet or slide-up strip, not a side panel |
| 6 | **Swipe** between chapters on mobile | L | Med | Use `touch-action: pan-y` to allow vertical scroll AND detect horizontal swipe; Hammerjs or vanilla pointer events |
| 7 | Chapter number odometer flip | S | Low | `will-change: transform` required; skip on `prefers-reduced-motion` |
| 8 | Scroll-linked background hue shift | M | Low | Passive scroll listener only (`{ passive: true }`); skip on battery saver mode |

---

## Mobile-specific features not yet planned

These are features only possible or particularly impactful on mobile:

| Feature | What it does | Effort |
|---|---|---|
| **Pull-to-restart** | Pull down past the top of the journey restarts the ceremony | M |
| **Lock-screen widget aesthetic** | Closing section styled to look like an iOS lock screen notification for Divya | M |
| **Share sheet integration** | Native share button (Web Share API) lets Animesh share the link via WhatsApp/iMessage from within the page | S |
| **Add to Home Screen prompt** | PWA manifest + install prompt so the experience launches full-screen (no browser chrome) | M |
| **Vibration on heart tap** | `navigator.vibrate(30)` — subtle haptic on the heart fill moment (Android only, ignored on iOS) | S |
| **Orientation lock guidance** | If device is landscape, show a soft nudge to rotate to portrait | S |
| **Dynamic Island / notch awareness** | Use `env(safe-area-inset-top)` so ceremony content sits below the notch | S |

---

## Future upgrades (from original extension menu)

- SurpriseMe mode: random theme on load
- Theme intensity slider (Soft / Medium / Extra)
- Transition speed slider
- Replay opening button at bottom (thumb zone)
- Real photo: blur-up loading (blurry → sharp as photo loads)
- Season-specific limited-edition theme slot
- Shareable private link variants
- PWA / Service Worker offline support
