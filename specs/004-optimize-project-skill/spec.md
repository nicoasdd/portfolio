# Feature Specification: Resume-Aligned Project Optimizer Skill

**Feature Branch**: `004-optimize-project-skill`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "i want to create an skill that optimize a project, text/wordings/ highligths and lesson learned based on the stage of my carrer on that moment, so i pass the skill my resume in md/pdf and it run for the selected project or each of the current projects and optimize them."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Optimize a single project against my current resume (Priority: P1)

As the portfolio owner, I want to point a skill at one of my existing project entries and at my current resume (Markdown or PDF), so the project's narrative copy — description, highlights, and lessons learned — is rewritten to reflect the seniority, focus areas, and vocabulary of where I am in my career today.

**Why this priority**: This is the core value of the feature and the smallest unit that delivers a tangible improvement. Without it, no other story makes sense. A single optimized project is also the safest way for the user to evaluate the skill's quality before applying it broadly.

**Independent Test**: Provide one project file (e.g. `src/content/projects/personal/example-personal.md`) and a resume file. Run the skill. Verify the project's `description`, `## Highlights`, and `## Lessons Learned` sections have been rewritten to emphasize themes present in the resume (e.g. recent roles, current seniority, dominant technologies), while non-narrative front-matter fields (slug, role, period, techStack, thumbnail, links, featured, order, category) are preserved unchanged.

**Acceptance Scenarios**:

1. **Given** an existing project markdown file and a resume in Markdown format, **When** the user invokes the skill with the project path and the resume path, **Then** the project's `description`, `## Highlights`, and `## Lessons Learned` sections are rewritten to align with the career stage and themes inferred from the resume, and all other front-matter fields and section headings are preserved byte-for-byte.
2. **Given** an existing project markdown file and a resume in PDF format, **When** the user invokes the skill with the project path and the resume path, **Then** the resume PDF is parsed to text and used as input, and the same optimization is applied as for a Markdown resume.
3. **Given** the resume indicates a senior/staff-level career stage, **When** the skill rewrites a project that was originally written from a junior perspective, **Then** the rewritten copy uses scope, ownership, and impact language consistent with senior contributions (e.g. "led", "owned", "mentored") rather than learner language (e.g. "learned", "got introduced to").
4. **Given** the user invokes the skill, **When** the skill produces optimized content, **Then** the user is shown a clear before/after diff and asked to confirm before any file is overwritten.

---

### User Story 2 - Bulk-optimize every current project in one pass (Priority: P2)

As the portfolio owner, when I update my resume after a job change or promotion, I want to refresh every project entry in the portfolio against the new resume in a single invocation, so my whole portfolio reads consistently from my current career stage without me touching each file by hand.

**Why this priority**: This is the obvious extension of P1 and is what makes the skill valuable on a recurring basis. It is lower priority because it depends entirely on P1 working well per project, and it can be deferred behind a "do one to learn it, then run all" workflow.

**Independent Test**: Place at least three project files across categories (`personal`, `startup`, `corporate`) and a resume. Run the skill in "all projects" mode. Verify each project file is processed independently, a single combined diff (or one diff per project) is shown, the user can approve, reject, or skip individual projects, and only approved files are written.

**Acceptance Scenarios**:

1. **Given** the user has multiple project files under `src/content/projects/**/*.md` and a resume file, **When** the user invokes the skill without naming a specific project, **Then** the skill enumerates every project file under `src/content/projects/`, shows the planned batch (count + categories), and asks for confirmation before starting.
2. **Given** the user confirms the batch, **When** the skill runs, **Then** each project is processed sequentially (never in parallel), and a per-project status line is reported (e.g. "✓ optimized", "↷ skipped", "✗ failed: <reason>").
3. **Given** one project fails to be optimized (e.g. malformed front matter), **When** the batch continues, **Then** the failure is reported and the remaining projects are still processed.
4. **Given** the user wants to exclude specific projects, **When** the user passes an exclusion list (project slugs or paths), **Then** those projects are listed as skipped and not modified.

