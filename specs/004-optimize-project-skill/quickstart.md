# Quickstart: Resume-Aligned Project Optimizer Skill

**Feature**: `004-optimize-project-skill`
**Date**: 2026-04-20
**Audience**: anyone validating that the skill works end-to-end (the developer doing the implementation, a reviewer, or a future maintainer).

This is a runnable acceptance walkthrough. Each step maps back to a user-story acceptance scenario and a contract clause from [contracts/skill-invocation.contract.md](./contracts/skill-invocation.contract.md). Run them in order on a clean working tree.

---

## Prerequisites

```bash
nvm use            # Node 20
npm install
git status         # confirm working tree is clean
```

You will need:

- A test resume Markdown file at `/tmp/resume.md` containing a few discrete roles with `YYYY-MM` date ranges and at least one current role with a senior-or-above title. A 30-line file is enough.
- Optionally, the same content as a PDF at `/tmp/resume.pdf` (export the Markdown via any tool that produces text-based PDFs).

The skill is invoked conversationally in the Cursor agent chat. The "command" lines below show the user prompt to type into the chat — they are not shell commands.

---

## Step 1 — Optimize one personal project from a Markdown resume (validates US1, C1, C2, C3, C5)

> User prompt: "Optimize `src/content/projects/personal/example-personal.md` using the resume at `/tmp/resume.md`."

Expected:

- The skill reads the resume once and reports the detected `current_career_stage` (e.g., `senior`).
- The skill shows a unified diff of `example-personal.md` whose changes are limited to:
  - The `title:`, `description:`, and `role:` lines in the front matter (any subset of these may have changed; none of the other front-matter keys may have).
  - The prose inside any body section (`## Overview`, `## Highlights`, `## Lessons Learned`, and any custom section in the file).
- All section heading lines are unchanged.
- Section ordering is unchanged.
- Embedded image references, hyperlinks, fenced code blocks, tables, and inline HTML inside body sections are unchanged in the diff.
- All preserved front-matter fields (`slug`, `period`, `techStack`, `thumbnail`, `screenshots`, `links`, `featured`, `order`, `draft`) are visually unchanged.
- The skill asks for confirmation before writing.

Confirm `yes`. Then verify on disk that *no preserved front-matter field changed*:

```bash
git diff --stat src/content/projects/personal/example-personal.md
# Expected: only example-personal.md changed.

# The preserved front-matter keys MUST NOT appear in the diff (with the
# leading "  " indentation that period/links sub-keys use, the keys are
# matched at top level only):
git diff src/content/projects/personal/example-personal.md \
  | grep -E '^[-+](slug|period|techStack|thumbnail|screenshots|links|featured|order|draft):' \
  | grep -v '^[-+][-+][-+]' \
  && { echo "FAIL: a preserved front-matter field changed"; exit 1; } \
  || echo "OK: no preserved front-matter field changed"
# Expected: prints "OK: no preserved front-matter field changed"

# Section heading lines MUST NOT appear in the diff as added/removed:
git diff src/content/projects/personal/example-personal.md \
  | grep -E '^[-+]## ' \
  | grep -v '^[-+][-+][-+]' \
  && { echo "FAIL: a section heading line changed"; exit 1; } \
  || echo "OK: no section heading line changed"
# Expected: prints "OK: no section heading line changed"
#
# (Exception: if Step 1 was your first run on this file and the file was
#  missing ## Highlights or ## Lessons Learned, you'll see those headings
#  added. The skill MUST also report them in `created_sections`.)
```

Then run the regression net to confirm C3:

```bash
npm test -- tests/unit/schema.test.ts tests/unit/projects.test.ts
# Expected: all tests pass.
```

Reset for the next steps:

```bash
git checkout -- src/content/projects/personal/example-personal.md
```

---

## Step 2 — Optimize the same project from a PDF resume (validates US1 scenario 2, C1)

