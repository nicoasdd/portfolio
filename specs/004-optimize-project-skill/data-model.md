# Data Model: Resume-Aligned Project Optimizer Skill

**Feature**: `004-optimize-project-skill`
**Date**: 2026-04-20

This feature introduces no new persisted data, no new content-schema fields, and no new files committed to the content collections (other than the skill files themselves). The "data model" here is the small set of in-memory concepts the skill prompt operates over.

---

## 1. `Resume`

**Source**: a filesystem path provided by the user, with extension `.md` or `.pdf`.
**Read mechanism**: Cursor's `Read` tool (text in both cases — the tool returns plain text for both `.md` and `.pdf` per the agent's PDF support).
**In-memory shape**: a single plain-text string.

### Required derived signals

The skill extracts three signals from the resume in a single up-front pass and reuses them for every project in the run:

| Signal | Type | Notes |
|---|---|---|
| `current_career_stage` | one of `junior` \| `mid` \| `senior` \| `staff` \| `principal` \| `founder` | Mapped via R2 in [research.md](./research.md). |
| `historical_stages` | list of `{ stage, start: 'YYYY-MM', end: 'YYYY-MM' \| 'present' }` | One entry per discrete role on the resume, ordered most-recent first. Used by R8 for old projects. |
| `vocabulary_themes` | list of free-text phrases (e.g., "platform engineering", "developer tooling", "growth experimentation") | 3–8 phrases. Drives word choice, never substitutes for facts. |

### Validation

- Empty resume (`Read` returns `File is empty.` or near-empty content after PDF extraction) → the skill stops with a clear error, no projects are touched.
- Resume that yields fewer than two `historical_stages` → still proceeds; the skill simply uses `current_career_stage` for every project regardless of `period.end`.

### Lifecycle

- Read once per `OptimizationRun`. Never re-read between projects in a batch.
- Never written to disk by the skill. The skill MUST NOT copy the resume into the repository.

---

## 2. `CareerStage`

**Type**: enum, fixed order:

```text
junior < mid < senior < staff < principal < founder
```

**Used by**: voice rules (verbs, scope register), confidentiality guard (orthogonal), historical-perspective lookup (R8).

### Per-stage rewrite influence

| Stage | Voice cues the rewrite leans into | Voice cues the rewrite avoids |
|---|---|---|
| `junior` | "learned to", "got comfortable with", "built my first…", "shipped X under guidance" | "led", "owned the architecture", "set the technical direction" |
| `mid` | "built", "shipped", "owned the feature", "improved" | "introduced to", "got my first taste of" |
| `senior` | "owned", "led the implementation", "designed", "mentored" | learner verbs; pure delivery verbs without ownership |
| `staff` | "set the technical direction", "rallied <N> teams", "owned the quality bar across…" | individual-feature verbs only |
| `principal` | "shaped the org's stance on…", "established the convention…" | small-scope verbs |
| `founder` | "decided to build…", "found product–market fit on…", "owned product, eng, and growth" | pure-engineering framing without product/business context |

These cues are guidelines for the model, not regex-enforced. The diff-and-confirm gate is the safety net.

---

## 3. `ProjectEntry` *(reference only — no change to existing schema)*

**Source of truth**: `src/content.config.ts`, `projectSchema`. Reproduced here for the skill's own validation step (the ← arrows mark fields the skill rewrites):

```ts
{
  title: string,                    // 1..80              ← REWRITTEN
  description: string,              // 1..240             ← REWRITTEN
  slug?: string,                    // kebab-case         (preserved — URL identity)
  role: string,                     // 1..80              ← REWRITTEN
  period: { start: 'YYYY-MM', end: 'YYYY-MM' | 'present' },   // (preserved — historical fact)
  techStack: string[],              // 1..20, each 1..30  (preserved — historical fact)
  thumbnail: string,                // 1..                (preserved — asset path)
  screenshots: string[],            // 0..10              (preserved — asset paths)
  links: { source?, live?, caseStudy? },   // strict      (preserved — URLs)
  featured: boolean,                // default false      (preserved — owner config)
  order: number,                    // int, >=0           (preserved — owner config)
  draft: boolean,                   // default false      (preserved — owner config)
}
```

**Body conventions** (not enforced by Zod; enforced by this skill):

- Every body section's *prose* is REWRITTEN.
- Every section's *heading line* is preserved verbatim.
- The order of sections in the file is preserved.
- Embedded non-prose constructs inside any section — image refs, hyperlinks, fenced code blocks, tables, inline HTML, explicit line breaks — are preserved verbatim.
- If `## Highlights` or `## Lessons Learned` are absent, they are appended after `## Overview` (or at end of body if no `## Overview`) and reported in `created_sections`.

### What the skill rewrites

