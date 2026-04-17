---
description: "Dependency-ordered task list for the Portfolio Showcase Site feature"
---

# Tasks: Portfolio Showcase Site

**Input**: Design documents from `/specs/001-portfolio-showcase/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md
**Branch**: `001-portfolio-showcase`

**Tests**: INCLUDED — the feature spec mandates measurable accessibility (SC-005), performance (SC-004), and responsive (SC-006) outcomes, and the plan defines Vitest + Playwright + axe-core + Lighthouse CI as the testing strategy.

**Organization**: Tasks are grouped by user story so each can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps task to a user story (US1–US5)
- All paths are relative to repo root: `/Users/nicolas.tambussi/Downloads/proys/portfolio/`

## Path Conventions

- Source: `src/` at repo root (Astro project)
- Content: `src/content/projects/{personal,startup,corporate}/`
- Static assets: `public/`
- Tests: `tests/unit/` (Vitest) and `tests/e2e/` (Playwright)
- CI/CD: `.github/workflows/`
- User-facing template: `templates/project.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Astro project, install dependencies, and wire up tooling.

- [X] T001 Initialize `package.json` at repo root with Node 20 engine, scripts (`dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:e2e`, `lighthouse`), and dependencies (`astro@^5`, `@astrojs/tailwind`, `@astrojs/sitemap`, `tailwindcss@^4`, `typescript`, `zod`)
- [X] T002 [P] Add `.nvmrc` containing `20` at repo root
- [X] T003 [P] Add `.gitignore` entries: `node_modules/`, `dist/`, `.astro/`, `coverage/`, `playwright-report/`, `test-results/`, `.lighthouseci/`
- [X] T004 [P] Create `tsconfig.json` extending `astro/tsconfigs/strict` with `paths` for `@/*` → `src/*`
- [X] T005 [P] Create `astro.config.mjs` with `site`, `base`, `integrations: [tailwind(), sitemap()]`, `output: 'static'`, image service config
- [X] T006 [P] Create `tailwind.config.ts` with design tokens (color palette meeting WCAG AA contrast, typography scale, spacing, breakpoints `sm:640 md:768 lg:1024 xl:1280`)
- [X] T007 [P] Add ESLint + Prettier configs (`.eslintrc.cjs`, `.prettierrc`) with Astro plugin
- [X] T008 [P] Install dev dependencies: `vitest`, `@vitest/ui`, `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`, `eslint`, `eslint-plugin-astro`, `prettier`, `prettier-plugin-astro`
- [X] T009 Run `npx playwright install --with-deps chromium` and document in README

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Content schema, query helpers, base layout, and global styles — all user stories depend on these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T010 Create Zod schemas and three content collections in `src/content/config.ts` per data-model.md (Project schema with all required + optional fields, three collections: `personal`, `startup`, `corporate`)
- [X] T011 [P] Create slug helpers and global collision detector in `src/lib/slug.ts` (kebab-case validator, `assertNoCollisions(allProjects)` that throws on duplicates)
- [X] T012 [P] Create project query helpers in `src/lib/projects.ts` (`getAllProjects()`, `getByCategory(cat)`, `getFeatured()`, `sortProjects()` by `order` asc + `period.start` desc, `excludeDrafts(env)`)
- [X] T013 [P] Create image-path validator in `src/lib/assets.ts` (`assertImageExists(path)` checked at build time for `thumbnail` and `screenshots[]`)
- [X] T014 Create build-time integration in `src/integrations/content-validator.ts` that runs slug collision + image existence checks during `astro:build:setup`, registered in `astro.config.mjs`
- [X] T015 [P] Create global styles in `src/styles/global.css` (CSS reset, base typography, focus-visible styles, `prefers-reduced-motion` overrides, font-face declarations)
- [X] T016 [P] Add subset self-hosted woff2 fonts to `public/fonts/` (one display + one body family) with appropriate licensing notice in `public/fonts/LICENSE.txt`
- [X] T017 Create `src/layouts/BaseLayout.astro` (HTML5 doctype, `<html lang>`, meta tags slot, skip-to-content link, semantic `<header>`/`<main>`/`<footer>`, theme-color meta, Open Graph defaults)
- [X] T018 [P] Create `src/components/SiteHeader.astro` (logo/name, primary nav with category links, semantic `<nav>`, keyboard-accessible)
- [X] T019 [P] Create `src/components/SiteFooter.astro` (copyright, social/contact links, semantic `<footer>`)
- [X] T020 [P] Seed one example project per category for development: `src/content/projects/personal/example-personal.md`, `src/content/projects/startup/example-startup.md`, `src/content/projects/corporate/example-corporate.md` (all conforming to schema, with placeholder thumbnails in `public/projects/<slug>/`)

