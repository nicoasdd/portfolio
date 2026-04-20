# Implementation Plan: Resume-Aligned Project Optimizer Skill

**Branch**: `004-optimize-project-skill` | **Date**: 2026-04-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-optimize-project-skill/spec.md`

## Summary

Ship a single Cursor agent skill, `optimize-project-from-resume`, that rewrites the *narrative* parts of one or more existing portfolio project entries to match the portfolio owner's current career stage as derived from their resume. The skill never touches presentation code, never adds runtime dependencies, never invents facts, and never silently overwrites a file.

Three coordinated decisions shape the implementation:

1. **The skill is a prompt, not new code.** It lives at `.cursor/skills/optimize-project-from-resume/SKILL.md` (with a small `reference.md` sibling for the career-stage taxonomy and confidentiality guardrails), exactly mirroring the existing `add-project-from-repo` skill convention. PDF resumes are parsed via Cursor's built-in `Read` tool (which already returns PDF→text), so no new packages enter the project.
2. **The rewrite covers every narrative segment, but nothing else.** The skill rewrites *all* prose in the file: the front-matter `title`, `description`, and `role` fields, and *every* body section — `## Overview`, `## Highlights`, `## Lessons Learned`, and any custom section the file contains. It preserves byte-for-byte every fact / identity / configuration field: `slug` (URL identity, also pinned by tests), `period` (historical fact), `techStack` (historical fact), `thumbnail` and `screenshots` (asset paths), `links` (URLs), and `featured` / `order` / `draft` (owner-controlled configuration). Inside body sections, embedded image references, hyperlinks, fenced code blocks, tables, and inline HTML are preserved verbatim — only the surrounding prose is rewritten. The output is re-validated against the existing Zod schema in `src/content.config.ts` (which caps `title` ≤80, `description` ≤240, `role` ≤80) before any write happens; the skill self-tightens to fit those limits and refuses to write any file that still fails validation.
3. **The skill is constitution-aware about category confidentiality.** For projects under `src/content/projects/{corporate,startup}/`, the skill extracts only *stage/tone signals* from the resume (seniority, vocabulary register, focus areas) and never imports proper nouns (employer names, internal product names, monetary figures) into the rewritten title, description, role, or body. The guard now spans the whole narrative surface — broader scope means broader leak surface, so the same allow-list discipline applies to every rewritten segment. This maps directly to Constitution principle II.

The result: a resume update can refresh the whole portfolio's voice in one invocation, without code changes, without schema changes, and without leaking anything that wasn't already in the project file.

## Technical Context

**Language/Version**: Markdown for the SKILL.md prompt; the skill is interpreted by the Cursor agent at author time. Build artifacts remain TypeScript 5.x on Node.js 20 LTS (unchanged).
**Primary Dependencies**: None new. The skill uses only the agent's built-in tools (`Read` for both `.md` and `.pdf` resumes, `Glob` to enumerate projects, `Grep` to locate sections, `StrReplace` for surgical edits, `Shell` for git checks). No new npm packages, no PDF library, no model-specific runtime.
**Storage**: Filesystem. Inputs: a resume file path (`.md` or `.pdf`) and project Markdown files under `src/content/projects/**/*.md`. Outputs: in-place edits to those same project files.
**Testing**: Existing `tests/unit/schema.test.ts` and `tests/unit/projects.test.ts` are the regression net — every file the skill writes MUST still pass them. The skill itself is a prompt and is exercised via the runnable acceptance walkthrough in [quickstart.md](./quickstart.md). No new automated tests are introduced.
**Target Platform**: Cursor IDE / Cursor agent runtime, invoked conversationally inside this repository.
**Project Type**: Cursor agent skill (an author-time tool), not a runtime feature of the portfolio site.
**Performance Goals**: ≤2 minutes wall-clock to optimize one project ≤200 lines against a resume ≤5 pages (SC-001); ≤10 minutes to refresh up to 20 projects in a single batch (SC-002).
**Constraints**: Zero new runtime dependencies; zero new schema fields; preserve every fact / identity / configuration field byte-for-byte (FR-005, FR-015); preserve embedded non-prose content (image refs, hyperlinks, code fences, tables, inline HTML) inside rewritten body sections; never introduce proper nouns into `corporate/`+`startup/` projects that weren't already there (Constitution II); self-tighten rewritten `title` / `description` / `role` to the schema's length limits and skip on failure (FR-010); never silently overwrite (FR-008/SC-005); refuse to overwrite a file with uncommitted edits unless the user opts in (FR-011); idempotent re-runs (FR-012/SC-006).
**Scale/Scope**: Up to ~20 project files per batch, three category folders, one resume per run.

