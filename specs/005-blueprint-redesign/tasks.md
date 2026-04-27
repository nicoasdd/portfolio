---

description: "Tasks for Blueprint Portfolio Redesign"
---

# Tasks: Blueprint Portfolio Redesign

**Input**: Design documents from `/specs/005-blueprint-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/design-tokens.md, contracts/route-contract.md, contracts/content-schema.md, quickstart.md

**Tests**: The spec's Success Criteria (SC-003, SC-004, SC-005, SC-006, SC-007, SC-008, SC-009) are measurable only via automated tests, and the existing project ships Vitest + Playwright + axe-core + Lighthouse CI. Test tasks are therefore included as required deliverables, not optional.

**Organization**: Tasks are grouped by user story so each story ships a complete, independently testable visual slice.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Every task includes an exact file path

## Path Conventions

Single Astro project at repo root. Source under `src/`, tests under `tests/`, public assets under `public/`. See `plan.md#Project Structure` for the full tree.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Directory scaffolding only — no new runtime dependencies per research §10.

- [X] T001 Create new directories: `src/components/blueprint/`, `public/blueprint/`, `src/content/site/` in the repo root.
- [X] T002 [P] Add `.gitkeep` to `public/blueprint/` and `src/content/site/` so empty dirs track before their contents arrive.
- [X] T003 [P] Confirm `npm ci` still installs against the existing lockfile (no new deps expected) by running `npm ci` from the repo root and verifying a clean exit.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ship the blueprint design token system, schema extensions, shared chrome (header + footer), and the shared primitive components that every user story consumes.

**Critical**: No user story phase may begin until Phase 2 completes. The shared chrome, tokens, and primitives are consumed by every page rewrite downstream.

### Tokens & layout

- [X] T004 Rewrite `src/styles/global.css` to implement the token contract in `specs/005-blueprint-redesign/contracts/design-tokens.md`: Tailwind 4 `@theme` block for spacing / type / radius / font scales, `:root[data-theme="dark"]` and `:root[data-theme="light"]` blocks for color tokens, `@layer base` focus-visible rule, `prefers-reduced-motion` branch, and the existing skip-link utility preserved.
- [X] T005 [P] Add a static blueprint grid-paper background utility (`.bp-grid-bg`) in `src/styles/global.css` using `--bp-grid` token — applied via an opt-in class on `<body>` from `src/layouts/BaseLayout.astro`.

### Content-collection schema deltas

- [X] T006 Extend `src/content.config.ts` with all schema additions from `specs/005-blueprint-redesign/contracts/content-schema.md`: `highlightMetricSchema`, `metricTileSchema`, `narrativeSchema`, `architectureNodeSchema`, `iconKeySchema`; merge into `projectSchema` via `.extend()` with all new fields `.optional()`. Preserve `.strict()`.
- [X] T007 Extend `src/content.config.ts` with `availabilityPillSchema`, `contactSchema`, `valueCardSchema`, `pillIconSchema`, `valueIconSchema`; merge into `aboutSchema`. All new fields optional; `.strict()` preserved.
- [X] T008 Add `siteSchema` and register the `site` collection in `src/content.config.ts` (exports update to `collections = { personal, startup, corporate, about, site }`); include `credibilityIconSchema` and `systemsIconSchema` enums.
- [X] T009 Create `src/content/site/site.md` with the seed data specified in `specs/005-blueprint-redesign/data-model.md` §3 (six credibility-strip items, four systems-strip groups, default `heroPrimaryCtaHref: "/category/personal/"`).
- [X] T010 Create `src/lib/site.ts` exporting `getSite(): Promise<{ entry, data }>` that mirrors `getAbout()` semantics (zero-entry and multi-entry errors with clear messages).
- [X] T011 Update `src/integrations/content-validator.ts` per `contracts/content-schema.md` §5: warn when `featured: true` projects supply no `metrics` and no `narrative`; error when the `site` collection is missing; enforce icon vocabularies via Zod enum errors with readable messages.

### Shared primitives (`src/components/blueprint/`)

