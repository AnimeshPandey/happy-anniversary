# Next Steps

> **Status as of 2026-06-04 (post Phase 15 commit)**
> Most of the original plan in this file has been completed. Only a handful of items remain.

---

## DONE (all shipped as of Phase 15)

- [x] Purrfect Pair default theme (index 0)
- [x] All 29 real photos processed and in `assets/images/real/`
- [x] 14 AI images deployed to `assets/images/ai/` (ch3, ch4, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch17, ch19, bonus-wonderla, purrfect-bonus)
- [x] 20 chapters with personalised copy in `content.js` (Animesh-to-Divya POV throughout)
- [x] IMAGE_SLOTS schema: all 24 slots with `src`, `aiSrc`, `aspectRatio`, `placeholder`
- [x] Dual image mode toggle (`_imageMode`, `getSlotSrc`, `refreshAllImages`)
- [x] Real photos default (AI mode only switches when explicitly toggled)
- [x] Photo shimmer fixed (`.image-placeholder--loaded::after { display: none }`)
- [x] Blur-to-sharp load animation (`ph-loaded` class, `markPhotoLoaded()` race fix)
- [x] Sound button unblocked (nav max-width fix for mobile)
- [x] `getIsMobile()` dynamic function (no parse-time static check)
- [x] `mobileCount()` for particle count scaling
- [x] Mobile ambient gain (0.10 vs desktop 0.07)
- [x] Missing EFFECT_MODULES: `marigold-garland`, `mint-leaves`, `elephant`
- [x] Cat cameo enabled on mobile (smaller 60px SVGs, `cat-cameo-wrap--mobile` class)
- [x] Photo stage overlay (`openPhotoStage`, `closePhotoStage`, keyboard Escape)
- [x] Mobile dock (`#mobile-dock`: share, sound, image-mode, chapters)
- [x] Ken Burns scroll-triggered animation
- [x] Hidden chapter easter egg moved to ch20 ornament (triple-tap)
- [x] SW cache at `anniversary-v13`
- [x] 160/160 tests passing
- [x] Cat names corrected: Mishti (white, pink nose, sapphire eyes), Barfi (cream, black nose, periwinkle eyes)
- [x] No em-dashes anywhere in user-facing copy

---

## REMAINING — Action Required

### 1. Generate 12 missing AI images (external AI tool required)

Slots that still show real photos in AI mode:
`hero-main`, `ceremony-bg`, `ch1-main`, `ch2-main`, `ch5-main`, `ch6-main`, `ch7-main`, `ch16-main`, `ch18-main`, `ch20-main`, `closing-hero`, `hidden-ch`

Generation prompts are in `Next-steps.md` PART 5 (legacy section below, still valid).
Save each as `assets/images/ai/<slot-name>.jpg`, then bump `aiSrc` in `content.js` if the path was changed.

Note: `ch10-main` AI image now exists (`CB6D63CC` rooftop terrace, deployed 2026-06-04).

### 2. OG share image

Create a 1200x630 screenshot of the Purrfect Pair theme selector at its most beautiful state. Save as `assets/og-image.jpg`. Update `index.html`:
- `<meta property="og:image" content="https://anmshpndy.com/happy-anniversary/assets/og-image.jpg">`
- `<meta name="twitter:image" content="...">`

This makes WhatsApp/iMessage previews show the cat theme.

### 3. Manual iPhone QA

Open `https://anmshpndy.com/happy-anniversary` in Safari on a real iPhone:
- [ ] Theme selector loads on Purrfect Pair by default
- [ ] Orb tap advances theme, no layout shift
- [ ] Sound button in dock works (no blocked tap)
- [ ] Image mode toggle switches between real/AI with blur-to-sharp
- [ ] All 20 chapters scroll correctly
- [ ] Tap any chapter image to open photo stage
- [ ] Chapter 12 shows Mishti and Barfi (not Mishri / Mochi)
- [ ] Closing hero shows cat walk photo
- [ ] Triple-tap ch20 ornament reveals hidden chapter
- [ ] Ambient effects visible (cats, marigolds, elephants depending on theme)

---

## AI Image Generation Prompts (still valid for remaining 12 slots)

See original PART 5 prompts below. The style is: **vivid anime / cartoon illustration with Indian aesthetic, warm saturated colours**. Reference the existing images in `assets/AI images/` for exact style.

| Slot | Source photo | Key prompt elements |
|------|-------------|---------------------|
| `hero-main` | P05 (51a724cd) | Wedding couple under white arch with chandelier, portrait 3:4 |
| `ceremony-bg` | P09 (802c3882) | Groom applying sindoor, marigold decor, intimate, landscape 16:9 |
| `ch1-main` | P02 (16ace2a7) | Couple on park grass, casual selfie, warm afternoon, 4:3 |
| `ch2-main` | P03 (41fb52d1) | Garden selfie in front of manicured garden, landscape 16:9 |
| `ch5-main` | P01 (069a109a) | Wedding pheras, sacred fire, golden bells, mandap, landscape 16:9 |
| `ch6-main` | P12 (937a4968) | Sindoor closeup, eyes downcast, tender sacred moment, landscape 16:9 |
| `ch7-main` | P04 (50276775) | Wedding portrait under chandelier, both smiling, portrait 3:4 |
| `ch16-main` | P22 (IMG_0234) | Mirror selfie in matching red, laughing with delight, portrait 3:4 |
| `ch18-main` | P13 (9c78c7fa) | Cinema seats, red velvet, movie glow, sharing popcorn, 4:3 |
| `ch20-main` | P20 (fbf6d520) | Mysore Palace, looking at each other smiling, landscape 16:9 |
| `closing-hero` | P16 (c7577c4c) | Couple in pink walking toward camera holding cats, garden path, portrait 3:4 |
| `hidden-ch` | P08 (749b77dd) | Playful tilted wedding composition, both laughing, 4:3 |