## Constitution Check

Evaluated against `.specify/memory/constitution.md` v1.0.0.

| Principle | Verdict | Notes |
|---|---|---|
| I. Showcase-First Design | PASS (N/A) | No UI surface is added or modified. The skill is invoked in the agent chat; the rendered site is unaffected except that its source content reads more cohesively. |
| II. Project Categorization | PASS (with active guard) | The skill never moves a project across category folders; the file path determines the category and the skill respects it. The confidentiality clause ("Corporate and startup projects MUST respect confidentiality — no proprietary code or NDA-protected details") is enforced by an explicit rule in the SKILL.md: when the target project is under `corporate/` or `startup/`, the resume contributes *only* stage/tone signals — no proper nouns are imported into any rewritten segment (title, description, role, or body). The expanded rewrite scope means the guard spans more text, but the discipline is the same. See R6 in [research.md](./research.md). |
| III. Static-Site Performance | PASS (N/A) | The skill produces no runtime code, no new bundle, no new asset. Build output is byte-identical except for the textual content of three Markdown segments per touched project. |
| IV. Content-Driven Architecture | PASS (reinforced) | The skill is a pure content-edit tool that goes through the existing content collection and validates against the existing Zod schema (FR-010). It does not touch components, layouts, or the build pipeline. Adding a real project remains a one-file change; optimizing one is now also a one-file change. |
| V. Responsive & Accessible | PASS (N/A) | No UI surface. |
| VI. Visual Polish & Consistency | PASS (with active guard) | Voice consistency is required: the skill's prose rules adopt the same anti-patterns list as `add-project-from-repo` (no "leveraged", "robust", "seamless", "cutting-edge", "powerful"; first-person; em-dash highlights), so optimized entries blend with un-optimized ones. See R7 in [research.md](./research.md). |

**Gate result**: PASS. No violations to justify in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/004-optimize-project-skill/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions and rationale
├── data-model.md        # Phase 1 — entities and rewrite contract
├── quickstart.md        # Phase 1 — runnable acceptance walkthrough
├── contracts/
│   └── skill-invocation.contract.md   # Phase 1 — invocation, preservation, error contract
├── checklists/
│   └── requirements.md  # Created by /speckit.specify
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
.cursor/skills/
├── add-project-from-repo/                 # Existing — referenced for voice/style and skill conventions
│   ├── SKILL.md
│   └── reference.md
└── optimize-project-from-resume/          # NEW — the deliverable of this feature
    ├── SKILL.md                           # NEW: main skill prompt (workflow, guardrails, anti-patterns)
    └── reference.md                       # NEW: career-stage taxonomy, voice rules, confidentiality guard,
                                           #      schema cheatsheet, idempotency rubric

src/                                       # No changes
├── content/
│   ├── projects/
│   │   ├── personal/                      # Read+rewrite target (narrative segments only)
│   │   ├── startup/                       # Read+rewrite target (with confidentiality guard)
│   │   └── corporate/                     # Read+rewrite target (with confidentiality guard)
│   └── about/                             # Untouched
├── content.config.ts                      # Untouched — used as the validation reference by the skill
└── lib/                                   # Untouched — no runtime code paths added or changed

