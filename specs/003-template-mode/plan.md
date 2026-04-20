# Implementation Plan: Template Mode

**Branch**: `003-template-mode` | **Date**: 2026-04-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-template-mode/spec.md`

## Summary

Make this repository usable as a fork-and-go portfolio template while preserving the original author's ability to maintain a personal portfolio in the same repo. Three coordinated changes:

1. A single new build-time environment variable, `HIDE_EXAMPLES` (default `false`), filters projects whose slug begins with `example-` out of the rendered site (landing grid, featured list, category pages, individual project pages, sitemap). Tests always run with `HIDE_EXAMPLES=false` so the seeded examples double as e2e fixtures with zero hand-maintained fixture set.
2. A safety net: a unit test asserts the three canonical example files exist on disk; the build-time content validator emits a clear, actionable warning with a README pointer when any are missing. A forker who deletes them gets a one-line error that names the problem instead of a stack trace.
3. A README rewrite that leads with a Quick Start (fork → Pages → first project → first deploy in under 15 minutes) and a Common Issues section that surfaces the "don't delete the examples" pitfall before any other troubleshooting topic. A dual-branch workflow guide documents how the author maintains `main` (template + examples) and `content/add-projects` (personal projects, `HIDE_EXAMPLES=true`) in parallel.

The deploy workflow is extended to honor `HIDE_EXAMPLES` (via repository variable + automatic derivation when the deploying ref is `content/add-projects`) so the dual-branch flow works out of the box without forcing forkers to edit YAML.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (already in `.nvmrc`)
**Primary Dependencies**: Astro 5.x, Tailwind CSS 4.x, `@astrojs/sitemap`, Zod (no new dependencies introduced by this feature)
**Storage**: Markdown files under `src/content/`, validated by Zod schemas in `src/content.config.ts` (no change)
**Testing**: Vitest (unit), Playwright + `@axe-core/playwright` (e2e/a11y), Lighthouse CI (perf budgets)
**Target Platform**: Static HTML/CSS/JS deployed to GitHub Pages (no runtime server)
**Project Type**: Single-project static site (Astro)
**Performance Goals**: Lighthouse mobile ≥ 90 (already enforced); no perf regression — the filter runs at build time only
**Constraints**: Zero new runtime dependencies; zero new content schema fields; the env var is the only new configuration surface
**Scale/Scope**: ~3 example projects on `main`, 0–N real projects on `content/add-projects`; README, deploy workflow, content filter, validator, and one new test file

## Constitution Check

Evaluated against `.specify/memory/constitution.md` v1.0.0.

| Principle | Verdict | Notes |
|---|---|---|
| I. Showcase-First Design | PASS | The visible site is unchanged when `HIDE_EXAMPLES=false`. When `true`, the only effect is fewer (real-author) cards — the layout, hierarchy, and visual identity are preserved. The empty-grid edge case is handled (see FR-014). |
| II. Project Categorization | PASS | The Personal/Startup/Corporate categorization is untouched. Example projects exist in all three categories so filtering them out leaves all three category pages structurally identical. |
| III. Static-Site Performance | PASS | The filter is a pure build-time predicate over a tiny in-memory list. No new runtime code paths, no new dependencies, no new asset loading. Lighthouse budgets are unchanged and re-asserted post-implementation. |
| IV. Content-Driven Architecture | PASS | Slug-prefix detection requires no schema migration and no code changes per project. Adding a real project remains "create one Markdown file." Forkers only ever touch content + config, never components. |
| V. Responsive & Accessible | PASS | No new UI surfaces. The graceful-empty-state for the featured grid (FR-014) preserves a11y semantics (no empty `<ul>`, no orphaned heading). The new "Common Issues" README anchor improves discoverability of error recovery — a usability win. |
| VI. Visual Polish & Consistency | PASS | The filter does not affect typography, spacing, color tokens, or animations. Hidden examples leave no visual trace. |

**Gate result**: PASS. No violations to justify in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-template-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output — decisions and rationale
├── data-model.md        # Phase 1 output — env var, slug marker, filter contract
├── quickstart.md        # Phase 1 output — runnable acceptance walkthrough
├── contracts/
│   └── hide-examples.contract.md   # Behavioral contract for HIDE_EXAMPLES
├── checklists/
│   └── requirements.md  # Created by /speckit.specify
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── content/
│   ├── projects/
│   │   ├── personal/example-personal.md          # Required example fixture (kept on main)
│   │   ├── startup/example-startup.md            # Required example fixture (kept on main)
│   │   └── corporate/example-corporate.md        # Required example fixture (kept on main)
│   └── about/profile.md                          # Seeded About; replaceable in-place by forkers
├── content.config.ts                             # Zod schemas (unchanged for this feature)
├── lib/
│   ├── projects.ts                               # MODIFIED: read HIDE_EXAMPLES, filter example-* slugs
│   ├── env.ts                                    # NEW: typed env-var helpers (HIDE_EXAMPLES + future flags)
│   └── examples.ts                               # NEW: canonical example-slug list + isExampleSlug()
├── integrations/
│   └── content-validator.ts                      # MODIFIED: warn-with-pointer when examples missing
├── pages/                                        # No source changes (filter is upstream in lib/)
└── styles/                                       # No changes

tests/
├── unit/
│   ├── examples.test.ts                          # NEW: required-fixtures-exist-on-disk safety net
│   └── projects.test.ts                          # MODIFIED: cover HIDE_EXAMPLES filter behavior
├── e2e/                                          # No spec changes; runs unchanged with examples visible
└── helpers/                                      # (no change)

.github/workflows/
├── deploy.yml                                    # MODIFIED: thread HIDE_EXAMPLES through to build env
└── ci.yml                                        # MODIFIED: add a "hidden-examples build smoke" step

templates/
├── project.md                                    # No change
└── about.md                                      # No change

README.md                                        # REWRITTEN: template-first; Quick Start; Common Issues
docs/
└── dual-branch-workflow.md                       # NEW: long-form author-side workflow doc (linked from README)
```

