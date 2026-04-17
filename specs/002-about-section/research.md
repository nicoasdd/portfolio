# Research: About Section

**Feature**: About Section (`002-about-section`)  
**Date**: 2026-04-17  
**Purpose**: Resolve all technology choices and architectural unknowns before design.

This feature is an additive extension of the existing portfolio site (see `specs/001-portfolio-showcase/research.md` for the foundational decisions). The research below covers only items specific to the About section. No `NEEDS CLARIFICATION` markers remain in `spec.md`; the assumptions documented in the spec are validated and adopted.

---

## R1. Content Modeling — Single-Entry Collection

**Decision**: Create a new Astro Content Collection named `about` at `src/content/about/`, configured via `glob`-loader to match `**/*.md`, expected to contain exactly one entry: `profile.md`. The collection's Zod schema enforces all required About fields. A new helper `src/lib/about.ts` exposes `getAbout()` which returns the single typed entry and throws a clear error if the count is not exactly 1.

**Rationale**:
- Matches the existing convention in `src/content.config.ts` (Markdown + Zod, file-system-as-source-of-truth, no DB).
- Astro Content Collections give us typed `getCollection`/`getEntry` access, frontmatter validation at build time, and Markdown body rendering — for free.
- A single-entry collection scales naturally if we ever want to add per-language profiles (e.g. `profile.es.md`) without a schema change.
- Build-time enforcement of "exactly one entry" prevents silent ambiguity.

**Alternatives considered**:
- **JSON/YAML config file** (e.g. `src/content/about.json`): No long-form Markdown body, awkward for the bio. Rejected.
- **Hardcoded constants in a TS file**: Violates Constitution Principle IV (Content-Driven Architecture). Rejected.
- **`type: 'data'` collection (data-only, no body)**: Loses Markdown rendering for the bio. Rejected.

---

## R2. Skills Modeling — Flat List vs Grouped

**Decision**: For v1, `skills` is a flat array of strings (`string[]`, 1–40 items, each 1–40 chars). Grouping (e.g. `Languages`, `Frameworks`, `Tools`) is **deferred to v1.1** — the schema will not preclude a future migration to a tagged-object form because the helper layer will be the only consumer.

**Rationale**:
- Matches the simplicity of the existing `techStack` field on projects (which is also a flat string array).
- Keeps the v1 template trivial to fill in.
- A flat list renders cleanly as a chip cloud, which is the most common pattern recruiters scan first.
- Grouping adds template complexity; we can introduce it without breaking changes by accepting either `string` or `{ category: string, items: string[] }` later.

**Alternatives considered**:
- **Grouped from day one**: Premature; the spec does not require it. Rejected.
- **Free-form Markdown skills section in the body**: Loses structured rendering and prevents skill-aware UI affordances (e.g. filtering or icons). Rejected.

---

## R3. Social Links Modeling

**Decision**: `socialLinks` is an array of `{ label: string, url: string, icon?: string }` objects. The `label` is mandatory and used for both visible text and accessible name; `url` MUST be an absolute `http(s)://` URL; `icon` is optional and refers to a known identifier (e.g. `github`, `linkedin`, `x`, `mastodon`, `website`) that the `SocialLinks` component maps to an inline SVG. Unknown icons fall back to a generic link glyph.

**Rationale**:
- Object form (not just URL strings) keeps the rendered link self-describing without forcing the component to parse hostnames.
- `icon` is optional so the owner can add platforms we haven't pre-built icons for and still get a working link.
- All external links rendered with `target="_blank" rel="noopener noreferrer"` per FR-008.

**Alternatives considered**:
- **Map of `{ platform: url }`**: Constrains to a closed set of platforms. Rejected (less extensible).
- **Free-form Markdown links in the body**: Loses structured rendering for the dedicated Social/Contact section. Rejected.

---

## R4. Profile Photo Handling

**Decision**: Profile photo is referenced by frontmatter field `photo`, a path relative to `public/` (matching the convention used by `thumbnail` on projects). The `about.astro` page renders it via `astro:assets` `<Image>` for responsive WebP/AVIF and `loading="eager"` (above-the-fold). The `AboutTeaser` uses a smaller variant via the same pipeline. Alt text is derived from `photoAlt` (optional frontmatter); if absent, the helper synthesizes `"Portrait of {name}"` to guarantee meaningful alt text per Principle V.

**Rationale**:
- Reuses the existing image optimization pipeline — no new dependencies, and Lighthouse rewards modern formats automatically.
- `loading="eager"` is correct for the LCP element on `/about/` to avoid slowing down LCP.
- A synthesized alt text fallback is an accessibility safety net rather than a license to omit it; the template encourages explicit `photoAlt`.

