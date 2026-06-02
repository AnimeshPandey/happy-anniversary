# Adding Photos

## Quick start (5 steps)

1. Name your photo file to match the slot ID listed in the table below (e.g. `ch1-main.jpg`)
2. Drop it into `assets/images/`
3. Open `content.js` and find the matching slot in `IMAGE_SLOTS`
4. Change `future_filename` to your filename (e.g. `'ch1-main.jpg'`)
5. Also add a real `src` in the placeholder — see the code snippet below
6. Commit and push; GitHub Actions deploys automatically

---

## Slot reference

| Slot ID | File to provide | Aspect ratio | Notes |
|---|---|---|---|
| `hero-main` | `hero-main.jpg` | 9:16 (portrait) | Your best shot together — tall frame |
| `ceremony-bg` | `ceremony-bg.jpg` | 16:9 (wide) | A beautiful place, soft background |
| `ch1-main` | `ch1-main.jpg` | 4:3 | The very beginning |
| `ch2-main` | `ch2-main.jpg` | 4:3 | The first yes |
| `ch3-main` | `ch3-main.jpg` | 16:9 | When you knew |
| `ch4-main` | `ch4-main.jpg` | 4:3 | First adventure |
| `ch5-main` | `ch5-main.jpg` | 4:3 | The little things |
| `ch6-main` | `ch6-main.jpg` | 3:4 (portrait) | When they made everything better |
| `ch7-main` | `ch7-main.jpg` | 16:9 | A quiet moment |
| `ch8-main` | `ch8-main.jpg` | 4:3 | How they changed you |
| `ch9-main` | `ch9-main.jpg` | 4:3 | An ordinary day |
| `ch10-main` | `ch10-main.jpg` | 4:3 | A memory you never want to forget |
| `ch11-main` | `ch11-main.jpg` | 16:9 | Looking ahead |
| `ch12-main` | `ch12-main.jpg` | 4:3 | Everything, always |
| `closing-hero` | `closing-hero.jpg` | 3:4 (portrait) | THE photo. The most important one. |

---

## How to activate a photo in the code

Open `content.js` and find the slot you want to update:

```js
// BEFORE (placeholder)
'ch1-main': { aspectRatio: '4/3', placeholder: 'How it started, the very beginning' },

// AFTER (real image) — add a src field
'ch1-main': { aspectRatio: '4/3', placeholder: 'How it started, the very beginning', src: 'assets/images/ch1-main.jpg' },
```

Then in `main.js`, inside `buildPlaceholder()`, add this logic after the figure is created:

```js
if (slot.src) {
  var img = document.createElement('img');
  img.src = slot.src;
  img.alt = slot.placeholder;
  img.loading = 'lazy';
  fig.innerHTML = '';      // clear the placeholder icon and text
  fig.appendChild(img);
}
```

---

## Recommended photo sizes

| Aspect ratio | Good dimensions | File size target |
|---|---|---|
| 9:16 | 900 x 1600 px | under 300 KB |
| 16:9 | 1600 x 900 px | under 300 KB |
| 4:3 | 1200 x 900 px | under 250 KB |
| 3:4 | 900 x 1200 px | under 250 KB |

Anything larger than these dimensions is just extra weight. Compress before uploading.

---

## Image fit options

**Default: `object-fit: cover`**
The card keeps its fixed aspect ratio and the photo is cropped to fill it (centres the crop). Good for most photos.

**To show the whole image without cropping:**
Add `style="object-fit: contain; background: #f5f0ff;"` to the `<img>` element in `buildPlaceholder()`.

**To resize the card to match your photo's natural ratio:**
Change `aspectRatio` in `IMAGE_SLOTS` to match your photo:
```js
// Portrait photo that is naturally 2:3
'ch1-main': { aspectRatio: '2/3', ... }
```

---

## Automated pipeline

If you have all 15 photos ready, use the script to resize and convert them in one pass:

```bash
# Put your photos in a folder, named to match the slot IDs
ls my-photos/
# ch1-main.jpg  ch2-main.jpg  closing-hero.jpg  ...

# Run the pipeline
./scripts/process-photos.sh my-photos/

# Output goes to assets/images/ ready to use
```

Run `./scripts/process-photos.sh` with no arguments for usage details.

---

## Accepted formats

`.jpg`, `.jpeg`, `.png`, `.heic`, `.webp` — the script converts everything to JPEG (or WebP if `cwebp` is installed).

iPhone photos in `.heic` format are accepted and will be converted automatically.
