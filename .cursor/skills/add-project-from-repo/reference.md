# Reference — add-project-from-repo

Detailed reference for the `add-project-from-repo` skill. Read this when you
need exact schema rules or the thumbnail template.

## Content collection layout

```
src/content/projects/
├── personal/    # Personal projects (default category)
├── startup/     # Startup work
└── corporate/   # Corporate / employer work
```

All three categories share the same schema (defined in
`src/content.config.ts`). The category determines the folder only.

## Authoritative frontmatter schema

Mirrored from `src/content.config.ts`. Schema is **strict** — unknown fields
cause build failure.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | yes | min 1, max 80 |
| `description` | string | yes | min 1, max 240 |
| `slug` | string | no | kebab-case, max 80; usually omit and let filename drive it |
| `role` | string | yes | min 1, max 80 |
| `period.start` | string | yes | matches `^[0-9]{4}-(0[1-9]|1[0-2])$` (YYYY-MM) |
| `period.end` | string | yes | YYYY-MM or literal `"present"`; must be ≥ `period.start` |
| `techStack` | string[] | yes | 1–20 entries, each min 1, max 30 |
| `thumbnail` | string | yes | non-empty path, e.g. `/projects/<slug>/thumbnail.svg` |
| `screenshots` | string[] | no | max 10, default `[]` |
| `links.source` | string | no | must be `http(s)://...` |
| `links.live` | string | no | must be `http(s)://...` |
| `links.caseStudy` | string | no | must be `http(s)://...` |
| `featured` | boolean | no | default `false` |
| `order` | integer | no | min 0, default `100`; lower = earlier in lists |
| `draft` | boolean | no | default `false` |

The `links` object itself is **strict** — no fields other than `source`,
`live`, `caseStudy` are allowed.

## Slug rules

- Filename (without `.md`) becomes the slug
- Must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Examples valid: `wallapop-finder-bot`, `magic-tokens`, `etsy-listings`
- Examples invalid: `Wallapop_Bot`, `magic--tokens`, `-foo`, `foo-`

## Order convention

Existing entries use multiples of 10 (`10`, `20`, `30`, …). When adding a new
project, find the current max in the target category and use the next multiple
of 10. This leaves room to insert items between later.

## Thumbnail SVG template

800×600, design-system-friendly, no external assets. Use this as a base and
swap the gradient stops, motif, and label per project:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <radialGradient id="g" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0" stop-color="#4c1d95"/>
      <stop offset="1" stop-color="#1e1b4b"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <g transform="translate(400 280)">
    <circle r="160" fill="#fde68a" stroke="#92400e" stroke-width="6"/>
    <text x="0" y="44" fill="#92400e" font-family="serif" font-size="120" font-weight="700" text-anchor="middle">T</text>
  </g>
  <text x="400" y="540" text-anchor="middle" fill="#ffffff" font-family="ui-sans-serif, system-ui, sans-serif" font-size="42" font-weight="700">Project Name</text>
</svg>
```

Place the file at `public/projects/<slug>/thumbnail.svg`. The `thumbnail`
frontmatter field then references it as `/projects/<slug>/thumbnail.svg`
(absolute from `public/`, no leading `public`).

### SVG content rules (must follow — broken thumbnails come from breaking these)

The renderer (`src/lib/assets.ts → safeImagePath`) silently falls back to
`_placeholder.svg` only when the file is **missing**. If the file exists but
contains invalid XML, the browser will fail to render it and the user sees a
broken image. Do not rely on the placeholder fallback.

1. **ASCII-only inside `<text>` elements.** Do **not** use emojis (👋, 🤖, 🎉,
   ⭐, etc.), arrows (→, ←, ⇒), bullets (•), middle dots (·), em-dashes (—),
   smart quotes ("" '' ‘ ’), or any other non-ASCII character in text content.
   When the agent writes these, they often land as control bytes or
   mojibake (e.g. `0xB7` alone, `0x16`, `0x14`) and the SVG fails to parse.
2. **If a special glyph is unavoidable, use an XML numeric entity**, e.g.
   `&#183;` (·), `&#8226;` (•), `&#8594;` (→), `&#8212;` (—). These are
   ASCII bytes on disk and parse safely.
3. **Escape the five XML specials** (`<`, `>`, `&`, `"`, `'`) inside text
   content as `&lt;`, `&gt;`, `&amp;`, `&quot;`, `&apos;`. Don't paste raw
   `<` or `&` into a label.
4. **No control characters** (bytes `0x00`–`0x1F` except `\t`, `\n`, `\r`).
   If you suspect any sneaked in, regenerate the file from scratch.
5. **Decorative motifs must be drawn with shapes** (`<rect>`, `<circle>`,
   `<path>`, `<polygon>`), not with emoji glyphs in `<text>`.
6. **No external references**: no `<image href="...">`, no `<use href="…">`
   pointing outside, no embedded fonts, no scripts.
7. **Self-contained**: every `id` referenced via `url(#…)` must be defined in
   the same file's `<defs>`.
8. **One `<defs>` block.** If you add markers/gradients later, extend the
   existing `<defs>` — don't open a second one (some renderers tolerate it,
   our pipeline shouldn't depend on that).

### Validate before finishing

After writing each SVG, validate it as XML. Fix any errors before moving on
or before running the batch's `npm run build`:

```bash
xmllint --noout public/projects/<slug>/thumbnail.svg
```

If `xmllint` is unavailable, a quick non-ASCII probe also catches the most
common failure mode:

```bash
LC_ALL=C grep -nP '[\x80-\xff]|[\x00-\x08\x0b\x0c\x0e-\x1f]' \
  public/projects/<slug>/thumbnail.svg && echo "FIX: non-ASCII or control byte"
```

Treat any hit as a bug — rewrite the affected line using rule 2 (numeric
entities) or rule 1 (drop the glyph entirely).

## Tech stack mapping cheatsheet

Use specific names, not generic categories:

| Detected file | Add to techStack |
|---------------|------------------|
| `package.json` with `"next"` | `Next.js` |
| `package.json` with `"@nestjs/core"` | `NestJS` |
| `package.json` with `"astro"` | `Astro` |
| `package.json` with `"react"` (no Next) | `React` |
| `package.json` with `"vite"` | `Vite` |
| `package.json` with `"jest"` / `"vitest"` | `Jest` / `Vitest` |
| `tsconfig.json` | `TypeScript` |
| `pyproject.toml` / `requirements.txt` | `Python` + relevant frameworks (`FastAPI`, `Pandas`, etc.) |
| `Cargo.toml` | `Rust` |
| `go.mod` | `Go` |
| `Dockerfile` | `Docker` |
| `.github/workflows/` | `GitHub Actions` (only if it's a meaningful part of the story) |

Always verify by reading the actual file — manifests can lie.

## Period derivation commands

```bash
# First commit month
git -C "$TMP/repo" log --reverse --format=%cs | head -1 | cut -c1-7

# Last commit month
git -C "$TMP/repo" log -1 --format=%cs | cut -c1-7

# Days since last commit (decide present vs YYYY-MM)
LAST=$(git -C "$TMP/repo" log -1 --format=%ct)
NOW=$(date +%s)
echo $(( (NOW - LAST) / 86400 ))
```

If the day-difference is ≤ 60, set `period.end: "present"`. Otherwise use the
last-commit month.

## Reference: existing entries

Before writing prose, read 2 of these for voice:

- `src/content/projects/personal/wallapop-finder-bot.md`
- `src/content/projects/personal/magic-tokens.md`
- `src/content/projects/personal/steamfolio-load.md`