- [X] T012 [P] Create `src/components/blueprint/CornerFrame.astro` — wraps any child in a positioned container that renders four L-shaped tick marks at each corner using `--bp-line` hairlines. Accepts `padding?: "sm" | "md" | "lg"`.
- [X] T013 [P] Create `src/components/blueprint/IndexNumber.astro` — renders a 2-digit zero-padded index in `--font-bp-mono`, `--bp-accent`, with a leading tick. Accepts `n: number`.
- [X] T014 [P] Create `src/components/blueprint/PillChip.astro` — outlined pill with `--bp-line` border, `--bp-text` label, `--radius-bp-sm`. Accepts `as?: "span" | "a"`, `href?`, `active?: boolean`, slot content. Active state uses `--bp-accent` background + `--bp-accent-contrast` text.
- [X] T015 [P] Create `src/components/blueprint/IconChip.astro` — icon + label chip used in credibility strip, availability pills, and systems-strip items. Accepts `icon: IconKey`, `label: string`. Resolves icon key to an inline SVG from the shared icon set.
- [X] T016 [P] Create `src/components/blueprint/MetricTile.astro` — single metric tile (label + value + optional unit) in a `CornerFrame`. Value uses `--text-bp-3xl`, label uses `--text-bp-xs` with `--bp-text-mut`.
- [X] T017 [P] Create `src/components/blueprint/MetricPanel.astro` — grid of up to 3 `MetricTile`s. Accepts `metrics: MetricTile[]`; renders nothing when `metrics.length === 0`.
- [X] T018 [P] Create `src/components/blueprint/SparklineGlyph.astro` — 40×12 px inline SVG polyline; accepts `trend: "up" | "down" | "flat"` and picks from three hard-coded point sequences. Decorative (`aria-hidden="true"`).
- [X] T019 [P] Create `src/components/blueprint/ArchitectureStrip.astro` — renders a horizontal row of node boxes connected by hairline arrows; each node is `IconChip` inside a `CornerFrame`. Accepts `nodes: ArchitectureNode[]`; renders nothing when `nodes.length < 2`.
- [X] T020 [P] Create `src/components/blueprint/IsoIllustration.astro` — inlines an SVG from `public/blueprint/hero-<variant>.svg` using the Astro `set:html` pattern so inline SVG inherits `currentColor` and theme tokens. Accepts `variant: "home" | "category" | "about"`. Marked `aria-hidden="true"`.
- [X] T021 [P] Create `src/components/blueprint/SystemsStrip.astro` — renders the 4-group footer strip from `site.systemsStrip` data. Consumes `getSite()`.
- [X] T022 [P] Create `public/blueprint/icons.svg` — sprite SVG containing every icon in the three vocabularies (`IconKey`, `PillIcon`, `ValueIcon`, credibility icons, systems icons). All paths use `currentColor` as stroke so they theme-flip automatically.

### Shared chrome (rewrites)

- [X] T023 Rewrite `src/layouts/BaseLayout.astro`: set `<html lang="en" data-theme="dark">` as a static default (dynamic behavior deferred to US5); update `<meta name="theme-color" content="#0B1326" />`; preserve canonical / og / twitter tags; keep skip-link and `<main>` slot; apply `.bp-grid-bg` to `<body>`.
- [X] T024 Rewrite `src/components/SiteHeader.astro`: sticky navy header, `Nico` wordmark (from `aboutSchema.name`) left, five nav links right (Home, About, Personal, Startup, Corporate) with cyan underline on active route via `aria-current="page"` detection, collapsing mobile menu preserved, *placeholder* theme-toggle button (non-functional in this phase — wired in US5). All spacing uses `--spacing-bp-*` utilities.
- [X] T025 Rewrite `src/components/SiteFooter.astro`: author card on the left (avatar + name + role + email + contact lines from `about` collection) and `SystemsStrip` beneath it.
- [X] T026 Edit `src/components/SocialLinks.astro`: swap to the new focus ring and cyan hover from `design-tokens.md` §7; keep icon set unchanged.
- [X] T027 Edit `src/components/SkillsList.astro`: render each skill via `PillChip`; remove the prior background styling.
- [X] T028 Edit `src/components/TechStack.astro`: render each tech item via `PillChip`; no filled background (per FR-011).
- [X] T029 Edit `src/components/CategoryBadge.astro`: render category label in cyan uppercase small-caps (per FR-010); remove category-colored backgrounds.

