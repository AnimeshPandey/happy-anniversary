# Next Steps — Complete Photo Integration & Final Publishing Plan

This document is the master implementation plan for taking the experience from its current feature-complete state to a fully personalised, photo-rich, publication-ready gift. Everything is ordered by dependency and priority.

---

## STATUS (commit bfa0cbb — 2026-06-03)

### Completed
- [x] Purrfect Pair moved to index 0 (default theme)
- [x] 29 real photos processed via sips into `assets/images/real/` (HEIC conversion, rotation fixes)
- [x] 11 existing AI images converted and copied to `assets/images/ai/` with slot names
- [x] `content.js` rewritten: 20 chapters with personalised copy, 24 IMAGE_SLOTS with `src` + `aiSrc`
- [x] `main.js` updated: `_imageMode`, `getSlotSrc()`, `refreshAllImages()`, image mode toggle button, ch20 hidden trigger
- [x] `style.css`: `.image-mode-btn` and `.image-placeholder--loaded` added
- [x] SW cache bumped to `anniversary-v11`
- [x] Tests updated (12 chapter counts to 20/21) — 150/150 passing
- [x] Deployed to GitHub Pages (main branch)

### Remaining — Action Required

1. **Generate 13 new AI images** using the prompts from Part 5 (slots that still show real photos in AI mode):
   `hero-main`, `ceremony-bg`, `ch1-main`, `ch2-main`, `ch5-main`, `ch6-main`, `ch7-main`, `ch10-main`, `ch16-main`, `ch18-main`, `ch20-main`, `closing-hero`, `hidden-ch`

   Save each file to `assets/images/ai/<slot-name>.jpg`, then update the `aiSrc` field in `content.js` IMAGE_SLOTS for that slot.

2. **OG share image** (Part 9): screenshot of Purrfect Pair theme selector at 1200x630 saved as `assets/og-image.jpg`, update `index.html` OG meta tags.

3. **Manual iPhone QA**: open URL in Safari, cycle themes, enter journey, scroll all 20 chapters, test AI/real toggle, verify cat chapter (ch12), closing hero, hidden chapter easter egg.

4. **Performance audit** (Part 10): Lighthouse check after AI images are added.

---

## The Vision

The experience will ship in two image modes, toggled by a single button in the journey UI:

- **AI Mode (default, privacy-safe):** Every chapter image shows an anime/illustrated version of the real photo. The style matches the 16 reference images already in `assets/AI images/`. Safe to share publicly or screenshot.
- **Real Photo Mode:** Shows the actual processed photographs. For Divya's private viewing.

Both modes are loaded in the same slot system. The toggle persists to `localStorage`. The experience is beautiful and complete in either mode.

---

## PART 1 — Quick Wins (do these first, no image work needed)

### 1A — Make Purrfect Pair the Default Theme

In `themes.js`, move the `purrfect-pair` entry from the end of the array to position 0. All other themes shift by +1. The theme selector will open on Purrfect Pair on every first load. No other code changes needed.

```js
// themes.js — reorder: purrfect-pair first, then petalpop, moonlight-mithai, etc.
var THEMES = [
  { id: 'purrfect-pair', ... },   // index 0 — new default
  { id: 'petalpop', ... },         // index 1
  { id: 'moonlight-mithai', ... }, // index 2
  // ... etc.
];
```

Update `THEMING.md` index table after this change.
Update `tests/theme-selector.spec.js`: the dot count stays 9, but the default name assertion (if any) needs checking.

---

## PART 2 — Complete Photo Inventory

### 2A — Real Photos Reference (35 photos, do not modify originals)

All originals live in `assets/Happy Anniversary /`. Do not touch them.