> User prompt: "Optimize `src/content/projects/personal/example-personal.md` using the resume at `/tmp/resume.pdf`."

Expected:

- The skill reads the PDF and reports a `current_career_stage` consistent with what Step 1 reported (the underlying content is the same).
- The diff is qualitatively similar to Step 1 — same fields/sections touched, similar register.

Reject the diff (`no`). Verify the file is unchanged:

```bash
git diff src/content/projects/personal/example-personal.md
# Expected: empty
```

---

## Step 3 — Confidentiality guard on a corporate project (validates Constitution II, C4)

Prepare a resume that names a specific employer the project file does *not* mention. For example, ensure `/tmp/resume.md` contains a role at "Acme Payments, Inc." with relevant senior responsibilities.

> User prompt: "Optimize `src/content/projects/corporate/example-corporate.md` using the resume at `/tmp/resume.md`."

Expected:

- The skill reads the corporate project, builds an `existing_names` allow-list from its current body and front matter (`title`, `description`, `role` included).
- The skill explicitly states (in the chat, before showing the diff): "Confidentiality guard active: this is a corporate project. Names from the resume will not be imported into title, description, role, or any body section."
- The diff does NOT contain the string `Acme Payments` (or any other proper noun unique to the resume) anywhere — not in the rewritten title, not in the rewritten description, not in the rewritten role, not in any rewritten body section.
- If the diff would have included a resume-only name, the skill reports it under `confidential_terms_blocked` (with the segment it appeared in) and re-prompts itself once.

Confirm or reject — either way, verify post-state across the whole file:

```bash
grep -i "acme payments" src/content/projects/corporate/example-corporate.md
# Expected: no match (exit code 1)

# Also verify it didn't slip into the front matter:
sed -n '/^---$/,/^---$/p' src/content/projects/corporate/example-corporate.md \
  | grep -i "acme payments"
# Expected: no match (exit code 1)
```

Reset:

```bash
git checkout -- src/content/projects/corporate/example-corporate.md
```

---

## Step 4 — Batch mode across all projects (validates US2, C7, C9)

> User prompt: "Optimize all my current projects using `/tmp/resume.md`."

Expected, in this exact order:

1. The skill enumerates files under `src/content/projects/**/*.md`, prints the count and a per-category breakdown, and asks for confirmation before starting.
2. After confirmation, the skill processes the projects sequentially. For each, it shows a diff and asks for confirmation. Decline some, accept others, to mix outcomes.
3. The skill reports per-project status lines as it goes:

   ```text
   ✓ src/content/projects/personal/example-personal.md   (-3/+5 lines)
   ↷ src/content/projects/personal/<other>.md            skipped: declined
   ✓ src/content/projects/startup/example-startup.md     (-2/+4 lines)
   ↷ src/content/projects/corporate/example-corporate.md skipped: declined
   ```

4. After the last project, the skill runs `npm run build` and reports whether it passed.
5. The skill prints a final summary `<N> optimized, <M> skipped, <K> failed` with one line per project.

Inject a failure to confirm C7's "continue past failures" behavior:

- Before running the batch a second time, temporarily corrupt one project's front matter (e.g., set `period.start` to `bad-value` in any one file).
- Re-run the batch. The corrupted file MUST be reported as `✗ failed: malformed front matter` (or `failed: schema validation`) and the remaining projects MUST still be processed.
- Restore the corrupted file:

  ```bash
  git checkout -- src/content/projects/<category>/<corrupted-file>.md
  ```

Reset everything:

```bash
git checkout -- src/content/projects/
```

---

## Step 5 — Idempotency check (validates FR-012, SC-006, C8)

Run Step 1 and accept the diff. Then immediately re-run the same prompt:

> User prompt: "Optimize `src/content/projects/personal/example-personal.md` using the resume at `/tmp/resume.md`."

Expected:

- The second-run diff has fewer than 5 changed lines across the whole file (`title`, `description`, `role`, and every body section combined).
- If the diff exceeds 5 lines, the skill is drifting — capture the diff and the resume in a bug note for prompt calibration; this is a known calibration target, not a hard runtime gate.