### Foundational tests

- [X] T030 [P] Extend `tests/unit/schema.test.ts` with the 8 cases listed in `contracts/content-schema.md` §6 (minimal existing project, project with all new fields, invalid `architecture[].icon`, `metrics.length > 3`, about without new fields, about with wrong-length `process`, site with `systemsStrip.length != 4`, missing site collection).
- [X] T031 [P] Create `tests/unit/site-collection.test.ts` that exercises `getSite()` zero-entry + multi-entry failure modes using fixtures in `tests/fixtures/`.

**Checkpoint**: Foundation ready — tokens, schemas, shared chrome, and primitives are in place. User story phases can now proceed in parallel.

---

## Phase 3: User Story 1 — Restyled Home Page (Priority: P1) 🎯 MVP

**Goal**: The home page ships with the full blueprint chrome, hero (greeting + H1 + CTAs + isometric illustration), "What I bring" credibility strip, 3-column Featured Projects grid using the new compact card, and the author card + systems strip in the footer.

**Independent Test**: Load `/` with the production build. Verify the hero block (greeting, H1, two CTAs, illustration), the 6-item credibility strip, the 3×2 featured grid with numbered cards + category tags + tech pills + single-metric sparkline, and the bottom author card + systems strip — all per `specs/005-blueprint-redesign/assets/home-blueprint.png` at 1440 px, 1024 px, 768 px, and 320 px.

### Implementation for User Story 1

- [X] T032 [P] [US1] Create `public/blueprint/hero-home.svg` — isometric blueprint illustration composed of server/API cube, cloud, shield, database cylinder, and a labeled JSON snippet glyph, all in `currentColor`.
- [X] T033 [P] [US1] Create `src/components/CredibilityStrip.astro` — consumes `site.credibilityStrip`, renders one `IconChip` per item on a single row at desktop with wrap on tablet/mobile.
- [X] T034 [P] [US1] Rewrite `src/components/Hero.astro` per `home-blueprint.png`: `Hi, I'm Nico 👋` greeting in `--bp-accent`, 3-line H1 (`--text-bp-hero`), one-sentence subpar, primary cyan CTA linking to `site.heroPrimaryCtaHref`, secondary outlined CTA linking to `/about/`, `<IsoIllustration variant="home" />` on the right (hidden on mobile). Primary CTA uses `--radius-bp-xl`.
- [X] T035 [P] [US1] Rewrite `src/components/ProjectCard.astro` as the compact blueprint card: top-left `IndexNumber`, project title, `CategoryBadge`, `highlightMetric` line with `SparklineGlyph` (only when set), up to four tech `PillChip`s, corner-tick frame (`CornerFrame`). The whole card is a single `<a>` so keyboard users reach it in one tab stop (per spec edge case).
- [X] T036 [P] [US1] Edit `src/components/ProjectGrid.astro`: 3-column grid at desktop / 2 at tablet / 1 at mobile; gap `--spacing-bp-3`; heading uses `--text-bp-xl` eyebrow with cyan tick; "View all projects →" affordance aligned right.
- [X] T037 [US1] Rewrite `src/pages/index.astro`: compose `Hero` → `CredibilityStrip` → `ProjectGrid` (showing up to six `getFeatured()` or first 6 of `getAllProjects()`) → (author card lives in footer). Remove the prior `CategoryNav` and `AboutTeaser` imports from this page.
- [X] T038 [US1] Extend `tests/e2e/navigation.spec.ts` OR add `tests/e2e/home.spec.ts` to assert at `/`: greeting text visible, H1 matches spec, two CTAs present with correct `href`, credibility strip has ≥ 4 items, featured grid renders ≥ 1 card with index + title + category tag + at least one tech pill, systems strip present with 4 groups. Run at 1440, 1024, 768, 320 px viewports.

**Checkpoint**: Home page is fully functional in the blueprint style. Theme toggle is visually present but not yet interactive (that lands in US5). User Story 1 is independently demoable.

---

## Phase 4: User Story 2 — Category Pages Lead With Outcomes (Priority: P1)

