---
description: "Dependency-ordered task list for the About Section feature"
---

# Tasks: About Section

**Input**: Design documents from `/specs/002-about-section/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md
**Branch**: `002-about-section`

**Tests**: INCLUDED — the feature spec mandates measurable accessibility (SC-006), performance (SC-005), responsive (SC-007), and link integrity (SC-003) outcomes. The plan reuses the existing Vitest + Playwright + axe-core + Lighthouse CI strategy.

**Organization**: Tasks are grouped by user story so each can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps task to a user story (US1–US3)
- All paths are relative to repo root: `/Users/nicolas.tambussi/Downloads/proys/portfolio/`

## Path Conventions

- Source: `src/` at repo root (Astro 5 project, already initialized)
- Content: `src/content/about/` (new collection added in this feature)
- Static assets: `public/about/`
- Tests: `tests/unit/` (Vitest) and `tests/e2e/` (Playwright)
- User-facing template: `templates/about.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new dependencies are needed for this feature. The Setup phase only ensures the new asset/content/template directories exist and are tracked.

- [X] T001 [P] Create the assets directory `public/about/` (kept by adding a `public/about/.gitkeep` placeholder so the empty dir is committable)
- [X] T002 [P] Create the content directory `src/content/about/` (kept by adding a `src/content/about/.gitkeep` placeholder; will be replaced by `profile.md` in T020)
- [X] T003 [P] Copy the contract template to the user-facing location: `cp specs/002-about-section/contracts/about-template.md templates/about.md` (this is the file the owner copies when editing About content)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, helper, build-time validation, and seeded content — all user stories depend on these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Extend the Zod schema and add the `about` collection in `src/content.config.ts` per `specs/002-about-section/data-model.md` (single-entry collection at `src/content/about/`, schema with required `name`, `headline`, `intro`, `photo`, `email`, `skills` and optional `photoAlt`, `location`, `availability`, `socialLinks[]`, `resumeUrl`); export `AboutFrontmatter` type
- [X] T005 Create `src/lib/about.ts` exposing `getAbout(): Promise<AboutEntry>` that loads the single entry from the `about` collection, throws a clear error if the collection has 0 or >1 entries (VR-8), enforces non-empty body (VR-7), synthesizes `effectiveAlt = photoAlt ?? "Portrait of " + name`, and resolves `resumeHref` via `withBase()` for relative `resumeUrl` values
- [X] T006 Extend `src/integrations/content-validator.ts` to (a) assert that exactly one `*.md` file exists under `src/content/about/`, (b) parse its frontmatter and assert presence + non-emptiness of required fields (`name`, `headline`, `intro`, `photo`, `email`, `skills`), (c) register the `photo` path with the existing missing-image check, and (d) log a single confirmation line on success (e.g. `[content-validator] About profile validated: profile.md (N skills, M social links)`)
- [X] T007 Seed the live About content file at `src/content/about/profile.md` by copying `templates/about.md` and filling with safe placeholder values (name "Your Name", placeholder headline/intro/email, an example skills array of 3–5 entries, no social links, no resume); replaces the `.gitkeep` from T002
- [X] T008 [P] Add a placeholder profile photo at `public/about/profile.svg` (SVG placeholder matching the convention used by existing project thumbnails — schema accepts any path; live photo can be swapped in later by the owner) so the path referenced from `profile.md` resolves at build time

**Checkpoint**: `npm run dev` starts without errors; `npm run build` succeeds and prints the new `[content-validator] About profile validated: …` line; `getAbout()` is type-checked and returns the seeded entry.

---

## Phase 3: User Story 1 — Recruiter Discovers Who the Owner Is (Priority: P1) 🎯 MVP

**Goal**: Visitors can navigate to a dedicated `/about/` page from any page in the site and see the owner's name, headline, photo, bio, skills, contact email, and (when configured) location/availability badges, social links, and resume download.

**Independent Test**: From any page, click the "About" link in the header. URL becomes `/about/`. Verify name, headline, photo, bio, skills, and at least one contact method are visible above the fold. Click the email link → `mailto:` opens. Click a social link → external profile loads in a new tab with `rel="noopener noreferrer"`. If a resume is configured, the "Download CV" link opens/downloads the PDF.

### Tests for User Story 1