---

### User Story 3 - Tune the optimization with explicit guidance (Priority: P3)

As the portfolio owner, I want to nudge the skill with a short instruction (e.g. "emphasize platform engineering", "tone down startup buzzwords", "target a hiring manager audience"), so I can shape the output without editing the resume itself.

**Why this priority**: This is a quality-of-life improvement that turns the skill from "one-shot generator" into "iterative collaborator". It is lowest priority because P1 + P2 already deliver the headline value, and this can be added later without changing the skill's interface.

**Independent Test**: Run the skill on the same project twice — once without guidance, once with a guidance string ("emphasize platform engineering"). Verify the second run's output measurably shifts terminology and emphasis toward the requested theme, while still respecting the resume-derived career stage.

**Acceptance Scenarios**:

1. **Given** a project, a resume, and an optional guidance string, **When** the skill runs, **Then** the guidance string is treated as an additional steering input layered on top of the resume-derived signals, and the resume always wins on factual claims (e.g. seniority, dates).
2. **Given** the guidance string contradicts the resume (e.g. user asks to claim "led a team" when the resume shows an individual-contributor role), **When** the skill runs, **Then** the skill surfaces the conflict to the user and refuses to fabricate facts.

---

### Edge Cases

- The resume file does not exist or is empty → skill stops with a clear error and does not modify any project.
- The resume PDF cannot be parsed to readable text (scanned image, encrypted) → skill reports the failure, suggests providing a Markdown version, and stops.
- A project file's front matter is missing required fields or fails the existing Zod schema validation → skill reports the offending file, skips it, and continues with the rest.
- A project markdown file is missing one of the target sections (`## Highlights`, `## Lessons Learned`) → skill creates the section in the conventional position rather than rewriting nothing.
- A project markdown file contains additional sections beyond `## Overview`, `## Highlights`, `## Lessons Learned` → those extra sections are preserved verbatim.
- The resume implies a career stage that conflicts with the project's recorded `period` (e.g. resume says "Staff Engineer since 2024" but the project ran in 2018 when the user was a junior) → the optimization respects the project's historical context (writes as the person the user was at the time, not as today's self) while using today's language quality and clarity.
- The user runs the skill on the same project repeatedly → each run is idempotent in spirit (does not progressively drift), and the diff against the previous run is small unless the resume or guidance changed.
- The user has uncommitted changes to a project file → skill warns and refuses to overwrite without explicit confirmation, to avoid clobbering manual edits.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The skill MUST accept a resume file path as input and support both Markdown (`.md`) and PDF (`.pdf`) formats.
- **FR-002**: The skill MUST accept either (a) a single project identifier — a path under `src/content/projects/` or a project slug — or (b) no project identifier, in which case it operates on every project file under `src/content/projects/**/*.md`.
- **FR-003**: The skill MUST extract from the resume the user's current career stage (e.g. junior, mid, senior, staff, principal, founder), recent role themes, and dominant technologies, and use these as the primary steering signals for rewriting.
- **FR-004**: The skill MUST rewrite, for each targeted project, the front-matter `description` field and the body sections titled `## Highlights` and `## Lessons Learned`.
- **FR-005**: The skill MUST preserve, byte-for-byte, all other front-matter fields (including but not limited to `title`, `role`, `period`, `techStack`, `thumbnail`, `links`, `featured`, `order`) and all body sections other than `## Highlights` and `## Lessons Learned` — including any `## Overview` section.
- **FR-006**: The rewritten content MUST remain consistent with the project's existing factual front matter (role, period, techStack) and MUST NOT invent technologies, employers, dates, or outcomes that are not already present in either the project file or the resume.
- **FR-007**: When rewriting a historical project (project `period.end` predates the resume's current role), the skill MUST write the project's narrative from the perspective the user held at that time (informed by the resume's history), not from today's perspective.
- **FR-008**: The skill MUST present a before/after diff to the user for each project and require explicit confirmation before writing any file to disk.
- **FR-009**: When operating on multiple projects, the skill MUST process them sequentially, report a per-project status (success, skipped, failed with reason), and continue past individual failures.
- **FR-010**: The skill MUST validate each rewritten project against the existing project content-collection schema before writing, and refuse to write any file that would fail validation.
- **FR-011**: The skill MUST refuse to overwrite a project file that has uncommitted local changes unless the user explicitly opts in to the overwrite.
- **FR-012**: The skill MUST be idempotent in effect — running it twice in a row on the same project with the same resume MUST NOT produce materially different output on the second run.
- **FR-013**: The skill MUST emit a final summary listing which project files were modified, which were skipped, and which failed, with one line per project.
- **FR-014**: The skill MUST surface, but not silently resolve, any factual conflict between the resume and an optional guidance string provided by the user (e.g. claimed leadership scope vs. resume role).

### Key Entities *(include if feature involves data)*

- **Resume**: The source of truth for the user's current and historical career stage. Provided as a file (Markdown or PDF). Yields signals: current seniority level, recent role focus areas, dominant technology themes, and a coarse career timeline used to date-align historical projects.
- **Project Entry**: An existing portfolio project, represented as a Markdown file under `src/content/projects/<category>/<slug>.md` with structured front matter and conventional body sections (`## Overview`, `## Highlights`, `## Lessons Learned`). The skill's output target.
- **Optimization Run**: A single invocation of the skill against one resume and one or more project entries. Produces a per-project diff, an approval decision, and (on approval) a written file plus a summary record.
- **Career Stage Signal**: The derived characterization of the user at a point in time (e.g. "senior platform engineer, 2024–present"). Used to choose tone, scope language, and emphasis when rewriting.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can optimize a single project from resume in under 2 minutes of wall-clock time from invocation to approved write, on a project file under 200 lines and a resume under 5 pages.
- **SC-002**: A user can refresh the entire portfolio (all projects under `src/content/projects/`) against a new resume in a single invocation in under 10 minutes of wall-clock time for up to 20 projects, including per-project review.
- **SC-003**: 100% of files written by the skill pass the existing project content-collection schema validation on the very next build, with zero new validation errors introduced.
- **SC-004**: In a blind review of optimized vs. original copy, at least 8 out of 10 project entries are judged by the user as "more aligned with my current career stage" without losing factual accuracy.
- **SC-005**: Zero project files are silently overwritten — every write is preceded by a diff and an explicit user confirmation in 100% of runs.
- **SC-006**: Re-running the skill on an already-optimized project with the same resume produces a diff of fewer than 5 changed lines (idempotency check) in at least 9 out of 10 runs.

## Assumptions

- The skill is consumed as a Cursor agent skill, the same surface as the existing `add-project-from-repo` skill, and the user invokes it conversationally inside this repository.
- Project entries follow the existing content-collection conventions: Markdown front matter with the fields shown in `src/content/projects/personal/example-personal.md`, and body sections including `## Highlights` and `## Lessons Learned`.
- The resume is the user's current resume at the time of invocation; if the user wants to target a different stage, they update the resume file or use the optional guidance string from User Story 3.
- PDF resumes are text-based (i.e. produced from a word processor or LaTeX), not scanned images. Scanned PDFs are out of scope and will be reported as a failure with guidance to provide a Markdown version.
- Career-stage labels are coarse-grained (e.g. junior / mid / senior / staff / principal / founder); fine-grained title taxonomies are out of scope for v1.
- The skill writes back into the same project files in place. Producing alternate output paths, branches, or PR drafts is out of scope for v1; git history is the user's safety net (combined with the uncommitted-changes guard in FR-011).
- The skill operates on Markdown content only — it does not touch project thumbnails, screenshots, or any asset under `public/projects/`.
- Existing tests under `tests/unit/` (notably `schema.test.ts` and `projects.test.ts`) continue to pass; the skill must produce files that satisfy the same invariants those tests already enforce.
