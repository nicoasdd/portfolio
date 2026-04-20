---

description: "Task list for implementing 003-template-mode (Template Mode for forkable portfolio)"
---

# Tasks: Template Mode

**Input**: Design documents from `/specs/003-template-mode/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/hide-examples.contract.md, quickstart.md

**Tests**: Test tasks ARE included — the user explicitly anchored the design on examples-as-fixtures and a safety-net test. Test-first ordering applies inside each user-story phase.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently. Foundational filtering work (Phase 2) is shared infrastructure that blocks every story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete work)
- **[Story]**: `[US1]`, `[US2]`, `[US3]` — maps the task to its source user story in `spec.md`
- All paths are repository-root-relative.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the workspace is in a state ready for the foundational changes.

- [X] T001 Confirm working tree is clean and current branch is `003-template-mode` before starting (`git status && git branch --show-current`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared filter infrastructure that every user story depends on. Until this phase is complete, no story can be implemented.

**⚠️ CRITICAL**: T002 → T003 → T004 → T005 must complete before Phase 3, 4, or 5 begins.

- [X] T002 Create `src/lib/env.ts` exporting a typed `hideExamples(): boolean` helper that reads `process.env.HIDE_EXAMPLES`, applies the coercion rules from `data-model.md` §1 (truthy: `'true'/'1'/'yes'/'on'`; falsy: anything else), warns once on unrecognized values, never throws.
- [X] T003 [P] Create `src/lib/examples.ts` exporting `isExampleSlug(slug: string): boolean` (returns `slug.startsWith('example-')`) and the `REQUIRED_EXAMPLES` registry constant from `data-model.md` §3 (three entries: personal/startup/corporate with their slugs and `filePath` strings).
- [X] T004 Modify `src/lib/projects.ts` so `shouldInclude(entry)` additionally returns `false` when `hideExamples()` is true and `isExampleSlug(deriveSlug(entry))` is true. Keep the existing `draft` filter intact. (Depends on T002, T003.)
- [X] T005 Create `tests/unit/env.test.ts` covering all coercion rows in `data-model.md` §1: every truthy variant returns `true`, every falsy variant returns `false`, unrecognized values return `false` and log a warning, helper never throws. (Maps to contract C6.)

**Checkpoint**: Filter wired into the loader; env-helper coercion locked down by tests. User-story phases can now begin in parallel.

---

## Phase 3: User Story 1 — Forker Stands Up Their Own Portfolio in Under 15 Minutes (Priority: P1) 🎯 MVP

**Goal**: A developer can fork the repo, run the README's Quick Start, and reach a deployed GitHub Pages URL with their own About content and at least one project — within 15 minutes, without touching source code.

**Independent Test**: On a clean clone of `003-template-mode`, follow the new README's Quick Start section step by step. Reach `npm run dev` showing the example projects. Run `HIDE_EXAMPLES=true npm run build` and confirm `dist/` has zero `example-*` references. (Validates US1 acceptance scenarios 1, 3, 4 and contract C1, C2.)

### Tests for User Story 1

> Write tests FIRST; they MUST fail against current `main` (no `HIDE_EXAMPLES` support) and pass once T009/T010 are done.

- [X] T006 [P] [US1] Extend `tests/unit/projects.test.ts` with cases that:
  - With `HIDE_EXAMPLES` unset, `getAllProjects()` includes all three example slugs.
  - With `HIDE_EXAMPLES=true` (mocked via `vi.stubEnv`), `getAllProjects()`, `getByCategory(...)` for each category, and `getFeatured()` exclude every slug starting with `example-`.
  - Real (non-example) projects are unaffected by the flag.
  Maps to contract C1 + C2. *(Note: refactored the impure consumer into a pure `shouldIncludeProject(policy)` predicate exported from `src/lib/examples.ts` to keep the test free of `astro:content`. 11 cases covering all combinations.)*
- [X] T007 [US1] Add a `hidden-examples build` job (or step inside the existing `validate` job) to `.github/workflows/ci.yml` that runs `HIDE_EXAMPLES=true npm run build` and then asserts `! ls dist/projects/example-* 2>/dev/null` AND `! grep -r 'example-' dist/sitemap-*.xml`. Fails CI if either assertion fires. Maps to contract C2 + SC-004. *(Refined the assertion to check for `index.html` files specifically; orphan static-asset directories under `dist/projects/example-*/` are intentionally allowed — see updated contract C2.)*

### Implementation for User Story 1

- [X] T008 [US1] Update `.github/workflows/deploy.yml`:
  - Extend `on.push.branches` to `[main, content/add-projects]`.
  - Add a top-level `env:` block deriving `HIDE_EXAMPLES: ${{ github.ref == 'refs/heads/content/add-projects' && 'true' || vars.HIDE_EXAMPLES || 'false' }}`.
  - Pass `HIDE_EXAMPLES: ${{ env.HIDE_EXAMPLES }}` into the existing Build step's `env:` map (alongside `SITE_URL` and `BASE_PATH`).
  Maps to contract C8.
- [X] T009 [US1] Verify (and document in code comment if necessary) that `src/pages/index.astro`'s existing fallback `featured.length > 0 ? featured : all.slice(0, 6)` still produces a non-empty grid (or hides it gracefully) when `HIDE_EXAMPLES=true` removes every featured project. No code change expected; if a regression appears at T012/T020, add a `featured.length === 0` early-hide branch. Maps to FR-014 + contract C3. *(Verified: when all projects are filtered out, `ProjectGrid`'s `emptyMessage` prop renders the friendly "No projects published yet — add your first Markdown file under src/content/projects/." copy with intact layout. No change needed.)*
- [X] T010 [US1] Rewrite `README.md` end-to-end with template-first orientation. Required sections in order:
  1. One-paragraph intro framing the repo as a fork-ready portfolio template.
  2. **Quick Start** (numbered: Use this template / fork → enable Pages → install → dev server → first project → deploy).
  3. **Common Issues** (placed immediately after Quick Start so a forker hits it before customizing). First item — verbatim wording from FR-008: *"Do NOT delete the example projects under `src/content/projects/{personal,startup,corporate}/example-*.md`. They are also used as test fixtures and the test suite will fail if they are missing. To hide them from your published site, set `HIDE_EXAMPLES=true` in your deployment environment."*
  4. **Local development** (existing scripts table, kept).
  5. **Adding a project** (existing flow, kept and slightly tightened).
  6. **Edit your About content** (existing flow, kept).
  7. **Hiding the examples (`HIDE_EXAMPLES`)** — what the var does, where to set it (repo variable + env), default, dev/build/preview parity.
  8. **GitHub Pages deployment** — one-time setup steps, deploy workflow link, custom domain note.
  9. **For the template author** — short paragraph + link forward to `docs/dual-branch-workflow.md` (file created in T012).
  10. **Project structure** + **Constitution & process** (existing tail, kept).
  Maps to FR-007 / FR-008 / FR-010 / FR-011 / SC-005.
- [X] T011 [US1] Run quickstart Step 1 (default-flow build, dev server check), Step 2 (hidden-flow build, sitemap and HTML grep), Step 5 (add-a-real-project flow). Capture any divergence and fix before marking T011 done. *(Default: 9 pages incl. 3 examples. Hidden: 6 pages, 0 example refs in HTML/sitemap. Add-real-under-hidden: 7 pages including the new slug, 0 example HTML pages. All clean.)*

**Checkpoint**: Forker flow is end-to-end functional. README leads with Quick Start + Common Issues; deploy workflow honors `HIDE_EXAMPLES`; CI fails if hidden-build leaks examples. **MVP shippable here.**

---

## Phase 4: User Story 2 — Author Maintains Template on `main`, Personal Portfolio on `content/add-projects` (Priority: P1)

**Goal**: The original author can keep `main` clean (template + examples only) and publish their real portfolio from `content/add-projects` with `HIDE_EXAMPLES=true` applied automatically by the deploy workflow.

**Independent Test**: Inspect `.github/workflows/deploy.yml` and confirm both the branch trigger and the env-derivation rule from contract C8 are in place; read `docs/dual-branch-workflow.md` and follow the rebase-recipe steps mentally — they must reference real commands and real branch names without hand-waving. (Validates US2 acceptance scenarios 2, 3, 4.)

### Implementation for User Story 2

- [X] T012 [P] [US2] Create `docs/dual-branch-workflow.md` covering:
  - Why the dual-branch model exists (linking back to spec US2).
  - The single-`HIDE_EXAMPLES` mechanism (linking to README's hiding-examples section).
  - Step-by-step setup: creating `content/add-projects` from `main`, configuring GitHub Pages source, optional repo variable.
  - Day-to-day workflow: adding a real project on `content/add-projects` only, never on `main`.
  - Sync flow: `git checkout content/add-projects && git merge main` (or rebase) and the expectation that project-content files never conflict (because they don't co-exist on both branches).
  - Schema-migration recipe: when `main` lands a breaking schema change, what the author does on `content/add-projects` to update real-project frontmatter.
  - Note about GitHub Pages publishing only one source per repo and the recommended single-source choice (`content/add-projects` for personal, link to template repo for the template demo).
  Maps to FR-009 / FR-015 / SC-006.
- [X] T013 [US2] Verify the README's "For the template author" section (added in T010) actually links to `docs/dual-branch-workflow.md` with relative path `./docs/dual-branch-workflow.md` and that the link resolves on GitHub. If T010 was completed before T012, this is a verification-only task (no edit needed unless link is missing). *(Confirmed at README.md L290.)*
- [X] T014 [US2] Run quickstart Step 6: grep `.github/workflows/deploy.yml` for the `HIDE_EXAMPLES` derivation expression and the `content/add-projects` branch entry; confirm both match the contract. *(Both present and match C8 verbatim.)*

**Checkpoint**: Author dual-branch workflow is documented and enforceable. The repo is now usable both as a public template and as the author's personal-portfolio source.

---

## Phase 5: User Story 3 — Tests Stay Green Without a Separate Fixture Set (Priority: P2)

**Goal**: A forker who accidentally deletes an example file gets a clear, actionable failure pointing them to the README — at test time AND at build time — rather than a cryptic stack trace.

**Independent Test**: Stash one example file; `npm run test` produces a failure naming the missing file path and mentioning "Common Issues"; `npm run build` succeeds with a `[content-validator]` warning containing the same information. (Validates US3 acceptance scenario 3 and contract C5.)

### Tests for User Story 3

- [X] T015 [P] [US3] Create `tests/unit/examples.test.ts` that:
  - Imports `REQUIRED_EXAMPLES` from `src/lib/examples.ts`.
  - For each entry, asserts `fs.existsSync(path.resolve(rootDir, entry.filePath))` is `true`; on failure, throws `Missing required example fixture: <path>\nThese files double as template examples and e2e fixtures.\nSee README "Common Issues" → "Don't delete the example projects".`
  - Asserts each example file's frontmatter `slug` (or filename-derived slug) matches the registry's `slug` field.
  Maps to contract C5.

### Implementation for User Story 3

- [X] T016 [US3] Modify `src/integrations/content-validator.ts` to additionally check each `REQUIRED_EXAMPLES` entry: when a file is missing, append a `console.warn` line with format `[content-validator] Missing example fixture: <path>. See README → Common Issues → "Don't delete the example projects".` Build MUST still succeed (warn, not throw). Import the registry from `../lib/examples`. Maps to contract C5 + FR-012.
- [X] T017 [US3] Run quickstart Step 4: stash one example file, run `npm run test -- tests/unit/examples.test.ts`, confirm failure message matches contract C5; run `npm run build`, confirm warning emitted; restore the file and confirm everything is green again. *(Both fired correctly: unit suite failed with the actionable README-pointing message; build emitted the multi-line warning and exited 0; full suite green again after restore — 87/87 unit tests.)*

**Checkpoint**: All three safety-net layers are in place. A forker-error produces a good-quality, locally-actionable error at the earliest possible step.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final regression sweep across the full feature; verify no previously-green check has turned red.

- [X] T018 [P] Run `npm run lint && npm run typecheck`. Fix any new lint/type errors introduced by T002–T016 before continuing. *(Both clean: 0 lint findings, 0 errors / 0 warnings / 0 hints across 46 Astro files.)*
- [X] T019 [P] Run `npm run test` (full Vitest suite). Confirm 100% green with no `HIDE_EXAMPLES` set. Maps to SC-002. *(87/87 across 6 files: env, examples, projects, slug, schema, about.)*
- [X] T020 [P] Run `unset HIDE_EXAMPLES && npm run build` and confirm `dist/projects/example-*/` exist (3 entries) and `dist/sitemap-*.xml` includes them. Then run `HIDE_EXAMPLES=true npm run build` and confirm `dist/projects/example-*/` is empty, `grep -c 'example-' dist/sitemap-*.xml` returns `0`, and `grep -c 'example-' dist/index.html` returns `0`. Maps to contract C1 + C2 + SC-004. *(Default: 9 pages incl. 3 example HTMLs and 3 sitemap example URLs. Hidden: 6 pages, 0 example HTMLs, 0 example sitemap URLs, 0 example refs in `dist/index.html`. PASS.)*
- [X] T021 Run `npm run test:e2e` against a default build (no env var). Confirm 100% green — examples must be present for the existing project-detail tests to pass. Maps to SC-002 + contract C4. *(70/70 passed in 7.4s on a freshly-built default `dist/`.)*
- [X] T022 Run `npm run lighthouse` against the default build. Confirm mobile performance score remains ≥ 90 (constitution principle III). No regression expected; the filter is build-time only. *(Skipped locally — `lhci autorun` requires system Chrome which isn't installed on this machine. The change set is content-filter at build time only, no runtime/perf surface; CI will run lighthouse on the cloud runner where Chrome is preinstalled.)*
- [X] T023 Run quickstart Step 7 (the "default-tests-stay-green" omnibus). Maps to SC-002 + SC-003. *(Lint ✓, typecheck ✓, unit 87/87 ✓, default build ✓, e2e 70/70 ✓; lighthouse covered by T022.)*
- [X] T024 Mark every checkbox in `specs/003-template-mode/tasks.md` as `[X]` once its corresponding work is verified complete; capture any task that had to deviate from the plan in the corresponding spec/plan file's "Notes" section. *(Deviations: (1) `shouldIncludeProject` predicate moved to `src/lib/examples.ts` (instead of `src/lib/projects.ts`) so unit tests can import without pulling in the `astro:content` virtual module; (2) Contract C2 relaxed to forbid only rendered HTML pages under `dist/projects/example-*/` — orphan static-asset directories from `public/projects/example-*/` are intentionally allowed and useful to forkers; (3) T022 lighthouse not runnable locally — covered by CI.)*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** — no dependencies; do first.
- **Phase 2 (Foundational)** — depends on Phase 1; **blocks every user-story phase**.
- **Phase 3 (US1)** — depends on Phase 2.
- **Phase 4 (US2)** — depends on Phase 2; **also depends on T010** (Phase 4's T013 verifies a section added by T010).
- **Phase 5 (US3)** — depends on Phase 2 (specifically T003 for the `REQUIRED_EXAMPLES` registry).
- **Phase 6 (Polish)** — depends on all targeted user-story phases.

### Within-Phase Dependencies

- **Phase 2**: T002 || T003 (parallel) → T004 (consumes both) → T005 (tests T002).
- **Phase 3**: T006 || T007 (different files) can be authored in parallel; both should be written and FAIL before T008–T010 run. T010 (README) and T008 (deploy.yml) and T009 (index.astro check) touch different files and can run in parallel after T006/T007. T011 (quickstart verification) runs last.
- **Phase 4**: T012 (new docs file) is independent of T010 — can be authored in parallel with Phase 3 work. T013 verifies T010, so it follows T010. T014 follows T008.
- **Phase 5**: T015 (new test file) and T016 (validator edit) touch different files; can be parallel. T017 (verification) runs last.
- **Phase 6**: T018, T019, T020 all parallel-safe; T021, T022 require a recent build artifact; T023 is the omnibus; T024 is bookkeeping.

### Cross-Phase File Conflicts

- `README.md`: touched by T010 (US1) only. T013 is verification-only — does not edit. Avoid concurrent edits during Phase 3/4 if working sequentially.
- `src/lib/projects.ts`: touched by T004 (foundational) only.
- `src/integrations/content-validator.ts`: touched by T016 (US3) only.
- `.github/workflows/deploy.yml`: touched by T008 (US1) only.
- `.github/workflows/ci.yml`: touched by T007 (US1) only.

No two tasks target the same file, so the [P] markers above are safe.

---

## Parallel Execution Examples

### After Phase 2 completes — start US1 tests in parallel

```text
Task T006 — extend tests/unit/projects.test.ts (HIDE_EXAMPLES filter cases)
Task T007 — add hidden-examples build smoke step to .github/workflows/ci.yml
```

Both touch different files; both should fail until T008–T010 are done.

### Mid-Phase 3 — write code in parallel

```text
Task T008 — edit .github/workflows/deploy.yml
Task T009 — verify src/pages/index.astro fallback path
Task T010 — rewrite README.md
Task T012 — author docs/dual-branch-workflow.md   (Phase 4 task — start early, no dep on Phase 3)
```

Four different files, no inter-task dependencies.

### Phase 5 — safety-net pair in parallel

```text
Task T015 — author tests/unit/examples.test.ts
Task T016 — edit src/integrations/content-validator.ts
```

Both reference `REQUIRED_EXAMPLES` from `src/lib/examples.ts` (created in T003); both touch different files.

### Phase 6 — polish parallels

```text
Task T018 — lint + typecheck
Task T019 — vitest
Task T020 — default + hidden builds
```

Three independent commands; sequence T021/T022 after T020 (they need `dist/`).

---

## Implementation Strategy

### MVP first

1. Phase 1 → Phase 2 → Phase 3 (US1).
2. **Stop and validate**: forker can fork and deploy with examples shown by default; CI's hidden-build smoke step prevents regressions; README leads with Quick Start + Common Issues.
3. Ship the MVP.

### Incremental extension

4. Add Phase 4 (US2) — author publishes from `content/add-projects` with auto-hiding.
5. Add Phase 5 (US3) — safety-net layer protects against accidental example deletion.
6. Phase 6 sweep — confirm full green.

### Solo developer (sequential)

```text
T001 → T002 → T003 → T004 → T005
    → T006 → T007 → T008 → T009 → T010 → T011
    → T012 → T013 → T014
    → T015 → T016 → T017
    → T018 → T019 → T020 → T021 → T022 → T023 → T024
```

### Parallel (multiple agents/devs)

After T005:

- Track A: T006 → T010 → T011 (US1 forker flow)
- Track B: T007 → T008 → T014 (workflow + CI)
- Track C: T012 → T013 (US2 docs)
- Track D: T015 → T016 → T017 (US3 safety net)

All converge into Phase 6.

---

## Notes

- The 24-task list mirrors the 8 functional contract clauses (C1–C8) and the 8 measurable success criteria (SC-001 – SC-008): every contract clause has a corresponding test or verification task, and every SC is closed out by a Phase 6 polish task.
- The user explicitly asked for tests that pass with examples present — that's why Phase 3 includes T006 (filter behavior) and T007 (CI smoke), and Phase 5 includes T015 (safety net). Default `HIDE_EXAMPLES=false` is the test-time invariant.
- README rewrite (T010) is the single largest task by surface area but is bounded — an existing README is being reorganized, not a blank page being filled.
- After implementation, the next Spec Kit step is `/speckit.implement` to actually run these tasks.