**Goal**: Each of `/category/personal/`, `/category/startup/`, `/category/corporate/` ships with the blueprint category hero, a breadcrumb, a filter chip row, an optional large Featured card (metric panel + CHALLENGE/BUILT/IMPACT + architecture strip + tech pills) when any project opts in, and the standard card grid for the rest.

**Independent Test**: Load `/category/personal/` and verify every block in `specs/005-blueprint-redesign/assets/personal-projects-blueprint.png` renders. Load `/category/startup/` and `/category/corporate/` and verify the same structure with the category-appropriate H1 and the active filter chip swapping.

### Implementation for User Story 2

- [X] T039 [P] [US2] Create `public/blueprint/hero-category.svg` — isometric illustration with the "Independent Builder"-style outlined callout card glyph composed of blueprint cubes (same `currentColor` style as home).
- [X] T040 [P] [US2] Create `src/components/CategoryHero.astro`: accepts `category: CategoryKey`; renders breadcrumb `Home / <Label>`, H1 in `--text-bp-hero`, one-sentence mission sub (per category — see T041), and `<IsoIllustration variant="category" />` on the right including the callout card markup.
- [X] T041 [P] [US2] Add category mission copy to `src/content/site/site.md` as `categoryMissions: { personal: string; startup: string; corporate: string }` and extend `siteSchema` in `content.config.ts` accordingly (all three required, max 160 chars each). `CategoryHero` reads this.
- [X] T042 [P] [US2] Rewrite `src/components/CategoryNav.astro` as the filter chip row `[All] [Personal] [Startup] [Corporate]` using `PillChip` with `active={pathname === href}` detection. `All` links to `/`, each category to its `/category/<slug>/`. Prefetch on hover enabled via Astro's default behavior.
- [X] T043 [P] [US2] Create `src/components/FeaturedProjectCard.astro`: full-width large card. Renders, top-to-bottom: `IndexNumber`, project title + tagline, `MetricPanel` (hides when no metrics), short description, three-column CHALLENGE / BUILT / IMPACT block sourced from `narrative` (hides entire block when all three arrays are empty), `ArchitectureStrip` (hides when < 2 nodes), and a labeled `TECH STACK` row of `PillChip`s. Everything framed by `CornerFrame`.
- [X] T044 [US2] Rewrite `src/pages/category/[category].astro`: compose `CategoryHero` → `CategoryNav` → (for each `featured` project: `FeaturedProjectCard`) → `ProjectGrid` with the remaining non-featured projects. Preserve `getStaticPaths()` over `CATEGORY_KEYS` unchanged.
- [X] T045 [US2] Add `tests/e2e/category.spec.ts`: for each category URL, assert breadcrumb, H1 text, filter chip row active state, at least zero `FeaturedProjectCard` instances (zero is acceptable per FR-019 edge case), grid renders remaining projects, systems strip renders.
- [X] T046 [P] [US2] Opt one representative corporate project (`src/content/projects/corporate/mercadolibre-billing-engine.md`) into the new fields by adding `metrics`, `narrative`, and `architecture` frontmatter so QA has a reference case; existing body and other frontmatter untouched.
- [X] T047 [P] [US2] Opt `src/content/projects/personal/csgo-try.md` into the same new optional fields (it is the anchor example in the mockup) for QA parity with the blueprint reference image.

**Checkpoint**: All three category pages are visually complete. US1 + US2 are independently demoable.

---

## Phase 5: User Story 3 — About Page (Priority: P1)

**Goal**: `/about/` ships the identity hero (`ABOUT` eyebrow, giant name, role subtitle, availability pills, contact lines, framed avatar), the two-paragraph bio, the 4-up "What I care about" value grid, the "Why work with me" process banner, the skills chip grid, and the Elsewhere block.

**Independent Test**: Load `/about/` with production build and verify every block in `specs/005-blueprint-redesign/assets/about-blueprint.png` renders in the documented order. Editing a pill label in `src/content/about/profile.md` (without touching code) updates the rendered pill.

### Implementation for User Story 3

