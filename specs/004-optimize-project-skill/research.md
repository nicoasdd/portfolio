# Research: Resume-Aligned Project Optimizer Skill

**Feature**: `004-optimize-project-skill`
**Date**: 2026-04-20
**Status**: Phase 0 complete — all `NEEDS CLARIFICATION` resolved

This document captures the technical decisions taken during planning, with the alternatives considered and the reasons for rejection. The intent is that anyone reading the skill files a year from now can understand why we picked the boring, low-magic option without having to re-derive it.

---

## R1. How does the skill read PDF resumes without adding a runtime dependency?

**Decision**: Rely on Cursor's built-in `Read` tool, which already returns PDF content as plain text (per the agent's documented PDF support). The skill instructs the agent to call `Read` on the resume path regardless of extension.

**Rationale**:

- The capability is already in the box. Adding a Node-side PDF library would only matter if a non-agent runtime needed to parse PDFs, and there is none — the skill is invoked exclusively at author time inside Cursor.
- Constitution III (Static-Site Performance) forbids new runtime dependencies for the site. Even though this dep would be author-only, the principle nudges us toward "no dep when none is needed."
- Failure mode is acceptable: if the PDF is a scanned image with no extractable text, `Read` returns near-empty content and the skill stops with a clear message asking for a Markdown version (see C9 in the contract).

**Alternatives considered**:

- *Add `pdf-parse` or `pdfjs-dist` as a devDependency*: rejected — adds installation surface, lockfile churn, and a transitive footprint, all to replace something the agent already does.
- *Convert PDFs to Markdown in a pre-step via `pandoc`*: rejected — assumes a system tool that isn't enforced by the project; introduces an external-tool failure mode into the skill's happy path.

---

## R2. What career-stage taxonomy does the skill use?

**Decision**: A coarse 6-stage scale, in this exact order:

| Stage | Typical resume signals |
|---|---|
| `junior` | <2 years experience; titles like Junior/Associate; learner verbs ("learned", "contributed to"); narrow, single-component scope. |
| `mid` | 2–5 years; "Software Engineer" / "Developer" without modifier; owns features; some peer review. |
| `senior` | 5–10 years; "Senior" in recent titles; cross-team scope; mentorship cues. |
| `staff` | 7–15 years with `staff/principal/lead` titles or org-wide initiatives; tech-strategy verbs ("set technical direction", "owned", "led"). |
| `principal` | Long horizon; multi-org influence; "principal" in title or equivalent scope language. |
| `founder` | Self-employed or `founder/CEO/CTO` with company they founded; product-and-business scope verbs. |

The skill's job is to map the resume to *one* of these labels for the *current* moment, plus a small list of `(stage, date_range)` tuples for past roles (used by R8).

**Rationale**:

- Coarse-grained labels generalize across companies and industries. Fine ladders (L3/L4/E5/E6/IC5/IC6/Lead vs. Senior Lead) are company-specific and would force the user to learn a taxonomy.
- Six stages give enough resolution to materially change the rewrite (junior→senior is a different voice; staff→principal is barely different but the difference is real for the right portfolio).
- Detection rules are explicit so the skill behaves predictably across resumes.

**Alternatives considered**:

- *Free-form stage description from the resume's most recent title verbatim*: rejected — too much variance ("Member of Technical Staff", "SDE II", "Engineering Lead III") to drive consistent rewrites.
- *Years-of-experience-only*: rejected — a 12-year IC and a 12-year staff engineer write very differently; title and scope cues add necessary signal.
- *Ask the user for their stage every time*: rejected — defeats the "pass me my resume" UX of the spec.

---

## R3. Where does the skill live, and how is it invoked?

**Decision**: A new directory `.cursor/skills/optimize-project-from-resume/` with `SKILL.md` + `reference.md`. Invocation is conversational, just like the existing `add-project-from-repo` skill: the user says "optimize my projects with this resume `<path>`" and the agent matches the skill via its frontmatter `description`.

**Rationale**:

