# Data Model: Portfolio Showcase Site

**Feature**: Portfolio Showcase Site (`001-portfolio-showcase`)  
**Date**: 2026-04-17

This site has no runtime database. All "data" is filesystem content authored as Markdown, validated at build time by Zod schemas defined in `src/content/config.ts`. The model below is the canonical contract for project content.

---

## Entity: Project

Represents a single project displayed in the portfolio. Stored as a Markdown file under `src/content/projects/<category>/<slug>.md`.

### Frontmatter Fields

| Field         | Type                                | Required | Default | Description                                                                 |
|---------------|-------------------------------------|----------|---------|-----------------------------------------------------------------------------|
| `title`       | string (1–80 chars)                 | yes      | —       | Display name of the project.                                                |
| `description` | string (1–240 chars)                | yes      | —       | One-line summary shown on cards and meta description.                       |
| `slug`        | string (kebab-case, `^[a-z0-9-]+$`) | no       | filename | URL slug; defaults to the filename without extension. Must be globally unique across all categories. |
| `role`        | string (1–80 chars)                 | yes      | —       | The author's role on the project (e.g., "Lead Engineer", "Founder").        |
| `period`      | object `{ start: YYYY-MM, end: YYYY-MM \| "present" }` | yes | — | Time period during which the project was active.                            |
| `techStack`   | string[] (1–20 items)               | yes      | —       | Technologies, frameworks, languages used. Each item 1–30 chars.             |
| `thumbnail`   | string (relative path)              | yes      | —       | Path under `public/projects/<slug>/` to the card thumbnail image.           |
| `screenshots` | string[] (0–10 items)               | no       | `[]`    | Additional images shown on the detail page. Paths relative to `public/`.    |
| `links`       | object (see below)                  | no       | `{}`    | Optional external URLs.                                                     |
| `featured`    | boolean                             | no       | `false` | Whether to surface on the landing page hero/featured section.               |
| `order`       | integer (≥ 0)                       | no       | `100`   | Sort order within a category (lower = earlier). Ties broken by `period.start` desc. |
| `draft`       | boolean                             | no       | `false` | If `true`, project is excluded from production builds.                      |

### `links` Sub-Object

| Field       | Type   | Required | Description                                       |
|-------------|--------|----------|---------------------------------------------------|
| `source`    | URL    | no       | Source code repository (GitHub, GitLab, etc.).    |
| `live`      | URL    | no       | Live demo / production URL.                       |
| `caseStudy` | URL    | no       | Long-form write-up (blog post, PDF, etc.).        |

### Body

Markdown body of the file. Rendered on the project detail page beneath the metadata header. May be empty (renders a "No description provided." note per Edge Case in the spec).

### Validation Rules

- **VR-1**: All required fields MUST be present and non-empty. Missing fields cause a build failure with the file path and field name.
- **VR-2**: `slug` MUST match `^[a-z0-9-]+$` and MUST be globally unique across all three category collections.
- **VR-3**: `period.end` MUST be either the literal string `"present"` or a `YYYY-MM` string ≥ `period.start`.
- **VR-4**: `thumbnail` and each `screenshots[]` path MUST resolve to an existing file under `public/`.
- **VR-5**: All `links.*` URLs MUST be valid absolute URLs (`https://` or `http://`).
- **VR-6**: `techStack` MUST contain at least one entry.
- **VR-7**: When `draft: true`, the project is loaded only in `dev` mode and excluded from `astro build`.

### Derived Fields (computed, not authored)

| Field        | Source                                 | Use                                        |
|--------------|----------------------------------------|--------------------------------------------|
| `category`   | parent directory name                  | Filter, badge label, category page routing.|
| `url`        | `/projects/${slug}/`                   | Internal links from cards.                 |
| `body`       | Markdown content (rendered as HTML)    | Detail page body.                          |
| `readingTime`| Computed from body word count          | Optional badge on detail page.             |

---

## Entity: Category

A fixed enumeration. Not user-defined.

| Value      | Display Label | Path                  |
|------------|--------------|-----------------------|
| `personal` | Personal      | `/category/personal/` |
| `startup`  | Startup       | `/category/startup/`  |
| `corporate`| Corporate     | `/category/corporate/`|

### Rules

- **CR-1**: The set of categories is closed; adding a new one requires a code change (new content collection + nav update).
- **CR-2**: Each category page lists projects from its corresponding collection, sorted by (`order` asc, `period.start` desc).
- **CR-3**: An empty category renders an empty-state component (per US1, scenario 4).

---

## Relationships

```text
Category (1) ─── (N) Project
   │
   └── filesystem mapping: src/content/projects/<category>/*.md
```

- A Project belongs to exactly one Category (its parent directory).
- A Project may be `featured`, in which case it also surfaces on the landing page hero/featured grid.

---

## State Transitions

The model has minimal state. The only transition is the **draft → published** lifecycle, controlled by the `draft` boolean:

```text
[draft: true]  ──remove `draft` or set false──▶  [published]
```

- `draft: true` projects are visible in `npm run dev` (for preview) but excluded from `npm run build`.
- No archival/deletion flag — projects are removed by deleting the Markdown file.

---

## Build-Time Invariants

The build pipeline MUST enforce:

1. Every Markdown file in `src/content/projects/**` validates against the schema (Zod).
2. No two projects (across all categories) share the same `slug`.
3. Every referenced image path resolves to a real file in `public/`.
4. The total number of projects is logged at build time for monitoring growth.

A violation of any invariant fails the build with a clear message identifying the file, field, and rule (FR-012).