| ID | Filename | Natural ratio | Orientation | Subject | Best slot |
|----|----------|--------------|-------------|---------|-----------|
| P01 | `069a109a.JPG` | 3:2 | Landscape | Wedding pheras / fire ritual, yellow+red | ch5-main |
| P02 | `16ace2a7.JPG` | 9:16 | Portrait | Park grass selfie, casual and relaxed | ch1-main |
| P03 | `41fb52d1.JPG` | 16:9 | Landscape | Garden selfie, lush green background | ch2-main |
| P04 | `50276775.JPG` | ~4:5 | Portrait | Professional wedding portrait, chandelier | ch7-main |
| P05 | `51a724cd.JPG` | 2:3 | Portrait | Professional wedding portrait, gold arch | hero-main |
| P06 | `56b9da89.JPG` | 3:4 | Portrait | Cafe / restaurant, stone wall, moody | ch3-main |
| P07 | `63172c92.JPG` | 2:3 | Portrait | CAT PHOTOSHOOT — garden path, pink outfits, both cats | ch12-main |
| P08 | `749b77dd.JPG` | 3:2 | Landscape | Creative wedding pose, tilted/lying | hidden-ch |
| P09 | `802c3882.JPG` | 3:2 | Landscape | Sindoor ceremony (wide), intimate | ceremony-bg |
| P10 | `7e5c78f1.jpg` | 3:2 | Landscape | Mysore Palace, standing in front | ch8-main |
| P11 | `8d42550f.JPG` | 9:16 | Portrait | Poolside evening event, maroon anarkali | ch13-main |
| P12 | `937a4968.JPG` | 3:2 | Landscape | Sindoor application closeup, most intimate | ch6-main |
| P13 | `9c78c7fa.JPG` | 9:16 | Portrait | Movie theater selfie, red seats | ch18-main |
| P14 | `a9e16202.JPG` | 9:16 (tall) | Portrait | Restaurant with gold wall, she in floral dress | (secondary) |
| P15 | `bff4cf5c.JPG` | 2:3 | Portrait | Mysore Palace, leaning on fence | (secondary to ch8) |
| P16 | `c7577c4c.JPG` | 2:3 | Portrait | CAT PHOTOSHOOT — walking toward camera | closing-hero |
| P17 | `caa974e4.JPG` | 9:16 | Portrait | Home hallway selfie, embroidered top | ch15-main (alt) |
| P18 | `e98a0ad0.JPG` | 9:16 | Portrait | Chinese restaurant with red lanterns, she beaming | ch4-main |
| P19 | `ed7df2cd.JPG` | 3:4 | Portrait | Temple selfie, braid, holding hand | ch11-main |
| P20 | `fbf6d520.jpg` | 3:2 | Landscape | **Mysore — looking at each other, smiling — BEST PHOTO** | ch20-main |
| P21 | `IMG_0052.HEIC` | 4:3 | Landscape | Festive home evening, pink saree + black kurta | ch17-main (alt) |
| P22 | `IMG_0234.HEIC` | 4:3→Portrait | Portrait (EXIF) | Mirror selfie, MATCHING RED outfits | ch16-main |
| P23 | `IMG_0429.HEIC` | 4:3→Portrait | Portrait (EXIF) | Post-puja selfie, both with tilak | ch15-main |
| P24 | `IMG_1443.HEIC` | 4:3 (rotated) | **NEEDS -90° ROTATION** | Rajasthani art cafe, hookah prop, colourful murals | ch19-main |
| P25 | `IMG_1564.HEIC` | 4:3→Portrait | Portrait (EXIF) | **HILLTOP — crochet jacket, dramatic sky, looking at each other** | ch10-main |
| P26 | `IMG_1650.HEIC` | 4:3→Portrait | Portrait (EXIF) | Rooftop terrace, green hills behind | ch11-main (alt) |
| P27 | `IMG_1700.HEIC` | 4:3 (rotated) | **NEEDS -90° ROTATION** | Street selfie, camo + red top | (skip or secondary) |
| P28 | `IMG_1726.HEIC` | 4:3→Portrait | Portrait (EXIF) | **ELEPHANT BATH — standing in river with elephant** | ch9-main |
| P29 | `IMG_1816.HEIC` | 4:3 (rotated) | **NEEDS -90° ROTATION** | Under tree, casual, mustard jacket | (skip or secondary) |
| P30 | `IMG_1825.HEIC` | 4:3→Portrait | Portrait (EXIF) | Mountain/hill viewpoint, misty + wide valley | (secondary to ch10) |
| P31 | `IMG_2055.HEIC` | 4:3 | Landscape (EXIF) | Home cooking selfie, pink apron | ch14-main |
| P32 | `IMG_2534.HEIC` | 4:3 | Landscape (EXIF) | Home selfie, peacock art frames behind | (secondary) |
| P33 | `IMG_7829.HEIC` | 4:3→Portrait | Portrait (EXIF) | Shiva temple selfie, both with sindoor/tilak | (secondary to ch11) |
| P34 | `IMG_8330.HEIC` | 4:3→Portrait | Portrait (EXIF) | Home evening, she in green silk saree | ch17-main |
| P35 | `IMG_9353.HEIC` | 4:3→Portrait | Portrait (EXIF) | Mirror selfie going out, pink paisley outfit | ch17-main |

**3 photos need rotation correction (EXIF issue):** P24 (IMG_1443), P27 (IMG_1700), P29 (IMG_1816)
**Photos to skip (rotation + limited value):** P27, P29 (can be deprioritised)

### 2B — AI Reference Images (16 existing, directly usable)

All live in `assets/AI images/`. Style: vivid anime/illustrated. Match each photo's setting.

| AI ID | Filename | Maps to | Used for slot |
|-------|----------|---------|---------------|
| A01 | `10E60F29.PNG` | Holi / festive colours | ch19-main (AI version) |
| A02 | `2B53CE83.PNG` | Cafe date, cats visible, "His Chaos Her Drama" | ch3-main (AI version) |
| A03 | `2FD4F25B.PNG` | Mysore Palace, "MYSORE!" caption | ch8-main (AI version) |
| A04 | `4C5E2C11.PNG` | Divya with both cats on sofa | ch12-main (AI version, sofa variant) |
| A05 | `5B1CD649.PNG` | Chinese restaurant with lanterns | ch4-main (AI version) |
| A06 | `6086B04B.PNG` | Home selfie, "Good Vibes Only" | ch15-main (AI version, alt) |
| A07 | `6DEF7319.PNG` | Wonderla theme park, thumbs up | (bonus / opening panel alt) |
| A08 | `8F4D964D.PNG` | Dravidian temple, "Adventure Mode ON" | ch11-main (AI version) |
| A09 | `A345AD7E.PNG` | Home selfie with peacock art | ch17-main (AI version) |
| A10 | `ACD81F4C.PNG` | Home cooking selfie, plaid + apron | ch14-main (AI version) |
| A11 | `B7A3E8A4.PNG` | Poolside party, maroon anarkali | ch13-main (AI version) |
| A12 | `C2646A06.PNG` | Divya with one Persian cat | (bonus for Purrfect Pair theme UI) |
| A13 | `C96A0EEC.PNG` | Balaji temple, statue | ch11-main (AI alt) |
| A14 | `CB6D63CC.PNG` | Rooftop terrace, colourful city | ch10-main (AI alt) |
| A15 | `DE66104C.PNG` | Elephant bath, joyful | ch9-main (AI version) |
| A16 | `F96E19F7.PNG` | Water / Holi fight, "BHA!" | ch19-main (AI alt) |