- One convention to learn. The repo already has one user-invokable skill that operates on `src/content/projects/`; the new one is its sibling.
- Splitting into `SKILL.md` (workflow) and `reference.md` (lookup tables) keeps the agent's working window lean per step. The existing skill uses the same split for the same reason.
- No `npm run` script, no CLI entry point — they would imply a maintained Node program for what is structurally a prompt + a few shell calls.

**Alternatives considered**:

- *A single-file skill*: rejected — the career-stage taxonomy, voice rules, schema cheatsheet, and confidentiality guard would crowd out the workflow steps.
- *An npm script (`npm run optimize -- --resume … --project …`)*: rejected — adds a Node entry point, an arg parser, and a maintenance burden where a prompt suffices, and removes the agent's ability to converse during the run (e.g., to surface a confidentiality conflict).

---

## R4. How does the skill detect uncommitted local changes (FR-011)?

**Decision**: Per project, run `git status --porcelain -- <project-path>` immediately before showing the diff. Non-empty output → skip with a message like:

> `<path>` has uncommitted changes. Commit, stash, or rerun with `--force` to overwrite.

**Rationale**:

- `--porcelain` output is stable and machine-readable; the empty/non-empty check is unambiguous.
- Per-file check (not repo-wide) is correct: the user might be editing project A while running the skill against project B, and that should not block B.
- "Refuse and tell" beats "stash and hope" — the skill never silently moves the user's work.

**Alternatives considered**:

- *Repo-wide `git status` check*: rejected — too aggressive; blocks legitimate partial workflows.
- *Auto-stash → optimize → pop*: rejected — turns a clean operation into a stash dance that can leave the user in a confusing state on conflicts. Constitution principle of least surprise wins.

---

## R5. How does the skill stay idempotent (FR-012, SC-006)?

**Decision**: Three layered constraints in the prompt, none of which require persisted state:

1. **Pass-through bias**: the skill is given the *current* project text in full and is instructed: "if a sentence already says what you would otherwise say, keep it verbatim." This makes the trivial fixed point — "this project is already optimized" — emit the same text.
2. **Deterministic prose rubric**: a short, fixed style guide (in `reference.md`) — first-person, em-dash highlights, ban-list of buzzwords, target sentence length, forbidden adjectives — pins the model's wording so two runs with the same inputs produce nearly identical outputs.
3. **Diff-and-confirm gate**: the user sees the diff before any write. A drifty rerun produces a noticeable diff and the user simply rejects it, which is itself a feedback signal that the prompt needs tightening (a manual-but-cheap calibration loop).

**Rationale**:

- Persisted state (e.g., a hash of the last-optimized version stored in a sidecar file) would add a maintenance footprint and a sync hazard for marginal benefit. The user rerunning the skill twice in a row is not the common case.
- The 9-of-10 / <5-line bar in SC-006 is what the rubric is calibrated against; it is not a hard guarantee against worst-case stochastic output.

**Alternatives considered**:

- *Cache a hash of the resume + project to skip unchanged pairs*: rejected — adds state and a cache-invalidation problem; doesn't help the case where the user *wants* to rerun (e.g., after editing the resume).
- *Lock the model's temperature to 0 explicitly*: not needed — the skill runs in whatever Cursor agent the user has; the rubric does the determinism work.

---

## R6. How does the skill respect Constitution principle II (corporate/startup confidentiality)?

**Decision**: When the target project file lives under `src/content/projects/corporate/` or `src/content/projects/startup/`, the skill applies a strict guardrail:

- From the resume, extract *only* `(career_stage, scope_register, vocabulary_themes)`. Do **not** extract employer names, customer names, internal product names, monetary figures, or team sizes.
- Build an allow-list of proper nouns from the *current* project file (its body and front matter, excluding generic technologies in `techStack`). Call this `existing_names`.
- *Every* rewritten segment — `title`, `description`, `role`, and every body section — MUST NOT introduce any proper noun that is not in `existing_names` or in `techStack`. If the model wants to use one (e.g., to add color), it must use a generic descriptor instead ("a major payments processor" rather than "Stripe"). The expanded scope (R11) means the guard surface is wider — title and description in particular are tempting places to land an employer name — so the rule is enforced on every segment, not just the body.