- [X] T048 [P] [US3] Create `public/blueprint/hero-about.svg` — isometric avatar-frame illustration with corner ticks and blueprint projection lines (matches the right-side figure in `about-blueprint.png`).
- [X] T049 [P] [US3] Extend `src/lib/about.ts` to compute derived fields: `availabilityPills` (falls back to deriving from `location` + `availability` scalars when new array absent — per data-model §2), `contact` (falls back to `email` + matching `socialLinks` icons), `valuesResolved` (array or empty), `processResolved` (array of length 5 or undefined). All fallbacks documented inline.
- [X] T050 [P] [US3] Create `src/components/AboutHero.astro`: `ABOUT` eyebrow, name in `--text-bp-hero`, role subtitle in `--bp-accent`, availability `PillChip`s, three contact lines (email / github / linkedin), and the avatar inside `CornerFrame` on the right. Monogram fallback glyph when `photo` is missing (spec edge case).
- [X] T051 [P] [US3] Create `src/components/ValueGrid.astro`: 4-up grid on desktop, 2-up on tablet, 1-up on mobile. Each card: `IconChip`-sized icon in `CornerFrame`, title, body. Consumes `values` from `about` collection; hides section entirely when empty.
- [X] T052 [P] [US3] Create `src/components/ProcessBanner.astro`: left column with `processStatement` prose, right column with the 5-step flow rendered as circle-icon glyphs connected by hairline arrows in the fixed order supplied by `process`. Hides the entire banner when `process` is absent or not length 5.
- [X] T053 [P] [US3] Create `src/components/ElsewhereList.astro`: one wide card per external profile (pulls from the new `contact` + existing `socialLinks`). Each card shows service name, full URL, and external-link arrow. Cards link out with `target="_blank" rel="noopener noreferrer"`.
- [X] T054 [US3] Rewrite `src/pages/about.astro`: compose `AboutHero` → bio `<Content />` wrapped in a blueprint prose surface → `ValueGrid` → `ProcessBanner` → Skills (`SkillsList`) → `ElsewhereList`. Preserve semantic landmarks (`<article>`, `<section>` with `aria-labelledby`).
- [X] T055 [US3] Edit `src/content/about/profile.md` to add populated `availabilityPills`, `values`, `process`, `processStatement`, and `contact` frontmatter so the new sections render with real copy out of the box. Existing `name`, `headline`, `intro`, `photo`, `email`, `location`, `availability`, `skills`, `socialLinks` preserved byte-for-byte.
- [X] T056 [US3] Extend `tests/e2e/about.spec.ts`: assert every new block present (identity hero, availability pills, three contact lines, values grid when populated, process banner when populated, skills, elsewhere); assert page still renders when new optional fields are removed (using a fixture document).
- [X] T057 [P] [US3] Extend `tests/unit/about.test.ts` with a case proving the legacy `availability` + `location` fallback path still produces pills when `availabilityPills` is absent.

**Checkpoint**: US1 + US2 + US3 all ship together as the full blueprint redesign MVP.

---

## Phase 6: User Story 4 — Project Detail Chrome (Priority: P2)

**Goal**: Every `/projects/<slug>/` page inherits the new chrome (sticky header, navy canvas, systems-strip footer) and renders body prose on the blueprint prose surface with the token typography scale. Screenshots sit inside `CornerFrame`.

**Independent Test**: Open any `/projects/<slug>/` URL and verify header + footer + canvas match the rest of the redesigned site, body prose is readable (AA contrast), and every screenshot is corner-ticked.

### Implementation for User Story 4

- [X] T058 [P] [US4] Rewrite `src/layouts/ProjectLayout.astro`: apply the blueprint prose surface (dark navy reading column, `--bp-text` body, `--text-bp-base` at 1.6 line-height), preserve headings / code fences / lists / tables using `--bp-line` rules and `--font-bp-mono` code blocks. Meta block (period + role + tech stack + links) inside a `CornerFrame`.
- [X] T059 [P] [US4] Edit `src/components/ProjectScreenshots.astro`: wrap each image in `CornerFrame` (variant `md`); preserve existing `loading="lazy"` and alt text.
- [X] T060 [P] [US4] Edit `src/components/ProjectLinks.astro`: render each link as a `PillChip` with `as="a"` and an external icon.
- [X] T061 [US4] Edit `src/pages/projects/[slug].astro` only as needed to wire the updated layout and components (`getStaticPaths` and content loading unchanged).
- [X] T062 [US4] Extend `tests/e2e/project-detail.spec.ts` to assert the detail page uses the new header/footer (sticky navy top bar, systems strip present), renders at least one heading + one paragraph in the blueprint prose surface, and shows every screenshot inside a corner-ticked frame.
- [X] T063 [P] [US4] Run an axe scan on one project detail URL (extend `tests/e2e/a11y.spec.ts`) confirming zero critical/serious violations.