---

## PART 3 — Chapter Structure (20 Chapters)

Expand from 12 to 20 chapters. Each is tied to a specific photo and has tailored body text.

### Final Chapter Map

| # | Title | Photo (real) | AI Image | Slot | Aspect | Layout |
|---|-------|-------------|----------|------|--------|--------|
| 01 | How It Started | P02 — Park grass selfie | Generate | ch1-main | 4:3 | left |
| 02 | When You Smiled | P03 — Garden selfie | Generate | ch2-main | 16:9 | right |
| 03 | Date Nights | P06 — Cafe stone wall | A02 | ch3-main | 4:3 | left |
| 04 | Red Lanterns | P18 — Chinese restaurant | A05 | ch4-main | 4:3 | right |
| 05 | The Sacred Fire | P01 — Wedding pheras | Generate | ch5-main | 16:9 | left |
| 06 | The Sindoor | P12 — Sindoor closeup | Generate | ch6-main | 16:9 | right |
| 07 | In Wedding White and Red | P04 — Professional portrait | Generate | ch7-main | 3:4 | left |
| 08 | Mysore | P10 — Palace standing | A03 | ch8-main | 16:9 | right |
| 09 | The Elephant | P28 — Elephant bath | A15 | ch9-main | 4:3 | left |
| 10 | Above the Clouds | P25 — Hilltop, crochet jacket | Generate | ch10-main | 4:3 | right |
| 11 | At the Temple | P19 — Temple, holding hand | A08 | ch11-main | 4:3 | left |
| 12 | Mishti and Barfi | P07 — Cat garden walk | Generate | ch12-main | 3:4 | right |
| 13 | The Evening in Maroon | P11 — Poolside party | A11 | ch13-main | 3:4 | left |
| 14 | In Our Kitchen | P31 — Cooking selfie | A10 | ch14-main | 4:3 | right |
| 15 | Puja Mornings | P23 — Post-puja tilak | Generate | ch15-main | 4:3 | left |
| 16 | Dressed in Red | P22 — Mirror, matching red | Generate | ch16-main | 3:4 | right |
| 17 | Going Somewhere | P35 — Mirror going out | A09 | ch17-main | 3:4 | left |
| 18 | In the Dark Together | P13 — Movie theater | Generate | ch18-main | 4:3 | right |
| 19 | Every Colourful Corner | P24 — Rajasthani art cafe (rotated) | A01 | ch19-main | 4:3 | left |
| 20 | One Year | P20 — Mysore, looking at each other | Generate | ch20-main | 16:9 | right |

**Opening panels:**
- `hero-main` → P05 (professional wedding portrait under arch) — 3:4 — Generate AI
- `ceremony-bg` → P09 (sindoor wide shot, warm + intimate) — 16:9 — Generate AI

**Closing:**
- `closing-hero` → P16 (cat walk toward camera, both in pink) — 3:4 — Generate AI

**Hidden chapter ∞:**
- `hidden-ch` → P08 (creative tilted wedding pose) — 4:3 — Generate AI

### Chapter Body Text (final copy — no em-dashes, no contractions in main body)

```
Ch 01 — How It Started
"This is how it began: a park, an afternoon, and the two of us in no particular hurry. 
There was no announcement, no ceremony, no moment that said: this is the one. 
And yet something in me went quiet and certain. I noticed you, Divya, and I thought: 
there she is. That thought has not changed once in a year. Not even a little."

Ch 02 — When You Smiled
"That smile. The one you give when something genuinely pleases you, not performed, 
not decorative. I saw it in a garden, with the green all around us, and I thought: 
I want to be the reason for that smile. I have been trying ever since."

Ch 03 — Date Nights
"The first real evenings out. We were still learning each other: what you liked to eat, 
what made you laugh, how you looked at menus, how you told stories. I was paying 
close attention to all of it. I still am."

Ch 04 — Red Lanterns
"There you are, beaming in the middle of a room full of red lanterns, completely 
yourself. You have this quality: you find something worth loving in every room you 
enter. I noticed it that evening and it has not stopped delighting me since."

Ch 05 — The Sacred Fire
"Seven circles around a fire. Each one a vow I did not take lightly. The smoke 
rose, the bells rang, and somewhere inside all that ritual, something settled into 
place inside me. I was glad, Divya. Completely, quietly glad."

Ch 06 — The Sindoor
"That moment. Your eyes closed, the stillness of it, the weight of what that red 
line meant. I have thought about it many times since. How ordinary it looked 
from the outside. How much it held."

Ch 07 — In Wedding White and Red
"You, in that lehenga. Him, in that sherwani. The arch behind you, the chandelier 
above. A photograph does not capture what I felt looking at you that day. But it 
gets close. It gets very close."

Ch 08 — Mysore
"A palace at dusk, the two of you in front of it, learning how to be us somewhere 
new. You looked at the palace the way you look at beautiful things: as if you are 
genuinely grateful they exist. I love that about you. I love it very much."

Ch 09 — The Elephant
"We stood in a river with an elephant. I repeat: a river. An elephant. You were 
absolutely unfazed, one hand on the elephant, completely at ease. I have never 
felt more certain that I am with the right person."

Ch 10 — Above the Clouds
"That crochet jacket, those colours, that sky. The hill falling away behind you. 
You were laughing at something and the clouds were doing something extraordinary 
and I thought: I want to be here, exactly here, for every adventure still ahead."

Ch 11 — At the Temple
"There is something about arriving at a temple together. The quiet, the incense, 
the sense of something larger than yourselves. You take it seriously without being 
solemn about it. You find the sacred and the funny in the same breath. I love that."

Ch 12 — Mishti and Barfi
"The day you both dressed in pink to match the cats. The garden path, the 
arch of green above us, each of us holding one of them. Mishti and Barfi, 
completely unimpressed. You two, completely delighted. This photograph is my 
favourite thing in the world."

Ch 13 — The Evening in Maroon
"That maroon anarkali. The pool lit up behind you, the tree between us and the 
table. You have a version of yourself that walks into any room and makes it feel 
like a celebration. I got to stand beside that version of you all evening."

Ch 14 — In Our Kitchen
"The apron. The sound of cooking. The smell of something good happening in our 
kitchen. There are whole chapters of this year that smell like food and feel like 
home. You made a place into a home by being in it. That is an extraordinary thing."

Ch 15 — Puja Mornings
"The tilak on both our foreheads. The fragrance of incense still in the air. 
These small sacred rituals that belong entirely to us. No performance, no 
audience. Just the two of you, beginning another day with intention."

Ch 16 — Dressed in Red
"You were already wearing red. I walked out wearing red. Neither of us had 
planned it. We looked at each other in the mirror and laughed. Some things 
feel like signs. This felt like one of those things."

Ch 17 — Going Somewhere
"The ritual of getting ready together. The mirror, the anticipation, the version 
of you that appears when you are dressed and ready. I look forward to those 
evenings. I look forward to every evening that still has you in it."

Ch 18 — In the Dark Together
"The dark of the cinema, the shared armrest, the moment we both laughed at 
the same thing without planning to. These small synchronicities. They are not 
nothing. They are the accumulation of something real."

Ch 19 — Every Colourful Corner
"You are always up for the strangest corner of the city. The most colourful 
cafe, the most improbable setting, the loudest possible backdrop. Your laughter 
against all those painted walls is one of my favourite sounds."

Ch 20 — One Year
"This photograph. The way you look at each other in it. Not performing for the 
camera, not posing. Just seeing each other, smiling because you cannot help it. 
That is the whole year, right there. Three hundred and sixty-five days of exactly 
that look."
```