**Alternatives considered**:
- **External avatar service (Gravatar)**: Adds runtime dependency and tracking concerns. Rejected.
- **No image / initials placeholder only**: Reduces the personal connection the section is meant to create. Rejected as a default; supported only as a graceful fallback when the photo file is missing (per the spec's edge case).

---

## R5. Resume / CV Distribution

**Decision**: `resumeUrl` is an optional frontmatter string. It accepts either an absolute URL (e.g. linking to a hosted CV) or a path relative to `public/` (e.g. `/about/resume.pdf`). The `about.astro` page renders a "Download CV" link only when `resumeUrl` is present. The template recommends checking the PDF into `public/about/resume.pdf` for reliability (no broken external links).

**Rationale**:
- Keeps content management entirely in-repo for owners who prefer that, while supporting third-party hosting (e.g. Read.cv, LinkedIn) for owners who want a single source of truth elsewhere.
- A missing field gracefully omits the link — no broken state (FR-011).
- File-in-repo is the recommended path because it's covered by the same deploy lifecycle.

**Alternatives considered**:
- **Always external link**: Forces the owner to host elsewhere; couples portfolio updates to a third-party. Rejected.
- **Generate the CV from the About content itself**: Scope creep beyond v1; the Markdown body is not structured enough to produce a reliable CV layout. Rejected.

---

## R6. Landing-Page Teaser

**Decision**: A new `AboutTeaser.astro` component is appended to the landing page (`src/pages/index.astro`) below the existing `ProjectGrid`. It renders the profile photo, the owner's `name`, `headline`, the dedicated `intro` field (a short single-paragraph teaser, max ~200 chars), and a "Read more" link to `/about/`. The component does **not** truncate the long-form bio body — `intro` is an explicit, separately authored field, which avoids the brittle truncation logic flagged as an edge case in the spec.

**Rationale**:
- Explicit `intro` field gives the owner full control over the teaser copy (no auto-generated fragments).
- Keeps the landing page lightweight (no large body parsing or rendering).
- Matches the spec's edge case requirement: "show only a truncated intro… not the full bio".

**Alternatives considered**:
- **Auto-truncate the body to N characters**: Risks awkward word breaks and HTML mid-tag cuts. Rejected.
- **Use the first paragraph of the body**: Couples teaser copy to the bio's structure (a refactor of the bio could silently change the teaser). Rejected.

---

## R7. Navigation Update

**Decision**: Add a single "About" link to the primary nav in `src/components/SiteHeader.astro`, positioned after "Home" and before the category links. The link uses `withBase('/about/')` and the same `isActive` logic as existing nav items so that the link is visually marked as the current page when on `/about/`.

**Rationale**:
- Honors the "About link visible from every page" requirement (FR-002) and SC-001 ("≤1 click from any page").
- Reuses the existing nav pattern — no new layout primitives.
- Placement before category links groups "people pages" (Home, About) on the left and "content categories" on the right.

**Alternatives considered**:
- **Footer-only About link**: Lower discoverability — recruiters scanning header nav would miss it. Rejected.
- **About as a side-drawer**: Adds JS/UX complexity unjustified for a single page. Rejected.

---

## R8. Build-Time Validation

**Decision**: Extend `src/integrations/content-validator.ts` to additionally:
1. Assert that exactly one `*.md` file exists under `src/content/about/`.
2. Parse its frontmatter and assert that the **required** fields (`name`, `headline`, `photo`, `email`, `skills` non-empty) are present and non-empty.
3. If `photo` is set, register the path with the existing missing-image check.

The Zod schema in `src/content.config.ts` is the authoritative validator; the integration provides a fast, file-system-level pre-check that fails the build with a clear path before Astro's collection loader runs.

**Rationale**:
- A missing `src/content/about/profile.md` should not produce a cryptic "collection has no entries" error — the integration catches it first with a friendly message (Edge Case + FR-006).
- Mirrors the existing pattern used to catch slug collisions in projects.

**Alternatives considered**:
- **Zod-only validation**: Sufficient for content errors but produces a less clear message when the file is missing entirely. Rejected as the sole mechanism.

---

## R9. Routing & URL

**Decision**: The About page is served at `/about/` via a static Astro page at `src/pages/about.astro` (with `trailingSlash: 'always'` per the existing `astro.config.mjs`). No dynamic routing — there is exactly one About page.

**Rationale**:
- Conventional URL recruiters expect.
- Matches the rest of the site's trailing-slash style.
- `pages/about.astro` is the simplest possible page — no `getStaticPaths`, no params.

**Alternatives considered**:
- **`/me/`, `/bio/`, `/who/`**: Less discoverable; "about" is the universal convention. Rejected.

---

## R10. Testing & Quality Gates

**Decision**:
- **Unit (Vitest)** — `tests/unit/about.test.ts` validates: schema accepts a complete fixture; schema rejects fixtures missing each required field; `getAbout()` helper returns a typed object; `getAbout()` throws when zero or multiple entries are found.
- **E2E (Playwright)** — `tests/e2e/about.spec.ts` covers: `/about/` loads with name, headline, photo, bio, skills, social links, and contact email; clicking the email link triggers `mailto:`; external social links open in a new tab with `rel="noopener noreferrer"`; the landing page teaser is present and the "Read more" link navigates to `/about/`; the About link in the header is `aria-current="page"` when on `/about/`.
- **Accessibility** — extend `tests/e2e/a11y.spec.ts` to include `/about/` in its axe-core sweep.
- **Responsive** — extend `tests/e2e/responsive.spec.ts` to include `/about/` at 320, 768, 1280 viewports.
- **Performance** — add `/about/` to `lighthouserc.json` URL list so the existing budgets (Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95, LCP < 2.5s) apply.

**Rationale**: Reuses the established test pyramid — no new tooling. Each acceptance scenario in the spec has at least one test.

---

## Summary

All technical context items resolved — no `NEEDS CLARIFICATION` markers remain. Ready to proceed to Phase 1 (Design & Contracts).