**Checkpoint**: Every URL in `contracts/route-contract.md` §1 now uses the blueprint chrome.

---

## Phase 7: User Story 5 — Theme Toggle (Priority: P3)

**Goal**: Ship a working light/dark toggle in the sticky header that (a) follows `prefers-color-scheme` on first paint, (b) persists explicit choice in `localStorage`, (c) flips every token in under 100 ms, (d) announces state to assistive tech, (e) updates `<meta name="theme-color">` to match, (f) respects `prefers-reduced-motion` (no transition animation).

**Independent Test**: From any page, click the toggle. Tokens flip instantly. Reload — theme persists. Navigate to another page — theme persists. Clear `localStorage` — theme returns to OS preference.

### Implementation for User Story 5

- [X] T064 [P] [US5] Create `src/lib/theme.ts`: exports `resolveInitialTheme()` (stored choice > OS preference > `"dark"` fallback), `readStoredTheme()`, `writeStoredTheme(theme)`, and `applyTheme(theme)` (flips `document.documentElement.dataset.theme` and updates `<meta name="theme-color">` content to `#0B1326` or `#F2F5FB`).
- [X] T065 [US5] Edit `src/layouts/BaseLayout.astro`: inject an inline `<script>` in `<head>` before stylesheet links that synchronously reads `localStorage` + `matchMedia("(prefers-color-scheme: dark)")` and sets `document.documentElement.dataset.theme` and the `theme-color` meta content — eliminates the flash-of-wrong-theme on first paint. Remove the previously static `data-theme="dark"` attribute from `<html>`.
- [X] T066 [P] [US5] Create `src/components/ThemeToggle.astro`: a `role="switch"` button with `aria-checked` reflecting current theme, a sun/moon icon pair, `aria-label="Toggle color theme"`. Client script wires `click` → `applyTheme(next)` → `writeStoredTheme(next)`.
- [X] T067 [US5] Edit `src/components/SiteHeader.astro` to replace the placeholder toggle button added in T024 with the real `<ThemeToggle />` component.
- [X] T068 [P] [US5] Create `tests/unit/theme.test.ts`: covers `resolveInitialTheme()` precedence (stored > OS > default), `writeStoredTheme` + `readStoredTheme` round-trip, and `applyTheme` side effects using a JSDOM setup.
- [X] T069 [P] [US5] Create `tests/e2e/theme-toggle.spec.ts`: clicks the toggle, asserts `html[data-theme]` flips, asserts `meta[name="theme-color"]` content swaps, reloads the page and asserts persistence, navigates to `/about/` and asserts persistence, and asserts that `prefers-reduced-motion: reduce` does not break the toggle.
- [X] T070 [US5] Extend `tests/e2e/a11y.spec.ts` to run axe against Home, About, `/category/personal/`, and one project detail URL in **both** themes (toggle first in each case).

**Checkpoint**: All five user stories ship. The full redesign matches the reference mockups.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Tie off the edges, update the 404, refresh README onboarding copy, run the SC-006/SC-009/SC-010 gates, and clean up anything left behind by the rewrites.