**Hidden Chapter ∞ body:**
```
"There are no words big enough for this year. I keep reaching for them because 
you deserve every single one. The large words and the small ones and all the 
quiet ones in between. Here is the truest thing I know: I am the luckiest 
person alive. Not because of anything I did, but because you exist, and somehow 
I get to love you. That is not a small thing. That is everything there is."
```

**Crescendo (3 lines):**
```
line1: "Divya, you are every good thing"
line2: "I did not know to ask for."
line3: "Happy first anniversary."
```

**Closing message:**
```
"With all of my love, completely and without reservation. Thank you for this year. 
Thank you for every ordinary day you made extraordinary just by being in it."
```

---

## PART 4 — Photo Processing Pipeline

**Output folder:** `assets/images/real/` (new, does not exist yet)
**Rule:** Never modify originals. All output goes to the new folder.

### Processing commands (run from project root)

```bash
mkdir -p assets/images/real assets/images/ai

HA="assets/Happy Anniversary "

# ── Landscape JPGs ──────────────────────────────────────────────────────────

# P01 ch5-main: wedding pheras (16:9 crop of landscape)
sips -s format jpeg -Z 1600 "$HA/069a109a-8d10-4653-b406-719f29d68eeb.JPG" \
  --out assets/images/real/ch5-main.jpg

# P03 ch2-main: garden selfie (16:9)
sips -s format jpeg -Z 1600 "$HA/41fb52d1-22ae-4288-90b6-3e8ad615ad02.JPG" \
  --out assets/images/real/ch2-main.jpg

# P08 hidden-ch: creative tilted wedding (4:3 crop)
sips -s format jpeg -Z 1200 "$HA/749b77dd-85cf-4a75-a101-8d24c1293ef9.JPG" \
  --out assets/images/real/hidden-ch.jpg

# P09 ceremony-bg: sindoor wide (16:9)
sips -s format jpeg -Z 1600 "$HA/802c3882-a50a-43f6-aeb7-a40bf8701162.JPG" \
  --out assets/images/real/ceremony-bg.jpg

# P10 ch8-main: Mysore wide (16:9)
sips -s format jpeg -Z 1600 "$HA/7e5c78f1-4b2d-4732-b2ed-9f7884f0f4e3.jpg" \
  --out assets/images/real/ch8-main.jpg

# P12 ch6-main: sindoor closeup (16:9 landscape)
sips -s format jpeg -Z 1600 "$HA/937a4968-8e90-4db7-b2ab-90ae4bedc1c4.JPG" \
  --out assets/images/real/ch6-main.jpg

# P20 ch20-main: Mysore looking at each other (16:9) — THE BEST PHOTO
sips -s format jpeg -Z 1600 "$HA/fbf6d520-44f0-4d54-bed7-b36c84292fbc.jpg" \
  --out assets/images/real/ch20-main.jpg

# ── Portrait JPGs ─────────────────────────────────────────────────────────

# P02 ch1-main: park selfie (4:3)
sips -s format jpeg -Z 1200 "$HA/16ace2a7-cf84-4324-bb7c-ec33d577ba13.JPG" \
  --out assets/images/real/ch1-main.jpg

# P04 ch7-main: professional portrait chandelier (3:4)
sips -s format jpeg -Z 1200 "$HA/50276775-158b-464a-87d7-a8a536a05654.JPG" \
  --out assets/images/real/ch7-main.jpg

# P05 hero-main: professional portrait gold arch (3:4)
sips -s format jpeg -Z 1200 "$HA/51a724cd-5c1a-470a-89e0-19092100193b.JPG" \
  --out assets/images/real/hero-main.jpg

# P06 ch3-main: cafe stone wall (4:3)
sips -s format jpeg -Z 1200 "$HA/56b9da89-3bce-47f3-b050-a05df6ecb90c.JPG" \
  --out assets/images/real/ch3-main.jpg

# P07 ch12-main: cat garden walk (3:4) — THE CAT PHOTO
sips -s format jpeg -Z 1200 "$HA/63172c92-8999-4ddf-bcd8-1b95baca9d44.JPG" \
  --out assets/images/real/ch12-main.jpg

# P11 ch13-main: poolside maroon (3:4)
sips -s format jpeg -Z 1200 "$HA/8d42550f-c2f1-4785-9c5c-8d1e7ebea939.JPG" \
  --out assets/images/real/ch13-main.jpg

# P13 ch18-main: movie theater (4:3)
sips -s format jpeg -Z 1200 "$HA/9c78c7fa-3bc3-483d-ab43-7e56b95184c5.JPG" \
  --out assets/images/real/ch18-main.jpg

# P15 ch8-secondary: Mysore leaning pose (portrait)
sips -s format jpeg -Z 1200 "$HA/bff4cf5c-3d97-41b0-800f-f2a3af6dc15d.JPG" \
  --out assets/images/real/ch8-secondary.jpg

# P16 closing-hero: cat walk toward camera (3:4) — 2nd cat photo
sips -s format jpeg -Z 1200 "$HA/c7577c4c-5db1-4b16-89bc-1d563167f030.JPG" \
  --out assets/images/real/closing-hero.jpg

# P18 ch4-main: Chinese restaurant lanterns (4:3)
sips -s format jpeg -Z 1200 "$HA/e98a0ad0-44cd-4b10-8773-45b91542a260.JPG" \
  --out assets/images/real/ch4-main.jpg

# P19 ch11-main: temple selfie holding hand (4:3)
sips -s format jpeg -Z 1200 "$HA/ed7df2cd-f28c-48d0-af0f-1f80a966d2dc.JPG" \
  --out assets/images/real/ch11-main.jpg

# ── HEIC files (sips auto-applies EXIF rotation) ───────────────────────────

# P23 ch15-main: puja tilak selfie (4:3)
sips -s format jpeg -Z 1200 "$HA/IMG_0429.HEIC" \
  --out assets/images/real/ch15-main.jpg

# P22 ch16-main: mirror matching red (3:4)
sips -s format jpeg -Z 1200 "$HA/IMG_0234.HEIC" \
  --out assets/images/real/ch16-main.jpg

# P21 ch17-alt: festive home evening (4:3)
sips -s format jpeg -Z 1200 "$HA/IMG_0052.HEIC" \
  --out assets/images/real/ch17-alt.jpg

# P24 ch19-main: Rajasthani art cafe — NEEDS -90 degree rotation
sips -s format jpeg -Z 1200 "$HA/IMG_1443.HEIC" \
  --out assets/images/real/ch19-main-raw.jpg
# Then rotate: sips -r 90 assets/images/real/ch19-main-raw.jpg --out assets/images/real/ch19-main.jpg
sips -r 90 assets/images/real/ch19-main-raw.jpg --out assets/images/real/ch19-main.jpg
rm assets/images/real/ch19-main-raw.jpg

# P25 ch10-main: hilltop crochet jacket (4:3)
sips -s format jpeg -Z 1200 "$HA/IMG_1564.HEIC" \
  --out assets/images/real/ch10-main.jpg

# P26 ch10-secondary: mountain viewpoint (4:3)
sips -s format jpeg -Z 1200 "$HA/IMG_1650.HEIC" \
  --out assets/images/real/ch10-secondary.jpg

# P28 ch9-main: elephant bath (4:3)
sips -s format jpeg -Z 1200 "$HA/IMG_1726.HEIC" \
  --out assets/images/real/ch9-main.jpg

# P30 ch10-alt: misty hill viewpoint (4:3)
sips -s format jpeg -Z 1200 "$HA/IMG_1825.HEIC" \
  --out assets/images/real/ch10-alt.jpg

# P31 ch14-main: cooking selfie (4:3)
sips -s format jpeg -Z 1200 "$HA/IMG_2055.HEIC" \
  --out assets/images/real/ch14-main.jpg

# P33 ch11-alt: Shiva temple (4:3)
sips -s format jpeg -Z 1200 "$HA/IMG_7829.HEIC" \
  --out assets/images/real/ch11-alt.jpg

# P35 ch17-main: mirror going out (3:4)
sips -s format jpeg -Z 1200 "$HA/IMG_9353.HEIC" \
  --out assets/images/real/ch17-main.jpg
```