**Rationale**:

- Constitution principle II says corporate/startup descriptions "MUST focus on role, impact, and technologies used" with "no proprietary code or NDA-protected details." The clearest way to enforce this is to forbid the skill from importing names *from the resume*, which is the most likely vector for accidental leaks.
- The allow-list approach lets the skill keep names the user already chose to disclose in the project file, without inventing new ones.
- For `personal/` projects there is no such guard — the user can introduce whatever names they want; that's the personal-portfolio surface.

**Alternatives considered**:

- *Regex post-filter to strip names after generation*: rejected — name detection is brittle (capitalized words, multi-word product names, ambiguous tokens like "Apollo"); generation-time constraint is more reliable.
- *Manual review only*: rejected — relying on the user to spot every leak in every diff is the failure mode this guard exists to prevent.
- *Strip the resume of names before passing it to the model*: rejected — the resume's structure (which company taught which lesson) carries useful stage signal; sanitizing it would also remove the stage cues.

---

## R7. How does the skill keep voice consistent with un-optimized entries (Constitution VI)?

**Decision**: Adopt verbatim the "Voice and style" + "Anti-patterns" sections from `.cursor/skills/add-project-from-repo/SKILL.md`:

- First-person, past or present tense, no marketing fluff.
- Highlights use the form `**Label** — concrete fact` (em-dash, not hyphen).
- Banned adjectives/phrases: "leveraged", "robust", "seamless", "cutting-edge", "powerful".
- Numbers and tech names are specific.
- Lessons Learned is one honest paragraph, not a recap of the Overview.

These rules are reproduced in the new `reference.md` rather than only cross-linked, so the skill's prompt is self-contained and the agent doesn't have to follow a link mid-task.

**Rationale**:

- Two skills writing in two voices into the same content collection would produce visually obvious inconsistency in the rendered site, which violates Constitution VI.
- Duplication (verbatim copy with a `Source:` footnote) is a deliberate trade against drift: when the rules in the source skill change, both files get touched in the same PR. A future refactor can extract a shared rules file if a third writer skill appears.

**Alternatives considered**:

- *Symlink or import the rules file from the other skill*: rejected — Cursor skills aren't designed to compose, and a broken link silently degrades the rules.
- *Loosen the rules and let the model "match the file's existing voice"*: rejected — when the file's existing voice is mediocre, the optimization can't improve it without latitude to deviate; explicit anti-patterns give that latitude in the right direction.

---

## R8. How does the skill handle historical projects (FR-007)?

**Decision**: For each target project, compare its `period.end` against the resume's role timeline:

- If `period.end == 'present'` OR `period.end` falls within the date range of the resume's *most recent* role → write from the *current* career stage.
- Otherwise → find the resume role whose date range contains `period.end` and write from *that* role's career stage. If no role contains the date, fall back to the role active immediately before `period.end`.

**Rationale**:

- The user *was* a different engineer when they shipped a 2018 side project. Writing that project's "Lessons Learned" with the voice of today's staff engineer would be inauthentic and slightly dishonest.
- Anchoring to `period.end` (not `period.start`) reflects the wisdom captured at the close of the project, not the naïveté at its start. Lessons Learned in particular is a retrospective section, so end-date is the right anchor.
- The fallback (immediately-prior role) handles gap years, sabbaticals, and parental leave gracefully without requiring the resume to be gap-free.

**Alternatives considered**:

- *Always write from current stage*: rejected — produces overclaiming on old projects (FR-007 explicitly forbids this).
- *Anchor to `period.start`*: rejected — claims insight the user didn't yet have when they began the project.
- *Ask the user for the stage per old project*: rejected — defeats the batch UX; the resume already encodes the answer.

---

## R9. How does the skill parse and rewrite the body?

**Decision**: Parse the body into an ordered list of heading-bounded sections. A *section* is `^##\s+<title>\s*$` plus everything until the next `## ` heading or end-of-file. The skill rewrites the *prose* of every section while preserving:

