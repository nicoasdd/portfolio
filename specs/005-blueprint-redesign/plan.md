# Implementation Plan: Blueprint Portfolio Redesign

**Branch**: `005-blueprint-redesign` | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-blueprint-redesign/spec.md`

## Summary

Replace the current light/purple portfolio theme with a cohesive navy/cyan "blueprint" visual system across every existing route — Home, the three category pages, About, and all project detail pages — while preserving 100 % of current URLs, Markdown content, content-collection schemas, and build pipeline. The redesign ships a new design token system (dark + light variants), a restyled sticky header/footer, a new hero + credibility-strip + featured-grid on Home, category heroes with filter chips and a featured-card pattern that foregrounds metrics and architecture diagrams, and an About page built around identity + availability + values + a process banner. No new runtime dependencies are introduced. All new per-project "featured" data (metrics panel, challenge/built/impact bullets, architecture diagram) lives behind **optional** content-collection fields so every existing project continues to validate untouched.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (pinned in `.nvmrc`, matches existing project)
**Primary Dependencies**: Astro 5.x, Tailwind CSS 4.x (via `@tailwindcss/vite`), Astro Content Collections + Zod, `@astrojs/sitemap`. No new runtime dependencies.
**Storage**: Filesystem — all content in `src/content/` as Markdown validated by Zod schemas in `src/content.config.ts`; theme preference in browser `localStorage` under a single key.
**Testing**: Vitest (unit), Playwright (e2e), `@axe-core/playwright` (a11y), `@lhci/cli` (Lighthouse) — all already configured in the project.
**Target Platform**: Static HTML/CSS/JS bundle deployed to GitHub Pages. Must render without horizontal scroll at 320px / 768px / 1024px / 1440px viewports. Must honor `prefers-color-scheme` and `prefers-reduced-motion`.
**Project Type**: Single Astro project (web-app) with content-driven pages; no backend.
**Performance Goals**: Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on a mid-tier mobile profile for the home page (spec SC-006); LCP < 2.5 s on a simulated mid-tier mobile connection (FR-040); theme toggle completes visually in < 100 ms (SC-007).
**Constraints**: Zero new runtime dependencies. No change to existing content files or content-collection slugs. No change to `/`, `/about/`, `/category/<slug>/`, `/projects/<slug>/` URL shapes. WCAG 2.1 AA in both themes. Reduced-motion compliant. Build output must remain pure static (no SSR).
**Scale/Scope**: 44 existing project Markdown files across 3 categories, 1 about profile, 5 existing routes. Feature touches ~15 existing components and adds ~12 new blueprint-specific components. Estimated 30–45 tasks in Phase 2.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The repository constitution (`.specify/memory/constitution.md` v1.0.0) is evaluated in full:

| Principle | Status | Evidence in this plan |
|-----------|--------|-----------------------|
| I. Showcase-First Design | ✅ Pass | Entire feature is a visual upgrade of hero, cards, and detail pages. Nav remains ≤ 2 clicks to any project (sticky header → card link). |
| II. Project Categorization | ✅ Pass | Personal / Startup / Corporate are preserved and made more visually distinct (cyan caps tag + filter chip row). Metadata schema is unchanged except for *additive, optional* fields. |
| III. Static-Site Performance | ✅ Pass | No new runtime deps. Still pure static Astro build. Lighthouse ≥ 90 mobile target explicitly enforced in spec SC-006 and re-asserted below. Illustrations ship as inline SVG (no raster downloads). |
| IV. Content-Driven Architecture | ✅ Pass | All new per-project data (metrics tiles, challenge/built/impact, architecture snippet) and all new About-page data (availability pills, value cards, process steps) live in Markdown + Zod-validated frontmatter. Adding or editing these never requires touching a component. |
| V. Responsive & Accessible | ✅ Pass | Spec enumerates the four breakpoints, WCAG AA contrast, keyboard nav with visible 2 px focus ring, reduced-motion branch, and decorative-SVG `aria-hidden`. Phase 1 quickstart includes an axe-core run in both themes. |
| VI. Visual Polish & Consistency | ✅ Pass | The feature *is* a design token system: `--bp-*` CSS variables wired through Tailwind 4's `@theme` block, two theme variants, and a recommended theme toggle (spec US5, P3). |

**Gate outcome**: **PASS** — no violations to track in Complexity Tracking. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/005-blueprint-redesign/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature spec (/speckit.specify output)
├── research.md          # Phase 0 output — decisions & rationale
├── data-model.md        # Phase 1 output — schema deltas & entities
├── quickstart.md        # Phase 1 output — build/run/verify steps
├── contracts/
│   ├── design-tokens.md     # Named token contract (colors, spacing, type)
│   ├── route-contract.md    # URL/route invariants this feature must preserve
│   └── content-schema.md    # New *optional* content collection fields
├── assets/
│   ├── home-blueprint.png
│   ├── personal-projects-blueprint.png
│   └── about-blueprint.png
└── checklists/
    └── requirements.md   # Spec quality checklist (already green)
```

