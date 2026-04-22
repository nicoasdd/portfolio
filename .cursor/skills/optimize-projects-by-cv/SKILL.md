---
name: optimize-projects-by-cv
description: >-
  Re-frames existing portfolio project entries (description, Overview,
  Highlights, Lessons Learned) through the lens of the user's CV — emphasizing
  the competencies, seniority signals, and target role(s) the CV is positioning
  for, without inventing facts. Use when the user provides a CV (PDF, Markdown,
  or pasted text) and asks to optimize, rewrite, tailor, polish, or align their
  portfolio projects, lessons learned, or wording to their career stage / target
  role / job search.
---

# Optimize Projects by CV

Re-frames existing portfolio entries under
`src/content/projects/<category>/<slug>.md` so their tone, emphasis, and
"Lessons Learned" reflect the seniority and target role implied by the user's
CV. **Reframing only — never fabrication.** The skill rewrites prose; it does
not invent metrics, tech, scope, dates, or impact claims.

## What it changes vs. what it leaves alone

| Field / Section            | Editable?      | Notes |
|----------------------------|----------------|-------|
| frontmatter `description`  | yes            | ≤240 chars; one sentence, must stay factually true to the body |
| body `## Overview`         | yes            | Reframe emphasis, not facts |
| body `## Highlights`       | yes            | Reorder, relabel, retighten — never add a highlight unsupported by the existing body or CV |
| body `## Lessons Learned`  | yes            | Rewrite through the seniority lens; may be added if missing and an honest one can be drawn from the existing body |
| `title`, `role`, `period`, `techStack`, `thumbnail`, `screenshots`, `links`, `featured`, `order`, `slug`, `draft` | **no** | Out of scope. If `role` looks wrong vs. the CV, **flag it** in the final report; never silently change it. |

If the user explicitly asks the skill to also touch `role` or reorder
`techStack`, that is a separate, opt-in request — confirm once before doing it.

## Inputs

Confirm with the user before starting:

1. **CV** — required. Accept any of:
   - a path to a `.md`, `.txt`, or `.pdf` file (use `pdftotext` if PDF; if not
     available, ask the user to convert or paste the text)
   - pasted text in the chat
   - the fallback location `.cursor/skills/optimize-projects-by-cv/cv.md`
     if it exists and the user did not specify another source
2. **Scope** — which projects to process. Default: all 3 categories
   (`personal`, `startup`, `corporate`). Allowed alternatives:
   - a single category
   - an explicit list of slugs
3. **Target framing override** (optional) — e.g. *"applying to Staff Backend
   roles"*, *"pivoting from gamedev to fintech"*. If absent, infer from the CV.

Do **not** prompt for credentials, do not commit anything, do not modify
files outside `src/content/projects/`.

## Workflow

Copy this checklist and track progress as you go.

```
- [ ] Phase 1: Read and profile the CV
- [ ] Phase 2: Confirm the career profile with the user
- [ ] Phase 3: List in-scope projects and load each one
- [ ] Phase 4: Per-project rewrite (sequential, one finished before the next)
- [ ] Phase 5: Show batch diff preview and get one approval
- [ ] Phase 6: Write changes
- [ ] Phase 7: Validate with `npm run build` and print final report
```

### Phase 1: Read and profile the CV

Read the CV once. Produce a compact **Career Profile** object — this is the
single source of truth that grounds every per-project rewrite. Hold it in
context for the rest of the run.

```yaml
career_profile:
  current_title: "<verbatim from CV, or 'unstated'>"
  years_experience: <integer or "unstated">
  seniority_band: <one of: junior | mid | senior | staff | principal | lead | founder>
  target_roles:                    # what the CV is positioning for
    - "<e.g. Staff Backend Engineer>"
  primary_competencies:            # 4-7 max, drawn from CV evidence
    - "<e.g. distributed systems>"
    - "<e.g. team leadership>"
  primary_tech:                    # what the CV foregrounds, not everything
    - "<e.g. TypeScript, NestJS, AWS>"
  domain_focus:                    # 1-3
    - "<e.g. fintech, devtools>"
  notable_signals:                 # short bullets, evidence-backed
    - "<e.g. led 6-person team for 18 months>"
    - "<e.g. owns design + delivery, not just implementation>"
  gaps_to_avoid_overclaiming:      # things the CV does NOT show
    - "<e.g. no formal management experience>"
```