- The exact heading line (text and whitespace).
- The order of sections in the file.
- Every embedded non-prose construct inside the section: image references (`![alt](url)`), hyperlinks (`[text](url)`), fenced code blocks (` ``` ` ... ` ``` `), tables (`|`-delimited), inline HTML (`<details>`, `<picture>`, etc.), and explicit line breaks (`<br>`, two-trailing-spaces).

If the conventional `## Highlights` or `## Lessons Learned` headings are absent, the skill *appends* them after `## Overview` (or at end of body if no `## Overview`), and logs `created_sections: [<heading>...]` in the per-project status.

**Rationale**:

- A heading-bounded parse is the only way to safely rewrite "everything" without destroying section identity: the skill knows which prose belongs to which heading and can rewrite it in place.
- Preserving non-prose constructs verbatim is non-negotiable. A rewritten image reference is a broken image; a rewritten code fence is a code injection; a rewritten link is a broken hyperlink. The skill must treat these as opaque tokens.
- "Create-on-absence" for the conventional headings keeps the skill useful for older entries that never had a Lessons Learned section, without guessing where the user wanted it.
- Rewriting all sections (not just the conventional three) is what the user explicitly asked for; FR-004 mandates it. R11 addresses how this interacts with confidentiality and with the schema's length limits on `title` / `description` / `role`.

**Alternatives considered**:

- *Rewrite the whole body as one string*: rejected — would lose section ordering, risk merging two adjacent sections under one heading, and make embedded-construct preservation almost impossible.
- *Only rewrite the three conventional sections, leave others untouched*: rejected — the user explicitly asked for "everything"; leaving custom sections (`## Demo`, `## Architecture`, `## Credits`) un-optimized would produce visibly inconsistent voice within a single project.
- *Fuzzy heading matching for the conventional sections*: rejected — irrelevant under the new scope, since *every* heading is rewritten in place; we no longer need to identify "the" Highlights section.

---

## R10. How does batch mode behave?

**Decision**: Reuse the proven sequential-with-per-item-status pattern from `add-project-from-repo`:

- Enumerate projects via `Glob` over `src/content/projects/**/*.md`.
- Show the plan once (count + categories) and ask for confirmation before starting.
- Process projects sequentially. Never parallel.
- Per-project status: `✓ optimized`, `↷ skipped` (with reason: e.g., uncommitted changes, user declined), `✗ failed` (with reason: e.g., schema-invalid output, missing front matter).
- One failure never aborts the batch.
- After the last project, run `npm run build` once to confirm the whole content collection still validates, then print a final summary `<n> optimized, <m> skipped, <k> failed` with one line per project.

**Rationale**:

- The pattern already exists, is documented, and the user has muscle memory for it.
- Sequential processing keeps the diff-and-confirm UX coherent — interleaved diffs from parallel runs would be unreadable.
- One end-of-batch `npm run build` (instead of per-file) is the same trade `add-project-from-repo` makes, and for the same reason: the schema is per-file, but build is per-collection, so per-file build is wasteful and doesn't catch anything per-file validation misses.

**Alternatives considered**:

- *Parallel optimization with a final consolidated diff*: rejected — interleaved confirmations are unworkable; the user can't reason about a 20-project diff at once.
- *Per-file `npm run build`*: rejected — quadratic cost, no extra signal over per-file schema validation.

---

## R11. What's narrative (rewriteable) vs. what's a fact (preserved)?

**Decision**: Two sets, exhaustively enumerated:

| Rewriteable (narrative) | Preserved (fact / identity / configuration) |
|---|---|
| `title` (front matter, ≤80 chars) | `slug` (URL identity; pinned by tests) |
| `description` (front matter, ≤240 chars) | `period.start`, `period.end` (historical facts) |
| `role` (front matter, ≤80 chars) | `techStack` (historical facts) |
| Every body section: `## Overview`, `## Highlights`, `## Lessons Learned`, and any custom section | `thumbnail` (asset path) |
| | `screenshots[]` (asset paths) |
| | `links.source`, `links.live`, `links.caseStudy` (URLs) |
| | `featured` (owner-controlled site config) |
| | `order` (owner-controlled site config) |
| | `draft` (owner-controlled workflow state) |

