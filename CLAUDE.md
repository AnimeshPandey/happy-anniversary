# Anniversary — Claude Code Instructions

## Git identity

All commits in this repo must use:

```
user.name  = AnimeshPandey
user.email = animeshpandey1909@gmail.com
```

This is set in `.git/config` (local). Never commit as `animesh-lifesight` or any other identity.
When creating commits, verify `git config user.name` returns `AnimeshPandey` before proceeding.

## Project

This is a personal anniversary digital experience — a single-page vanilla HTML/CSS/JS site
deployed to GitHub Pages at `anmshpndy.com/happy-anniversary`.

See `claude-prompt-happy-anniversary.md` for the full design spec.

## Key rules

- No em-dashes anywhere in copy (see `WRITING.md`)
- No build step — pure vanilla HTML, works offline and on GitHub Pages as-is
- All content lives in `content.js`; all theme configs live in `themes.js`
- Adding real photos: see `PHOTOS.md`
- Image pipeline: `scripts/process-photos.sh`
