# Reference — optimize-project-from-resume

The lookup-table sibling of [`SKILL.md`](SKILL.md). Every workflow step in
`SKILL.md` cites a section of this file rather than restating the rules — that
keeps `SKILL.md` lean per step and keeps these tables independently auditable.

> **Scope boundary**: this skill rewrites *narrative* content only.
> See **Rewrite vs. Preserve cheatsheet** below for the exact line.

## Sections

1. **Career-stage taxonomy** — the six stages, detection cues, scope verbs,
   anti-cues. Drives the *voice* of the rewrite.
2. **Voice and anti-patterns** — first-person, no marketing fluff, ban list,
   highlight format. Single source of truth for prose style.
3. **Rewrite vs. Preserve cheatsheet** — which fields/segments are
   rewriteable, which are immutable, and why.
4. **Schema cheatsheet** — Zod constraints + the self-tighten retry policy
   for the now-rewriteable `title` / `description` / `role` fields.
5. **Confidentiality guard** — the corporate/startup rule, allow-list
   construction, and the inspection + reprompt loop.
6. **Idempotency rubric** — the three-layer trick that keeps re-runs flat.
7. **Error condition table** — every failure mode and its outcome.

---

## 1. Career-stage taxonomy

The skill maps the resume to **one** of these six labels for the *current*
moment, plus a list of `(stage, start, end)` tuples for past roles (used by
the historical-perspective lookup in `SKILL.md` Step 2).

| Stage       | Detection cues (any 2 of 3 is enough)                                                                                                                                                                                                                                                | Scope/ownership verbs the rewrite MAY use                                                                                            | Anti-cues — verbs the rewrite MUST avoid                                                |
|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| `junior`    | (a) <2 years experience total. (b) Most recent title contains *Junior* / *Associate* / *Intern* / *Trainee* / *Graduate*. (c) Resume bullets dominated by learner verbs.                                                                                                              | "learned to", "got comfortable with", "built my first", "shipped under guidance", "contributed to", "paired on"                      | "led", "owned the architecture", "set the technical direction", "mentored"               |
| `mid`       | (a) 2–5 years total. (b) Most recent title is plain *Software Engineer* / *Developer* / *Engineer II* with no senior modifier. (c) Bullets show feature ownership but rarely cross-team scope.                                                                                       | "built", "shipped", "owned the feature", "improved", "refactored", "investigated"                                                    | "introduced to", "got my first taste of", "set the org's direction"                      |
| `senior`    | (a) 5–10 years. (b) *Senior* in any of the most recent two titles. (c) Bullets include cross-team scope, code review, mentorship.                                                                                                                                                    | "owned", "led the implementation", "designed", "mentored", "drove the rollout", "unblocked"                                          | learner verbs; pure delivery verbs without ownership ("worked on")                       |
| `staff`     | (a) 7–15 years. (b) Title contains *Staff* / *Principal* / *Lead* / *Architect* / *Tech Lead*. (c) Bullets reference org-wide initiatives, multi-team coordination, technical strategy.                                                                                              | "set the technical direction", "rallied <N> teams", "owned the quality bar across …", "wrote the RFC for …", "deprecated …"          | individual-feature verbs only; "shipped X" without scope qualifier                       |
| `principal` | (a) Long horizon (10+ years) with clear influence beyond a single org. (b) *Principal* / *Distinguished* / *Fellow* in title or equivalent ("set engineering culture for N orgs"). (c) Bullets include external influence — talks, RFCs adopted by others, OSS leadership.            | "shaped the org's stance on …", "established the convention …", "advised the leadership on …", "represented the company at …"        | small-scope verbs; "fixed bug X"                                                         |
| `founder`   | (a) Self-employed, *Founder* / *Co-Founder* / *CEO* / *CTO* with company they founded, or "Building <thing>" framing. (b) Bullets cover product + business + engineering, not engineering alone. (c) Resume references customers, revenue, fundraising, hiring.                       | "decided to build", "found product–market fit on", "owned product, eng, and growth", "shipped the first paying-customer feature"     | pure-engineering framing without product/business context                                |

**Selection rule**: pick the stage whose detection cues match best. Tie →
prefer the *more conservative* (less senior) label. The diff-and-confirm gate
catches over-claiming; under-claiming is recoverable on the next run.