### Source Code (repository root)

```text
src/
├── content/
│   ├── about/
│   │   └── profile.md                # Existing — gains OPTIONAL pills/values/process fields
│   ├── projects/
│   │   ├── personal/*.md             # Existing (16) — untouched
│   │   ├── startup/*.md              # Existing (11) — untouched
│   │   └── corporate/*.md            # Existing (3) — untouched; may opt into new optional metrics/impact fields
│   └── site/                         # NEW collection (single document)
│       └── site.md                   # Credibility strip items + systems strip groups (home & category)
├── content.config.ts                 # Extend about + project schemas with OPTIONAL fields; register `site` collection
├── lib/
│   ├── about.ts                      # Existing — extend to expose new optional fields
│   ├── projects.ts                   # Existing — unchanged
│   ├── site.ts                       # NEW — load credibility strip + systems strip
│   └── theme.ts                      # NEW — pre-hydration theme resolution helpers
├── styles/
│   └── global.css                    # Rewrite @theme block with --bp-* tokens for dark + light
├── components/
│   ├── blueprint/                    # NEW — shared blueprint primitives
│   │   ├── CornerFrame.astro         # Dashed L-tick frame around any child
│   │   ├── IndexNumber.astro         # Monospace zero-padded index label
│   │   ├── PillChip.astro            # Outlined cyan pill (used for tech, filters, skills)
│   │   ├── IconChip.astro            # Icon + label chip (credibility strip, availability)
│   │   ├── MetricTile.astro          # Single metric tile for 3-tile panel
│   │   ├── MetricPanel.astro         # Composes 3 MetricTiles
│   │   ├── SparklineGlyph.astro      # Inline static SVG sparkline
│   │   ├── ArchitectureStrip.astro   # Horizontal blueprint flow diagram
│   │   ├── IsoIllustration.astro     # Inline isometric SVG (variant: home|category|about)
│   │   └── SystemsStrip.astro        # Footer 4-group systems bar
│   ├── SiteHeader.astro              # Rewrite — sticky blueprint chrome + nav + theme toggle
│   ├── SiteFooter.astro              # Rewrite — author card + SystemsStrip
│   ├── ThemeToggle.astro             # NEW — sun/moon toggle with a11y + persistence
│   ├── ProjectCard.astro             # Rewrite — compact blueprint card (home + grid)
│   ├── FeaturedProjectCard.astro     # NEW — large category-level card
│   ├── CategoryNav.astro             # Rewrite — filter chip row `[All] [Personal] [Startup] [Corporate]`
│   ├── Hero.astro                    # Rewrite — home hero (greeting + H1 + CTAs + iso illustration)
│   ├── CategoryHero.astro            # NEW — category hero (breadcrumb + H1 + sub + callout card)
│   ├── AboutHero.astro               # NEW — about hero (identity + availability pills + contact + avatar frame)
│   ├── ValueGrid.astro               # NEW — 4-up "What I care about" grid
│   ├── ProcessBanner.astro           # NEW — "Why work with me" process flow
│   ├── ElsewhereList.astro           # NEW — GitHub/LinkedIn wide cards
│   ├── CredibilityStrip.astro        # NEW — home "What I bring" icon-chip row
│   ├── ProjectScreenshots.astro      # Edit — wrap each image in CornerFrame
│   ├── SkillsList.astro              # Edit — swap to PillChip
│   ├── SocialLinks.astro             # Edit — cyan hover + focus ring
│   ├── TechStack.astro               # Edit — swap to PillChip
│   ├── CategoryBadge.astro           # Edit — cyan caps
│   ├── AboutTeaser.astro             # Edit — blueprint surface or retire (spec does not reference it)
│   └── ProjectGrid.astro             # Edit — blueprint gap + heading style
├── layouts/
│   ├── BaseLayout.astro              # Edit — inline pre-hydration theme script; update `<meta theme-color>`
│   └── ProjectLayout.astro           # Edit — blueprint prose surface + CornerFrame around screenshots
├── pages/
│   ├── index.astro                   # Rewrite — hero + credibility + featured + author
│   ├── about.astro                   # Rewrite — compose new About blocks
│   ├── category/[category].astro     # Rewrite — CategoryHero + filter chips + FeaturedProjectCard + grid
│   ├── projects/[slug].astro         # Edit — ProjectLayout already handles body; re-validate chrome
│   └── 404.astro                     # Edit — minimal blueprint treatment for consistency
└── integrations/
    └── content-validator.ts          # Edit — extend validation to cover new optional fields (no hard errors on absence)

tests/
├── unit/
│   ├── theme.test.ts                 # NEW — theme resolution helpers
│   ├── content-schema.test.ts        # Extend — new optional about + project fields
│   └── site-collection.test.ts       # NEW — site collection loader
└── e2e/
    ├── home.spec.ts                  # Extend — scan hero, credibility, featured grid
    ├── about.spec.ts                 # Extend — identity hero, values, process, skills, elsewhere
    ├── category.spec.ts              # NEW (or extend) — filter chips + featured card contract
    ├── project-detail.spec.ts        # Extend — blueprint chrome on detail pages
    ├── theme-toggle.spec.ts          # NEW — toggle flips tokens, persists across navigation
    └── a11y.spec.ts                  # Extend — axe scan on home/about/category/project in both themes

public/
├── about/                            # Existing — profile photo stays
└── blueprint/                        # NEW — isometric illustration SVGs
    ├── hero-home.svg
    ├── hero-category.svg
    └── hero-about.svg
```

