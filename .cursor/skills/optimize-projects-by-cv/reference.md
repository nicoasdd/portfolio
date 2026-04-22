# Reference — optimize-projects-by-cv

Detailed reference for the `optimize-projects-by-cv` skill. Read this when
you need the Career Profile schema, seniority-band prose rules, or rewrite
examples.

## Career Profile schema

Built once, in Phase 1. Used as the grounding object for every per-project
rewrite. Do not extend it with fields not listed here without a reason — extra
fields tempt the model to invent connections.

```yaml
career_profile:
  current_title: string                # verbatim from CV; "unstated" if absent
  years_experience: integer | "unstated"
  seniority_band: junior | mid | senior | staff | principal | lead | founder
  target_roles: string[]               # 1-3, drawn from CV summary/objective
  primary_competencies: string[]       # 4-7, evidence-backed
  primary_tech: string[]               # what the CV foregrounds, not exhaustive
  domain_focus: string[]               # 1-3
  notable_signals: string[]            # short, concrete, evidence-backed
  gaps_to_avoid_overclaiming: string[] # things NOT in the CV
```

### How to fill `seniority_band`

Weighted signals, highest weight first. When two conflict, take the most
recent and note both in `notable_signals`.

| Signal | Weight | Notes |
|--------|--------|-------|
| Most recent job title | 4 | "Staff", "Principal", "Lead" override years |
| Years of relevant XP | 3 | <3 → junior, 3–6 → mid, 6–10 → senior, 10+ → staff/principal candidate |
| Scope verbs in recent roles | 3 | "owned", "designed", "led" → senior+; "built", "implemented" → mid; "contributed", "supported" → junior |
| Direct reports / team size | 2 | Any direct reports → lead band candidate |
| Cross-functional indicators | 2 | Mentions of product, design, GTM partnership → staff+ candidate |
| Founder / company-of-one | 2 | Sets `founder` band regardless of years |

If `seniority_band` cannot be determined honestly from the CV, stop and ask
the user. Do not guess.

### How to fill `primary_competencies`

Aim for 4–7. Each must trace back to **at least two** pieces of CV evidence
(a job bullet, a project description, a skills section line, plus another
job/project). Examples of good competencies:

- "distributed systems design"
- "team leadership and mentorship"
- "type-safe API design"
- "incident response and observability"
- "product-engineer collaboration"
- "cost-aware infrastructure"

Bad (too generic): "software engineering", "problem solving", "Agile".

## Prose voice by seniority band

Use this table when rewriting Overview, Highlights, and Lessons Learned.
The point is *emphasis*, not vocabulary. The factual content stays identical.

| Band | Overview leads with | Highlight labels favor | Lessons Learned tone |
|------|---------------------|------------------------|----------------------|
| junior / mid | what was built, how it works, the user-visible behavior | concrete features, integrations, tooling | "I learned X about Y" — tool/technique-level, honest about novelty |
| senior | system shape and the why behind the design choices | architectural patterns, trade-offs, reliability concerns | trade-off observed; what would do differently; second-order effects |
| staff / principal | constraints, scope, and the design space considered | leverage, optionality, decoupling, blast-radius reduction | systemic insight; what scales vs. what doesn't; organizational/technical leverage |
| lead | scope of ownership, team and time constraints | delivery posture, operational scaffolding, cross-cutting concerns | constraint navigation; prioritization; what was deferred and why |
| founder | the problem and the cost/value envelope | minimum viable scope, cost guardrails, customer feedback loops | what mattered vs. what felt like it should matter; cost of being wrong |

## Highlight label heuristics

Same project, different framings (factual content unchanged):

| Underlying fact | Junior / mid label | Senior label | Staff / principal label |
|-----------------|-------------------|--------------|-------------------------|
| Switched between polling and webhook with one env var | **Dual transport** | **Dual transport with single-flag swap** | **Transport decoupled from domain via env-driven adapter** |
| Used Apify for Facebook Marketplace scraping | **Facebook Marketplace integration** | **Cost-budgeted scraping via Apify** | **External-cost surface kept explicit in config** |
| Hexagonal layout with ports/adapters | **Hexagonal architecture** | **Ports-and-adapters keeps marketplaces swappable** | **Domain stays marketplace-agnostic; adapters absorb churn** |
| Webhook → LLM → reply via Graph API | **Webhook → LLM → reply pipeline** | **End-to-end Meta webhook integration with dedupe and self-reply guard** | **Async event pipeline with idempotency and replay safety** |

The fact column is identical across rows. Only the framing shifts.

## Rewrite examples

### Example A — Senior framing

