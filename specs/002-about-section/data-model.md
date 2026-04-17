# Data Model: About Section

**Feature**: About Section (`002-about-section`)  
**Date**: 2026-04-17

This feature has no runtime database. The About content is filesystem content authored as a single Markdown file, validated at build time by a Zod schema declared in `src/content.config.ts`. The model below is the canonical contract for About content.

---

## Entity: About Profile

Represents the portfolio owner. Stored as **exactly one** Markdown file at `src/content/about/profile.md`. Loaded via the `about` content collection and accessed through `src/lib/about.ts`'s `getAbout()` helper.

### Frontmatter Fields

| Field          | Type                                              | Required | Default        | Description                                                                                                                |
|----------------|---------------------------------------------------|----------|----------------|----------------------------------------------------------------------------------------------------------------------------|
| `name`         | string (1–80 chars)                               | yes      | —              | Owner's display name (e.g., "Nicolas Tambussi").                                                                           |
| `headline`     | string (1–120 chars)                              | yes      | —              | Professional title / one-line tagline (e.g., "Senior Frontend Engineer & Product Builder").                                |
| `intro`        | string (1–240 chars)                              | yes      | —              | Short single-paragraph teaser used on the landing page `AboutTeaser`. Authored separately from the long-form bio body.     |
| `photo`        | string (path under `public/`)                     | yes      | —              | Profile photo path (e.g., `/about/profile.webp`). Resolved by `astro:assets` for responsive variants.                      |
| `photoAlt`     | string (1–160 chars)                              | no       | `Portrait of {name}` | Alt text for the profile photo. If omitted, the helper synthesizes `Portrait of {name}` so the image is never unlabeled. |
| `email`        | string (valid email)                              | yes      | —              | Contact email. Rendered as a `mailto:` link.                                                                               |
| `location`     | string (1–80 chars)                               | no       | —              | Optional location (e.g., "Buenos Aires, Argentina" or "Remote").                                                           |
| `availability` | string (1–120 chars)                              | no       | —              | Optional status (e.g., "Open to opportunities", "Currently at $Company"). Rendered as a small status badge when present.   |
| `skills`       | string[] (1–40 items, each 1–40 chars)            | yes      | —              | Areas of expertise rendered as chips (e.g., "TypeScript", "Astro", "UX Design").                                           |
| `socialLinks`  | object[] (0–10 items, see sub-schema below)       | no       | `[]`           | Social/professional profile links.                                                                                         |
| `resumeUrl`    | string (absolute URL **or** path under `public/`) | no       | —              | Resume/CV link. When absent, no download button is rendered.                                                               |

### `socialLinks[]` Sub-Object

| Field   | Type                                | Required | Description                                                                                                            |
|---------|-------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------|
| `label` | string (1–40 chars)                 | yes      | Visible link text and accessible name (e.g., "LinkedIn", "GitHub").                                                    |
| `url`   | string (absolute `http(s)://` URL)  | yes      | Destination URL.                                                                                                       |
| `icon`  | string (known identifier)           | no       | Icon hint: one of `github`, `linkedin`, `x`, `mastodon`, `bluesky`, `email`, `website`, or omitted for a generic link. |

### Body

Markdown body of `profile.md`. Rendered on `/about/` beneath the metadata header as the long-form bio. May be multi-paragraph and use standard Markdown (headings, bold/italic, lists, links). Empty body is not allowed (the bio is the heart of the About page); the build fails with a clear message if the body is empty.

### Validation Rules

- **VR-1**: All required fields MUST be present and non-empty. Missing fields cause a build failure identifying the field name.
- **VR-2**: `email` MUST match a basic email pattern (Zod's `z.string().email()`).
- **VR-3**: `photo` MUST resolve to an existing file under `public/`. The build emits a warning (matching the existing project-image behavior) if missing; the `about.astro` page renders a neutral placeholder avatar when the file is absent at runtime.
- **VR-4**: Each `socialLinks[].url` MUST be an absolute `http://` or `https://` URL.
- **VR-5**: `resumeUrl`, if set, MUST be either an absolute URL **or** a path that begins with `/` (treated as relative to `public/`).
- **VR-6**: `skills` MUST contain at least one entry; duplicates are not enforced but a warning is logged for visibility.
- **VR-7**: The Markdown body MUST be non-empty (≥ 1 non-whitespace character) — enforced by the `getAbout()` helper after collection load.
- **VR-8**: The `about` collection MUST contain exactly one entry. Zero entries fails the build with "About content is required at src/content/about/profile.md"; multiple entries fails with the list of conflicting paths.

### Derived Fields (computed, not authored)

| Field         | Source                                          | Use                                                                |
|---------------|-------------------------------------------------|--------------------------------------------------------------------|
| `effectiveAlt`| `photoAlt ?? "Portrait of " + name`             | Always-present alt text passed to `<Image>`.                       |
| `body`        | Markdown content rendered as HTML               | Long-form bio on `/about/`.                                        |
| `resumeHref`  | `resumeUrl` resolved through `withBase()` if relative | Final `href` for the "Download CV" link, base-path-aware.    |

---

## Entity: Social Link

A labeled external link surfaced on the About page (and re-usable in the footer if desired in v1.1).

| Field   | Type   | Required | Description                                                  |
|---------|--------|----------|--------------------------------------------------------------|
| `label` | string | yes      | Visible link text + accessible name.                         |
| `url`   | string | yes      | Absolute http(s) URL.                                        |
| `icon`  | string | no       | Icon identifier; falls back to a generic link glyph if unknown. |

### Rules

- **SL-1**: Rendered as `<a href={url} target="_blank" rel="noopener noreferrer">` with the icon inline-SVG and `<span>{label}</span>`.
- **SL-2**: When `icon` is absent or unknown, a generic external-link icon is used — the link still works, just without brand iconography.

---

## Entity: Skill

A short label representing an area of expertise.

| Field  | Type   | Required | Description                                  |
|--------|--------|----------|----------------------------------------------|
| value  | string | yes      | The skill label (1–40 chars), e.g. "Astro". |

### Rules

- **SK-1**: Rendered as a chip identical in style to the existing `TechStack` chips (visual consistency per Principle VI).
- **SK-2**: Order in the rendered list preserves the order in the frontmatter array (the owner curates priority).

---

## Relationships

```text
About Profile (1) ─── (0..N) Social Link
About Profile (1) ─── (1..N) Skill
About Profile (1) ─── (0..1) Resume (file in public/about/ OR external URL)
```

The About entity is **standalone** — it has no relationship to Project entities. The landing page composes both via separate components (`ProjectGrid`, `AboutTeaser`); they do not share data.

---

## State Transitions

The model has no lifecycle state. Updates are made by editing `src/content/about/profile.md` directly. There is no `draft` flag (unlike Project) because the About page is always required to be published for the site to be complete.

```text
[edit profile.md] ──commit & push──▶ [build & deploy] ──▶ [updated About page live]
```

---

## Build-Time Invariants

The build pipeline MUST enforce:

1. Exactly one Markdown file exists under `src/content/about/`.
2. That file's frontmatter validates against the Zod schema (all required fields present, types correct, constraints met).
3. The Markdown body is non-empty.
4. `photo`, if it points under `public/`, resolves to a real file (warning-level, mirrors existing behavior for project images).
5. All `socialLinks[].url` and any external `resumeUrl` are syntactically valid absolute URLs.

A violation of invariants 1–3 fails the build with a clear message identifying the file, field, and rule (FR-006). Invariant 4 logs a warning consistent with the existing project-image behavior.