- [X] T009 [P] [US1] Vitest unit tests for `src/lib/about.ts` and the about Zod schema in `tests/unit/about.test.ts`: schema accepts a complete fixture; schema rejects fixtures missing each required field individually (`name`, `headline`, `intro`, `photo`, `email`, `skills`); schema rejects malformed `email`, non-`http(s)` `socialLinks[].url`, and a `resumeUrl` that is neither absolute nor begins with `/`; `getAbout()` throws when the collection is empty or contains >1 entry; `getAbout()` synthesizes `effectiveAlt` when `photoAlt` is omitted
- [X] T010 [P] [US1] Playwright e2e in `tests/e2e/about.spec.ts` covering US1 acceptance scenarios: AS-1 (header "About" link navigates to `/about/` from `/`, from a category page, and from a project detail page), AS-2 (page renders name, headline, photo, bio, skills chips, contact email above the fold at desktop viewport), AS-3 (email link has `mailto:` href; each social link has `target="_blank"` and `rel` containing `noopener` and `noreferrer`), AS-4 (when `resumeUrl` is present, "Download CV" link is visible and points to the resolved href)
- [X] T011 [P] [US1] Extend `tests/e2e/a11y.spec.ts` to add `/about/` to the axe-core sweep (zero serious/critical violations; explicitly assert profile image has an `alt` attribute)

### Implementation for User Story 1