**Checkpoint**: `npm run dev` starts without errors, content collections type-check, base layout renders an empty page with header/footer.

---

## Phase 3: User Story 1 — Browse Projects by Category (Priority: P1) 🎯 MVP

**Goal**: Visitors land on the site, see featured projects, and can browse projects filtered by category.

**Independent Test**: Open `/`, see hero + featured + category nav. Click each of `/category/personal/`, `/category/startup/`, `/category/corporate/` and confirm only matching projects appear. Visit a category with zero projects and see an empty-state message.

### Tests for User Story 1

- [X] T021 [P] [US1] Vitest unit tests for query helpers in `tests/unit/projects.test.ts` (sorting by order/period, featured filter, drafts excluded in prod)
- [X] T022 [P] [US1] Playwright e2e for landing + category navigation in `tests/e2e/navigation.spec.ts` (covers spec AS-1, AS-2, AS-3, AS-4 of US1)
- [X] T023 [P] [US1] Playwright + axe-core a11y scan for landing and category pages in `tests/e2e/a11y.spec.ts` (zero serious/critical violations)

### Implementation for User Story 1

- [X] T024 [P] [US1] Create `src/components/CategoryBadge.astro` (label + category-specific accent color from tokens)
- [X] T025 [P] [US1] Create `src/components/CategoryNav.astro` (three category links + "All" link, active-state highlighting via `Astro.url.pathname`)
- [X] T026 [P] [US1] Create `src/components/Hero.astro` (heading, intro copy, primary CTA to featured projects)
- [X] T027 [US1] Create `src/components/ProjectCard.astro` (uses `astro:assets` `<Image>` with `widths` for srcset, lazy loading, category badge, title, description, tech stack chips; entire card is a single `<a>` for keyboard nav) — depends on T024
- [X] T028 [US1] Create `src/components/ProjectGrid.astro` (CSS grid: 1 col < 640px, 2 cols 640–1023px, 3 cols ≥ 1024px; empty-state slot fallback) — depends on T027
- [X] T029 [US1] Create landing page `src/pages/index.astro` (BaseLayout + Hero + featured ProjectGrid + CategoryNav) — depends on T012, T017, T025, T026, T028
- [X] T030 [US1] Create category listing page `src/pages/category/[category].astro` with `getStaticPaths` returning the three category slugs; renders ProjectGrid filtered by category with empty-state message — depends on T012, T017, T028

**Checkpoint**: User Story 1 is fully functional. The MVP is shippable: visitors can browse and filter, even before detail pages exist.

---

## Phase 4: User Story 2 — View Project Details (Priority: P1)

**Goal**: Each project has a dedicated detail page with full metadata, visuals, and optional links.

**Independent Test**: Click any project card → land on `/projects/<slug>/` → see title, description, category badge, tech stack, role, period, screenshots, and only the links that are defined in frontmatter (no broken/empty link sections).

### Tests for User Story 2

