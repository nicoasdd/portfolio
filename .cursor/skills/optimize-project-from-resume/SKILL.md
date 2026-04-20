---
name: optimize-project-from-resume
description: >-
  Rewrites the narrative content of one or more existing portfolio project
  entries to match the portfolio owner's current career stage as derived from
  their resume. Accepts a single project (path or slug) or runs in batch over
  every project under src/content/projects/. Reads .md or .pdf resumes via
  the agent's built-in Read tool. Rewrites only the title, description, role,
  and body section prose — preserves slug, period, techStack, thumbnail,
  screenshots, links, featured, order, draft, every section heading, and
  every embedded image / link / code fence / table / inline HTML byte-for-byte.
  Validates against the existing Zod schema, refuses to overwrite uncommitted
  changes, and never writes without an explicit yes from the user. Use when
  the user wants to optimize project copy, refresh project narratives from
  their resume, align portfolio entries with their current career stage,
  rewrite project descriptions against a resume, or run a portfolio refresh
  after a job change or promotion.
---

# Optimize Project From Resume

Rewrites the *narrative* content of existing portfolio project entries to
match the portfolio owner's current career stage, as derived from a resume.
Reads `.md` and `.pdf` resumes through the agent's built-in `Read` tool —
no new dependencies are added to the project.

The skill is **surgically scoped**:

- **Rewrites**: the front-matter `title`, `description`, `role`, AND every
  body section's prose (`## Overview`, `## Highlights`, `## Lessons Learned`,
  and any custom section the file contains).
- **Preserves byte-for-byte**: `slug`, `period`, `techStack`, `thumbnail`,
  `screenshots`, `links.{source,live,caseStudy}`, `featured`, `order`,
  `draft`, every section heading line, the order of sections, and every
  embedded image reference / hyperlink / fenced code block / table / inline
  HTML / explicit line break inside body sections.