**Per-project stage selection** (used by `SKILL.md` Step 2 for FR-007 / R8):

- If `period.end == 'present'` OR `period.end` falls inside the *most recent*
  resume role → use `current_career_stage`.
- Else find the resume role whose `(start, end)` range contains `period.end`
  → use that role's stage.
- Else (gap year, sabbatical, parental leave, undated period) → use the role
  active immediately before `period.end`.

These cues are guidelines for the model, not regex-enforced. Maps to spec
FR-003 and acceptance scenario US1#3.

---

## 2. Voice and anti-patterns

> Single source of truth for prose style. **`SKILL.md` MUST link here rather
> than restating these rules.** Mirrors the discipline of
> `.cursor/skills/add-project-from-repo/SKILL.md` § "Voice and style" — when
> you change one, change both in the same PR.

### Voice

- **First-person** ("I built", "I owned"). Past or present tense — match the
  surrounding prose. Never third-person ("the developer", "the team").
- **Concrete over adjectival**. Numbers, tech names, durations, scope.
  - Good: "five workers behind a Redis stream, 200ms p95"
  - Bad: "fast, scalable async pipeline"
- **Evidence-backed**. Every claim must be supportable by something already
  in the project file or in the resume — never invent (FR-006).
- **Highlights line format**: `- **Label** — concrete fact` (em-dash `—`,
  not hyphen `-` or two hyphens `--`).
- **Lessons Learned** is *one honest paragraph*. Not a recap of the Overview.
  Skip it if you cannot infer one honestly from the existing file or
  techStack — leaving it as it was is better than fabricating retrospect.

### Banned phrases

The model MUST NOT use these in any rewritten segment. Strip them from
inputs that already contain them when rewriting.

| Banned                                                                | Why                                                       |
|-----------------------------------------------------------------------|-----------------------------------------------------------|
| `leveraged`                                                           | Marketing fluff; "used" is honest                         |
| `robust`                                                              | Unsupportable claim; replace with a metric                |
| `seamless`                                                            | Marketing fluff; nothing is seamless                      |
| `cutting-edge`                                                        | Adjective inflation; name the tech instead                |
| `powerful`                                                            | Marketing fluff                                           |
| `unlock` / `unlocked`                                                 | Press-release verb                                        |
| `synergy` / `synergies`                                               | Buzzword                                                  |
| `next-generation` / `next-gen`                                        | Adjective inflation                                       |
| `world-class`                                                         | Unsupportable claim                                       |
| `state-of-the-art`                                                    | Adjective inflation                                       |
| `revolutionary` / `revolutionize`                                     | Press-release verb                                        |
| `bleeding-edge`                                                       | Adjective inflation                                       |
| `enterprise-grade`                                                    | Adjective inflation                                       |
| `mission-critical`                                                    | Adjective inflation; describe the SLA instead             |

### Stage-specific scope words

See **§1 Career-stage taxonomy** for the per-stage allow-list / deny-list of
scope and ownership verbs.

Maps to research.md R7 + Constitution VI.

---

## 3. Rewrite vs. Preserve cheatsheet

The non-negotiable line. **Rewrite the left column. Preserve the right
column byte-for-byte.** Maps to spec FR-005 + FR-015 + contract C2 + R11.