- [X] T031 [P] [US2] Playwright e2e for project detail page in `tests/e2e/project-detail.spec.ts` (covers AS-1, AS-2, AS-3 of US2 — including the "no live link" graceful omission)
- [X] T032 [P] [US2] Extend `tests/e2e/a11y.spec.ts` to scan a project detail page

### Implementation for User Story 2

- [X] T033 [P] [US2] Create `src/components/TechStack.astro` (renders chips for each `techStack` entry, semantic `<ul>`)
- [X] T034 [P] [US2] Create `src/components/ProjectLinks.astro` (conditionally renders source/live/case-study links, each as a real `<a>` with `rel="noopener"`)
- [X] T035 [P] [US2] Create `src/components/ProjectScreenshots.astro` (responsive `<Picture>` per screenshot with alt text fallback)
- [X] T036 [US2] Create `src/layouts/ProjectLayout.astro` (BaseLayout + header section with title/badge/period/role/tech stack/links + slot for body content) — depends on T017, T024, T033, T034
- [X] T037 [US2] Create project detail page `src/pages/projects/[slug].astro` with `getStaticPaths` over all three collections (flat URL space `/projects/<slug>/`), render Markdown body via `<Content />`, include screenshots — depends on T012, T035, T036

**Checkpoint**: User Stories 1 and 2 both work independently. End-to-end browsing is complete.

---

## Phase 5: User Story 3 — Add a New Project via Markdown Template (Priority: P2)

**Goal**: The portfolio owner can add a new project by copying a template `.md` file, filling in frontmatter, committing — no code changes required.

**Independent Test**: Copy `templates/project.md` to `src/content/projects/personal/<new-slug>.md`, fill required fields, run `npm run build` → succeeds and the project appears on the site. Remove a required field → build fails with a clear error.

### Tests for User Story 3

- [X] T038 [P] [US3] Vitest schema-validation tests in `tests/unit/schema.test.ts` (parses valid template fixture, rejects missing required fields with field name in error, rejects invalid slug pattern, rejects bad period range)
- [X] T039 [P] [US3] Vitest test for slug-collision detector in `tests/unit/slug.test.ts` (asserts `assertNoCollisions` throws and lists both file paths)

### Implementation for User Story 3

- [X] T040 [P] [US3] Copy contract template to user-facing location: create `templates/project.md` from `specs/001-portfolio-showcase/contracts/project-template.md` (single source of truth — keep the contract version as the canonical reference and copy at this step)
- [X] T041 [P] [US3] Add fixture project Markdown files for tests in `tests/fixtures/projects/` (one valid, one missing-field, one bad-slug, one collision pair)
- [X] T042 [US3] Update root `README.md` with "Adding a new project" section: prerequisites, copy command, frontmatter explanation, image asset instructions, build verification step (mirrors quickstart.md Step 3)

**Checkpoint**: Content workflow is documented and validated. Owner can self-serve adding projects.

---

## Phase 6: User Story 4 — Responsive Browsing Experience (Priority: P2)

**Goal**: The site adapts cleanly to mobile (320px), tablet (768px), and desktop (1280px+) viewports.

**Independent Test**: Resize browser (or use Playwright viewport emulation) to each breakpoint and confirm: single-column on mobile with mobile menu, 2 cols on tablet, 3+ cols on desktop. Text remains readable, no horizontal scroll, all interactive elements remain reachable.

### Tests for User Story 4

- [X] T043 [P] [US4] Playwright responsive tests in `tests/e2e/responsive.spec.ts` running landing + category + detail pages at 320, 768, 1280 viewports (asserts layout, no horizontal overflow, mobile menu reachable on 320)

### Implementation for User Story 4