---

## PART 5 — AI Image Generation

### Style Reference
The existing 16 images in `assets/AI images/` define the exact style: **vibrant anime / cartoon illustration with Indian aesthetic, warm saturated colours, expressive character faces that are clearly recognisable likenesses, fun text overlays and environmental storytelling**.

The same tool and style settings used for the existing 16 must be used for all new generations. The character likenesses are already established across the existing set — reference them when generating new ones.

### New AI Images Needed (16)

Output each to `assets/images/ai/` with the slot filename (e.g. `ch1-main.jpg`).

| Slot | Source photo | Prompt |
|------|-------------|--------|
| `hero-main` | P05 — professional wedding portrait (51a724cd) | Anime illustration: Indian couple in full wedding attire, groom in ornate white sherwani with red sash and red safa/turban, bride in red bridal lehenga with gold embroidery, standing under a white arch with chandelier, gold and white background. Joyful, warm, cinematic. Portrait 3:4 |
| `ceremony-bg` | P09 — sindoor ceremony wide (802c3882) | Anime illustration: Indian groom in yellow kurta and red safa applying sindoor to bride's forehead, bride in red bridal saree. Intimate ritual moment under hanging bells and marigold decor, candlelight. Landscape 16:9 |
| `ch1-main` | P02 — park grass selfie (16ace2a7) | Anime illustration: Indian couple lying on green grass in a park, surrounded by autumn leaves. She in beige kurta with red floral dupatta and red bindi/sindoor, he in grey shirt with glasses. Relaxed, smiling, casual selfie moment. Warm afternoon light. 4:3 |
| `ch2-main` | P03 — garden selfie (41fb52d1) | Anime illustration: Indian couple selfie in front of beautifully manicured garden with tall trees. He in purple shirt with glasses and backpack, she in red kurta with round glasses and bindi. Green garden background, overcast sky. Both smiling warmly. Landscape 16:9 |
| `ch5-main` | P01 — wedding pheras (069a109a) | Anime illustration: Indian wedding pheras ceremony. Groom in yellow kurta and red safa, bride in red bridal saree, both seated before sacred fire under a mandap with hanging golden bells and green marigold garlands. Sacred and beautiful. Night setting. Landscape 16:9 |
| `ch6-main` | P12 — sindoor closeup (937a4968) | Anime illustration: Indian groom in yellow kurta applying sindoor to bride's hair parting. Bride in red bridal saree, eyes downcast, gold jewelry, the moment is tender and sacred. Close composition. Text overlay: "The Promise". Landscape 16:9 |
| `ch7-main` | P04 — wedding portrait chandelier (50276775) | Anime illustration: Indian couple in elegant wedding attire under a crystal chandelier with white drapes. Bride in red lehenga with gold embroidery, groom in embroidered white sherwani with red sash. Formal portrait, both smiling, holding hands. Portrait 3:4 |
| `ch10-main` | P25 — hilltop (IMG_1564) | Anime illustration: Indian couple on top of a green hill, dramatic cloudy sky behind them with mountains visible. She in a colourful crochet patchwork jacket, he in mustard/orange windbreaker. They are looking at each other and smiling. Breathtaking viewpoint, wind in hair. Portrait 4:3 |
| `ch12-main` | P07 — cat garden walk (63172c92) | Anime illustration: Indian couple in matching soft pink/mauve outfits, both holding fluffy white Persian cats, walking on a garden stone path under a green pergola. She in pink lehenga with pearl necklace, he in pink blazer. Both delighted, cats unimpressed. Text: "The Purrfect Pair". Portrait 3:4 |
| `ch15-main` | P23 — puja tilak (IMG_0429) | Anime illustration: Indian couple at home after evening puja, both with red tilak on foreheads. She in yellow embroidered kurta with silver jhumka earrings, he in orange kurta. Standing in warmly lit home with golden hour glow. Soft and spiritual. 4:3 |
| `ch16-main` | P22 — mirror matching red (IMG_0234) | Anime illustration: Indian couple taking mirror selfie. Both wearing matching red outfits. He in red striped kurta, she in red saree with jasmine flower garland and gold jewelry. Home mirror, golden accents on frame. They are laughing with delight. Text: "Accidental Twins". Portrait 3:4 |
| `ch17-main` | P35 — mirror going out (IMG_9353) | Anime illustration: Indian couple in mirror selfie, dressed up and ready to go out. She in gorgeous pink and gold paisley outfit, he in olive/sage green hoodie with crossbody bag. Home hallway, cozy decor visible. Warm excited energy. Portrait 3:4 |
| `ch18-main` | P13 — movie theater (9c78c7fa) | Anime illustration: Indian couple in cinema seats. Red velvet seats, dark theater, movie screen glow reflecting on their faces. She in white embroidered kurta with bindi and nose ring, he in grey shirt with glasses. Both leaning close, sharing popcorn. Cozy and intimate. 4:3 |
| `ch20-main` | P20 — Mysore looking at each other (fbf6d520) | Anime illustration: Indian couple in front of Mysore Palace in soft golden light. He in teal green sweatshirt, she in orange salwar with white embroidery. They are LOOKING AT EACH OTHER AND SMILING, not at the camera. The palace is beautifully rendered behind them with bokeh. Warm and loving. Text: "Year One." Landscape 16:9 |
| `closing-hero` | P16 — cat walk toward camera (c7577c4c) | Anime illustration: Indian couple in matching pink/mauve outfits walking toward the viewer along a garden stone path, each holding a fluffy white Persian cat. Lush garden pergola above them. She in pink lehenga, he in pink blazer. Both smiling warmly at camera. Cats perfectly fluffy. Portrait 3:4 |
| `hidden-ch` | P08 — creative tilted wedding (749b77dd) | Anime illustration: Indian couple in wedding attire in a playful tilted composition. Bride in red bridal lehenga lying on white fabric, groom in embroidered white sherwani beside her. Crystal chandelier visible at angle. Both laughing. Fun and cinematic. 4:3 |