**Structure Decision**: Single-project Astro layout (Option 1), matching the existing repository shape. No `backend/` or separate `frontend/` split is introduced. New blueprint primitives are colocated under `src/components/blueprint/` so the blueprint design system is clearly bounded and reusable, without polluting the existing component root. A new `site` content collection is added for landing-page rails (credibility strip items, systems strip groups) so every label is editable without code changes — honoring the Content-Driven Architecture principle. Optional per-project fields for metrics and challenge/built/impact live inside the existing `projectSchema`, preserving every existing file byte-for-byte.

## Constitution Check — Post-Design Re-Evaluation

*Gate re-check after Phase 1 design artifacts (`research.md`, `data-model.md`, `contracts/*`, `quickstart.md`).*

| Principle | Status | Phase 1 evidence |
|-----------|--------|------------------|
| I. Showcase-First Design | ✅ Pass | Phase 1 components in `plan.md#Project Structure` center on `Hero`, `CategoryHero`, `AboutHero`, `FeaturedProjectCard`, `ProjectCard`. Nav depth stays ≤ 2 clicks (`contracts/route-contract.md`). |
| II. Project Categorization | ✅ Pass | `contracts/content-schema.md` keeps the three-category split; `getByCategory` is unchanged; only additive optional fields. |
| III. Static-Site Performance | ✅ Pass | `research.md` §4, §6, §10 lock in inline SVG, static polylines, system fonts, and two tiny client-side islands (`ThemeToggle`, mobile menu). `quickstart.md` §8 enforces Lighthouse ≥ 90 as Definition of Done. |
| IV. Content-Driven Architecture | ✅ Pass | Every new user-visible string or icon (credibility strip, systems strip, availability pills, values, process, architecture nodes, metrics) is sourced from Markdown frontmatter validated by Zod. New `site` collection added for landing rails; no JSON/TS constants. |
| V. Responsive & Accessible | ✅ Pass | `contracts/design-tokens.md` §6–§8 enforces four breakpoints, a mandatory `:focus-visible` declaration, and a `prefers-reduced-motion` branch. `quickstart.md` §7 wires axe-core in both themes into the e2e suite. |
| VI. Visual Polish & Consistency | ✅ Pass | `contracts/design-tokens.md` is the single source of truth for color/space/type/radius/border tokens, and every component consumes those tokens. Theme toggle is implemented as an attribute flip on `<html>` (`research.md` §2), giving instant, flicker-free theme swaps. |

**Post-design gate outcome**: **PASS** — no violations introduced by the design. No entries required in the Complexity Tracking table.

---

## Phase 2 Handoff

Phase 2 (task generation) is performed by `/speckit.tasks` and is NOT produced by this command. The task generator will derive an ordered `tasks.md` from:

- The four `contracts/*.md` files (each contract item → one or more tasks).
- `data-model.md` (each schema delta → a schema-extension task + validator task + unit test task).
- `plan.md#Project Structure` (each "NEW" or "Rewrite" file → one implementation task; each "Edit" file → one edit task).
- `quickstart.md#11` (each DoD checkbox → one verification task).

---

## Complexity Tracking

> Not required — both Constitution Checks (pre- and post-design) passed without violations.
