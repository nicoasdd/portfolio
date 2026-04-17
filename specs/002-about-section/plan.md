# Implementation Plan: About Section

**Branch**: `002-about-section` | **Date**: 2026-04-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-about-section/spec.md`

## Summary

Add a dedicated About page (`/about/`) and a landing-page teaser so potential clients and recruiters can quickly understand who the portfolio owner is, what they do, and how to reach them. Content is authored in a single Markdown file (`src/content/about/profile.md`) following the existing content-driven architecture: structured frontmatter (name, headline, photo, contact, social links, skills, optional resume) plus a long-form Markdown body for the bio. The About link is added to the primary navigation; an `AboutTeaser` component is added to the landing page. All work is built on the existing Astro 5 + Tailwind CSS 4 stack, validated at build time by a new Zod schema and the existing content-validator integration, and deployed via the same GitHub Pages workflow — no new runtime dependencies, no new infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20 LTS) — same as existing project  
**Primary Dependencies**: Astro 5.x, Tailwind CSS 4.x (via `@tailwindcss/vite`), Astro Content Collections (Markdown + Zod), `@astrojs/sitemap`. No new runtime dependencies introduced by this feature.  
**Storage**: Filesystem — single Markdown file at `src/content/about/profile.md`; profile photo and optional resume PDF under `public/about/`.  
**Testing**: Vitest for schema/unit tests; Playwright + `axe-core/playwright` for e2e + accessibility against `/about/` and the landing page teaser; Lighthouse CI extended to assert the About page meets the same performance/accessibility budgets as the rest of the site.  
**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge — last 2 versions); statically generated HTML/CSS/JS deployed to GitHub Pages.  
**Project Type**: Static web application (single project, no backend) — extension of existing portfolio app.  
**Performance Goals**: Lighthouse Performance ≥ 90 (mobile) on `/about/`, LCP < 2.5s on 3G, profile photo < 80 KB after responsive `astro:assets` optimization.  
**Constraints**: No server-side runtime; no contact form / no backend; no tracking; respect `prefers-reduced-motion`; WCAG 2.1 AA on `/about/`; build MUST fail if the About content file is missing or invalid; external links open in a new tab with `rel="noopener noreferrer"`.  
**Scale/Scope**: Exactly 1 About profile (single-entry collection); 1 new page (`/about/`); 1 landing-page section addition; ~3 new components (`AboutTeaser`, `SocialLinks`, `SkillsList`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|-----------|-------|
| I. Showcase-First Design | PASS | About complements the showcase by humanizing the projects. The page itself is visually consistent with project pages (hero-style header with photo, structured sections). Two-click navigation preserved: any page → About link in header → `/about/`. |
| II. Project Categorization | PASS (N/A) | About is not a project; the three project categories remain unchanged. About lives at a flat URL (`/about/`), parallel to category pages, and does not affect the project taxonomy. |
| III. Static-Site Performance | PASS | Pure static output; profile photo optimized via `astro:assets` (WebP/AVIF + responsive `srcset`); no client-side JS required for rendering (a small inline script is reused for header mobile-nav only); Lighthouse CI budget extended to `/about/`. |
| IV. Content-Driven Architecture | PASS | All About content authored in a single Markdown file with Zod-validated frontmatter via Astro Content Collections; updates require editing only the content file. No hardcoded copy in components. The build-time content validator is extended to assert presence/validity of the About entry. |
| V. Responsive & Accessible | PASS | Tailwind responsive utilities for 320/768/1280+; semantic HTML (`<main>`, `<section>`, `<h1>`, `<address>` for contact); profile photo has meaningful alt text; all links keyboard-navigable; axe-core scan added for `/about/`. |
| VI. Visual Polish & Consistency | PASS | Reuses existing design tokens (`--color-bg`, `--color-text`, `--color-accent`, `--color-border`), typography scale, container widths (`container-narrow`), and component patterns (`SiteHeader`, `BaseLayout`, badge-style "skill" chips mirroring `TechStack`). No new motion. |

**Result**: PASS — no violations. Complexity Tracking section intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/002-about-section/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── about-frontmatter.schema.json   # JSON-schema mirror of the Zod schema
│   └── about-template.md               # Starter Markdown template for the owner
└── checklists/
    └── requirements.md  # Spec quality checklist (already exists)
```

### Source Code (repository root)

```text
.
├── astro.config.mjs                          # unchanged
├── src/
│   ├── content.config.ts                     # +about collection (single-entry) + Zod schema
│   ├── content/
│   │   └── about/
│   │       └── profile.md                    # NEW — sole About entry (frontmatter + bio body)
│   ├── components/
│   │   ├── SiteHeader.astro                  # MODIFIED — add "About" nav link
│   │   ├── AboutTeaser.astro                 # NEW — landing-page teaser block
│   │   ├── SocialLinks.astro                 # NEW — renders socialLinks[]
│   │   └── SkillsList.astro                  # NEW — renders skills[] as chips
│   ├── layouts/
│   │   └── BaseLayout.astro                  # unchanged (already supports any page)
│   ├── pages/
│   │   ├── index.astro                       # MODIFIED — render <AboutTeaser />
│   │   └── about.astro                       # NEW — full About page
│   ├── lib/
│   │   └── about.ts                          # NEW — typed helper to load+validate the single About entry
│   └── integrations/
│       └── content-validator.ts              # MODIFIED — assert About entry exists & required fields present
├── public/
│   └── about/
│       ├── profile.webp                      # NEW — owner's photo (source asset)
│       └── resume.pdf                        # OPTIONAL — owner's CV
├── templates/
│   └── about.md                              # NEW — copy-this template for the About content (mirrors contracts/)
├── tests/
│   ├── unit/
│   │   └── about.test.ts                     # NEW — Zod schema + helper round-trip tests
│   └── e2e/
│       ├── about.spec.ts                     # NEW — about page renders, contact links work, teaser links to /about/
│       ├── a11y.spec.ts                      # MODIFIED — add /about/ to axe scan list
│       └── responsive.spec.ts                # MODIFIED — add /about/ to viewport matrix
├── lighthouserc.json                         # MODIFIED — add /about/ to URL list
└── README.md                                 # MODIFIED — add "Edit your About page" section + link to template
```

**Structure Decision**: Single-project static web app — extension of `001-portfolio-showcase`. The About content is modeled as a **single-entry Astro Content Collection** at `src/content/about/` (matching the existing per-category collections in `src/content/projects/`). This preserves the directory-as-source-of-truth convention, lets us reuse the same Zod-based validation pattern, and keeps the schema self-documenting. A dedicated `lib/about.ts` helper centralizes the "load the one About entry, throw if missing" logic so both `pages/about.astro` and `components/AboutTeaser.astro` consume a typed, validated object. The `content-validator` integration is extended to fail the build early (rather than letting `getEntry` throw downstream) when the About content file is missing or required frontmatter is absent — directly enforcing FR-006 and the Edge Case for a missing About file.

## Complexity Tracking

> No constitution violations — this section intentionally left empty.