---

## PART 6 — Dual AI/Real Mode Toggle

### Design

A small toggle button appears in the journey UI alongside the sound button (bottom-right). Its icon is 🎨 (AI mode) or 📷 (photo mode). Clicking swaps all chapter images without a page reload. State saved to `localStorage('image-mode')`.

### content.js changes

Add `aiMode: true` to SITE and `aiSrc` to each IMAGE_SLOTS entry:

```js
var SITE = {
  aiMode: true,   // default: show AI illustrated versions
  ...
}

var IMAGE_SLOTS = {
  'hero-main': {
    aspectRatio: '3/4',
    placeholder: 'Wedding day portrait',
    src:   'assets/images/real/hero-main.jpg',
    aiSrc: 'assets/images/ai/hero-main.jpg'
  },
  'ceremony-bg': {
    aspectRatio: '16/9',
    placeholder: 'The sacred ceremony',
    src:   'assets/images/real/ceremony-bg.jpg',
    aiSrc: 'assets/images/ai/ceremony-bg.jpg'
  },
  // ... all 24 slots follow the same pattern
};
```

### main.js changes

**1. State variable (add near top of IIFE):**
```js
var _imageMode = localStorage.getItem('image-mode') || (SITE.aiMode ? 'ai' : 'real');
```

**2. In `buildPlaceholder()`, use aiSrc or src based on mode:**
```js
function getSlotSrc(slot) {
  if (_imageMode === 'ai' && slot.aiSrc) return slot.aiSrc;
  return slot.src || null;
}
```