- [X] T044 [US4] Add mobile menu disclosure to `src/components/SiteHeader.astro` (hamburger button, `aria-expanded`, `aria-controls`, focus management, closes on Escape, hidden ≥ `md` breakpoint) — modifies T018
- [X] T045 [P] [US4] Audit and refine responsive utilities in `ProjectGrid` and `Hero` to enforce 320 → 1-col, 768 → 2-col, 1280+ → 3-col (verify with the new e2e tests)
- [X] T046 [P] [US4] Add `viewport` meta and `theme-color` confirmation in BaseLayout, plus a mobile-friendly type scale via Tailwind `clamp()` utilities in `tailwind.config.ts`

**Checkpoint**: SC-006 is measurably satisfied. The site works at all required breakpoints.

---

## Phase 7: User Story 5 — Automated Deployment on Push (Priority: P3)

**Goal**: Pushes to `main` automatically build and deploy to GitHub Pages; build failures keep the live site untouched.

**Independent Test**: Push a commit to `main`, observe both workflows run, observe the deployed URL updated. Push a commit that breaks the build (e.g., invalid project frontmatter) and confirm deploy is blocked while the live version is preserved.

### Tests for User Story 5

> Tested via the workflow run itself — no separate test file. Manual verification step in quickstart.md Step 7.

### Implementation for User Story 5

- [X] T047 [P] [US5] Create `lighthouserc.json` with budgets (Performance ≥ 90 mobile, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95, LCP < 2.5s) and assertions
- [X] T048 [P] [US5] Create `playwright.config.ts` with chromium project, viewports for mobile/tablet/desktop, `webServer` running `npm run preview`, retries in CI
- [X] T049 [P] [US5] Create `vitest.config.ts` with TypeScript path resolution and coverage settings
- [X] T050 [US5] Create `.github/workflows/ci.yml` (triggers: pull_request, push; jobs: install → typecheck → lint → unit tests → build → e2e + axe → lighthouse CI; uploads artifacts on failure)
- [X] T051 [US5] Create `.github/workflows/deploy.yml` (trigger: push to main; jobs: build with `BASE_PATH` from repo name → upload `dist/` via `actions/upload-pages-artifact@v3` → `actions/deploy-pages@v4`; permissions: pages:write, id-token:write; concurrency group `pages`)
- [X] T052 [US5] Document GitHub Pages activation steps in README (Settings → Pages → Source: GitHub Actions; custom domain note)

**Checkpoint**: Push-to-deploy is fully automated. SC-007 satisfied.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, SEO, polish, and final validation across all user stories.