For seniority inference, use these signals (in order of weight):
years XP → most recent title → scope language ("led", "designed", "owned",
"mentored") → number of direct reports → cross-functional indicators. If two
signals contradict, prefer the more recent one and note the conflict in
`notable_signals`.

If the CV is too sparse to fill `seniority_band` and `target_roles`
honestly, **stop and ask the user once** — don't guess.

### Phase 2: Confirm the career profile

Show the user the Career Profile (compact form, max 15 lines). Ask one
question:

> Does this match how you want your projects framed? Anything to add, remove,
> or correct before I rewrite?

Apply any corrections to the in-memory profile. Do **not** continue without
acknowledgment.

### Phase 3: List in-scope projects

```bash
ls src/content/projects/personal/ src/content/projects/startup/ src/content/projects/corporate/
```

Filter to the user's chosen scope. Skip files starting with `example-`. Print
the final list of `<category>/<slug>.md` paths so the user sees what's about
to be processed. If the count is large (>15), confirm once before continuing.

### Phase 4: Per-project rewrite

For each project, sequentially, one at a time:

1. **Read the file in full** (frontmatter + body). This is the only source of
   truth for the project's facts.
2. **Map** the project to the Career Profile:
   - Which `primary_competencies` does this project demonstrate?
   - Which `target_roles` does it support?
   - Is there a competency the project demonstrates that is *currently
     under-emphasized* in the wording?
3. **Rewrite the four allowed slots** following the rules in the next section.
4. **Hold the rewrite in memory** (do not write to disk yet). Move to the
   next project.

Process projects sequentially so emphasis decisions stay consistent across the
batch. Never read or write multiple projects in parallel.

#### Slot-by-slot rewrite rules

**Frontmatter `description`** (≤240 chars, single sentence):
- Lead with the most CV-relevant fact already in the file.
- If the existing description is already optimal for this profile, leave it.
- Never introduce a tech name, metric, or scope claim that is not already in
  the body or frontmatter.

**`## Overview`** (2–3 paragraphs):
- Keep first-person voice.
- Reorder paragraphs/sentences so the most CV-aligned aspect leads.
- For senior/staff/principal profiles: lead with **system shape, trade-offs,
  and why** rather than what was built.
- For junior/mid profiles: lead with **what was built and how it works** —
  concrete, verb-first.
- For lead/founder profiles: lead with **scope, ownership, and constraints
  navigated** (cost, time, team).

**`## Highlights`** (3–6 bullets, format `**Label** — concrete fact`):
- Reorder so the top 2 bullets map to the user's top 2 `primary_competencies`.
- Tighten labels so they read as competency tags (e.g.
  `**Hexagonal architecture**` reads as a system-design competency for a Staff
  profile; `**Webhook → LLM → reply pipeline**` reads as integration breadth
  for a mid profile).
- Never add a bullet whose facts are not in the existing body.
- Never delete a bullet whose facts are notable; demote it to position 4+
  instead.

**`## Lessons Learned`** (1 paragraph, optional):
- Match the seniority lens of the Career Profile:

  | Band | Lesson tone |
  |------|-------------|
  | junior / mid | "I learned X about Y" — concrete, tool/technique-level |
  | senior | trade-off observed; what would do differently; second-order effects |
  | staff / principal | systemic insight, organizational/technical leverage, what scales vs. what doesn't |
  | lead / founder | constraint navigation, prioritization, cost/team/time trade-offs |

- If the file currently has no Lessons Learned but an honest one can be drawn
  from the Overview/Highlights, add one. If not, leave the section absent.
- One paragraph, not a bulleted recap of the Overview.

#### Honesty rules (non-negotiable)

- **No new tech names** in any slot. If the CV mentions Kubernetes but the
  project doesn't use it, do not add it.
- **No new metrics, dates, team sizes, user counts, revenue, latencies, or
  uptime claims** unless they are *already* in the project file.