Then in buildPlaceholder():
```js
var activeSrc = getSlotSrc(slot);
if (activeSrc) {
  var img = document.createElement('img');
  img.src = activeSrc;
  img.alt = slot.placeholder;
  img.loading = 'lazy';
  img.style.filter = 'blur(20px)';
  img.style.transition = 'filter 0.4s ease';
  img.onload = function() { img.style.filter = 'blur(0)'; };
  fig.innerHTML = '';
  fig.appendChild(img);
}
```

**3. Add toggle button in `showJourneyUI()`:**
```js
// Add after existing sound/share button wiring
var imgToggleBtn = document.createElement('button');
imgToggleBtn.id = 'img-mode-btn';
imgToggleBtn.className = 'fixed-btn';
imgToggleBtn.setAttribute('aria-label', _imageMode === 'ai' ? 'Switch to real photos' : 'Switch to illustrated mode');
imgToggleBtn.textContent = _imageMode === 'ai' ? '📷' : '🎨';
imgToggleBtn.style.cssText = 'position:fixed;bottom:calc(3.5rem + env(safe-area-inset-bottom));right:1rem;z-index:50;';
document.body.appendChild(imgToggleBtn);

imgToggleBtn.addEventListener('click', function() {
  _imageMode = _imageMode === 'ai' ? 'real' : 'ai';
  localStorage.setItem('image-mode', _imageMode);
  imgToggleBtn.textContent = _imageMode === 'ai' ? '📷' : '🎨';
  imgToggleBtn.setAttribute('aria-label', _imageMode === 'ai' ? 'Switch to real photos' : 'Switch to illustrated mode');
  // Re-render all images
  document.querySelectorAll('.image-placeholder').forEach(function(fig) {
    var slotId = fig.closest('[data-image-id]') && fig.closest('[data-image-id]').dataset.imageId;
    if (slotId && IMAGE_SLOTS[slotId]) {
      var slot = IMAGE_SLOTS[slotId];
      var newSrc = getSlotSrc(slot);
      var img = fig.querySelector('img');
      if (img && newSrc) {
        img.style.filter = 'blur(20px)';
        img.src = newSrc;
        img.onload = function() { img.style.filter = 'blur(0)'; };
      }
    }
  });
});
```

**4. Add `data-image-id` attribute to image-wrap elements in `buildPlaceholder()`:**
```js
// In buildPlaceholder(imageId, slot), add to the returned figure's parent:
wrap.dataset.imageId = imageId;
```

---

## PART 7 — CODE CHANGES (Full List)

### themes.js
- Move `purrfect-pair` to index 0

### content.js
- Add `aiMode: true` to SITE
- Expand `chapters` array from 12 to 20 entries (new titles + bodies from Part 3)
- Update `hiddenChapter` body (from Part 3)
- Update `crescendo` lines (from Part 3)
- Update `closing.message` (from Part 3)
- Expand `IMAGE_SLOTS` from 16 to 24 entries (all with `src` + `aiSrc`)
- Update `hero-main` aspectRatio from `9/16` to `3/4`

### main.js
- Add `_imageMode` state variable
- Add `getSlotSrc()` helper
- Update `buildPlaceholder()` to use `getSlotSrc()` and add `data-image-id` to wrap
- Add image mode toggle button in `showJourneyUI()`
- Update `initChapterNav()` to handle 20 chapters (any hardcoded 12 limit must become dynamic)
- Update `initTOCSheet()` to handle 20 chapters
- Update `initHiddenChapter()` — ornament is on chapter 20, not 12

### sw.js
- Bump `CACHE` from `anniversary-v10` to `anniversary-v11`

### tests/theme-selector.spec.js
- `toHaveCount(9)` stays the same (count unchanged, just reordered)
- Add check: `expect(page.locator('#ts-name')).toContainText('Purrfect Pair')` on initial load

### tests/journey.spec.js
- Update any hardcoded "12 chapters" assertions to 20
- Update TOC sheet test: `toHaveCount(20)` not 12

### index.html
- No markup changes needed (chapter DOM is generated by JS)

### THEMING.md
- Update index table: purrfect-pair moves to 0, renumber all

---

## PART 8 — Implementation Order

Execute in this order to minimise merge conflicts and broken states.

### Step 1 — Purrfect Pair to default (5 min)
```
1. themes.js: move purrfect-pair to index 0
2. THEMING.md: update table
3. Run playwright test — should still pass (9 themes)
```