**Before** (existing entry, mid-band-style description):

```yaml
description: "A NestJS-based Telegram bot that surfaces Wallapop and Facebook Marketplace deals on demand, with cost-aware scraping and dual polling/webhook delivery."
```

**After** (re-framed for `seniority_band: senior`, `target_roles: ["Senior Backend Engineer"]`):

```yaml
description: "A NestJS marketplace-aggregation bot built on a ports-and-adapters core, with cost-budgeted scraping and a single-flag swap between Telegram polling and webhook transports."
```

Same facts (NestJS, marketplace aggregation, ports-and-adapters, cost-aware,
polling/webhook). The senior framing leads with system shape ("ports-and-
adapters core") and surfaces the trade-off ("cost-budgeted") instead of the
feature ("surfaces deals on demand").

### Example B — Lessons Learned, mid → staff lens

**Before** (mid-band, tool-level lesson):

> The hard part of an LLM reply bot turned out not to be the LLM — it was the
> boundary work. Verifying the webhook signature, deduplicating self-replies,
> fetching missing media on demand, and surviving Instagram's retry behaviour
> without thrashing the database absorbed far more design effort than choosing
> a model or writing the prompt.

**After** (staff lens — same insight, scaled up):

> The interesting work in an LLM reply bot lives at the boundaries, not at the
> model. Webhook signature handling, self-reply guards, on-demand media
> hydration, and absorbing Instagram's retry semantics drove the design — the
> model swap is a 5-line change, the boundary contract isn't. The lesson
> generalizes: when the model is the cheap part, the architecture has to make
> it cheap to keep replacing it.

The original lesson was already excellent — the staff version adds the
generalization ("the lesson generalizes"). Do not force this kind of
generalization if the underlying observation is too local; leave the original.

### Example C — When NOT to rewrite

**Existing** (mid-band Overview, already aligned with a junior/mid CV):

> A Telegram bot that hunts deals across Wallapop and Facebook Marketplace and
> notifies me directly in chat. Built with NestJS using a clean ports-and-
> adapters architecture so each marketplace integration is swappable, testable
> in isolation, and easy to extend.

If the Career Profile is `seniority_band: mid`, this Overview is already
correctly framed. **Leave it untouched** and report the project as
"unchanged — already aligned".

Forcing changes for the sake of changes is an anti-pattern. The skill should
report a no-op proudly.

## CV ingestion notes

| Source | Approach |
|--------|----------|
| `.md` / `.txt` | Read directly with the file tool. |
| `.pdf` | Try `pdftotext -layout <file> -` first. If the text comes out garbled (multi-column resumes often do), ask the user to paste the text or convert to Markdown. |
| Pasted text | Use as-is. Do not assume structure. |
| `cv.md` fallback | If present and the user did not specify a source, use it. Otherwise, ask. |

Never store, log, or echo the full CV back to the user. When confirming the
Career Profile in Phase 2, show the **profile**, not the source CV.

## What the rewrite must NOT introduce

A short, hard rule list. If a proposed rewrite would introduce any of these,
revise the rewrite — do not ship it.

- A tech name absent from the project file's frontmatter or body
- A metric (number, percentage, latency, count, revenue) absent from the
  project file
- A team size, headcount, direct-report count, or "led X people" claim
- A duration ("for 2 years", "over 18 months") not derivable from the
  existing `period` field
- A user-impact claim ("served N users", "saved $X", "reduced latency by Y%")
  unless the number is already in the file
- A reference to a customer, employer, or company name not already in the
  file
- The phrase "I" doing something the file does not say "I" did (e.g. "I led",
  "I designed", "I owned" added on top of an existing solo-build description
  is fine; "I led a team of N" is not, unless N appears in the file)

When in doubt, omit and flag.

## Edge cases

- **Project file uses different section headings** (e.g. `## What I built`
  instead of `## Overview`). Treat by position: the first prose section maps
  to Overview, bulleted competency-style sections map to Highlights,
  retrospective-style sections map to Lessons Learned. Preserve the original
  heading text.
- **Project file has extra sections** (e.g. `## Demo`, `## Architecture`).
  Leave them untouched.
- **Frontmatter has fields the schema lists as optional** (e.g. `screenshots`,
  `links.live`, `links.caseStudy`). Preserve byte-for-byte.
- **Project is marked `draft: true`**. Process it the same way; the user can
  decide what to publish.
- **Empty or stub Lessons Learned section** (e.g. just a heading and one
  short sentence). Treat as "missing" — replace with an honest one if
  derivable, otherwise remove the section entirely (don't ship a stub).
