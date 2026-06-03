# AI Image Prompts

Use these prompts in Midjourney, DALL-E 3, or Stable Diffusion to generate
themed placeholder art before real photos are ready.

Paste the prompt for the slot + theme you want.
Recommended settings: square or slot's native ratio, no text, photo-realistic or painterly.

---

## How to use

1. Pick a slot from the table (e.g. `hero-main`)
2. Pick the theme you have active (e.g. `Moonlight Mithai`)
3. Copy the matching prompt below
4. Generate in your preferred AI image tool
5. Save the output as the slot's filename (e.g. `hero-main.jpg`) in `assets/images/`

---

## Prompt template variables

Throughout these prompts:
- `[PERSON A]` = the first person (replace with a description if needed)
- `[PERSON B]` = the second person
- `[PLACE]` = a meaningful location

---

## hero-main (9:16 portrait)

**PetalPop Parade**
A close portrait of two people in soft pink natural light, surrounded by scattered rose petals, faces tilted toward each other, shallow depth of field, warm spring afternoon, film grain, 9:16 portrait orientation

**Moonlight Mithai**
Two silhouettes close together under soft moonlight, surrounded by floating silver-blue orbs of light, lavender and pearl tones, dreamy impressionistic style, tall portrait format

**CandyCloud Caravan**
A cheerful portrait of a couple in a cotton-candy coloured environment, pastel pinks and yellows, soft bokeh background, laughing, playful mood, tall portrait

**Gulabo Garden Gala**
Two people together in a festive garden full of marigolds and roses, rich reds and oranges, golden afternoon light, celebratory, vibrant colours, portrait orientation

**Starry Snuggle Story**
Two people looking up at a violet-blue star-filled night sky, silhouetted, glowing stars reflected on water, intimate and quiet, tall portrait

**ButterflyBlush Bash**
Soft portrait of two people in a garden with butterflies, blush pink and mint greens, gentle light, dreamy and airy, butterflies mid-flutter nearby, 9:16

**SangeetSpark Symphony**
Dramatic portrait of a couple in jewel-toned outfits, golden fireworks behind them, deep dark background, festive glowing light, cinematic and electric, tall portrait

**VelvetVows Voyage**
Luxurious portrait of two people in a velvet-curtained room with deep plum and ruby tones, champagne gold accents, cinematic lighting, tall portrait

**Purrfect Pair**
Soft portrait of two people cozy together in a lavender-toned room, white and cream fluffy Persian cats in the scene, dreamy diffused light, pale lilac and rose accents, tender and warm, tall portrait format

---

## ch1-main (4:3 landscape) — How it started

**PetalPop Parade**
A candid moment of two people meeting for the first time, spring park setting, warm sunlight through cherry blossom trees, soft and warm, 4:3

**Moonlight Mithai**
Two people at a gentle evening gathering, soft lantern light, lavender twilight sky, first conversation, painterly style, 4:3

**Gulabo Garden Gala**
Two people at a colourful festival, marigold garlands, bright sunny day, first meeting, vibrant and joyful, 4:3

**Starry Snuggle Story**
A quiet cafe at night, two people at a small table with fairy lights overhead, violet and warm gold tones, intimate first meeting, 4:3

---

## ch7-main (16:9 landscape) — The quiet moments

**PetalPop Parade**
A lazy Sunday afternoon inside a bright apartment, sunlight through curtains, scattered flowers, two people reading near a window, warm and soft, 16:9

**Moonlight Mithai**
A peaceful evening scene, two people on a balcony with soft moonlight and hanging lanterns, lavender and silver tones, intimate and quiet, 16:9

**SangeetSpark Symphony**
Candlelit dinner scene, two people at a table, warm amber and gold light, quiet and romantic, jewel-toned background, 16:9

**VelvetVows Voyage**
A luxurious quiet evening, two people on a deep-plum velvet sofa, champagne in hand, warm fire glow, cinematic, 16:9

---

## closing-hero (3:4 portrait) — THE photo

**PetalPop Parade**
The most beautiful portrait of two people together, golden hour sunlight, soft pink petals drifting around them, pure joy, perfect stillness, 3:4

**Moonlight Mithai**
Two people under a soft full moon, silver light, stars above, arms around each other, perfect calm and love, tall portrait format

**SangeetSpark Symphony**
A jubilant portrait of two people celebrating, gold confetti falling, jewel-toned background, wide smiles, cinematic and electric, 3:4

**VelvetVows Voyage**
The most elegant portrait, deep plum and champagne tones, a single perfect moment of connection, cinematic lighting, timeless, 3:4

**Purrfect Pair**
The softest, most tender portrait: two people together in gentle lavender light, a white Persian cat and a cream Persian cat curled nearby, dreamy and cozy, pale lilac tones, love and warmth, 3:4

---

## AI image transformation pipeline

To convert a REAL photo into a stylised version matching a theme:

### Using Stable Diffusion img2img

1. Open your real photo in your SD tool (Automatic1111, ComfyUI, etc.)
2. Set img2img denoising strength: 0.4 to 0.6 (lower = closer to original photo)
3. Use the prompt below for your theme
4. Negative prompt: `ugly, deformed, cartoon, anime, text, watermark`

**PetalPop theme img2img prompt:**
`romantic couple portrait, soft pink rose petals, warm spring light, film photograph, shallow depth of field, dreamy`

**Moonlight Mithai img2img prompt:**
`couple silhouette, moonlit scene, lavender and silver tones, floating lanterns, ethereal, painterly`

**SangeetSpark img2img prompt:**
`couple portrait, dramatic jewel tones, gold light, festive, cinematic, high contrast, Bollywood inspired`

**VelvetVows img2img prompt:**
`couple portrait, deep plum and burgundy, champagne gold, luxury cinematic lighting, editorial photography`

**Purrfect Pair img2img prompt:**
`couple portrait, soft lavender and lilac tones, dreamy diffused light, cozy interior, persian cats, gentle and warm, pastel`

### Using DALL-E 3 with image upload (GPT-4V)

Prompt: "Reimagine this photo in the style of [theme description]. Keep the people recognisable but transform the colours and mood. Output in [aspect ratio]."

---

## Notes

- AI-generated images with real people require the subject's consent before publishing
- For placeholder purposes only (before real photos are added), generic AI art is fine
- All real photos take precedence over AI-generated art when available