| Rewriteable narrative                                                                          | Immutable fact / identity / configuration / structure                                                                                                                                       | Why preserved                                                                                                                                                  |
|------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Front matter — `title` (≤80 chars after rewrite)                                               | Front matter — `slug`                                                                                                                                                                       | URL identity. Pinned by `tests/unit/projects.test.ts` and the example slugs (`example-personal`, `example-startup`, `example-corporate`). Renaming breaks links and tests. |
| Front matter — `description` (≤240 chars after rewrite)                                        | Front matter — `period.start`, `period.end`                                                                                                                                                 | Historical fact. Rewriting would invite the model to re-date a project to fit the resume's narrative — exactly the dishonesty FR-006 forbids.                  |
| Front matter — `role` (≤80 chars after rewrite; vocabulary/register only — never claimed scope) | Front matter — `techStack[]` (every entry, in order)                                                                                                                                        | Historical fact. The project shipped with the tools it shipped with.                                                                                           |
| Body — `## Overview` prose                                                                     | Front matter — `thumbnail`, `screenshots[]`                                                                                                                                                 | Asset paths. Any "improvement" is at best a no-op, at worst a 404.                                                                                             |
| Body — `## Highlights` prose (each bullet `**Label** — concrete fact`)                         | Front matter — `links.source`, `links.live`, `links.caseStudy`                                                                                                                              | URLs. Same reason as asset paths.                                                                                                                              |
| Body — `## Lessons Learned` prose (one honest paragraph)                                       | Front matter — `featured`, `order`, `draft`                                                                                                                                                 | Owner-controlled site configuration. The skill optimizes content; the owner curates which content surfaces and where.                                          |
| Body — every other section's prose (`## Demo`, `## Architecture`, `## Credits`, etc.)          | Any unknown front-matter key the file may carry                                                                                                                                             | Strict schema rejects unknowns; preserving keeps the file build-clean if the schema is later extended.                                                         |
|                                                                                                | Front-matter block delimiters (`---`), key indentation, key ordering, surrounding whitespace                                                                                                | Diff hygiene. Re-emitting the same data with different YAML formatting produces a noisy diff that buries the actual content changes.                            |
|                                                                                                | Every body section heading line (`^## .*$`) — text and whitespace                                                                                                                           | The order and identity of sections is part of the file's structure, not its narrative.                                                                         |
|                                                                                                | The order of body sections in the file                                                                                                                                                      | Same reason.                                                                                                                                                   |
|                                                                                                | Inside any body section: image refs (`![alt](path)`), hyperlinks (`[text](url)`), fenced code blocks (` ```lang ... ``` `), tables (`|`-delimited rows), inline HTML, explicit line breaks | These are not prose. Rewriting an image ref breaks an image; rewriting a code fence is code injection; rewriting a link is a broken hyperlink. Treat as opaque tokens. |
|                                                                                                | Trailing newline of the file (present or absent — do not add or remove)                                                                                                                     | Diff hygiene.                                                                                                                                                  |

**Permitted differences between `P` (original) and `P'` (rewritten)** —
exhaustive list (per contract C2):

1. The value following `title:` in the front matter.
2. The value following `description:` in the front matter.
3. The value following `role:` in the front matter.
4. The *prose* content inside any body section (text between heading lines,
   excluding embedded non-prose constructs as enumerated above).
5. Insertion of a missing `## Highlights` or `## Lessons Learned` heading +
   body, placed immediately after `## Overview` (or at end of body if no
   `## Overview`). When this occurs, `created_sections` MUST be reported in
   the per-project status.

Anything else differing between `P` and `P'` is a bug.

---

## 4. Schema cheatsheet

The rewritten file MUST validate against `projectSchema` from
`src/content.config.ts` *before* any write. The full schema lives in that
file; the constraints the skill is most likely to bump into are:

