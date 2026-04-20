# Behavioral Contract: `optimize-project-from-resume` Skill Invocation

**Feature**: `004-optimize-project-skill`
**Type**: Skill behavioral contract (no API surface — invoked conversationally inside Cursor)
**Date**: 2026-04-20

This document is the executable specification for what the skill does and does not do per invocation. Each clause maps one-to-one to a verification step in [quickstart.md](../quickstart.md). If a behavior is not stated here, it is unspecified — do not rely on it.

---

## C1. Invocation inputs

**Given** the user invokes the skill in the Cursor agent chat in this repository,

**When** the skill begins,

**Then** the skill MUST accept the following inputs:

- `resume_path` (REQUIRED) — a filesystem path to a `.md` or `.pdf` file. If absent, the skill MUST stop and ask for it once.
- `project_selector` (OPTIONAL) — either a path under `src/content/projects/`, a project slug (e.g., `example-personal`), or unset. If unset, the skill operates in batch mode over `src/content/projects/**/*.md`.
- `guidance` (OPTIONAL) — a free-text steering string (US3). Defaults to none.
- `excluded` (OPTIONAL, batch only) — a list of slugs or paths to skip in batch mode.

The skill MUST NOT accept any other input that mutates behavior; in particular it MUST NOT accept a flag that disables the diff-and-confirm gate (C5).

---

## C2. Preservation invariant

**Given** a project file `P` selected for optimization,

**When** the skill produces the rewritten file `P'`,

**Then** every one of the following MUST hold for `P'` compared to `P`:

- The front-matter block delimiters (`---` lines), key order, key indentation, and surrounding whitespace are byte-identical.
- Every front-matter field except `title`, `description`, and `role` is byte-identical. The preserved set explicitly includes: `slug`, `period` (both `start` and `end`), `techStack` (every entry, in order), `thumbnail`, `screenshots[]`, `links.{source,live,caseStudy}`, `featured`, `order`, `draft`, and any unknown key the file may contain.
- Every body section heading line is byte-identical (`^## .*$` lines unchanged in text and whitespace).
- The order of body sections in the file is byte-identical.
- Inside any body section, every embedded non-prose construct is byte-identical to its appearance in `P`. This includes: image references (`![alt](path)`), hyperlinks (`[text](url)`), fenced code blocks (` ``` ` … ` ``` `), tables (any `|`-delimited row), inline HTML tags (`<details>`, `<picture>`, `<br>`, etc.), and explicit line breaks (two trailing spaces or `<br>`).
- The trailing newline of the file is preserved as in `P` (present or absent — do not add or remove one).

The only permitted differences between `P` and `P'` are:

1. The value following `title:` in the front matter.
2. The value following `description:` in the front matter.
3. The value following `role:` in the front matter.
4. The *prose* content inside any body section (text between heading lines, excluding embedded non-prose constructs as enumerated above).
5. Insertion of a missing `## Highlights` or `## Lessons Learned` heading + body, placed immediately after `## Overview` (or at end of body if no `## Overview`). When this occurs, `created_sections` MUST be reported in the per-project status.

---

## C3. Schema invariant

**Given** the rewritten file `P'`,

**When** the skill prepares to write `P'` to disk,

**Then** `P'` MUST validate against `projectSchema` from `src/content.config.ts` *before* the write happens. Specifically:

- `title.length >= 1 && title.length <= 80`.
- `description.length >= 1 && description.length <= 240`.
- `role.length >= 1 && role.length <= 80`.
- All other front-matter constraints from `projectSchema` continue to hold (they will, by C2, because nothing else is touched — but the validation MUST still be performed to catch a buggy rewrite).

**Self-tighten retry policy**: if validation fails *only* because one or more of `title` / `description` / `role` exceed their length limits, the skill MUST attempt one re-generation pass instructing itself to tighten the offending field(s) to fit. The fields that were re-tightened MUST be reported in `PerProjectResult.self_tightened_fields`. If validation fails for any other reason, or if the re-tighten pass still fails, the skill MUST mark the project as `failed: schema validation (<field>)` and MUST NOT write the file.

---

## C4. Confidentiality invariant (Constitution II)

**Given** a project file `P` whose path matches `src/content/projects/{corporate,startup}/**`,

**When** the skill produces *any* rewritten segment for `P` — `title`, `description`, `role`, or any body section,

**Then** that rewritten segment MUST NOT contain any proper noun that:

- Was *not* present in the original `P` body or front matter (excluding `techStack`), AND
- Appears in the resume.

The skill MUST construct the `existing_names` allow-list per `data-model.md` §5 before generation, MUST inject it into the generation prompt as a hard rule, and MUST inspect *every* rewritten segment for violations before writing. A detected violation MUST cause one re-prompt; if the re-prompt still violates, the project MUST be marked `failed: confidentiality guard tripped` with the offending tokens and the segment they appeared in.

The expanded rewrite scope (vs. earlier drafts of this contract) widens the surface where a leak could occur — `title` and `description` in particular are tempting places for an employer name to land — so the guard explicitly spans every rewritten segment, not just the body.