The exact rewrite-vs-preserve line is in
[reference.md § 3 Rewrite vs. Preserve cheatsheet](reference.md#3-rewrite-vs-preserve-cheatsheet).

Every write is preceded by a unified diff and an explicit `yes` from the
user. There is no `--force`, no `--auto-yes`, no global silencer for the
diff gate.

## Inputs

| Input              | Required        | Notes                                                                                                                       |
|--------------------|-----------------|-----------------------------------------------------------------------------------------------------------------------------|
| `resume_path`      | yes             | Filesystem path to a `.md` or `.pdf` file. If absent, ask **once** for it and stop until provided.                           |
| `project_selector` | no              | A path under `src/content/projects/` OR a project slug (e.g. `example-personal`). If unset → batch mode (every project).     |
| `guidance`         | no              | Free-text steering string (e.g. "emphasize platform engineering"). Layered on top of resume signals; resume wins on facts.   |
| `excluded`         | no (batch only) | List of slugs or paths to skip in batch mode.                                                                                |

The skill MUST NOT accept any other input that mutates behavior. In
particular: there is **no** flag that disables the diff-and-confirm gate
in Step 9, no `--auto-yes`, no `--force` global toggle. The per-file opt-in
for the uncommitted-changes guard in Step 3 is the only opt-in at all, and
it is per-file and verbal — not a global flag.

## Workflow

For each invocation, copy this checklist and tick steps as you go. Steps
0, 11, 12 only apply in batch mode; everything else runs per project.

```
- [ ] Step 0:  Batch plan-and-confirm    (BATCH MODE ONLY)
- [ ] Step 1:  Read inputs (resume + selector)
- [ ] Step 2:  Extract resume signals
- [ ] Step 3:  Per-project pre-flight (uncommitted-changes + parse)
- [ ] Step 4:  Build confidentiality context
- [ ] Step 5:  Parse body into heading-bounded sections
- [ ] Step 6:  Generate rewritten content
- [ ] Step 7:  Schema validation + self-tighten
- [ ] Step 8:  Confidentiality inspection + reprompt
- [ ] Step 9:  Show diff and confirm
- [ ] Step 10: Write file and report
- [ ] Step 11: End-of-batch validation     (BATCH MODE ONLY)
- [ ] Step 12: Final summary               (BATCH MODE ONLY)
```

In single-project mode (a `project_selector` is provided), skip Step 0,
run Steps 1–10 once, and skip Steps 11–12 (the per-file status line from
Step 10 is the whole report).

In batch mode (no selector), run Step 0 once, then Steps 1–10 per project
in stable alphabetical order, then Steps 11–12 once.

### Step 0 — Batch plan-and-confirm (batch mode only)

When `project_selector` is unset:

1. `Glob` over `src/content/projects/**/*.md` to enumerate targets.
2. Apply the optional `excluded` list (slug or path) by removing matches.
3. Print the plan in this form, then wait for `yes`:

   ```
   Found <N> projects:
     personal:  <C1>  (<slug>, <slug>, ...)
     startup:   <C2>  (<slug>, <slug>, ...)
     corporate: <C3>  (<slug>, <slug>, ...)
   Excluded: <list-of-slugs or "none">
   Resume: <resume_path>
   Guidance: <guidance string or "(none)">
   Proceed? [yes/no]
   ```

4. If the user types anything other than `yes` → stop, write nothing,
   no per-project status. If `yes` → enter the per-project loop.

The skill MUST NOT touch any file before the user types `yes`.

Maps to spec FR-002, contract C7 lines 1–2, US2 acceptance scenarios 1
and 4.

### Step 1 — Read inputs

1. Call the agent's `Read` tool on `resume_path`. The tool handles both
   `.md` and `.pdf` natively (PDF text extraction is built in).
2. Branch on the result:
   - File missing → [reference.md § 7 row 1](reference.md#7-error-condition-table).
     Stop. Print `Resume not found: <path>`. Ask once for a corrected path.
   - Content empty or near-empty (typical of scanned PDFs) →
     [reference.md § 7 row 2](reference.md#7-error-condition-table).
     Stop. Print
     `Could not extract text from <path>. If this is a scanned PDF, please provide a Markdown version.`
     Do not retry.
   - Otherwise → carry the resume text into Step 2.
3. Resolve `project_selector` to a concrete file path under
   `src/content/projects/`:
   - A path that ends with `.md` → use as-is. Verify it exists with `Read`.
   - A bare slug (e.g. `example-personal`) → `Glob` for
     `src/content/projects/*/<slug>.md`. Exactly one match → use it.
     Multiple matches → list them and ask the user to disambiguate by
     category. No matches →
     [reference.md § 7 row 3](reference.md#7-error-condition-table).
     Print `No project found for selector: <selector>` and the closest
     matches by slug if any.
   - Unset → defer to batch mode (already handled by Step 0).

### Step 2 — Extract resume signals

Make a single up-front pass over the resume text and derive three signals
that you reuse for every project in this run:

1. **`current_career_stage`** — one of `junior`, `mid`, `senior`, `staff`,
   `principal`, `founder`. Use the detection cues in
   [reference.md § 1 Career-stage taxonomy](reference.md#1-career-stage-taxonomy).
   Tie → prefer the more conservative (less senior) label.
2. **`historical_stages`** — list of `{ stage, start: 'YYYY-MM', end: 'YYYY-MM' | 'present' }`,
   one entry per discrete role on the resume, ordered most-recent first.
   Used in Step 6 for old projects.
3. **`vocabulary_themes`** — 3–8 free-text phrases that recur in the
   resume's most-recent role(s) (e.g. `platform engineering`, `developer
   tooling`, `growth experimentation`). Drives word choice in Step 6.
   Never substitutes for facts.

For each project later, pick the stage to write from per
[reference.md § 1 → "Per-project stage selection"](reference.md#1-career-stage-taxonomy):
if `period.end == 'present'` or falls inside the most-recent role, use
`current_career_stage`; otherwise look up the role active during
`period.end`. (Maps to spec FR-007 + acceptance scenario US1#3.)

### Step 3 — Per-project pre-flight

For the current target file `P`:

1. **Uncommitted-changes guard** (FR-011 + contract C6):

   ```bash
   git status --porcelain -- "<P>"
   ```

   - Empty output → proceed.
   - Non-empty output AND the user has NOT explicitly opted in for *this
     specific file* in *this* invocation → mark
     `↷ skipped: <slug> (uncommitted changes)`. **Do NOT show the diff.**
     **Do NOT write the file.** Continue with the next project (or end the
     invocation in single mode).
   - Non-empty output AND the user explicitly opted in (verbal opt-in for
     this file only — there is no global flag) → proceed but **prepend** a
     warning line above the diff in Step 9:

     ```
     WARNING: <P> has uncommitted changes; proceeding will overwrite them.
     ```

   The check is **per-file**. Uncommitted changes elsewhere in the repo
   do not block optimization of an unrelated project file.

2. **Parse the file** as YAML front matter + Markdown body. If the parse
   fails → [reference.md § 7 row 5](reference.md#7-error-condition-table).
   Mark `✗ failed: <slug> (malformed front matter)` and continue.

3. **Determine the writing-stage** for this project per
   [reference.md § 1 → "Per-project stage selection"](reference.md#1-career-stage-taxonomy)
   using the resume's `historical_stages` from Step 2 and the project's
   front-matter `period.end`.

### Step 4 — Build confidentiality context

If `<P>` matches `src/content/projects/{corporate,startup}/**`:

1. Build the `existing_names` allow-list per
   [reference.md § 5 → "Building the allow-list"](reference.md#5-confidentiality-guard):
   capitalised tokens (length ≥ 2, NOT at sentence start) appearing in the
   original project's body (every section, including custom sections) PLUS
   capitalised tokens in the original front-matter `title`, `description`,
   `role` (after stripping leading articles). Do NOT include `techStack`
   entries — they're handled separately in the rule.
2. Carry `existing_names` (and the implicit `techStack` allowance) into
   Steps 6 and 8.

If `<P>` matches `src/content/projects/personal/**`, the
`ConfidentialityContext` is `null` for this project — Steps 6 and 8 simply
do not apply the proper-noun constraint. The personal-portfolio surface is
the user's own.

Maps to Constitution principle II + contract C4 + spec FR-006.

### Step 5 — Parse body into heading-bounded sections

Split the body on `^##\s+<title>\s*$` headings into an ordered list of
sections. Each section is a triple:

```
{
  heading_line:    string,        // exact text of the `## ...` line, including trailing whitespace
  prose:           string,        // freely rewriteable
  embedded_blocks: Block[],       // image refs, hyperlinks, fenced code, tables, inline HTML, explicit line breaks
}
```

Where:

- `heading_line` is preserved **verbatim** in Step 10. Never rewrite it,
  never reorder sections.
- `prose` is the **only** rewriteable slot inside the body.
- `embedded_blocks` are extracted to opaque tokens before generation
  (Step 6) and re-inserted at their original positions in Step 10. The
  exhaustive list of embedded constructs is in
  [reference.md § 3](reference.md#3-rewrite-vs-preserve-cheatsheet) — image
  refs (`![alt](path)`), hyperlinks (`[text](url)`), fenced code blocks
  (` ```lang ... ``` `), tables (any `|`-delimited row), inline HTML tags,
  and explicit line breaks (`<br>` or two trailing spaces).

**Missing conventional sections**: if `## Highlights` or
`## Lessons Learned` is absent from the file, queue it for **insertion**
after `## Overview` (or at the end of the body if no `## Overview` exists)
per [reference.md § 7 row 6](reference.md#7-error-condition-table) and
contract C2 permitted-difference 5. Track the inserted heading(s) in
`PerProjectResult.created_sections`.

**Custom sections** (`## Demo`, `## Architecture`, `## Credits`, etc.):
treat them identically to the conventional sections — rewrite their prose
in Step 6 with the same career-stage signals, preserve their heading line
and embedded blocks. Per
[reference.md § 7 row 7](reference.md#7-error-condition-table).

Maps to research.md R9 + spec FR-004.

### Step 6 — Generate rewritten content

Produce candidates for: `title`, `description`, `role`, AND a rewritten
prose slot for each body section (existing + any sections inserted in
Step 5).

The generation prompt MUST explicitly carry:

1. **Stage cues** from
   [reference.md § 1 Career-stage taxonomy](reference.md#1-career-stage-taxonomy)
   for the writing-stage chosen in Step 3 — both the allowed verbs and
   the anti-cues (verbs to avoid).
2. **Voice rules** from
   [reference.md § 2 Voice and anti-patterns](reference.md#2-voice-and-anti-patterns) —
   first-person, em-dash highlights (`**Label** — concrete fact`), the
   ban list, the "concrete over adjectival" rule.
3. **Confidentiality allow-list** from Step 4 (when present): inject
   verbatim as a hard rule per the prompt template in
   [reference.md § 5 → "The rule"](reference.md#5-confidentiality-guard).
4. **Pass-through bias** for idempotency — feed the *current* prose for
   each segment as a "preserve where you can" anchor:
   *"If a sentence in the current prose already passes the voice rules
   in §2 and supports a fact in the resume, keep it verbatim. Rewrite
   only what you would otherwise reject."*
   See [reference.md § 6 Idempotency rubric](reference.md#6-idempotency-rubric).
5. **No-fabrication rule** (FR-006): the rewrite MUST NOT invent
   technologies, employers, dates, customers, monetary figures, or
   outcomes that are not already present in either the project file or
   the resume. The project's preserved `period`, `techStack`, and
   category bound the claims you may make.
6. **Guidance handling** (US3, when `guidance` is non-empty): see
   [§ Guidance handling](#guidance-handling) below.

Output each rewritten segment with its embedded-block tokens still in
place — Step 10 re-inserts the actual blocks before writing.

#### Guidance handling

When the `guidance` input is non-empty:

1. Inject `guidance` into the generation prompt as a **steering layer**
   that is explicitly *subordinate* to:
   - (a) the resume-derived facts (career stage, dates, scope, employer
     existence), and
   - (b) the project's own preserved facts (`period`, `techStack`,
     category).
2. State the precedence rule verbatim in the prompt:
   *"Resume wins on factual claims (seniority, dates, scope, employer or
   customer existence). Guidance wins only on emphasis, vocabulary, and
   theme."*
3. **Conflict-surfacing**: BEFORE generating, scan `guidance` for explicit
   factual claims that contradict the resume-derived signals. Examples
   of conflicts:
   - Guidance asks to claim leadership scope larger than the resume's
     role + period support (e.g. *"claim I led a team of 8"* against an
     individual-contributor resume).
   - Guidance names a technology not in `techStack` and not in the
     resume's stack (e.g. *"emphasize my Rust work"* on a project whose
     `techStack` is `[Python, Django]` and whose resume never mentions
     Rust).
   - Guidance names an employer / customer / monetary figure that
     would violate the confidentiality guard in Step 8.

   On detected conflict, print:

   ```
   Conflict between guidance and resume:
     guidance asks to claim "<X>"
     but the resume shows <Y>
   The skill will not fabricate this claim. Continue without it? [yes/no]
   ```

   - `no` → mark `↷ skipped: <slug> (guidance conflict declined)`,
     continue with the next project.
   - `yes` → proceed with the conflicting claim **omitted** (not silently
     softened, not rephrased into something weaker — simply not present
     in the rewrite).

Maps to spec FR-014 + contract C1 `guidance` clause + US3 acceptance
scenarios 1 and 2.

### Step 7 — Schema validation + self-tighten

Re-assemble the front matter (with the exact same key ordering, indentation,
and surrounding whitespace as `P`) plus the body (with original heading
lines, original ordering, original embedded blocks) into a candidate `P'`,
then validate against `projectSchema` from `src/content.config.ts`.

Refer to
[reference.md § 4 Schema cheatsheet](reference.md#4-schema-cheatsheet)
for the constraint summary. The relevant new failure modes — because we
now rewrite `title`, `description`, and `role` — are length overflow on
those fields:

- `title.length > 80`
- `description.length > 240`
- `role.length > 80`

**Self-tighten retry policy** (per
[reference.md § 4 → "Self-tighten retry policy"](reference.md#4-schema-cheatsheet)
and contract C3):

1. Identify which of `title` / `description` / `role` are over their limits
   (one, two, or all three).
2. Re-prompt the model with the original input + the over-limit value(s)
   + a hard cap: *"Rewrite `<field>` in ≤<N> characters. Preserve meaning.
   Do not change any other field."*
3. Re-validate.
4. Pass → record the names of the re-tightened fields in
   `PerProjectResult.self_tightened_fields` and continue to Step 8.
5. Fail (still over limit on second try) → mark
   `✗ failed: <slug> (schema validation: <field> over <N> chars after retry)`
   and continue with the next project.

**Any non-length validation failure** (model dropped a key, emitted a
non-string value, etc.) → mark `✗ failed: <slug> (schema validation: <field>)`
and continue. Do **not** retry — non-length failures are bugs in the prompt;
fix the prompt, do not paper over with more retries. Maps to FR-010 + C3 +
[reference.md § 7 rows 8 + 9](reference.md#7-error-condition-table).

### Step 8 — Confidentiality inspection + reprompt

Only when the project lives under `corporate/` or `startup/`. For
`personal/` projects, skip this step entirely.

Per [reference.md § 5 → "Inspection + one-reprompt loop"](reference.md#5-confidentiality-guard):

1. Tokenise every rewritten segment from Step 7 (`title`, `description`,
   `role`, every body section's rewritten prose) and extract capitalised
   tokens by the same rule used to build `existing_names` in Step 4.
2. Compute
   `violations = rewritten_capitalised_tokens − (existing_names ∪ techStack)`.
3. Empty `violations` → pass to Step 9.
4. Non-empty → **one** re-prompt that calls out the offending tokens
   verbatim and re-injects the allow-list. After the re-prompt, re-run
   Step 7 (schema check) and then re-inspect.
5. Pass on second try → continue to Step 9.
6. Fail on second try → mark
   `✗ failed: <slug> (confidentiality guard tripped: <tokens> in <segment>)`,
   record `confidential_terms_blocked` in the per-project result, do NOT
   write, continue with the next project.

The expanded rewrite scope (we now rewrite `title` and `description`, not
just the body) means this guard surface is **wider** than in earlier
drafts — `title` and `description` in particular are tempting places for
an employer name to land. Inspect every segment.

Maps to Constitution II + contract C4 + C9 row 10.

### Step 9 — Show diff and confirm

Present a unified diff between the on-disk `P` and the candidate `P'`,
covering every changed segment (front matter + body). Format:

```diff
--- src/content/projects/<category>/<slug>.md   (current)
+++ src/content/projects/<category>/<slug>.md   (rewritten)
@@ ... @@
-title: "..."
+title: "..."
-description: "..."
+description: "..."
-role: "..."
+role: "..."
@@ ... @@
 ## Overview
-... old prose ...
+... new prose ...
 ## Highlights
- - **OldLabel** — old fact
+ - **NewLabel** — new fact
... etc ...
```

If Step 3 set the uncommitted-changes warning, **prepend** this line above
the diff:

```
WARNING: <P> has uncommitted changes; proceeding will overwrite them.
```

Then ask **explicitly**:

```
Apply this rewrite? [yes/no/skip]
```

- `yes` → proceed to Step 10 (write).
- `no` or `skip` → mark `↷ skipped: <slug> (declined)`. Do NOT write.
  Continue with the next project.
- Any other reply → re-ask **once**:
  `Please answer yes, no, or skip.`
  On second non-`yes` → mark `↷ skipped: <slug> (declined)`.

The skill MUST NOT write any file before the user's explicit `yes`.
There is **no** flag, no mode, and no global silencer that bypasses this
gate. Maps to FR-008 + SC-005 + contract C5.

### Step 10 — Write file and report

On `yes` from Step 9:

1. Write `P'` to `<P>`. Use surgical `StrReplace` calls when possible
   (one per changed segment) so unchanged regions are not retouched —
   this keeps the on-disk file's `mtime` movement minimal and is friendly
   to filesystem watchers.
2. Re-insert embedded blocks (image refs, hyperlinks, fenced code,
   tables, inline HTML, explicit line breaks) at their original positions
   per Step 5. Verify byte-equality of every embedded block against `P`.
3. Emit a one-line per-project status using this format:

   ```
   ✓ optimized: <slug>  (rewrote: title, description, role, <N> sections; created: [<sections>]; self-tightened: [<fields>])
   ```

   Or one of:

   ```
   ↷ skipped:  <slug>  (<reason>)
   ✗ failed:   <slug>  (<reason>)
   ```

   Omit the parenthetical sub-clauses (`created: ...`, `self-tightened: ...`)
   when their lists are empty.

Maps to FR-013 line shape + research.md R10.

### Step 11 — End-of-batch validation (batch mode only)

After the last project in the batch is processed (regardless of mix of
`optimized` / `skipped` / `failed`), run **once**:

```bash
npm run build
```

Outcomes:

- Build succeeds → continue to Step 12.
- Build fails → per
  [reference.md § 7 row 13](reference.md#7-error-condition-table):
  print the build error verbatim, name the most recent successfully-written
  project as the suspect, and let the user decide. **Do NOT auto-revert.**

Maps to contract C7 line 5 + research.md R10.

### Step 12 — Final summary (batch mode only)

Print a header line in this form, followed by one status line per project
in the same order they were processed:

```
<N> optimized, <M> skipped, <K> failed
  ✓ src/content/projects/personal/foo.md          (rewrote 4 sections)
  ↷ src/content/projects/personal/bar.md          skipped: uncommitted changes
  ✗ src/content/projects/startup/baz.md           failed: schema validation (description over 240 chars after retry)
  ↷ src/content/projects/corporate/qux.md         skipped: declined
  ✓ src/content/projects/personal/quux.md         (rewrote 3 sections; self-tightened: [title])
```

The status lines are the same lines emitted in Step 10 at write-time,
re-printed in batch order so the user can see the whole roll-up at a
glance. Maps to FR-013 + contract C7 line 6.

## Voice and style

This skill MUST produce prose that blends with the un-optimized entries
in the same content collection. The full ruleset — voice, banned phrases,
highlight format, stage-specific verbs — lives in
[reference.md § 2 Voice and anti-patterns](reference.md#2-voice-and-anti-patterns).

When you need the rules during a step, link there. **Do not restate them
in this file** — keep the workflow readable and the rules in one place.

## Anti-patterns

- Do **not** edit any file under `public/projects/` — assets are out of
  scope (FR-005 + plan.md → assumptions).
- Do **not** rename a project file or change its `slug` — URL identity
  and pinned test fixtures depend on slug stability (FR-015 +
  research.md R11).
- Do **not** change `period`, `techStack`, `thumbnail`, `screenshots`,
  `links`, `featured`, `order`, or `draft` — they are not narrative
  (FR-005 + contract C2).
- Do **not** add or remove any front-matter key, and do **not** reorder
  the existing keys — diff hygiene + the strict Zod schema (contract C2).
- Do **not** rewrite, reorder, or rename any body section's heading line
  (`## ...`) — section identity is structural, not narrative
  (contract C2).
- Do **not** rewrite anything inside an embedded image ref, hyperlink,
  fenced code block, table, or inline HTML tag — they're opaque tokens
  (research.md R9 + contract C2).
- Do **not** introduce a proper noun from the resume into a `corporate/`
  or `startup/` project file that wasn't already there (Constitution II +
  contract C4).
- Do **not** invent technologies, employers, dates, customers, monetary
  figures, or outcomes that aren't already in the project file or the
  resume (FR-006).
- Do **not** process projects in parallel in batch mode — sequential
  only, per project, end-to-end (contract C7 line 3 + research.md R10).
- Do **not** auto-yes the diff. There is no `--force`, no `--auto-yes`,
  no global silencer for the diff gate (FR-008 + SC-005 + contract C5).
- Do **not** silently overwrite a file with uncommitted changes — refuse
  unless the user explicitly opts in for *that file* in *this* invocation
  (FR-011 + contract C6).
- Do **not** retry non-length schema failures — they are bugs in the
  prompt; fail-fast and surface the field name (contract C3 +
  [reference.md § 7 row 9](reference.md#7-error-condition-table)).
- Do **not** abort the whole batch when one project fails — isolate the
  failure, record it in the summary, keep going (FR-009 + contract C7
  line 4).
- Do **not** copy the resume into the repository — it's an input, not a
  deliverable (data-model.md § 1).

## Additional resources

- [reference.md](reference.md) — career-stage taxonomy, voice rules,
  rewrite vs. preserve cheatsheet, schema cheatsheet, confidentiality
  guard, idempotency rubric, error condition table.
- Spec: [`specs/004-optimize-project-skill/spec.md`](../../../specs/004-optimize-project-skill/spec.md)
- Plan: [`specs/004-optimize-project-skill/plan.md`](../../../specs/004-optimize-project-skill/plan.md)
- Behavioral contract:
  [`specs/004-optimize-project-skill/contracts/skill-invocation.contract.md`](../../../specs/004-optimize-project-skill/contracts/skill-invocation.contract.md)
- Quickstart (acceptance walkthrough):
  [`specs/004-optimize-project-skill/quickstart.md`](../../../specs/004-optimize-project-skill/quickstart.md)
- Sibling skill (voice-consistency reference):
  [`.cursor/skills/add-project-from-repo/SKILL.md`](../add-project-from-repo/SKILL.md)