- [X] T071 [P] Edit `src/pages/404.astro` to apply blueprint chrome consistently: large `404` index-style heading, short copy, a `PillChip` back-to-home link; no feature-unique components.
- [X] T072 [P] Retire or restyle `src/components/AboutTeaser.astro` — if retained, it MUST use blueprint tokens and a `CornerFrame`; otherwise delete it and remove every import (already removed from `index.astro` in T037 and from `category/[category].astro` in T044 — verify no dangling imports remain in the repo).
- [X] T073 [P] Extend `tests/e2e/responsive.spec.ts` with assertions at 320 px / 768 px / 1024 px / 1440 px on Home, About, and one category page, proving no horizontal scroll (SC-003).
- [X] T074 [P] Extend `tests/e2e/navigation.spec.ts` with a test that tabs through the sticky nav + hero CTAs + filter chips + one card + footer link with a visible `:focus-visible` outline at every stop (SC-004).
- [X] T075 [P] Add a routes-integrity check to `tests/e2e/navigation.spec.ts` (or a new `tests/e2e/routes.spec.ts`) that iterates every URL in `specs/005-blueprint-redesign/contracts/route-contract.md` §1 and asserts HTTP 200 (SC-009).
- [X] T076 [P] Update `README.md` with: how to edit `src/content/site/site.md`, how to opt a project into `metrics` / `narrative` / `architecture`, how to extend About pills / values / process. Do not alter project-adding instructions.
- [X] T077 [P] Update `.cursor/rules/specify-rules.mdc` manual-additions block (between the existing markers) to note that blueprint token authoring MUST go through `src/styles/global.css` and that new icon vocabularies MUST be added as Zod enums in `src/content.config.ts`.
- [X] T078 Run `npm run typecheck && npm run lint && npm test && npm run build && npm run preview &` then `npm run test:e2e && npm run lighthouse` to execute the full `specs/005-blueprint-redesign/quickstart.md` §§2–8 pipeline end-to-end; open any failures into new tasks.
- [X] T079 Manual verification pass against `quickstart.md#11` Definition of Done: every checkbox green, spec Success Criteria SC-001 through SC-010 walked.
- [X] T080 [P] Ensure `src/content/site/site.md` and the seed `site.md` example fields documented in `specs/005-blueprint-redesign/data-model.md` §3 stay in sync by running the content validator once more post-DoD (`npm run build` will fail if drift exists).

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: no deps — can start immediately.
- **Phase 2 (Foundational)**: needs Setup — blocks every user story. Contains tokens, schema deltas, primitives, and shared chrome.
- **Phase 3 (US1 Home)**: needs Phase 2.
- **Phase 4 (US2 Category)**: needs Phase 2.
- **Phase 5 (US3 About)**: needs Phase 2.
- **Phase 6 (US4 Project detail)**: needs Phase 2.
- **Phase 7 (US5 Theme toggle)**: needs Phase 2; does NOT need US1–US4 to be complete but exercises them as part of its e2e test (T069, T070).
- **Phase 8 (Polish)**: needs every user story the team chooses to ship.

### Within-phase dependencies

- **Phase 2**:
  - T006–T008 precede T009 (seed depends on `siteSchema` existing) and T010 (loader depends on collection registration).
  - T004–T005 precede every component task in T012–T022 (primitives consume tokens).
  - T012–T022 precede T023–T025 (chrome consumes primitives).
  - T015 (`IconChip`) and T022 (icon sprite) must land together.
  - T030–T031 tests can run in parallel with later Phase 2 tasks once the schema is in (T006–T010).
- **Phase 3 (US1)**: T032–T036 are all `[P]` (different files); T037 depends on all of them; T038 depends on T037.
- **Phase 4 (US2)**: T039–T043 `[P]`; T044 depends on T039–T043; T045 depends on T044. T046 and T047 can run in parallel with any other US2 task after schemas land (T006).
- **Phase 5 (US3)**: T048–T053 `[P]`; T054 depends on T049–T053; T055 depends on T054's compose order; T056 and T057 depend on T055.
- **Phase 6 (US4)**: T058–T060 `[P]`; T061 depends on T058–T060; T062–T063 depend on T061.
- **Phase 7 (US5)**: T064 first; T065 depends on T064; T066 depends on T064; T067 depends on T066; T068 depends on T064; T069–T070 depend on T067.
- **Phase 8**: T078 is a "run the whole pipeline" task — run last.

### User story independence

- **US1**, **US2**, **US3**, and **US4** may ship in any order after Phase 2 completes. Each restyles an independent set of routes.
- **US5** may ship before or after US1–US4; it only requires Phase 2 (the tokens already define both theme palettes). Running US5 with US1 shipped and US2–US4 not yet restyled will simply toggle the new home chrome against the old category/about chrome — that's a valid interim state.

### Parallel opportunities