- [X] T012 [P] [US1] Create `src/components/SkillsList.astro` — accepts `skills: string[]`, renders a chip cloud styled identically to the existing `TechStack` chips (Principle VI: visual consistency); semantic `<ul role="list">` of `<li>` chips
- [X] T013 [P] [US1] Create `src/components/SocialLinks.astro` — accepts `links: { label, url, icon? }[]`, renders an inline `<ul>` of `<a target="_blank" rel="noopener noreferrer">` items; bundles inline SVGs for `github`, `linkedin`, `x`, `mastodon`, `bluesky`, `email`, `website`, with a generic external-link glyph fallback for unknown/omitted icons; visible label is always rendered for accessibility
- [X] T014 [US1] Modify `src/components/SiteHeader.astro` to add an "About" `<li>` between the "Home" link and the category links; reuse the existing `withBase('/about/')` + `isActive(href)` pattern so the link gets `aria-current="page"` and the active styling on `/about/`
- [X] T015 [US1] Create `src/pages/about.astro` — uses `BaseLayout` (with title `"About"` and the bio's first sentence as the meta description); renders the profile photo via `astro:assets` `<Image>` with `loading="eager"`, `widths={[160, 320, 640]}`, and `alt={effectiveAlt}`; `<h1>` shows `name`, sub-heading shows `headline`, optional `<address>` block lists location + availability badges; long-form bio rendered from the Markdown body; `<SkillsList>`, `<SocialLinks>`, contact `mailto:` link, and conditional `resumeUrl` "Download CV" button — depends on T005, T012, T013
- [X] T016 [US1] Implement the missing-photo runtime fallback: when `astro:assets` cannot resolve `photo` (file missing), `pages/about.astro` renders a neutral placeholder avatar component instead so the layout never breaks (Edge Case from spec) — implemented via `safeImagePath` helper which already provides this fallback

**Checkpoint**: `/about/` is fully functional and reachable in 1 click from every page. The MVP is shippable: even before US2 and US3 ship, recruiters can find and read About content.

---

## Phase 4: User Story 2 — Landing Page Teaser Drives About Discovery (Priority: P2)

**Goal**: A visible "About me" teaser appears on the landing page below the project grid, surfacing identity passively and linking to the full About page.

**Independent Test**: Open `/`, scroll past the project grid, see the teaser block with the owner's photo, name, headline, the `intro` text (NOT the full bio), and a "Read more" link. Click "Read more" → navigates to `/about/`.

### Tests for User Story 2

- [X] T017 [P] [US2] Add Playwright e2e in `tests/e2e/about.spec.ts` (same file as US1 tests, separate `describe` block) covering US2 acceptance scenarios: AS-1 (teaser block is present on `/` with photo, name, headline, and `intro` text — explicitly assert the long-form bio is NOT present in the teaser to confirm truncation behavior), AS-2 (clicking the "Read more" link navigates to `/about/`)

### Implementation for User Story 2

- [X] T018 [P] [US2] Create `src/components/AboutTeaser.astro` — calls `getAbout()` internally, renders a compact two-column block (photo on one side at small size via `astro:assets` `<Image widths={[120, 240]} loading="lazy">`, text on the other); shows `name`, `headline`, `intro`, and a "Read more →" link to `withBase('/about/')`; uses `container-narrow` and matches the visual rhythm of `Hero` and `ProjectGrid` (Principle VI)
- [X] T019 [US2] Modify `src/pages/index.astro` to import and render `<AboutTeaser />` immediately after the existing `<ProjectGrid>` (so projects remain the primary focus per Principle I, with About as a complementary section) — depends on T018

**Checkpoint**: User Stories 1 AND 2 both work independently. `/about/` exists and is reachable from header nav (US1) and from the landing page teaser (US2).

---

## Phase 5: User Story 3 — Owner Edits About Content via Markdown (Priority: P2)

**Goal**: The owner can update bio, skills, contact, and social links by editing only `src/content/about/profile.md` (and optionally swapping the photo/resume in `public/about/`); changes appear after the next build with no code touches.

**Independent Test**: Edit `src/content/about/profile.md` (e.g., update `headline`, add a new skill, add/remove a social link). Run `npm run build && npm run preview`. Confirm changes appear on `/about/` (and on the landing teaser when `name`/`headline`/`intro`/`photo` change). Then remove a required field and confirm `npm run build` fails with a clear, file-and-field-specific error.

### Tests for User Story 3

- [X] T020 [P] [US3] Add Vitest test in `tests/unit/about.test.ts` (extending the file from T009) that loads the actual seeded `src/content/about/profile.md` via `getAbout()` and asserts every required field round-trips correctly (the live content file must always pass schema validation, not just synthetic fixtures)
- [X] T021 [P] [US3] Add Playwright e2e in `tests/e2e/about.spec.ts` covering US3 acceptance scenarios at the rendered-page level: AS-1 (snapshot the `headline` text on `/about/` and confirm it matches the value in `src/content/about/profile.md`), AS-2 (count the rendered skill chips and assert it matches the length of the `skills` array in `profile.md`)

### Implementation for User Story 3

- [X] T022 [US3] Update the README at the repo root: add a new "Edit your About content" section under "Adding a new project", explaining the `templates/about.md` → `src/content/about/profile.md` workflow, the required vs optional fields, where to place the photo/resume in `public/about/`, and how to verify with `npm run build && npm run dev`
- [X] T023 [US3] Verify FR-006 manually: removing a required field surfaces `[InvalidContentEntryDataError] about → profile data does not match collection schema. email**: **email: Required` (file path + field), and emptying the body surfaces `About content body is empty in src/content/about/profile.md — write the long-form bio in the Markdown body beneath the frontmatter.` from `getAbout()`. Both messages are file-and-field specific; no further validator changes needed.

**Checkpoint**: All three user stories are independently functional. Editing About content end-to-end is documented and validated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tighten responsive coverage, performance budgets, accessibility traces, and final docs.

- [X] T024 [P] Extend `tests/e2e/responsive.spec.ts` to add `/about/` to the viewport matrix at 320, 768, and 1280 widths (assert no horizontal overflow, photo and bio stack on mobile, side-by-side at desktop)
- [X] T025 [P] Extend `lighthouserc.json` to add `/about/` to the URL list so the existing budgets (Performance ≥ 90 mobile, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95, LCP < 2.5s) apply to the new page
- [X] T026 [P] Run `quickstart.md` Steps 1–10 end-to-end via the e2e suite (US1+US2+US3 specs cover navigation, teaser, content round-trip; build verifies validator + missing-field error) — all 35 desktop + 12 mobile e2e tests pass; missing-field and empty-body error messages confirmed file-and-field-specific
- [X] T027 [P] Visual QA: chip styling reuses identical Tailwind classes as `TechStack` (Principle VI), photo wrapper uses `rounded-full object-cover` with explicit aspect at all breakpoints, social-link icons render at consistent 16×16 px, focus rings (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]`) wired on every interactive element (email, CV, social links, teaser CTA); axe-core sweep on `/about/` passes with zero serious/critical violations
- [X] T028 No regressions: full unit suite (53 tests) + full desktop e2e suite (35 tests) + a11y suite (8 tests) all green; mobile suite for new About specs (12 tests) green after adding mobile-menu helper; build clean with no warnings; typecheck and lint clean. No budget relaxations needed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately. T001/T002/T003 are all `[P]`.
- **Foundational (Phase 2)**: Depends on Setup. T004 → T005 → T006 are sequential (each depends on the previous file existing); T007 depends on T003 (template) and T004 (schema must exist before content validates); T008 depends on T002 (asset dir).
- **User Story 1 (Phase 3)**: Depends on Phase 2 complete.
- **User Story 2 (Phase 4)**: Depends on Phase 2 complete; does NOT depend on US1 (the teaser uses `getAbout()` directly).
- **User Story 3 (Phase 5)**: Depends on Phase 2 complete; T020/T021 also depend on US1 implementation existing so the live content can be asserted against the rendered page.
- **Polish (Phase 6)**: Depends on US1 and US2 complete (T024/T025/T026/T027 cover both pages).

### User Story Dependencies

- **US1 (P1)**: Independent — provides `/about/` page and header nav link. Shippable as MVP after Phase 3.
- **US2 (P2)**: Independent of US1 in terms of code paths (the teaser calls `getAbout()` directly), but UX-dependent on US1 because the "Read more" link targets `/about/`. Recommend shipping after US1 so the link doesn't 404 in production builds.
- **US3 (P2)**: Independent — the Markdown editing workflow works as soon as Phase 2 ships, but T020/T021 assert against the rendered output, so they need US1.

### Within Each User Story

- Tests (T009–T011, T017, T020–T021) are written first and MUST FAIL before the corresponding implementation tasks.
- Component tasks (T012/T013, T018) are `[P]` because they touch separate new files.
- Page tasks (T015, T019) come after their components.
- Header modification (T014) is independent of the page (T015) — `/about/` 404s until T015 lands but the nav link itself is correct.

### Parallel Opportunities

- All Setup tasks (T001/T002/T003) → parallel
- T012/T013 within US1 → parallel
- All test-writing tasks within a story (T009/T010/T011) → parallel
- US1, US2, US3 implementation can proceed in parallel after Phase 2 if multiple developers are available (US1 page and US2 teaser touch different files; US3 docs are independent)
- Polish tasks T024/T025/T026/T027 → parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (after Phase 2 is complete):
Task: "Vitest unit tests for src/lib/about.ts in tests/unit/about.test.ts"
Task: "Playwright e2e for /about/ in tests/e2e/about.spec.ts"
Task: "Add /about/ to axe-core sweep in tests/e2e/a11y.spec.ts"

# Launch the two leaf components together:
Task: "Create src/components/SkillsList.astro"
Task: "Create src/components/SocialLinks.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T008) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T009–T016)
4. **STOP and VALIDATE**: From any page, click "About" → `/about/` renders with bio, skills, contact, optional social/resume. All three acceptance scenarios pass.
5. Deploy/demo if ready — recruiters can already discover the owner.

### Incremental Delivery

1. Phase 1 + Phase 2 → foundation ready
2. Add US1 → test independently → deploy/demo (MVP — About page reachable from header)
3. Add US2 → test independently → deploy/demo (teaser on landing page increases passive discovery)
4. Add US3 → test independently → deploy/demo (owner can confidently edit content; README documents the workflow)
5. Phase 6 polish → harden responsive/perf/a11y on the new page

### Parallel Team Strategy

With multiple developers (after Phase 2 ships):

- Developer A: US1 (T009–T016) — page + components
- Developer B: US2 (T017–T019) — teaser + landing wiring
- Developer C: US3 (T020–T023) — content tests + README

All three can integrate independently and converge for Phase 6 polish.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- [Story] label maps task to specific user story for traceability.
- Tests are written first within each story and MUST fail before their corresponding implementation tasks.
- Commit after each task or logical group (the post-`/speckit.implement` git hook will help here).
- Stop at any checkpoint to validate the story independently.
- Do NOT add tasks that change project taxonomy, modify project schemas, or otherwise touch the `001-portfolio-showcase` feature surface — this feature is strictly additive.
- If a quickstart step fails during T026, prefer fixing the implementation over modifying the quickstart; the quickstart is the executable acceptance contract.