- **No new scope claims** ("led a team", "across 3 regions", "in production
  for 2 years") unless backed by the existing body.
- If you notice a high-value fact in the **CV** (e.g. "served 2M users") that
  is not in the project file but plausibly belongs there, **do not add it**.
  Record it in the per-project flags (Phase 7 report) so the user can decide
  manually.
- If frontmatter `role` clearly conflicts with the CV (e.g. file says
  `"Solo Developer"` but CV says you led a 4-person team on this project),
  **do not change it**. Flag it.

For full prose-voice rules and more rewrite examples, see
[reference.md](reference.md).

### Phase 5: Batch diff preview

Once every in-scope project has a proposed rewrite in memory, present the
changes as a single batch:

- For each project, show only the slots that actually changed, as a unified
  diff (or a clean before/after if diff rendering would be unreadable).
- Group by category. Skip projects where nothing changed and call them out
  separately ("3 projects already aligned, no changes proposed").
- Surface every flagged item from Phase 4 in a separate **Flags** section per
  project (CV facts not added, role mismatches, missing Lessons Learned that
  could not be honestly inferred, etc.).

End with one question:

> Apply all proposed changes? (yes / no / list slugs to skip)

Honor the answer literally. Do not partial-apply without explicit instruction.

### Phase 6: Write changes

For each approved project, write the full markdown file back. Preserve:

- Every frontmatter field except `description` byte-for-byte (same key order,
  same quoting style, same indentation).
- Trailing newline at end of file.
- Any sections in the body that are not Overview/Highlights/Lessons Learned
  (rare, but some entries have extra sections — leave them).

Never partially edit a file with multiple in-place patches across one run; do
the rewrite in one write per project to avoid drift.

### Phase 7: Validate and report

```bash
npm run build
```

If the build fails, identify the offending file from the error output, fix
it, and re-run. Common failure modes:

- `description > 240 chars` — tighten and rewrite that one file
- `description` empty — restore the previous one and flag for the user
- accidental edit to `period` / `techStack` — revert that field to the
  pre-rewrite value (read from `git diff` if needed)

Print a final report:

```
Optimized for: <target_roles, joined>
Career profile band: <seniority_band>

Updated:
  personal/<slug>      [description, overview, highlights, lessons]
  startup/<slug>       [overview, highlights]
  ...
Unchanged (already aligned):
  personal/<slug>
  ...
Flags (manual review):
  personal/<slug>      role says "Solo Developer", CV implies "Tech Lead"
  startup/<slug>       CV mentions "served 2M users" — not added; consider
                       confirming and editing manually
```

Do **not** run `git add`, `git commit`, or `git push`. Leave review to the
user.

## Anti-patterns

- Do **not** start rewriting before Phase 2 (profile confirmation).
- Do **not** rewrite multiple projects in parallel — sequential only.
- Do **not** edit any frontmatter field other than `description`.
- Do **not** add tech, metrics, scope, dates, or claims not already present in
  the project file. The CV provides *framing*, never *facts*.
- Do **not** mention the CV, the seniority band, or the target role in the
  rewritten body. The output should read like the user's own voice, not like
  a tailored cover letter.
- Do **not** commit, stage, or push. The user owns review and version control.
- Do **not** modify `src/content.config.ts` to make a rewrite fit; tighten
  the rewrite instead.
- Do **not** invent a Lessons Learned section just to fill the slot. Leave it
  absent if no honest one can be drawn.

## Voice and style

Match the existing entries — read 2 of them before any rewrite:

- `src/content/projects/personal/wallapop-finder-bot.md`
- `src/content/projects/personal/automate-comments-reply.md`

Conventions to preserve:

- First-person, past or present tense, no marketing language
- Highlights use the form `**Label** — concrete fact` (em-dash, not hyphen)
- Avoid: "leveraged", "robust", "seamless", "cutting-edge", "powerful",
  "best-in-class", "scalable" (when used as filler)
- Tech names are specific (e.g. "NestJS", not "a Node.js framework")
- Numbers stay specific (e.g. "5 results × $0.005", not "low cost")
- Lessons Learned is one honest paragraph, not a recap of the Overview

## Additional resources

- For the Career Profile schema, prose-voice rules per seniority band, and
  before/after rewrite examples, see [reference.md](reference.md).
- For the project frontmatter schema (off-limits to this skill, but useful
  context), see `.cursor/skills/add-project-from-repo/reference.md`.
- Drop your CV at `.cursor/skills/optimize-projects-by-cv/cv.md` for the
  default location, or pass a path / paste text per run.