| Field                  | Constraint                                                                            |
|------------------------|---------------------------------------------------------------------------------------|
| `title`                | `string`, `length ∈ [1, 80]` ← rewriteable, may need self-tighten                     |
| `description`          | `string`, `length ∈ [1, 240]` ← rewriteable, may need self-tighten                    |
| `role`                 | `string`, `length ∈ [1, 80]` ← rewriteable, may need self-tighten                     |
| `period.start`         | `^[0-9]{4}-(0[1-9]|1[0-2])$` (preserved — not the skill's job)                        |
| `period.end`           | `YYYY-MM` or literal `"present"`; must be `≥ period.start` (preserved)                |
| `techStack`            | `string[]`, 1–20 entries, each `length ∈ [1, 30]` (preserved)                         |
| `thumbnail`            | non-empty `string` (preserved)                                                        |
| `screenshots`          | `string[]`, max 10 (preserved)                                                        |
| `links.{source,live,caseStudy}` | each must match `^https?://` (preserved)                                       |
| `featured`             | `boolean`, default `false` (preserved)                                                |
| `order`                | non-negative `integer`, default `100` (preserved)                                     |
| `draft`                | `boolean`, default `false` (preserved)                                                |

Strict schema — unknown keys cause build failure. The skill MUST NOT add or
remove keys; it only edits the values of `title`, `description`, and `role`.

### Self-tighten retry policy

If validation fails *only* because one or more of `title` / `description` /
`role` exceed their length limits, the skill MUST attempt **exactly one**
re-generation pass instructing itself to tighten the offending field(s) to
fit. Mechanics:

1. Identify which of the three rewriteable fields exceed their limits (one,
   two, or all three may be over).
2. Re-prompt the model with the original input + the over-limit field
   value(s) + a hard cap: *"Rewrite `<field>` in ≤<N> characters. Preserve
   meaning. Do not change any other field."*
3. Re-validate.
4. Pass → write the file. Record the names of the re-tightened fields in
   `PerProjectResult.self_tightened_fields`.
5. Fail (still over limit on second try, or any non-length validation
   failure) → mark the project `failed: schema validation (<field>)` and
   skip. **Do not write.**

Length failures are the only validation failures eligible for retry. Every
other validation failure (e.g., the model accidentally dropped a key, or
emitted a non-string value) is a bug in this skill — fix the prompt, do
not paper over with more retries. Maps to FR-010 + contract C3.

---

## 5. Confidentiality guard

Applies **only** to projects whose path matches
`src/content/projects/{corporate,startup}/**`. For `personal/` projects this
section is a no-op — the personal-portfolio surface is the user's own.
Maps to Constitution principle II + spec FR-006 + contract C4 + R6.

### The rule

When the target file is corporate or startup:

> **From the resume, extract only `(career_stage, scope_register, vocabulary_themes)`. Never extract proper nouns — no employer names, no customer names, no internal product names, no monetary figures, no team sizes.**
>
> **Inside any rewritten segment — `title`, `description`, `role`, OR any body section — the only proper nouns that MAY appear are: (a) those already present in the original project file, plus (b) entries already in `techStack`. Do not introduce any other proper noun. If the model wants to refer to something whose name appears in the resume but not in the project file, it MUST use a generic descriptor instead ("a major payments processor", "a top-three retail bank").**

The expanded rewrite scope (we now rewrite `title` and `description`, not
just the body) means the guard surface is wider — `title` and `description`
in particular are tempting places to land an employer name — so the rule is
enforced on **every** rewritten segment, not just the body.

### Building the allow-list

`existing_names` is the union of:

1. Capitalised tokens (length ≥ 2, NOT at sentence start) appearing in the
   original project's body — every section, including custom sections.
2. Capitalised tokens in the original project's front-matter `title`,
   `description`, and `role` (after stripping leading articles).
3. NOT included: `techStack` entries (they're handled by the "or in
   `techStack`" branch of the rule above) — and not `slug`, `links`, or
   asset paths (those aren't prose-eligible names).

Examples of what counts as a capitalised token: `Stripe`, `JPMorgan`,
`Acme Corp` (multi-word, treated as one token), `Q1 2024` (no — leading
digit), `iPhone` (yes — internal capital).

### Inspection + one-reprompt loop

After Step 6 (generation) in `SKILL.md`, before Step 9 (diff):

1. Tokenise every rewritten segment (`title`, `description`, `role`, every
   body section's rewritten prose) and extract capitalised tokens by the
   same rule used to build `existing_names`.
2. Compute `violations = rewritten_capitalised_tokens − (existing_names ∪ techStack)`.
3. If `violations` is empty → pass.
4. If non-empty → **one** re-prompt with the offending tokens called out
   verbatim and the allow-list re-injected: *"You used these proper nouns
   that are not allowed: `<violations>`. Rewrite the affected segments
   without them. The only proper nouns you may use are: `<existing_names>`
   plus `<techStack>`."*
5. Re-inspect.
6. Pass → continue to Step 9 (diff).
7. Fail → mark `failed: confidentiality guard tripped (<tokens> in <segment>)`,
   record `confidential_terms_blocked` in the per-project result, do NOT
   write, continue with the next project.

Maps to contract C4 + C9 row 10.

---

## 6. Idempotency rubric

Calibration target (per SC-006 + contract C8): a second run of the skill on
the same project with the same resume + guidance produces a diff of fewer
than 5 changed lines in at least 9 of 10 attempts.

This is a *prompt-design* target, not a runtime check. The skill never
refuses a write because the diff is too big — the user's diff-and-confirm
gate (Step 9) handles that, and a too-big diff is itself the user's signal
that the prompt needs sharpening. Maps to research.md R5.

The three layered constraints:

1. **Pass-through bias.** The generation step (Step 6) feeds the *current*
   project text into the rewrite prompt and instructs the model: *"If a
   sentence already passes the voice rules in §2 and supports a fact in the
   resume, keep it verbatim. Rewrite only what you would otherwise reject."*
   This makes the trivial fixed point — "this project is already optimized" —
   emit the same text.
2. **Deterministic prose rubric.** §2 (Voice + ban list + highlight format)
   is a tight, fixed style guide. Two runs with the same inputs will pick
   nearly the same words because the rubric narrows the space of "valid"
   wordings.
3. **Diff-and-confirm gate.** The user sees the diff before any write. A
   drifty rerun produces a noticeable diff and the user simply says no.
   Rejection is the manual-but-cheap calibration loop that pulls the
   prompt back into idempotency over time.

If a same-input rerun consistently produces a >5-line diff in casual use,
sharpen the pass-through bias instruction in `SKILL.md` Step 6 first —
that's where the lever is.

---

## 7. Error condition table

Every failure mode the skill knows how to handle. In every error case, no
project file is modified. Maps to contract C9 in full.

| Condition                                                                                                            | Outcome                                                                                                                                                                                              |
|-----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `resume_path` does not exist                                                                                         | Stop. Print `Resume not found: <path>`. Ask once for a corrected path. If still missing, abort — do not enter retry loops.                                                                            |
| `resume_path` exists but `Read` returns empty / near-empty content (incl. scanned PDFs)                              | Stop. Print `Could not extract text from <path>. If this is a scanned PDF, please provide a Markdown version.` Do not retry.                                                                          |
| `project_selector` is set but matches no file                                                                        | Stop. Print `No project found for selector: <selector>`. List the closest matches by slug if any.                                                                                                     |
| In batch mode, the glob `src/content/projects/**/*.md` matches zero files                                            | Stop. Print `No project files found under src/content/projects/`.                                                                                                                                     |
| A target project file fails to parse as front-matter + body                                                          | Mark `failed: malformed front matter`. Continue with the next project.                                                                                                                                |
| A target project file is missing `## Highlights` and/or `## Lessons Learned`                                         | Proceed. Create the missing section(s) after `## Overview` (or at end of body if no `## Overview`) per R9. Report `created_sections` in the per-project status.                                       |
| A target project file contains custom body sections (`## Demo`, `## Architecture`, `## Credits`, etc.)               | Proceed. Rewrite their prose with the same career-stage signals as the rest of the body, preserving heading lines and embedded non-prose constructs verbatim per §3.                                  |
| The rewritten `title` / `description` / `role` exceeds its schema length limit                                       | Re-prompt once with explicit instruction to tighten the offending field(s). Re-tightened field names go in `self_tightened_fields`. If the re-tightened output still fails, mark `failed: schema validation (<field>)`. |
| The rewritten content fails the schema for any reason other than length                                               | Mark `failed: schema validation (<field>)`. Continue. Do not retry — non-length failures are bugs, fix the prompt.                                                                                    |
| The rewritten content fails the confidentiality guard on first pass                                                   | Re-prompt once (see §5). If the second pass still fails, mark `failed: confidentiality guard tripped (<tokens> in <segment>)`. Continue.                                                              |
| The user declines the diff (Step 9)                                                                                   | Mark `skipped: declined`. Continue.                                                                                                                                                                   |
| The user has uncommitted changes to the target file and does not opt in for that file                                 | Mark `skipped: uncommitted changes`. Do NOT show the diff. Continue.                                                                                                                                  |
| `npm run build` fails after a batch (Step 11)                                                                         | Print the build error verbatim and which project's diff was the most recent suspect. Do not auto-revert; let the user decide.                                                                         |
| Guidance string conflicts with the resume on a factual claim (US3)                                                    | Surface the conflict before generation; ask `Continue without the conflicting claim? [yes/no]`. `no` → `skipped: guidance conflict declined`. `yes` → proceed with the conflicting claim *omitted* (not silently softened). |