**Structure Decision**: This is a single-project Astro static site. The feature touches three thin layers (a new env helper, a new examples-marker module, the existing project loader) plus documentation and CI plumbing. No new packages, no monorepo split, no runtime code paths. The new `src/lib/env.ts` is a deliberate seam so future flags don't get scattered across `import.meta.env` reads — the surface stays disciplined.

## Phase 0 — Outline & Research

**Output**: [research.md](./research.md)

Resolved unknowns and locked decisions:

- **Detection mechanism**: slug-prefix `example-` (no schema change) over a `isExample: boolean` frontmatter field. Rationale: zero migration cost, zero per-file authoring overhead, matches the slugs the e2e suite already asserts against.
- **Env var read site**: `process.env.HIDE_EXAMPLES` via a single typed helper in `src/lib/env.ts`. Rationale: Astro builds run in Node, `process.env` is reliably populated by `astro build`; using `import.meta.env` would require a `PUBLIC_` prefix and leak the flag to client bundles, which is unwanted.
- **Where to apply the filter**: at the data-loading layer (`src/lib/projects.ts`), once, before any consumer touches the list. Rationale: `getStaticPaths`, page templates, sitemap generation, and component loops all consume from these helpers, so a single chokepoint is sufficient and impossible to bypass accidentally.
- **About handling**: not affected by the flag. Rationale: there is exactly one About entry; forkers replace its content in-place rather than hide it, so there is no "example About" to filter. The seeded content acts as a fillable template.
- **Sitemap**: `@astrojs/sitemap` derives URLs from the actual generated pages. Filtering at the loader removes the `getStaticPaths` entries for hidden examples, so the sitemap and `dist/` tree both lose the URLs automatically. No sitemap-specific code needed.
- **Empty-featured fallback**: if every `featured: true` project happens to be an example and `HIDE_EXAMPLES=true`, the landing page falls back to "first 6 of `getAllProjects()`" — the existing fallback in `src/pages/index.astro` already handles `featured.length === 0`. No new code path needed; the existing fallback covers it.
- **Deploy-time configuration**: a single repository variable `HIDE_EXAMPLES` plus auto-derivation when the deploying ref is `content/add-projects`. Rationale: forkers configure nothing (the var defaults to `false`); the original author sets the var to `true` once on their personal-portfolio repo or relies on the auto-detection for the `content/add-projects` branch.
- **Safety-net layering**: complementary, not redundant. (a) Vitest test fails loudly if any example file is missing — runs in CI, blocks merge. (b) Build-time validator emits a warning with the README pointer — runs at `npm run build` so a forker iterating locally sees it before pushing. (c) E2E tests would also fail organically because `/projects/example-startup/` would 404 — but the dedicated unit test catches it earlier with a better message.

## Phase 1 — Design & Contracts

### Data model — [data-model.md](./data-model.md)

Three concepts, no new persisted data:

- **`HIDE_EXAMPLES` env var** — boolean, default `false`. Read once per build via `src/lib/env.ts`. Truthy values: `'true'`, `'1'`, `'yes'` (case-insensitive). Falsy/unset → examples are visible.
- **Example slug marker** — predicate `isExampleSlug(slug: string): boolean` returning `slug.startsWith('example-')`. Centralized in `src/lib/examples.ts` so it has one definition and one test.
- **Required-example registry** — a frozen list of three canonical paths (`src/content/projects/{personal,startup,corporate}/example-{personal,startup,corporate}.md`) used by both the unit safety-net test and the build-time validator. Single source of truth; renaming an example requires touching exactly one file.

### Contracts — [contracts/hide-examples.contract.md](./contracts/hide-examples.contract.md)

A behavioral contract (not an API contract — there is no API surface): the spec for what `HIDE_EXAMPLES=true` and `HIDE_EXAMPLES=false` MUST produce in the rendered output. Includes the exact assertions that map to FR-002 / FR-003 / FR-014, written as Given/When/Then so they translate one-for-one into Vitest cases and a CI smoke step.

### Quickstart — [quickstart.md](./quickstart.md)

A runnable, copy-pasteable walkthrough that exercises every acceptance scenario from the spec end to end:

1. Fresh clone → `npm install` → `npm run dev` → see examples (default flow, validates US1 step 1).
2. `HIDE_EXAMPLES=true npm run build` → inspect `dist/` → confirm no `example-` paths and no sitemap entries (validates FR-002 / SC-004).
3. Delete one example → `npm run test` → confirm the safety-net failure message points at the README (validates US3 acceptance #3).
4. Add a real project → rebuild → confirm it appears alongside or instead of examples (validates US1 step 4).
5. Author flow: switch to `content/add-projects`, push → confirm deploy auto-sets `HIDE_EXAMPLES=true` (validates US2 acceptance #4).

### Agent context update

Run `.specify/scripts/bash/update-agent-context.sh cursor-agent` to refresh `.cursor/rules/specify-rules.mdc` with the new tech notes (no new framework — only "build-time `HIDE_EXAMPLES` env var" added to the active-technologies list). Performed as part of Phase 1 closeout.

### Re-evaluated Constitution Check (post-design)

All six principles still PASS. The Phase 1 decisions reinforce — rather than challenge — the Content-Driven Architecture and Static-Site Performance principles: no new runtime code, no schema migration, no per-project authoring cost.

## Complexity Tracking

> No constitution violations. Section intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| _(none)_ | _(n/a)_ | _(n/a)_ |
