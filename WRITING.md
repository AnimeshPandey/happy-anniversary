# Writing Guidelines

Rules for all copy in this project: chapter bodies, opening panels, poem, crescendo lines, and the closing message.

---

## No em-dashes

Do not use em-dashes (`—`) anywhere in the copy. Replace them with one of these:

| Instead of | Use |
|---|---|
| A long pause in a sentence | A comma |
| Introducing a clarification | A colon |
| An aside or extra thought | Parentheses |
| A strong break between two ideas | A full stop and a new sentence |

**Examples:**

Bad:
> Ours started quietly, unexpectedly — the kind of beginning you only recognise later.

Good:
> Ours started quietly, unexpectedly: the kind of beginning you only recognise later.

Bad:
> You were there — not always with words, but always present.

Good:
> You were there. Not always with words, but always present.

---

## No en-dashes in body copy

En-dashes (`–`) are only acceptable in date ranges displayed in the UI (e.g. "June 2025 to June 2026"). Do not use them in sentences.

---

## Contractions

Avoid contractions in the formal chapter copy. Use the full form.

| Avoid | Use |
|---|---|
| don't | do not |
| didn't | did not |
| I'm | I am |
| we're | we are |
| it's | it is |
| won't | will not |
| wasn't | was not |

Exception: the closing section and any handwritten-style text may use contractions to feel warmer.

---

## Chapter copy guidelines

- Length: 3 to 6 sentences per chapter, roughly 50 to 90 words
- Voice: second person ("you", "your"), warm, direct
- Tense: past tense for memories, present tense for feelings and observations
- No exclamation marks in chapter bodies
- Each chapter should build on the previous emotional beat

---

## How to edit copy

All copy lives in `content.js`. Open the file and find the `chapters` array. Each chapter has a `body` field:

```js
{
  number: '01',
  title: 'How it started',
  body: 'Every great love story has a beginning...',
  ...
}
```

Edit the `body` string directly. Keep the single quotes and do not break out of the string.

For multiline strings, use `\n` to add a line break, or split into separate `<p>` tags by updating `buildChapters()` in `main.js`.

---

## Poem and section headings

The opening poem (`SITE.opening.poem`) uses `\n` for line breaks. The `white-space: pre-line` CSS rule respects these.

The crescendo lines (`SITE.crescendo`) are three separate strings and display on three lines. Keep them short: 3 to 7 words each.

---

## Apostrophes

Use a real curly apostrophe (`'`) in final copy, not a straight one (`'`).

Most text editors and browsers handle this automatically when you type. In code strings, you can type it directly or use `’` for the Unicode right single quotation mark.