| Field / Segment | Rewrite? | Constraints |
|---|---|---|
| Front matter — `title` | YES | ≤80 chars after rewrite (schema gate). Self-tighten if over. |
| Front matter — `description` | YES | ≤240 chars after rewrite (schema gate). Self-tighten if over. |
| Front matter — `role` | YES | ≤80 chars after rewrite (schema gate). MUST stay consistent with the *scope* implied by `period` and `techStack` (FR-006) — i.e., the rewrite changes vocabulary/register, not claimed scope. |
| Body — `## Overview` (prose only) | YES | First-person, technical, specific. Preserve embedded non-prose constructs verbatim. |
| Body — `## Highlights` (prose only) | YES | Markdown bullet list; each bullet uses `**Label** — concrete fact` (R7); each fact must be supportable by the existing project file or `techStack` (FR-006). |
| Body — `## Lessons Learned` (prose only) | YES | One paragraph; first-person; honest retrospective; no recap of Overview (R7). |
| Body — any other section's prose | YES | Same voice rules (R7). Preserve embedded non-prose constructs verbatim. |
| Front matter — `slug` | NO | URL identity. Pinned by `tests/e2e/project-detail.spec.ts` and `tests/unit/examples.test.ts` for example slugs. |
| Front matter — `period` | NO | Historical fact. |
| Front matter — `techStack` | NO | Historical fact. |
| Front matter — `thumbnail`, `screenshots[]` | NO | Asset paths. |
| Front matter — `links.{source,live,caseStudy}` | NO | URLs. |
| Front matter — `featured`, `order`, `draft` | NO | Owner-controlled site configuration. |
| Section heading lines (`## ...`) | NO | Byte-for-byte preserved. |
| Section ordering | NO | Byte-for-byte preserved. |
| Embedded `![](...)`, `[](...)`, ` ``` ` blocks, tables, inline HTML | NO | Byte-for-byte preserved. |
| Front-matter block delimiters (`---`), key indentation, key ordering | NO | Byte-for-byte preserved. |
| Trailing newline / surrounding whitespace | NO | Byte-for-byte preserved. |

---

## 4. `OptimizationRun`

**Lifecycle**: one user invocation of the skill.

```text
{
  resume_path: string,                          // user-provided
  resume: Resume,                                // from §1
  guidance: string | null,                       // optional, US3
  mode: 'single' | 'batch',
  targets: string[],                             // 1..N project file paths
  results: PerProjectResult[]
}

PerProjectResult = {
  path: string,
  status: 'optimized' | 'skipped' | 'failed',
  reason?: string,                               // present for skipped/failed
  diff_summary?: {
    added: number,
    removed: number,
    front_matter_fields_changed: ('title' | 'description' | 'role')[],
    body_sections_rewritten: string[],           // e.g. ['Overview', 'Highlights', 'Lessons Learned', 'Demo']
  },
  confidential_terms_blocked?: string[],         // empty for personal/; populated for corporate/, startup/
  created_sections?: ('Highlights' | 'Lessons Learned')[],   // R9
  self_tightened_fields?: ('title' | 'description' | 'role')[],   // fields the skill had to re-tighten to fit schema limits
}
```

### Mode resolution

- User invokes the skill with a single project path or slug → `mode = 'single'`, `targets.length === 1`.
- User invokes the skill without naming a project → `mode = 'batch'`, `targets = glob('src/content/projects/**/*.md')`.
- An optional exclusion list (US2 acceptance #4) is applied to `targets` after the glob and before the confirmation prompt.

### Final summary

After all `targets` are processed, the skill prints (per R10):

```text
<N> optimized, <M> skipped, <K> failed
  ✓ src/content/projects/personal/foo.md       (-5/+7 lines)
  ↷ src/content/projects/personal/bar.md       skipped: uncommitted changes
  ✗ src/content/projects/startup/baz.md        failed: rewritten description exceeds 240 chars (schema)
```

---

## 5. `ConfidentialityContext`

**Derived per-project**, used only for `corporate/` and `startup/` targets. For `personal/` targets, this object is `null` and the corresponding guards are no-ops.

```text
{
  category: 'corporate' | 'startup',
  existing_names: string[],          // proper nouns already present in the project body or front matter
  forbidden_sources: ['resume'],     // names from the resume MUST NOT appear in the rewritten body
}
```

### Construction

`existing_names` is the union of:

1. Capitalized tokens (length ≥ 2, not at sentence start) appearing in the current project's body — every section, including any custom sections.
2. Capitalized tokens in the project's front matter (`title`, `description`, `role`), except inside `techStack` (technologies are not "names" for this guard).

`existing_names` is *additive only* — it never removes anything; it only constrains what new tokens can appear in any rewritten segment.

### Enforcement

The constraint enters the skill's prompt as a hard rule:

> For this rewrite, the only proper nouns you may use anywhere — in the title, in the description, in the role, or in any body section — are: `<existing_names>` and the entries already in `techStack`. Do not introduce any other proper noun. If you want to refer to a specific company, customer, or product whose name appears in the resume but not in this list, use a generic descriptor instead.

If any rewritten segment (front-matter `title`/`description`/`role` or any body section), on inspection, contains a proper noun outside the allow-list, the skill flags it in `PerProjectResult.confidential_terms_blocked` and either (a) re-prompts to remove it, or (b) marks the project as `failed: confidentiality guard tripped` if the second pass still fails. No write happens.

---

## 6. State transitions

There is no per-entity state machine. The only "state transition" is per project, per run:

```text
   read project file
        │
        ▼
  uncommitted changes? ── yes ──▶ status = skipped (reason: uncommitted)
        │ no
        ▼
  build prompt (resume signals + project text + confidentiality context)
        │
        ▼
  generate rewritten { title, description, role, every body section's prose }
        │
        ▼
  splice into original file (preserving facts, asset paths, links,
                             owner config, headings, ordering, embedded
                             non-prose constructs — all byte-for-byte)
        │
        ▼
  Zod schema validation ─── length-limit fail ──▶ self-tighten the offending field, retry once
                            │ retry pass                       │ retry fail
                            │                                  ▼
                            │                          status = failed (reason: schema)
                            ▼
  confidentiality guard ────── fail ──▶ status = failed (reason: confidentiality)
        │ pass
        ▼
  show diff to user ─── declined ──▶ status = skipped (reason: declined)
        │ confirmed
        ▼
  write file → status = optimized
```

No persisted state between runs. No migrations. No backward-compatibility shims required.