### Step 2 — Process real photos (20 min)
```
1. Run the sips pipeline from Part 4
2. Verify each output file exists and looks right with: sips -g pixelWidth output.jpg
3. Run rotation check on ch19-main.jpg
```

### Step 3 — Copy existing AI images to assets/images/ai/ (5 min)
```bash
AI="assets/AI images"
cp "$AI/2B53CE83-9E62-4655-87F6-A09FE29600C0.PNG" assets/images/ai/ch3-main.jpg
cp "$AI/5B1CD649-DF41-4729-90AD-9454037CF14E.PNG" assets/images/ai/ch4-main.jpg
cp "$AI/2FD4F25B-E683-44CA-B9B1-EFB18A3BA0C1.PNG" assets/images/ai/ch8-main.jpg
cp "$AI/DE66104C-9751-4495-B436-0117DCBF0851.PNG" assets/images/ai/ch9-main.jpg
cp "$AI/8F4D964D-F4C8-4E0A-AA75-F27BCE156A44.PNG" assets/images/ai/ch11-main.jpg
cp "$AI/4C5E2C11-E778-4663-9FB9-4E5C92AF51D5.PNG" assets/images/ai/ch12-main-sofa.jpg
cp "$AI/B7A3E8A4-AC52-4E75-AB3F-F4BFA61C2E99.PNG" assets/images/ai/ch13-main.jpg
cp "$AI/ACD81F4C-481D-4E3F-996D-A4687C43ED18.PNG" assets/images/ai/ch14-main.jpg
cp "$AI/6086B04B-FD48-4433-8461-5E2CD165C4E6.PNG" assets/images/ai/ch15-alt.jpg
cp "$AI/A345AD7E-687A-489F-85F1-B09125A55CCF.PNG" assets/images/ai/ch17-main.jpg
cp "$AI/10E60F29-538F-4C8A-B85B-6A7C96560579.PNG" assets/images/ai/ch19-main.jpg
```

### Step 4 — Generate new AI images (2-4 hours, external tool)
```
Using the prompts from Part 5, generate 16 new AI images
Output each to assets/images/ai/ with the slot filename
Verify style matches existing 16 before finalising
```

### Step 5 — Update content.js (1 hour)
```
1. Add aiMode: true
2. Expand IMAGE_SLOTS to 24 entries with src + aiSrc paths
3. Expand chapters array to 20 with new titles + bodies
4. Update hiddenChapter, crescendo, closing
```

### Step 6 — Update main.js (1.5 hours)
```
1. Add _imageMode state variable
2. Add getSlotSrc() helper
3. Update buildPlaceholder() — use getSlotSrc, add data-image-id
4. Add image mode toggle button in showJourneyUI()
5. Audit chapter nav / TOC for hardcoded chapter count references
6. Move hidden chapter trigger from ch12 ornament to ch20 ornament
```

### Step 7 — Update sw.js and tests (15 min)
```
1. Bump CACHE to anniversary-v11
2. Update chapter count in tests
3. Add default theme name check
```

### Step 8 — Full test run + visual QA (1 hour)
```
npx playwright test
Manual smoke test: all 20 chapters, AI/real toggle, Purrfect Pair default,
cat chapter, elephant chapter, Mysore chapter, closing hero
```

### Step 9 — Commit and push
```
git add -A
git commit -m "feat: 20 chapters with real photos + AI mode toggle, purrfect-pair default"
git push origin main
```

---

## PART 9 — OG / Share Image

Generate a 1200x630 screenshot of the Purrfect Pair theme selector at maximum beauty and save as `assets/og-image.jpg`. Update `index.html` OG meta tags.

This will make link previews on WhatsApp/iMessage show the cat theme immediately.

---

## PART 10 — Performance After Photo Addition

After photos are added:
- Run Lighthouse with "Mid-tier mobile" throttling
- Target: Performance >= 85, CLS <= 0.05
- Each image should be <= 250KB (sips -Z 1200 already handles this)
- Verify lazy loading is working on all chapter images
- Consider adding `width` and `height` attributes on img elements to prevent CLS

---

## Pre-Gifting Final Checklist

- [x] Purrfect Pair is the default theme (opens on cats immediately)
- [x] All 20 chapters have personalised body text (no placeholder text remains)
- [x] `document.body.innerText.includes('—')` returns `false`
- [x] All real photos are in `assets/images/real/` and render correctly
- [ ] All AI images are in `assets/images/ai/` and render correctly (13 slots still need AI generation)
- [x] AI mode is default (opens in illustrated mode)
- [x] Photo mode toggle works and persists after reload
- [x] `sw.js` CACHE is bumped to `anniversary-v11`
- [x] `npx playwright test` — 150/150 passing
- [ ] OG share image set
- [ ] Manual test on real iPhone Safari: open URL, cycle themes, enter journey, scroll all 20 chapters, see cats in ch12 + closing, tap toggle between AI and real photos
- [x] `git config user.name` returns `AnimeshPandey`
- [x] Push to main — GitHub Actions deploys

---

## Effort Estimate

| Task | Effort |
|------|--------|
| Purrfect Pair default | 5 min |
| Photo processing pipeline (sips) | 20 min |
| Copy existing AI images | 5 min |
| Generate 16 new AI images | 2-4 hours (external AI tool) |
| content.js: 20 chapters + slots | 1 hour |
| main.js: AI toggle + chapter updates | 1.5 hours |
| Tests + QA | 1 hour |
| OG image | 30 min |
| **Total** | **6-9 hours** |

The biggest variable is AI image generation (waiting on external tool). All code changes can happen in parallel while AI images are being generated.