Repeat 10 times if you want a statistical read on SC-006 ("at least 9 of 10").

Reset:

```bash
git checkout -- src/content/projects/personal/example-personal.md
```

---

## Step 6 — Uncommitted-changes guard (validates FR-011, C6)

Make a trivial uncommitted edit to one project file:

```bash
echo "" >> src/content/projects/personal/example-personal.md
git status --porcelain -- src/content/projects/personal/example-personal.md
# Expected: " M src/content/projects/personal/example-personal.md"
```

> User prompt: "Optimize `src/content/projects/personal/example-personal.md` using the resume at `/tmp/resume.md`."

Expected:

- The skill detects the uncommitted change and refuses with a clear message:

  > `src/content/projects/personal/example-personal.md` has uncommitted changes. Commit, stash, or rerun explicitly opting in to overwrite.

- No diff is shown. No write happens.

> User prompt (opt-in): "Optimize it anyway, overwrite my local edits."

Expected:

- The skill prints `WARNING: <path> has uncommitted changes; proceeding will overwrite them.` above the diff.
- The diff-and-confirm gate (C5) still runs.

Reset:

```bash
git checkout -- src/content/projects/personal/example-personal.md
```

---

## Step 7 — Optional guidance string (validates US3, C1)

Run Step 1 first and accept; note the resulting Highlights wording (call it `highlights_v1`).

Reset, then run with a guidance nudge:

> User prompt: "Optimize `src/content/projects/personal/example-personal.md` using the resume at `/tmp/resume.md`. Emphasize platform engineering."

Expected:

- The new Highlights (`highlights_v2`) measurably leans into platform-engineering language compared to `highlights_v1` (e.g., "developer experience", "build pipeline", "internal tooling") while still respecting the resume-derived `current_career_stage`.
- If the guidance contradicts a resume fact (e.g., "claim I led a team" when the resume shows IC roles), the skill surfaces the conflict in the chat and refuses to fabricate the claim.

Reset:

```bash
git checkout -- src/content/projects/personal/example-personal.md
```

---

## Cleanup

```bash
git status
# Expected: working tree clean except for any spec/ or .cursor/skills/ files
#           you intentionally added during the implementation.
```

---

## Mapping to spec acceptance scenarios

| Quickstart step | Spec User Story / Scenario | Contract clauses |
|---|---|---|
| 1 | US1 scenario 1 | C1, C2, C3, C5 |
| 2 | US1 scenario 2 | C1 |
| 3 | US1 scenario 3 + Constitution II | C4 |
| 4 | US2 scenarios 1–3 | C7, C9 |
| 5 | Edge case: idempotency on rerun | C8 |
| 6 | Edge case: uncommitted local edits | C6 |
| 7 | US3 scenarios 1–2 | C1, C9 |

---

## Optional Step 8 — Embedded constructs preservation (validates C2, edge case)

Take any project file and add a body section with non-prose content before running the skill:

```markdown
## Demo

Watch the live demo:

![Demo screenshot](/projects/example-personal/demo.png)

```bash
npm install my-tool && my-tool --help
```

See [the docs](https://example.com/docs) for more.
```

Commit, then run the skill on this file with `/tmp/resume.md`.

Expected:

- The `## Demo` heading line is unchanged in the diff.
- The image reference, the fenced bash code block (including the exact command), and the hyperlink are unchanged in the diff.
- Only the surrounding prose (`Watch the live demo:`, `See ... for more.`) may have been rewritten.

Verify:

```bash
git diff src/content/projects/personal/example-personal.md \
  | grep -E '^[-+](!?\[|```|\| |<)' \
  | grep -v '^[-+][-+][-+]' \
  && { echo "FAIL: an embedded non-prose construct changed"; exit 1; } \
  || echo "OK: all embedded constructs preserved"
```