- **Phase 1**: T002 + T003 in parallel.
- **Phase 2**: All of T012–T022 (10 primitive files, each in its own file) in parallel; T030 + T031 in parallel with T023–T029 once schemas exist.
- **Phase 3**: T032 + T033 + T034 + T035 + T036 in parallel.
- **Phase 4**: T039 + T040 + T041 + T042 + T043 in parallel; T046 + T047 in parallel with all of them.
- **Phase 5**: T048 + T049 + T050 + T051 + T052 + T053 in parallel.
- **Phase 6**: T058 + T059 + T060 in parallel; T063 in parallel with T062.
- **Phase 7**: T064 alone; then T065 + T066 + T068 in parallel; then T067; then T069 + T070 in parallel.
- **Phase 8**: T071 + T072 + T073 + T074 + T075 + T076 + T077 + T080 in parallel; T078 and T079 run sequentially at the end.

---

## Parallel Example: User Story 1

```bash
# Launch all US1 component builds together (each in its own file):
Task: "Create public/blueprint/hero-home.svg"
Task: "Create src/components/CredibilityStrip.astro"
Task: "Rewrite src/components/Hero.astro"
Task: "Rewrite src/components/ProjectCard.astro"
Task: "Edit src/components/ProjectGrid.astro"

# Then serially:
Task: "Rewrite src/pages/index.astro"
Task: "Extend tests/e2e/home.spec.ts"
```

## Parallel Example: Phase 2 primitives

```bash
# All 10 primitives are independent files — launch together:
Task: "Create src/components/blueprint/CornerFrame.astro"
Task: "Create src/components/blueprint/IndexNumber.astro"
Task: "Create src/components/blueprint/PillChip.astro"
Task: "Create src/components/blueprint/IconChip.astro"
Task: "Create src/components/blueprint/MetricTile.astro"
Task: "Create src/components/blueprint/MetricPanel.astro"
Task: "Create src/components/blueprint/SparklineGlyph.astro"
Task: "Create src/components/blueprint/ArchitectureStrip.astro"
Task: "Create src/components/blueprint/IsoIllustration.astro"
Task: "Create src/components/blueprint/SystemsStrip.astro"
```

---

## Implementation Strategy

### MVP first (US1 → US2 → US3)

All three P1 stories are required to claim the redesign ships because the spec explicitly states "Zero pages surface the prior light/purple theme after the redesign ships" (SC-008). Therefore the MVP is **Phase 1 + Phase 2 + Phases 3 + 4 + 5**, delivered in one release:

1. Phase 1: Setup.
2. Phase 2: Foundational (tokens, schemas, primitives, shared chrome).
3. Phase 3: US1 Home.
4. Phase 4: US2 Category pages.
5. Phase 5: US3 About page.
6. **Stop and validate** against spec SC-001, SC-002, SC-003, SC-008, SC-009, SC-010.
7. Demo / deploy.

### Incremental follow-ups

8. Phase 6: US4 Project detail (P2) — polishes the detail pages to match.
9. Phase 7: US5 Theme toggle (P3) — enables light mode.
10. Phase 8: Polish — 404, README, responsive + routes tests, Lighthouse gate, DoD walk.

### Parallel team strategy

With multiple contributors:

1. Phase 1 + Phase 2 completed together (token / schema / chrome are shared dependencies nobody can bypass).
2. Once Phase 2 completes:
   - Developer A: US1 (Home).
   - Developer B: US2 (Category pages).
   - Developer C: US3 (About).
   - Developer D: US4 + US5 (project detail + theme toggle — both small, pair well).
3. Each developer lands their story's tests before merging; the four streams integrate against the shared chrome without conflict.

---

## Notes

- `[P]` tasks = different files, no dependencies on incomplete tasks.
- `[Story]` label maps the task to a specific user story for traceability.
- Every user story is independently demoable once Phase 2 completes.
- Commit after each task or logical group (pre_plan / pre_tasks / pre_implement hooks in `.specify/extensions.yml` prompt to auto-commit).
- Stop at any checkpoint to validate the corresponding user story against the spec Acceptance Scenarios.
- Avoid: hard-coding hex values (use tokens), modifying existing project Markdown beyond the two opt-in seeds (T046, T047), introducing new runtime dependencies.