Inside rewriteable body sections, the following embedded constructs are themselves preserved verbatim (only the surrounding prose is rewriteable):

- Image references: `![alt](path)`
- Hyperlinks: `[text](url)`
- Fenced code blocks: `` ```lang ... ``` ``
- Tables (any line containing `|`-delimited cells)
- Inline HTML tags
- Explicit line breaks (`<br>`, two trailing spaces)

**Rationale**:

- **`slug` is URL identity**, full stop. Changing it on a published portfolio breaks every external bookmark, every internal link, and the existing test fixtures: `tests/e2e/project-detail.spec.ts` and `tests/unit/examples.test.ts` both pin specific slugs (`example-personal`, `example-startup`, `example-corporate`). A "let's rebrand the title and the slug together" feature is appealing in isolation but unacceptable in this codebase. If a user ever wants to rename a slug, that's a separate, manual operation with its own redirect strategy.
- **`period` and `techStack` are historical facts**, not editorial. The rewrite must respect them (FR-006); rewriting them would invite the model to re-date or re-tech a project to fit the resume's narrative, which is exactly the dishonesty FR-006 forbids.
- **Asset paths and URLs aren't editorial**. They point at real files and real external pages. Any "improvement" the model makes is at best a no-op and at worst a 404.
- **`featured`, `order`, and `draft` are site-config knobs the owner controls**. The skill optimizes content; the owner curates *which* content surfaces and where.
- **Embedded image refs / links / code fences / tables / inline HTML inside body prose** are technically text in a `## Overview` section, but they aren't *prose*. Rewriting them would break the rendered page (broken image, broken link, broken code sample). The skill treats them as opaque tokens it copies through verbatim.

**Alternatives considered**:

- *Rewrite the slug to better match a new title*: rejected — silent URL breakage and test-fixture breakage are unacceptable. If the user wants to rebrand, they do it deliberately with a redirect plan.
- *Rewrite `techStack` to use modern equivalents (e.g., "AngularJS" → "Angular")*: rejected — these are historical facts; the project shipped with the tools it shipped with. The narrative can mention "in 2014, AngularJS was the popular choice" if the user wants context, but the fact stays.
- *Rewrite `links` to canonicalize URLs (https, trailing slash, etc.)*: rejected — orthogonal to "optimize against my resume", and any URL-canonicalization should be a separate, deterministic tool that doesn't go through an LLM.
- *Allow `featured` / `order` to be re-sorted by relevance to the current resume*: rejected — interesting but a different feature; would change site configuration, not content.

---

## Summary of decisions

| ID | Topic | Decision |
|---|---|---|
| R1 | PDF parsing | Cursor `Read` tool; no new dep |
| R2 | Career stages | 6 coarse labels: junior/mid/senior/staff/principal/founder |
| R3 | Skill location & invocation | `.cursor/skills/optimize-project-from-resume/`, conversational |
| R4 | Uncommitted-changes guard | per-file `git status --porcelain` |
| R5 | Idempotency | pass-through bias + fixed rubric + diff-and-confirm |
| R6 | Confidentiality (corporate/startup) | strip names from resume signal; allow-list from current file; applies to **every** rewritten segment |
| R7 | Voice consistency | adopt anti-patterns from `add-project-from-repo` verbatim |
| R8 | Historical perspective | anchor career-stage lookup to `period.end` |
| R9 | Body parsing & rewrite | heading-bounded sections; rewrite all sections' prose; preserve embedded constructs verbatim; create-on-absence for conventional headings |
| R10 | Batch mode | sequential, per-item status, end-of-batch `npm run build` |
| R11 | Narrative vs. facts | rewrite `title`/`description`/`role` + every body section's prose; preserve `slug`/`period`/`techStack`/`thumbnail`/`screenshots`/`links`/`featured`/`order`/`draft` and every embedded non-prose construct |

All decisions are locked. No `NEEDS CLARIFICATION` markers remain.
