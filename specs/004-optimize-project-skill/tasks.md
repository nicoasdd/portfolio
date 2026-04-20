---

description: "Task list for implementing 004-optimize-project-skill (Resume-Aligned Project Optimizer Skill)"
---

# Tasks: Resume-Aligned Project Optimizer Skill

**Input**: Design documents from `/specs/004-optimize-project-skill/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/skill-invocation.contract.md, quickstart.md

**Tests**: No new automated tests are introduced — the deliverable is a Cursor agent skill (a Markdown prompt), not runtime code. The regression net is the existing `tests/unit/schema.test.ts` and `tests/unit/projects.test.ts`, plus the runnable acceptance walkthrough in [quickstart.md](./quickstart.md). Validation tasks within each user-story phase exercise the contract clauses end-to-end against the example projects.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently. The foundational `reference.md` (Phase 2) is shared by all three stories and blocks every implementation phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete work)
- **[Story]**: `[US1]`, `[US2]`, `[US3]` — maps the task to its source user story in `spec.md`
- All paths are repository-root-relative.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up the new skill directory next to the existing `add-project-from-repo` skill so subsequent phases have a place to write into.

- [ ] T001 Create the skill directory `.cursor/skills/optimize-project-from-resume/` and seed two empty files: `SKILL.md` and `reference.md`. Verify with `ls -la .cursor/skills/optimize-project-from-resume/` that both files exist next to the existing `.cursor/skills/add-project-from-repo/`. (Maps to plan.md → "Project Structure" → Source Code.)
- [ ] T002 Confirm working tree is clean and current branch is `004-optimize-project-skill` before starting Phase 2 (`git status && git branch --show-current`). The skill author commits incrementally so a clean baseline matters. (Mirrors the convention used in `specs/003-template-mode/tasks.md` T001.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build `.cursor/skills/optimize-project-from-resume/reference.md` — the lookup tables (career-stage taxonomy, voice rules, schema cheatsheet, confidentiality guard, idempotency rubric, error table) that every step of the SKILL.md workflow links into. Splitting these out keeps the agent's working context lean per step and makes the rules independently auditable (per plan.md → "Structure Decision").

**⚠️ CRITICAL**: T003 → T009 must complete before Phase 3 begins, because every workflow step in SKILL.md cites a section of `reference.md`.

- [ ] T003 Add a top-of-file "Purpose" section to `.cursor/skills/optimize-project-from-resume/reference.md` describing the file as the lookup-table sibling of `SKILL.md`, listing the sections that follow, and stating the scope boundary: "This skill rewrites *narrative* content only — see the Rewrite vs. Preserve table below." (Maps to plan.md Summary point 2 + FR-005.)
- [ ] T004 Add the **Career-stage taxonomy** section to `.cursor/skills/optimize-project-from-resume/reference.md`. Enumerate the six coarse stages from research.md R2 (`junior`, `mid`, `senior`, `staff`, `principal`, `founder`) with: (a) detection cues (years of experience + most-recent-role title cues + scope cues), (b) the scope/ownership verbs each stage may use ("learned"/"contributed" → "owned"/"led"/"mentored"), (c) anti-cues (what *not* to claim at each stage). Cite spec FR-003 + acceptance scenario US1#3.
- [ ] T005 Add the **Voice and anti-patterns** section to `.cursor/skills/optimize-project-from-resume/reference.md`, copying the discipline of `add-project-from-repo/SKILL.md`'s "Voice and style": first-person; past or present tense; no marketing fluff; explicit ban list (`leveraged`, `robust`, `seamless`, `cutting-edge`, `powerful`, `unlock`, `synergy`, `next-generation`); em-dash in highlight labels; concrete numbers over adjectives. Note that this section is the single source of truth — `SKILL.md` MUST link to it rather than restating. (Maps to research.md R7 + Constitution VI.)
- [ ] T006 Add the **Rewrite vs. Preserve cheatsheet** to `.cursor/skills/optimize-project-from-resume/reference.md` as a table sourced from data-model.md §3 and research.md R11. Two columns: *Rewriteable narrative* (`title`, `description`, `role`, every body section) vs. *Immutable fact / identity / configuration* (`slug`, `period`, `techStack`, `thumbnail`, `screenshots[]`, `links.{source,live,caseStudy}`, `featured`, `order`, `draft`, every front-matter delimiter and key, every body heading line, every embedded image ref / hyperlink / fenced code block / table / inline HTML / explicit line break). Include the rationale column from research.md R11 (slug = URL identity + test fixture pin; period/techStack = historical fact; etc.). Cite spec FR-005 + FR-015 + contract C2.
- [ ] T007 Add the **Schema cheatsheet** to `.cursor/skills/optimize-project-from-resume/reference.md` summarising the length limits enforced by `src/content.config.ts` `projectSchema` for the now-rewriteable fields: `title.length ∈ [1, 80]`, `description.length ∈ [1, 240]`, `role.length ∈ [1, 80]`. Document the **self-tighten retry policy** from contract C3: on length failure for one of those three fields, the skill makes exactly one re-generation pass instructing itself to tighten; on second failure, the project is marked `failed: schema validation (<field>)` and not written. (Maps to FR-010 + C3.)
- [ ] T008 Add the **Confidentiality guard** section to `.cursor/skills/optimize-project-from-resume/reference.md`. Document the rule from research.md R6 + contract C4: when the target file path matches `src/content/projects/{corporate,startup}/**`, the skill derives only `(career_stage, scope_register, vocabulary_themes)` from the resume — never proper nouns. Spell out the *expanded surface*: the guard applies to `title`, `description`, `role`, AND every body section, not just the body. Specify how to build the per-project allow-list: capitalised tokens already present in the original front matter (excluding `techStack`) and original body. Specify the inspection + one-reprompt loop from C4. (Maps to Constitution II + spec FR-006.)
- [ ] T009 Add the **Idempotency rubric** + **Error condition table** to `.cursor/skills/optimize-project-from-resume/reference.md`:
  1. *Idempotency rubric* (research.md R5, contract C8, SC-006): three layered constraints — (a) feed the current project text into the rewrite step and instruct the model to keep wording it would otherwise re-emit, (b) pin voice via the anti-patterns section above, (c) rely on the diff-and-confirm gate as the natural drift filter. Calibration target: <5 changed lines on a same-input rerun in 9/10 cases.
  2. *Error condition table* — copy contract C9 verbatim (resume not found / scanned PDF / selector miss / empty glob / malformed front matter / missing conventional section / custom section / length over limit / non-length schema fail / confidentiality fail / declined / uncommitted / build fail). The SKILL.md workflow steps MUST link to specific rows of this table.

**Checkpoint**: `reference.md` is complete and self-contained. Phase 3 can begin — every workflow step in `SKILL.md` will cite a section of this file.

---

## Phase 3: User Story 1 — Optimize a single project against my current resume (Priority: P1) 🎯 MVP

**Goal**: Point the skill at one existing project file and one resume; get every narrative segment (`title`, `description`, `role`, all body sections) rewritten to today's career stage; have every fact / identity / configuration field preserved byte-for-byte; never get a silent overwrite.

**Independent Test**: Run [quickstart.md](./quickstart.md) Steps 1, 2, 3, 5, 6, 8 against the existing example projects (`src/content/projects/personal/example-personal.md`, `src/content/projects/corporate/example-corporate.md`). Each step's `git diff` and `grep` checks pass without manual prompt corrections. Validates US1 acceptance scenarios 1–4 plus contracts C1–C6, C8, C9.

### Implementation for User Story 1

All tasks in this phase write into `.cursor/skills/optimize-project-from-resume/SKILL.md`. They are sequential because they all touch the same file (per the [P] rule: same file = not parallel).

- [ ] T010 [US1] Write the SKILL.md frontmatter and top-of-file framing in `.cursor/skills/optimize-project-from-resume/SKILL.md`: YAML frontmatter with `name: optimize-project-from-resume` and a `description` that triggers on phrases like *"optimize project copy"*, *"refresh project narrative from resume"*, *"align portfolio entries with my current career stage"*, *"rewrite project description against resume"*. Mirror the descriptor style of `.cursor/skills/add-project-from-repo/SKILL.md` so skill discovery is consistent. Add a one-paragraph "What this skill does" intro that names the scope: rewrites *every narrative segment*, preserves *every fact / identity / configuration field* — and links to `reference.md` § Rewrite vs. Preserve.
- [ ] T011 [US1] Add the **Inputs** section to `.cursor/skills/optimize-project-from-resume/SKILL.md` mapping directly to contract C1: `resume_path` (REQUIRED, `.md` or `.pdf`), `project_selector` (OPTIONAL — path or slug), `guidance` (OPTIONAL, US3), `excluded` (OPTIONAL, batch only). State the no-mutation-flag rule from C1: there is no flag that disables the diff-and-confirm gate, no `--auto-yes`, no `--force` global toggle. (Per-file opt-in for the uncommitted-changes guard is handled in Step 3 below — different scope.)
- [ ] T012 [US1] Add **Step 1 — Read inputs** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: invoke the agent's `Read` tool against `resume_path` (handles both `.md` and `.pdf`). Branch on result: missing file → C9 row 1; empty / near-empty result → C9 row 2 (suggest Markdown version, do not retry). Resolve `project_selector` to a concrete file path under `src/content/projects/`: a path → use as-is; a slug → `Glob` for `src/content/projects/*/<slug>.md`; unset → defer to batch mode (Phase 4). Selector miss → C9 row 3.
- [ ] T013 [US1] Add **Step 2 — Extract resume signals** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: from the resume text, derive `current_career_stage` (one of the six stages from `reference.md` § Career-stage taxonomy), `historical_stages` as a list of `{ stage, start, end }` rows, and `vocabulary_themes` (top 5–10 recurring focus areas + technologies). Document the historical-vs-current selection rule from research.md R8 + spec FR-007: if the project's `period.end` is `present` or within the most-recent role's window, write from `current_career_stage`; otherwise pick the historical stage active during `period.end`. Cite acceptance scenario US1#3.
- [ ] T014 [US1] Add **Step 3 — Per-project pre-flight** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: run `git status --porcelain -- <project-path>` per contract C6. Empty → proceed. Non-empty + no explicit verbal opt-in for *this file* → mark `skipped: uncommitted changes`, do NOT show the diff, do NOT write. Non-empty + opt-in → proceed but prepend the warning line `WARNING: <P> has uncommitted changes; proceeding will overwrite them.` above the diff. Also parse the file as front matter + body: parse failure → C9 row 5 (`failed: malformed front matter`).
- [ ] T015 [US1] Add **Step 4 — Build confidentiality context** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: if the project file path matches `src/content/projects/{corporate,startup}/**`, build the `existing_names` allow-list per data-model.md §5 — the set of capitalised proper-noun tokens already present in the original front matter (excluding `techStack`) and original body. If the path matches `src/content/projects/personal/**`, the allow-list is unconstrained (per C4 last paragraph). Carry this context into Step 6.
- [ ] T016 [US1] Add **Step 5 — Parse body into heading-bounded sections** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: split the body on `^##\s+<title>\s*$` headings into an ordered list of `(heading_line, prose, embedded_blocks)` triples per research.md R9. Embedded blocks include: image refs (`![alt](path)`), hyperlinks `[text](url)`, fenced code blocks, tables, inline HTML, explicit line breaks. Spell out: only the *prose* slot is rewriteable; heading lines and embedded blocks are passed through verbatim. Detect missing conventional sections (`## Highlights`, `## Lessons Learned`) and queue them for creation after `## Overview` (or end of body if no `## Overview`) per C9 row 6 + C2 permitted-difference 5. Detect custom sections (`## Demo`, `## Architecture`, etc.) and treat them identically per C9 row 7.
- [ ] T017 [US1] Add **Step 6 — Generate rewritten content** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: produce candidate `title`, `description`, `role`, and a rewritten prose slot for each body section. The generation prompt MUST explicitly: (a) cite `reference.md` § Career-stage taxonomy with the chosen stage, (b) cite `reference.md` § Voice and anti-patterns, (c) inject the `existing_names` allow-list from Step 4 as a hard rule when present, (d) feed the *current* prose for each segment as a "preserve where you can" anchor (idempotency — `reference.md` § Idempotency rubric), (e) NEVER invent technologies / employers / dates / customers / outcomes not present in the project file or resume (FR-006).
- [ ] T018 [US1] Add **Step 7 — Schema validation + self-tighten** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: re-assemble the front matter (preserving keys, order, delimiters per C2) + body, then validate against `projectSchema` from `src/content.config.ts`. On length failure for `title` / `description` / `role` only: one re-generation pass instructing the model to tighten the offending field(s); record those names in `self_tightened_fields`. On any other validation failure or repeat length failure: mark `failed: schema validation (<field>)`, do NOT write, continue. (Maps to C3 + C9 rows 8 + 9.)
- [ ] T019 [US1] Add **Step 8 — Confidentiality inspection + reprompt** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: only when the project lives under `corporate/` or `startup/`. Scan every rewritten segment (`title`, `description`, `role`, every body prose slot) for capitalised tokens absent from the `existing_names` allow-list from Step 4. On hit: one re-prompt with the offending tokens called out + the allow-list re-injected. On second-pass hit: mark `failed: confidentiality guard tripped (<tokens> in <segment>)`, do NOT write, continue. (Maps to C4 + C9 row 10.)
- [ ] T020 [US1] Add **Step 9 — Show diff and confirm** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: present a unified diff between the on-disk file and the rewritten file covering every changed segment (front-matter + body). Require an explicit `yes` / `no` / `skip`. `no` or `skip` → mark `skipped: declined`, do NOT write. Any other reply → re-ask once; on second non-`yes` → `skipped: declined`. State the absolute rule: no flag, no mode, no global silencer can bypass this gate (echoes C5 last paragraph + SC-005).
- [ ] T021 [US1] Add **Step 10 — Write file and report** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: on `yes` from Step 9, perform the write via `StrReplace` (segment-by-segment) so unchanged regions are not retouched. Emit a one-line per-project status using the visual format: `✓ optimized: <slug> (rewrote <N> sections, self-tightened: [<fields>])` or `↷ skipped: <slug> (<reason>)` or `✗ failed: <slug> (<reason>)`. (Maps to FR-013 line shape + R10.)
- [ ] T022 [US1] Add an **Anti-patterns** section at the bottom of `.cursor/skills/optimize-project-from-resume/SKILL.md` mirroring the convention used in `add-project-from-repo/SKILL.md`: never edit assets under `public/projects/`; never rename files; never change `slug`; never change `period`/`techStack`/asset paths/links/`featured`/`order`/`draft`; never add YAML keys; never reorder front matter keys; never reorder or rename body section headings; never inline a fenced code block as prose; never run in parallel in batch mode; never auto-yes the diff. Each bullet cites the FR or contract clause it enforces.

### Validation for User Story 1

These tasks exercise the SKILL.md prompt against real project files and tune the prompt if reality diverges from contract. They are sequential because each one mutates a project file and needs a clean checkout for the next one (`git checkout -- <file>` between runs).

- [ ] T023 [US1] Run [quickstart.md](./quickstart.md) **Step 1** end-to-end on `src/content/projects/personal/example-personal.md` against a sample Markdown resume. Verify the `git diff` shows changes confined to `title`, `description`, `role` in the front matter and the prose inside `## Overview` / `## Highlights` / `## Lessons Learned`; verify *no* other front-matter key, no heading line, and no embedded link/code/image moved. If a violation appears, tighten the relevant SKILL.md step and re-run. Validates US1 scenario 1 + C2 + C5.
- [ ] T024 [US1] Run [quickstart.md](./quickstart.md) **Step 2** with a PDF version of the same resume. Verify the diff is qualitatively equivalent to T023's diff — same career-stage signals, same voice, same preserved-vs-rewritten boundary. Validates US1 scenario 2 + FR-001.
- [ ] T025 [US1] Run [quickstart.md](./quickstart.md) **Step 3** on `src/content/projects/corporate/example-corporate.md`. Verify with `grep` over the rewritten file (front matter + body) that no proper-noun token from the resume that wasn't already in the original file appears in the rewrite. Trip the guard deliberately (insert a fake employer name into the resume that's *not* in the project file) and verify the second run prints `failed: confidentiality guard tripped (<token> in <segment>)` without writing. Validates Constitution II + C4 + C9 row 10.
- [ ] T026 [US1] Run [quickstart.md](./quickstart.md) **Step 5** on the file produced by T023 (already optimized). Verify `git diff` after the second run is fewer than 5 changed lines. If the threshold is exceeded, sharpen `reference.md` § Idempotency rubric (e.g. add stronger "preserve current wording where it already passes the voice rules" instruction in SKILL.md Step 6) and re-run until 9/10 attempts hit the threshold. Validates FR-012 + SC-006 + C8.
- [ ] T027 [US1] Run [quickstart.md](./quickstart.md) **Step 6**: dirty a project file (`echo "" >> <file>`), run the skill *without* the per-file opt-in, and verify the output is `↷ skipped: <slug> (uncommitted changes)` with no diff shown and no write. Then re-run with the explicit verbal opt-in for that file and verify the warning line `WARNING: <P> has uncommitted changes; proceeding will overwrite them.` precedes the diff. Validates FR-011 + C6.
- [ ] T028 [US1] Run [quickstart.md](./quickstart.md) **Step 8** (embedded-construct preservation): pick a project file containing at least one image ref, one hyperlink, and one fenced code block. Run the skill, accept the diff, then verify byte-equality of every embedded construct line via `git diff --word-diff=color` (constructs unchanged, prose around them changed). Validates C2 permitted-difference 4 + spec edge-case row 10.
- [ ] T029 [US1] Run a length-overflow probe: edit the resume to contain themes that would naturally produce a >80-char `title` for a target project, run the skill, and verify the self-tighten retry fires (status line includes `self_tightened: [title]`) and the resulting file passes `npm run build`. Then craft a case where even the retry can't fit (e.g. set `title` schema to a much smaller cap temporarily, or pick a constraint the model genuinely can't satisfy) and verify the project is marked `failed: schema validation (title)` with no write. Validates FR-010 + C3 self-tighten policy + C9 row 8.

**Checkpoint**: User Story 1 is fully functional and independently testable. The MVP — "point at one project + one resume, get a clean optimized file" — works end-to-end.

---

## Phase 4: User Story 2 — Bulk-optimize every current project in one pass (Priority: P2)

**Goal**: When `project_selector` is unset, the skill enumerates every project file under `src/content/projects/`, processes each sequentially with a per-project diff-and-confirm, never aborts on a single failure, and ends with a roll-up summary plus one final `npm run build`.

**Independent Test**: Run [quickstart.md](./quickstart.md) **Step 4** with no project selector, optionally injecting one malformed project file. Verify the planned-batch confirmation appears before the first project is touched, projects are processed strictly sequentially, the malformed file is reported as failed without aborting the batch, and the final summary lists every project's status. Validates US2 acceptance scenarios 1–4 + C7.

### Implementation for User Story 2

All tasks in this phase write into `.cursor/skills/optimize-project-from-resume/SKILL.md`. Sequential (same file).

- [ ] T030 [US2] Add **Step 0 — Batch mode plan-and-confirm** before Step 1 in `.cursor/skills/optimize-project-from-resume/SKILL.md` (only when `project_selector` is unset): use `Glob` over `src/content/projects/**/*.md` to enumerate targets, apply the optional `excluded` list (slug or path), then print a plan in the form `Found <N> projects: <C1> in personal, <C2> in startup, <C3> in corporate. Excluded: <list or "none">. Proceed? [yes/no]`. The skill MUST NOT touch any file before the user types `yes`. Maps to C7 lines 1–2 + spec acceptance US2#1 + US2#4.
- [ ] T031 [US2] Add the **Sequential per-project loop** discipline to the workflow framing in `.cursor/skills/optimize-project-from-resume/SKILL.md`: state explicitly that batch mode runs Steps 1–10 (from US1) once per file, in stable alphabetical order (so re-runs are deterministic), strictly sequentially. State the no-parallelism rule from C7 line 3 + R10: parallel diffs are an awful UX. State the continue-past-failures rule from C7 line 4 + spec acceptance US2#3 + FR-009: any `skipped` or `failed` status leaves the loop intact and the next file is processed.
- [ ] T032 [US2] Add **Step 11 — End-of-batch validation** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: after the last project is processed (regardless of mix of `optimized` / `skipped` / `failed`), run `npm run build` exactly once and report whether the content collection still validates as a whole. Build failure path per C9 row 13: print the build error verbatim, name the most recent successfully-written project as the suspect, do NOT auto-revert. Maps to C7 line 5 + R10 closing sentence.
- [ ] T033 [US2] Add **Step 12 — Final summary** to `.cursor/skills/optimize-project-from-resume/SKILL.md`: print a header line `<N> optimized, <M> skipped, <K> failed` followed by one status line per project (the same line emitted at write time in T021, replayed in batch order). Maps to C7 line 6 + FR-013.

### Validation for User Story 2

- [ ] T034 [US2] Run [quickstart.md](./quickstart.md) **Step 4** with no project selector against the three example projects (`personal`, `startup`, `corporate`). Verify: (a) the plan-and-confirm prompt appears with category counts before any file is touched, (b) projects are processed strictly sequentially (no interleaved diffs), (c) the per-project status lines use the ✓/↷/✗ format, (d) `npm run build` runs at the end, (e) the final summary prints the header line + per-project lines. Validates US2 scenarios 1–2 + C7 in full.
- [ ] T035 [US2] Inject a deliberate failure: create a temp project file at `src/content/projects/personal/__tmp-broken.md` with intentionally malformed front matter (e.g. unclosed string). Run the batch. Verify the broken file is reported `✗ failed: __tmp-broken (malformed front matter)`, the next project is processed, the final summary still completes, and `npm run build` failure (if any) is printed verbatim. Clean up the temp file. Validates US2 scenario 3 + FR-009 + C9 rows 5 + 13.
- [ ] T036 [US2] Pass an `excluded` list of one slug (e.g. `example-corporate`). Verify the plan output names the excluded slug, the excluded file is not processed (it appears as `↷ skipped: <slug> (excluded)` in the summary or is omitted entirely depending on prompt design — pick the friendlier option and document it in SKILL.md Step 0 + Step 12), and the remaining files are processed normally. Validates US2 scenario 4.

**Checkpoint**: User Story 2 is fully functional. The skill can refresh the entire portfolio against a new resume in one invocation, with per-project review and graceful failure tolerance.

---

## Phase 5: User Story 3 — Tune the optimization with explicit guidance (Priority: P3)

**Goal**: When the user supplies a `guidance` string ("emphasize platform engineering", "tone down startup buzzwords"), the skill layers it on top of the resume-derived signals as additional steering — but the resume always wins on factual claims, and the skill refuses to fabricate when guidance contradicts resume.

**Independent Test**: Run [quickstart.md](./quickstart.md) **Step 7** twice on the same project — once without guidance, once with `guidance="emphasize platform engineering"`. Verify the second diff shifts terminology toward the requested theme without altering preserved fields. Then provide a guidance string that contradicts the resume's IC-only signal (e.g. `guidance="claim I led a team of 8"`) and verify the skill surfaces the conflict and refuses to write that claim. Validates US3 scenarios 1–2 + FR-014 + C1 `guidance` clause.

### Implementation for User Story 3

All tasks in this phase write into `.cursor/skills/optimize-project-from-resume/SKILL.md`. Sequential (same file).

- [ ] T037 [US3] Add a **Guidance handling** subsection inside Step 6 (generation) of `.cursor/skills/optimize-project-from-resume/SKILL.md`: when `guidance` is non-empty, inject it into the generation prompt as a *steering layer* explicitly subordinate to (a) the resume-derived facts and (b) the project's own preserved facts (`period`, `techStack`, category). State the precedence rule from C1 + spec scenario US3#1 + FR-014: resume wins on factual claims (seniority, dates, scope, employer/customer existence); guidance wins only on emphasis, vocabulary, and theme.
- [ ] T038 [US3] Add a **Conflict-surfacing rule** to the same Guidance subsection in `.cursor/skills/optimize-project-from-resume/SKILL.md`: before generation, the skill MUST detect explicit factual conflicts between `guidance` and the resume-derived signals (e.g. guidance asks to claim leadership scope larger than what the resume's role + period support, or claims a technology not in `techStack`). On detected conflict: print `Conflict between guidance and resume: <guidance asks X> but <resume shows Y>. The skill will not fabricate this claim. Continue without it? [yes/no]`. `no` → abort this project as `skipped: guidance conflict declined`. `yes` → proceed but with the conflicting claim *omitted* (not silently softened). Maps to FR-014 + C1 + spec scenario US3#2.

### Validation for User Story 3

- [ ] T039 [US3] Run [quickstart.md](./quickstart.md) **Step 7** *baseline pass* on a personal project with no guidance. Save the diff/output. Then run *guided pass* on the same project (after `git checkout -- <file>`) with `guidance="emphasize platform engineering"`. Verify (manually) that the guided diff shifts vocabulary toward platform-engineering terminology (e.g. `infrastructure`, `tooling`, `developer experience`, `platform`) compared to baseline, while preserved fields and embedded constructs are byte-identical to original in both cases. Validates US3 scenario 1.
- [ ] T040 [US3] Run a contradiction probe: with a resume that shows IC scope only, invoke the skill on a personal project with `guidance="claim I led a team of 8 and managed a $2M budget"`. Verify the conflict-surfacing prompt fires, listing both claims, and that `no` → `skipped: guidance conflict declined` while `yes` → the rewritten output contains *neither* the team-size claim nor the budget claim. Validates US3 scenario 2 + FR-014.

**Checkpoint**: All three user stories are complete and independently functional. The skill can be invoked single / batch / guided.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tighten the skill against feedback gathered during validation, confirm the regression net is intact, and run the quickstart top-to-bottom one final time as the acceptance walkthrough.

- [ ] T041 [P] Re-read `.cursor/skills/optimize-project-from-resume/SKILL.md` end-to-end and confirm every workflow step links to a section of `reference.md` rather than inlining lookup-table content. Move any inlined enumerations into the appropriate `reference.md` section. Goal: SKILL.md stays a workflow document; reference.md stays the lookup-table sibling. (Maps to plan.md "Structure Decision".)
- [ ] T042 [P] Update `README.md` § *Optimizing project copy with your resume* if the validation phases (T023–T040) revealed UX details that changed the user-facing description (e.g. exact prompt wording for the plan-and-confirm gate, exact format of the per-project status lines, exact guidance-conflict prompt). Keep the section short and link to the SKILL.md for the full rules.
- [ ] T043 Run `npm test` and confirm `tests/unit/schema.test.ts` and `tests/unit/projects.test.ts` still pass after the validation phases mutated the example project files (or after `git checkout -- src/content/projects/` was used to reset them). Required regression net per plan.md → Technical Context → Testing.
- [ ] T044 Run `npm run build` against a freshly-checked-out copy of the example projects with the example projects in their pristine state, then again immediately after running the skill end-to-end on each example. Both builds MUST succeed with zero new validation errors (SC-003). If either fails, treat as a regression and trace back to the SKILL.md step at fault.
- [ ] T045 Run [quickstart.md](./quickstart.md) from Step 1 to Step 8 in order, on a clean checkout of the branch, as the final acceptance walkthrough. All steps' verifications must pass without manual prompt corrections. This is the deliverable's smoke test.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. **BLOCKS all user-story phases** because every SKILL.md step cites a `reference.md` section.
- **User Story 1 (Phase 3)**: Depends on Foundational. Delivers the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational AND on Phase 3 implementation tasks (T010–T022). Reuses Steps 1–10 inside the per-project loop. *Could* be developed in parallel with Phase 3's validation tasks (T023–T029) by a second contributor, but most teams will sequence Phase 3 → Phase 4.
- **User Story 3 (Phase 5)**: Depends on Foundational AND on Phase 3 implementation tasks (T010–T022). Independent of Phase 4 — guidance handling is layered into Step 6 (generation), not into batch orchestration.
- **Polish (Phase 6)**: Depends on Phases 3, 4, 5 being complete to the level intended for delivery.

### User Story Dependencies

- **User Story 1 (P1)**: Can start once Phase 2 is complete. No dependency on US2 or US3.
- **User Story 2 (P2)**: Wraps a batch loop around US1's per-project pipeline. Requires US1 implementation but is independently testable (runs Steps 0/11/12 around an already-validated US1 path).
- **User Story 3 (P3)**: Adds a guidance-handling subsection inside US1's Step 6 + a conflict-surfacing rule. Requires US1 implementation; independently testable on a single-project run, no need for batch mode.

### Within Each User Story

- All tasks within a user story phase write into `.cursor/skills/optimize-project-from-resume/SKILL.md` and are therefore sequential (same-file rule).
- Implementation tasks come before validation tasks within the same story (validation exercises the just-written workflow against real project files).
- Validation tasks within a story are sequential because each one mutates a project file and needs `git checkout -- <file>` between runs to start from a clean baseline.

### Parallel Opportunities

- Phase 2 tasks T003–T009 all touch `reference.md` and are therefore sequential.
- Phase 6 polish tasks T041 and T042 are marked `[P]` because they touch different files (`SKILL.md` + `reference.md` vs. `README.md`).
- T043 (npm test) and T044 (npm run build) run against the same workspace state and should be sequenced, not parallelised.
- Different user stories (Phase 3 vs. Phase 4 vs. Phase 5) can be worked on in parallel by different contributors *only after Phase 3 implementation (T010–T022) is complete* — Phases 4 and 5 both layer onto that workflow.

---

## Parallel Example: Phase 6 Polish

```bash
# T041 and T042 touch different files and have no dependency on each other:
Task: "Re-read SKILL.md and move any inlined enumerations into reference.md"
Task: "Update README § 'Optimizing project copy with your resume' for any UX wording changes"
```

There are no other meaningful parallel opportunities in this feature — the deliverable is essentially two Markdown files written into a single skill directory, and most tasks edit the same SKILL.md file.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002).
2. Complete Phase 2: Foundational (T003–T009) — `reference.md` is the single source of truth.
3. Complete Phase 3: User Story 1 implementation (T010–T022) and validation (T023–T029).
4. **STOP and VALIDATE**: Run quickstart Step 1 on `example-personal.md`. If the diff is clean and the file builds, US1 ships.
5. Use the skill on real personal projects. Iterate on `reference.md` § Voice and Career-stage taxonomy if the rewrites feel off — those edits don't require touching SKILL.md.

### Incremental Delivery

1. Phase 1 + Phase 2 → foundation ready.
2. Phase 3 (US1) → MVP shipped: optimize one project end-to-end. Demo this.
3. Phase 4 (US2) → add bulk mode. Demo refreshing the whole portfolio against a new resume.
4. Phase 5 (US3) → add guidance string. Demo theme-shifting on the same project.
5. Phase 6 → polish, regression checks, final acceptance walkthrough.
6. Each story adds value without breaking previous stories.

### Solo-Author Strategy

This feature is a Markdown-prompt deliverable, which is naturally a solo-author task. The recommended sequencing for one contributor:

1. Day 1: T001–T009 (setup + reference.md). All lookup tables locked.
2. Day 2: T010–T022 (SKILL.md workflow). All ten workflow steps written.
3. Day 3: T023–T029 (validation). Iterate on prompt wording until quickstart Steps 1–6 + 8 pass clean.
4. Day 4: T030–T036 (US2: batch). T037–T040 (US3: guidance).
5. Day 5: Polish + final acceptance walkthrough.

---

## Notes

- This feature ships zero new runtime code, zero new dependencies, and zero new tests. The deliverable is two Markdown files under `.cursor/skills/optimize-project-from-resume/`.
- The regression net is `tests/unit/schema.test.ts` + `tests/unit/projects.test.ts` (already in the repo) plus the runnable acceptance walkthrough in [quickstart.md](./quickstart.md).
- "Done" for any implementation task = the corresponding SKILL.md or reference.md section is written, cites the spec/plan/research/contract clauses it enforces, and the quickstart step that validates it passes without manual prompt correction.
- Commit after each phase boundary at minimum; after each task is also fine.
- Stop at any checkpoint to validate the story independently before moving on.
- Avoid: rewriting `reference.md` lookup tables inline in SKILL.md (defeats the split-file rationale); marking same-file tasks as `[P]`; skipping validation tasks because "the prompt looks right" — prompt-only deliverables fail in surprising ways without end-to-end runs.