public/projects/                           # Untouched — assets and thumbnails are out of scope
tests/                                     # No new test files; existing schema+projects tests are the regression net
```

**Structure Decision**: This feature ships a single new Cursor skill at `.cursor/skills/optimize-project-from-resume/`, peer to the existing `add-project-from-repo` skill. No `src/`, `public/`, `tests/`, or workflow file is modified. Splitting the skill into `SKILL.md` + `reference.md` mirrors the existing convention so the main file stays focused on workflow and the reference file holds the lookup tables (career stages, schema rules, voice anti-patterns, confidentiality guard) that the workflow links into. Doing this in two files instead of one keeps the agent's working context lean per step and makes the rules independently auditable.

## Phase 0 — Outline & Research

**Output**: [research.md](./research.md)

Resolved unknowns and locked decisions:

- **R1. PDF resume parsing**: Use Cursor's built-in `Read` tool, which already converts PDFs to text. Rejected: adding `pdf-parse`/`pdfjs-dist`/`pdf-to-text`. Rationale: the agent already has the capability, adding a dep would be a Constitution III violation (new runtime dep) for zero gain at author time.
- **R2. Career-stage taxonomy**: Coarse 6-stage scale — `junior` / `mid` / `senior` / `staff` / `principal` / `founder`. Detection rule: years of experience + most-recent-role title cues + scope cues. Rejected: fine-grained ladder taxonomies (L3/L4/L5/E5/E6/etc.) — too company-specific to generalize across resumes.
- **R3. Skill location and surface**: `.cursor/skills/optimize-project-from-resume/`, conversational invocation through the Cursor agent (same surface as `add-project-from-repo`). No CLI, no npm script. Rejected: an `npm run optimize` entry point — would add code where a prompt is enough.
- **R4. Uncommitted-changes guard (FR-011)**: `git status --porcelain -- <project-path>` per file at the start of each rewrite. If non-empty, refuse and ask the user to commit, stash, or explicitly confirm. Rejected: silently stashing on the user's behalf — too magical, easy to lose work.
- **R5. Idempotency strategy (FR-012/SC-006)**: Three layered constraints in the prompt — (a) the skill is given the *current* project text and instructed to keep wording it would otherwise re-emit; (b) a fixed-rubric prose-style guide pins voice deterministically; (c) the diff is shown to the user, who has natural pressure to reject runs that drift. No content-hash cache — would add state for a marginal benefit and complicate the "edit then re-optimize" loop.
- **R6. Confidentiality guard for corporate/startup (Constitution II)**: When the target file is under `src/content/projects/corporate/` or `src/content/projects/startup/`, the skill is instructed to derive *only* `(career_stage, scope_register, vocabulary_themes)` from the resume — never proper nouns. The rewritten body MUST NOT introduce any proper noun (employer name, internal product, customer name) that was not already present in the project file. Rejected: a regex post-filter to strip names — too brittle; better to constrain at generation time.
- **R7. Voice/style alignment**: Adopt the same anti-patterns list as `add-project-from-repo/SKILL.md` ("Voice and style" section): first-person; past or present; no marketing fluff; ban "leveraged", "robust", "seamless", "cutting-edge", "powerful"; em-dash in highlight labels. Centralized in the new `reference.md` so both skills can cite it; on follow-up we may extract to a shared file. Rejected: writing a separate voice guide — would risk drift between the two skills.
- **R8. Historical-vs-current perspective (FR-007)**: If `period.end` is `present` or within the resume's most-recent-role window, write from the *current* career stage. Otherwise, find the resume role active during `period.end` and write from *that* stage. Rejected: always writing from current stage — would falsely claim senior-level scope on a project the user did as a junior.
- **R9. Section parsing and creation**: Parse the body into a heading-bounded section list (each section = `^##\s+<title>\s*$` plus everything until the next `##` or end of file). Rewrite the prose of every section while preserving its heading line, ordering, and any embedded non-prose blocks (image refs, links, fenced code, tables, inline HTML). If the conventional `## Highlights` or `## Lessons Learned` headings are absent, append them after `## Overview` (or at end of body if no `## Overview`) per the existing convention. Rejected: a flat "rewrite the whole body as one string" approach — would lose section ordering/structure and risk merging or dropping headings.
- **R10. Batch processing pattern**: Reuse the sequential, per-item-status pattern from `add-project-from-repo` (✓ optimized / ↷ skipped / ✗ failed: `<reason>`). Run schema validation once per file at write time and a final `npm run build` at the end of the batch (echoing the existing skill's Step 6). Rejected: parallelism — mixed diffs and interleaved confirmations are an awful UX.
- **R11. What's narrative vs. what's a fact (per FR-015)**: Rewriteable = `title`, `description`, `role`, every body section. Immutable = `slug`, `period`, `techStack`, `thumbnail`, `screenshots`, `links`, `featured`, `order`, `draft`. Rationale: `slug` is URL identity (changing it breaks links *and* the test fixtures pinned to `example-personal/startup/corporate`); `period` and `techStack` are historical facts the rewrite must respect, not invent; asset paths and URLs aren't editorial; `featured`/`order`/`draft` are owner-controlled site configuration. Rejected: rewriting `slug` to better match a new title — silent URL breakage is unacceptable, and the existing test fixtures explicitly require slug stability.

All open questions from the spec's Edge Cases and FRs are resolved. Zero `NEEDS CLARIFICATION` markers remain.

## Phase 1 — Design & Contracts

### Data model — [data-model.md](./data-model.md)

The skill introduces no persisted data and no new schema fields. The "data model" captures the in-memory primitives the prompt operates over:

- **Resume**: file path + format (`md` | `pdf`); after Read, an in-memory plain-text string. Yields three derived signals: `current_career_stage`, `historical_stages` (with date ranges), and `vocabulary_themes`.
- **CareerStage**: enum `junior` | `mid` | `senior` | `staff` | `principal` | `founder`. Drives tone, scope verbs, and emphasis.
- **ProjectEntry** *(reference only — no change)*: the existing front-matter shape from `src/content.config.ts` `projectSchema`. The skill consumes it read-only and rewrites only `description` (front-matter) plus `## Highlights` and `## Lessons Learned` (body).
- **OptimizationRun**: one invocation against one resume and one or more project paths. Carries: run mode (`single` | `batch`), optional guidance string (US3), and a per-project status record (`status`, `diff_summary`, `confidential_terms_blocked`).
- **ConfidentialityContext**: derived per-project from the file's category folder; for `corporate`/`startup` it carries the allow-list of proper nouns already present in the *current* project file, and an empty allow-list of names from the resume.

### Contracts — [contracts/skill-invocation.contract.md](./contracts/skill-invocation.contract.md)

A behavioral contract (no API surface): the binding spec for what the skill MUST and MUST NOT do per invocation. Written as Given/When/Then so each clause translates directly into a quickstart verification step. Covers:

- **C1. Invocation inputs**: resume path (required), project selector (optional), guidance string (optional).
- **C2. Preservation invariant**: every fact / identity / configuration front-matter field (`slug`, `period`, `techStack`, `thumbnail`, `screenshots`, `links`, `featured`, `order`, `draft`), the front-matter block delimiters and key ordering, the body's section ordering and exact heading lines, and every embedded non-prose construct inside body sections (image refs, links, fenced code blocks, tables, inline HTML) — all preserved byte-for-byte. Only the prose surface and the `title` / `description` / `role` values may differ.
- **C3. Schema invariant**: the rewritten file MUST validate under `projectSchema` from `src/content.config.ts` before any write — including the tighter limits for the now-rewriteable `title` (≤80), `description` (≤240), and `role` (≤80) fields.
- **C4. Confidentiality invariant**: for `corporate/` and `startup/` targets, no proper noun absent from the *current* project file MAY appear in *any* rewritten segment (title, description, role, or any body section).
- **C5. Diff-and-confirm invariant**: every write is preceded by a unified diff and an explicit "yes/no/skip" prompt; "no" or "skip" leaves the file untouched.
- **C6. Uncommitted-changes guard**: if `git status --porcelain -- <path>` is non-empty, the file is skipped unless the user explicitly opts in to overwrite.
- **C7. Batch invariant**: in batch mode, projects are processed sequentially; one failure never aborts the batch; a final summary lists per-project status.
- **C8. Idempotency invariant**: a second run with the same inputs produces a diff of fewer than 5 changed lines in at least 9 of 10 cases.
- **C9. Error contract**: missing/empty resume → stop, no writes. Scanned PDF (no extractable text) → stop, suggest Markdown. Schema-invalid project → skip with reason. Section absent → create after `## Overview`.

### Quickstart — [quickstart.md](./quickstart.md)

A runnable, copy-pasteable walkthrough that exercises every acceptance scenario from the spec end to end:

1. Optimize one personal project from a Markdown resume → confirm only `description` + Highlights + Lessons Learned changed (validates US1, C2, C5).
2. Optimize the same project from a PDF resume → confirm equivalent output (validates US1 scenario 2).
3. Optimize a corporate project → confirm no employer/customer name from the resume leaked into the body (validates Constitution II, C4).
4. Run in batch mode against all projects → confirm sequential processing, per-project status lines, and graceful continuation past one injected failure (validates US2, C7).
5. Re-run the skill on an already-optimized project with the same resume → confirm <5-line diff (validates FR-012, SC-006, C8).
6. Run with uncommitted local edits to a target file → confirm refusal with a clear message (validates FR-011, C6).
7. Run with the optional guidance string from US3 → confirm the requested theme shifts terminology without overriding facts (validates US3 scenarios 1+2).

### Agent context update

Run `.specify/scripts/bash/update-agent-context.sh cursor-agent` at the end of Phase 1 to refresh `.cursor/rules/specify-rules.mdc` with this feature's tech notes. The only new entry is the new author-time skill itself; no new framework, language, or runtime dependency is introduced.

### Re-evaluated Constitution Check (post-design)

All six principles still PASS. The Phase 1 contracts make two principles measurably stronger:

- **Principle II (Project Categorization)** is now defended by a binding clause (C4) that maps to a quickstart step (#3), not just a soft assumption.
- **Principle IV (Content-Driven Architecture)** is reinforced by C2+C3: the skill is structurally incapable of touching anything outside the content collection's narrative segments and is gated by the same Zod schema the build uses.

## Complexity Tracking

> No constitution violations. Section intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| _(none)_ | _(n/a)_ | _(n/a)_ |