For projects under `src/content/projects/personal/**`, this clause is not enforced (the personal-portfolio surface is the user's own).

---

## C5. Diff-and-confirm invariant

**Given** any rewritten file `P'` that has passed C2, C3, and C4,

**When** the skill is ready to write,

**Then** the skill MUST first present a unified diff between `P` and `P'` to the user and MUST require an explicit confirmation:

- `yes` → write the file.
- `no` / `skip` → do not write; mark the project `skipped: declined`.
- Any other response → re-ask once; on second non-yes, mark `skipped: declined`.

The skill MUST NOT write any file before the user's explicit `yes`. There MUST be no "force-yes" flag, no "auto-approve" mode, and no global silencer for this gate.

---

## C6. Uncommitted-changes guard

**Given** a project file `P` selected for optimization,

**When** the skill begins processing `P`,

**Then** the skill MUST run `git status --porcelain -- <P>` and inspect the output:

- Empty output → proceed.
- Non-empty output AND the user did not pass an explicit `--force` (or equivalent verbal opt-in for this specific file) → mark `skipped: uncommitted changes` and DO NOT show the diff or write the file.
- Non-empty output AND the user explicitly opted in for this file → proceed but include a one-line warning above the diff: `WARNING: <P> has uncommitted changes; proceeding will overwrite them.`

The check is per-file. Uncommitted changes elsewhere in the repo do not block optimization of an unrelated project file.

---

## C7. Batch invariant

**Given** the skill is invoked in batch mode (`project_selector` is unset),

**When** the run starts,

**Then** all of the following MUST hold:

- The skill enumerates all files matching `src/content/projects/**/*.md`, applies any `excluded` list, and shows the count + a per-category breakdown to the user before the first project is touched.
- The user MUST confirm the batch before any project is processed.
- Projects are processed strictly sequentially, never in parallel.
- A failure in any one project (any of `skipped` or `failed`) MUST NOT abort the batch — the next project is processed.
- After the last project, the skill MUST run `npm run build` once and report whether the content collection still validates as a whole.
- The skill MUST print a final summary in the form `<N> optimized, <M> skipped, <K> failed` followed by one status line per project.

---

## C8. Idempotency invariant

**Given** a project file `P` that was just optimized using resume `R`,

**When** the user immediately re-invokes the skill on `P` with the same `R` (and no `guidance` change),

**Then** the resulting diff between the on-disk `P` and the new `P''` MUST contain fewer than 5 changed lines in at least 9 of 10 attempts (SC-006).

This is a calibration target on the prompt's prose rubric (R5), not a hard runtime check. The skill is not required to refuse a write that exceeds the threshold; the user's diff-and-confirm gate handles that.

---

## C9. Error contract

The following error conditions MUST produce the stated outcomes. In every error case, no project file is modified.

| Condition | Outcome |
|---|---|
| `resume_path` does not exist | Stop. Print `Resume not found: <path>`. Ask once for a corrected path. |
| `resume_path` exists but `Read` returns empty / near-empty content (incl. scanned PDFs) | Stop. Print `Could not extract text from <path>. If this is a scanned PDF, please provide a Markdown version.` Do not retry. |
| `project_selector` is set but matches no file | Stop. Print `No project found for selector: <selector>`. List the closest matches by slug if any. |
| In batch mode, the glob matches zero files | Stop. Print `No project files found under src/content/projects/`. |
| A target project file fails to parse as front-matter + body | Mark `failed: malformed front matter` and continue with the next project. |
| A target project file is missing `## Highlights` and/or `## Lessons Learned` | Proceed. Create the missing section(s) after `## Overview` (or at end of body if no `## Overview`) per R9. Report `created_sections` in the per-project status. |
| A target project file contains custom body sections (`## Demo`, `## Architecture`, etc.) | Proceed. Rewrite their prose with the same career-stage signals as the rest of the body, preserving heading lines and embedded non-prose constructs verbatim per C2. |
| The rewritten `title` / `description` / `role` exceeds its schema length limit | Re-prompt once with an explicit instruction to tighten the offending field(s). If the re-tightened output still fails, mark `failed: schema validation (<field>)`. Continue. Successful re-tightenings MUST be reported in `self_tightened_fields`. |
| The rewritten content fails C3 (schema) for any reason other than length | Mark `failed: schema validation (<field>)`. Continue. |
| The rewritten content fails C4 (confidentiality) on first pass | Re-prompt once. If the second pass still fails, mark `failed: confidentiality guard tripped (<tokens> in <segment>)`. Continue. |
| The user declines the diff (C5) | Mark `skipped: declined`. Continue. |
| The user has uncommitted changes and does not opt in (C6) | Mark `skipped: uncommitted changes`. Continue. |
| `npm run build` fails after a batch | Print the build error verbatim and which project's diff was the most recent suspect. Do not auto-revert; let the user decide. |

---

## Mapping to user stories and FRs

| Clause | Spec FRs | User stories | Quickstart step |
|---|---|---|---|
| C1 | FR-001, FR-002, FR-014 | US1, US2, US3 | Step 1, 4, 7 |
| C2 | FR-004, FR-005, FR-015 | US1 | Step 1, 5 |
| C3 | FR-010 | US1 | Step 1, 4 |
| C4 | FR-006 | US1 (constitutional) | Step 3 |
| C5 | FR-008, SC-005 | US1 | Step 1, 6 |
| C6 | FR-011 | US1 | Step 6 |
| C7 | FR-009, FR-013 | US2 | Step 4 |
| C8 | FR-012, SC-006 | US1 | Step 5 |
| C9 | FR-001, FR-006, FR-010, FR-011 | US1, US2, US3 | Step 1, 3, 6 |