- [X] T053 Create 404 page `src/pages/404.astro` (BaseLayout + friendly message + link back to home + recent projects suggestion) — addresses FR-011 and the removed-project edge case
- [X] T054 [P] Add Open Graph + Twitter Card meta to `BaseLayout.astro` accepting per-page overrides (title, description, image) and use project thumbnail on detail pages
- [X] T055 [P] Add `robots.txt` and verify sitemap output covers all project + category pages
- [X] T056 [P] Add empty-body handling in `ProjectLayout.astro` (renders "No description provided." note when Markdown body is empty — covers spec edge case)
- [X] T057 [P] Add missing-image placeholder behavior: `src/lib/assets.ts` returns a placeholder path when source missing (still warn at build, but don't crash dev) — covers spec edge case
- [X] T058 [P] Run quickstart.md acceptance walkthrough end-to-end and check off each scenario
- [X] T059 [P] Run final manual accessibility audit: keyboard-only navigation across all routes, screen-reader pass on detail page, contrast check on category badges
- [X] T060 Update root `README.md` with project overview, tech stack, local dev instructions, "Adding a new project" link, deployment notes, and a constitution compliance summary

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks all user stories.**
- **User Stories (Phase 3–7)**: All depend on Foundational. Can run in parallel between developers; sequentially in priority order for a solo build.
- **Polish (Phase 8)**: Depends on the user stories you intend to ship.

### User Story Dependencies

- **US1 (P1)**: Independent. Foundational only.
- **US2 (P1)**: Independent. Foundational only. (Shares ProjectCard with US1 indirectly via cards linking to detail pages, but cards already work without US2.)
- **US3 (P2)**: Independent. Builds on the schema from Foundational; doesn't require US1 or US2 to be complete.
- **US4 (P2)**: Refines components from US1/US2. Best done after US1 + US2 to test against real layouts. Can ship without it (degraded mobile UX).
- **US5 (P3)**: Independent of the others — wires up CI/CD. Ideally last so the workflows run against the full site.

### Within Each User Story

- Tests written before implementation (TDD encouraged: tests should fail first, then pass after implementation).
- Components before pages.
- Layouts before pages that use them.

### Parallel Opportunities

- All `[P]` tasks within Phase 1 can run together once T001 finishes.
- All `[P]` tasks within Phase 2 can run together (T011, T012, T013, T015, T016, T018, T019, T020).
- US1, US2, US3, US5 can be developed in parallel by different contributors after Foundational.
- Within US1: T021/T022/T023 (tests) and T024/T025/T026 (atomic components) all parallel.
- Within US2: T031/T032 (tests) and T033/T034/T035 (components) all parallel.

---

## Parallel Example: User Story 1 Implementation

```bash
# After Foundational completes, kick off US1 in parallel:
# Group A — tests (one developer)
Task: "Vitest unit tests for query helpers in tests/unit/projects.test.ts"
Task: "Playwright e2e for landing + category nav in tests/e2e/navigation.spec.ts"
Task: "Playwright + axe a11y scan in tests/e2e/a11y.spec.ts"

# Group B — atomic components (another developer)
Task: "Create CategoryBadge in src/components/CategoryBadge.astro"
Task: "Create CategoryNav in src/components/CategoryNav.astro"
Task: "Create Hero in src/components/Hero.astro"

# Then sequentially: ProjectCard → ProjectGrid → index.astro & [category].astro
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1 (Setup) → Phase 2 (Foundational)
2. Phase 3 (US1) → run navigation + a11y tests
3. **Stop, validate, ship to GitHub Pages manually if desired.** A browsable, accessible portfolio with category filtering — already valuable.

### Incremental Delivery

1. MVP (Setup + Foundational + US1) → ship.
2. Add US2 (project detail) → ship. Site is now feature-complete for visitors.
3. Add US3 (template + README docs) → ship. Owner workflow documented.
4. Add US4 (responsive polish) → ship. Mobile-perfect.
5. Add US5 (CI/CD) → ship. Now self-deploying.
6. Phase 8 polish across all of the above.

### Parallel Team Strategy

With multiple contributors after Foundational:

- **Dev A**: US1 → US2 (page flow)
- **Dev B**: US3 → README + template (content workflow)
- **Dev C**: US5 → CI/CD (infra)
- All converge on Phase 8 polish.

---

## Notes

- `[P]` = different files, no dependencies on incomplete tasks.
- `[Story]` label maps the task to a spec user story for traceability.
- Each user story phase ends in a checkpoint where the story is independently demonstrable.
- Tests should fail before implementation lands.
- Commit after each task or coherent group (auto-commit hooks are now enabled).
- Avoid: vague tasks, same-file conflicts, cross-story coupling that breaks independent shipping.

## Task Count Summary

| Phase | Tasks | Notes |
|-------|-------|-------|
| Phase 1: Setup | 9 | T001–T009 |
| Phase 2: Foundational | 11 | T010–T020 |
| Phase 3: US1 (P1) MVP | 10 | T021–T030 — 3 test, 7 impl |
| Phase 4: US2 (P1) | 7 | T031–T037 — 2 test, 5 impl |
| Phase 5: US3 (P2) | 5 | T038–T042 — 2 test, 3 impl |
| Phase 6: US4 (P2) | 4 | T043–T046 — 1 test, 3 impl |
| Phase 7: US5 (P3) | 6 | T047–T052 |
| Phase 8: Polish | 8 | T053–T060 |
| **Total** | **60** | |
