# Feature Specification: Template Mode

**Feature Branch**: `003-template-mode`
**Created**: 2026-04-17
**Status**: Draft
**Input**: User description: "I want this repo to be a portfolio template that anyone can use, so I cannot merge to the main branch my own projects. I want my projects on `content/add-projects` deployed from there, but anyone forking the main one can create their own GitHub Pages site. For testing, set an env variable `HIDE_EXAMPLES` defaulting to false; tests run with examples visible so they pass and the examples are used as test fixtures. Add everything needed in the README so anyone can set up their project (create projects, deploy GitHub Page, etc.) and warn — in a Common Issues section — that the examples must not be deleted or the tests will fail."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — A Forker Stands Up Their Own Portfolio in Under 15 Minutes (Priority: P1)

A developer discovers this repository, recognizes it as a high-quality portfolio template, forks it on GitHub, and follows a single, linear "Quick Start" section in the README. Within 15 minutes — without ever opening the source code — they have:

1. A working local dev server displaying the example projects.
2. A GitHub Pages deployment of their fork at `https://<their-username>.github.io/<repo-name>/`.
3. Their first real project added (replacing or appearing alongside the examples) with their own About content.

They never have to delete the example projects to use the template, and the template never silently breaks when they push their first real change.

**Why this priority**: This is the entire reason the repository exists as a template. Without a forker successfully completing this flow, the template has no value. Every other story in this feature is an enabler for this one.

**Independent Test**: Fork the repo on a clean GitHub account, follow only the README's Quick Start section (no other docs, no help from the original author), and reach a deployed personal portfolio at the GitHub Pages URL within 15 minutes — including their own About content and at least one of their own projects added.

**Acceptance Scenarios**:

1. **Given** a developer has just clicked "Use this template" or forked the repo on GitHub, **When** they follow the README's Quick Start section step by step, **Then** they can run the site locally (`npm install && npm run dev`) and see the example projects rendered without errors.
2. **Given** the forker has enabled GitHub Pages and pushed a commit to their `main` branch, **When** the deploy workflow finishes, **Then** their site is reachable at `https://<their-username>.github.io/<repo-name>/` with the example content visible (or hidden, per their choice).
3. **Given** the forker wants their personal portfolio to show only their work, **When** they set `HIDE_EXAMPLES=true` in their deployment environment (or in a workflow input), **Then** the example projects are excluded from the rendered site but remain on disk so tests still pass.
4. **Given** the forker adds their first project Markdown file under `src/content/projects/<category>/<their-slug>.md`, **When** they run `npm run build` locally, **Then** the build succeeds and the new project appears alongside (or instead of, when `HIDE_EXAMPLES=true`) the examples.

---

### User Story 2 — Template Owner Maintains the Template on `main` While Deploying Personal Portfolio from `content/add-projects` (Priority: P1)

The original author of this template wants two things to coexist forever:

- `main` stays a clean, publishable template — example projects only, no personal content, all tests passing.
- The author's actual personal portfolio is deployed from a long-lived `content/add-projects` branch that contains their real projects (and optionally hides the examples).

The author needs a workflow where merging template improvements (fixes, new features, doc updates) into `main` is decoupled from publishing personal projects, and where rebasing/merging `main` into `content/add-projects` is straightforward and conflict-free.

**Why this priority**: Without this separation, the template either becomes contaminated with the author's personal content (defeating the "anyone can fork" purpose) or the author has to choose between maintaining the template and showing their portfolio. Both options are unacceptable.

**Independent Test**: On `main`, no personal project files exist (only `example-personal`, `example-startup`, `example-corporate`); on `content/add-projects`, real projects exist; the deployment configured to deploy from `content/add-projects` shows the real projects (with examples hidden), and the deployment from `main` shows only examples — both live URLs work in parallel.

**Acceptance Scenarios**:

1. **Given** the author is on `main`, **When** they run `npm run build && npm run test && npm run test:e2e`, **Then** all tests pass with example content as the only fixtures (no personal projects exist on `main`).
2. **Given** the author wants to add a real project to their personal portfolio, **When** they switch to `content/add-projects` and add a Markdown file under `src/content/projects/<category>/`, **Then** the file lives only on `content/add-projects` and never appears on `main` (no merge required for the project itself).
3. **Given** template improvements have been merged to `main`, **When** the author rebases or merges `main` into `content/add-projects`, **Then** the merge resolves cleanly with no conflicts on the project content files (because those files don't exist on both branches).
4. **Given** the deployment workflow is configured to publish `content/add-projects` to GitHub Pages, **When** a commit lands on that branch, **Then** the deployed site shows the author's real projects with `HIDE_EXAMPLES=true` applied, and the example projects do not appear in the published site.

---

### User Story 3 — Tests Stay Green Without Anyone Having to Maintain Test Fixtures Separately (Priority: P2)

Anyone running `npm run test` and `npm run test:e2e` — whether the original author, a forker, or CI — gets a green build by default, because the example projects on `main` double as the test fixtures. There is no separate `tests/fixtures/` directory to maintain in lock-step with the schema; the same Markdown files that demonstrate "how to add a project" to forkers are also what the e2e tests assert against.

**Why this priority**: This is the mechanism that lets US1 and US2 coexist. Without it, either tests would need a hand-maintained fixture set (extra cost, drift risk) or removing the examples would break the suite (defeating the point of letting forkers delete them). Including it as P2 (not P1) because the system works without it — it just means a duplicate fixture set, which is a tax we're explicitly choosing to avoid.

**Independent Test**: Clone `main` on a fresh machine, run `npm install && npm run build && npm run test && npm run test:e2e` with no environment variables set; all unit and e2e tests pass against the example project content present in `src/content/projects/`. Then set `HIDE_EXAMPLES=true` and run only the production build — the build succeeds and produces a site with no example projects.

**Acceptance Scenarios**:

1. **Given** the example projects exist under `src/content/projects/{personal,startup,corporate}/example-*.md`, **When** the test suite runs with no env var set (default `HIDE_EXAMPLES=false`), **Then** all unit, e2e, and accessibility tests pass — the example projects supply the data the tests assert against (project counts, slugs, category routing, project detail pages).
2. **Given** `HIDE_EXAMPLES=true` is set in the environment, **When** `npm run build` runs, **Then** the build succeeds and the `dist/` output contains no `/projects/example-*/` pages and no example references on the landing page or category pages.
3. **Given** a forker has accidentally deleted one or more example project files, **When** they run `npm run test:e2e`, **Then** the failing tests produce a clear, actionable error pointing them at the README's Common Issues section that explains why examples must remain on disk.

---

### Edge Cases

- **Forker deletes the example projects to "clean up" the template**: e2e tests fail because expected slugs (`example-personal`, `example-startup`, `example-corporate`) no longer resolve. The README's Common Issues section MUST explain this trap up front and offer the two safe alternatives: (a) keep the examples and use `HIDE_EXAMPLES=true` to hide them in production, or (b) replace each example file in-place with a real project of the same category, keeping the slug pattern matching what the tests expect, then update the test slug references.
- **Forker keeps examples but doesn't set `HIDE_EXAMPLES`**: their deployed site shows the example projects mixed in with their own. This is acceptable (they chose not to set it) but the README MUST surface the env var clearly in the deployment section so it's an informed choice, not an oversight.
- **Author publishes both `main` (template demo) and `content/add-projects` (personal portfolio) from the same repo**: GitHub Pages only allows one publish source per repo, so the author must pick one. The README and deployment docs MUST make the trade-off explicit and document the recommended pattern (publish `content/add-projects`; the template is demoed via a separate "Demo" repo or a fork hosted under a different account).
- **Author rebases `content/add-projects` on top of `main` after a major template change** (e.g., schema migration): if a schema field changes, the author's real project files may need updates. The README MUST mention that breaking schema changes are landed on `main` with a CHANGELOG note and a migration recipe.
- **`HIDE_EXAMPLES` env var not respected by the dev server**: forkers iterating locally may want to hide examples while previewing their own work. The implementation MUST honor the var in `dev`, `build`, AND `preview` contexts so the local experience matches production.
- **Sitemap and `robots.txt` references to example projects when `HIDE_EXAMPLES=true`**: the sitemap MUST not list `/projects/example-*/` URLs when examples are hidden, and the build MUST not 404 if anything internally links to a hidden example.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a build/runtime environment variable `HIDE_EXAMPLES` (boolean; values `true` / `false`; default `false`) that controls whether the seeded example projects appear in the rendered site.
- **FR-002**: When `HIDE_EXAMPLES=true`, the system MUST exclude every project whose slug begins with `example-` (or is otherwise marked as a template example) from: the landing-page project grid, the featured-projects list, every category page, the generated sitemap, and the static page output (no `/projects/example-*/` directories in `dist/`).
- **FR-003**: When `HIDE_EXAMPLES=false` (or unset), the system MUST render the example projects in the same way it renders any other project, with no visual marker distinguishing them from real content.
- **FR-004**: The default test command (`npm run test` and `npm run test:e2e`) MUST run with `HIDE_EXAMPLES=false` so that the example projects supply the fixtures the e2e tests assert against, and the unit tests continue to pass against the real content.config schema.
- **FR-005**: The example projects (`example-personal`, `example-startup`, `example-corporate` plus any About example) MUST remain present on the `main` branch of the template repository so that anyone forking gets a working site out of the box and the test suite has fixtures to run against.
- **FR-006**: The deployment workflow MUST allow an operator to set `HIDE_EXAMPLES=true` (via workflow input, repository variable, or environment variable) so that the deployed site can show only real projects without the operator having to delete files from the repo.
- **FR-007**: The README MUST include a Quick Start section that, in numbered steps, takes a forker from "I just clicked Use this template / Fork" to "my site is live on GitHub Pages with my own About content and at least one project" — without requiring them to read any other documentation.
- **FR-008**: The README MUST include a Common Issues section that explicitly warns: *"Do NOT delete the example projects under `src/content/projects/{personal,startup,corporate}/example-*.md`. They are also used as test fixtures and the test suite will fail if they are missing. To hide them from your published site, set `HIDE_EXAMPLES=true` in your deployment environment."*
- **FR-009**: The README MUST document the dual-branch workflow recommended for the original template author: `main` holds only the template + examples, `content/add-projects` holds the author's real projects (with `HIDE_EXAMPLES=true` set on its deployment), and template improvements flow from `main` → `content/add-projects` via merge or rebase.
- **FR-010**: The README MUST document how to configure GitHub Pages for a forked repository: enabling Pages under repo settings, choosing the correct source, setting `BASE_PATH` and `SITE_URL` (or equivalent) for project-page URLs, and verifying the deployed site.
- **FR-011**: The README MUST document the full content authoring workflow for forkers: how to add a project (link to or expand on existing `templates/project.md` instructions), how to edit the About page (link to or expand on existing About docs), and how to swap the favicon / fonts / theme tokens.
- **FR-012**: The system MUST provide at least one safety net so a forker who accidentally deletes the examples sees a clear, actionable error message at test time (or build time) — not a cryptic stack trace — that points them at the Common Issues section.
- **FR-013**: The build-time content validator MUST continue to enforce the existing schema rules and MUST NOT raise a warning when `HIDE_EXAMPLES=true` causes example projects to be excluded from output (excluded examples are an intended state, not an error).
- **FR-014**: When `HIDE_EXAMPLES=true` causes the only "featured" projects to be example projects, the landing page MUST gracefully fall back to either showing real projects in their place or hiding the featured-projects section entirely — it MUST NOT render an empty grid or a broken layout.
- **FR-015**: The dual-branch deployment guidance MUST acknowledge that GitHub Pages publishes from a single source per repository and MUST recommend a specific, working pattern (e.g., "configure Pages to publish from `content/add-projects` for your personal site; demo the template via the README's hosted demo link or a separate demo repo").

### Key Entities

- **Example project**: A Markdown file under `src/content/projects/<category>/example-<category>.md` whose slug starts with `example-`. Serves a dual purpose: documents the schema for forkers via working examples, and supplies the fixtures the e2e suite asserts against. Lives only on `main`. Hidden from rendered output when `HIDE_EXAMPLES=true`.
- **Template-demo deployment**: The deployment of `main` to a public URL (e.g., the original author's GitHub Pages, a separate demo repo, or a forker's own fork). Shows examples by default. Lets prospective forkers see what they get before forking.
- **Personal-portfolio deployment**: The deployment of `content/add-projects` (or any branch the author chooses) to a public URL. Has `HIDE_EXAMPLES=true` set so only real projects appear. The author's actual portfolio.
- **`HIDE_EXAMPLES` flag**: Boolean environment variable consumed at build time. Source of truth for whether example projects appear in rendered output. Independent of test execution (tests always run with examples visible).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new developer who has never seen this repository can fork it, follow only the README's Quick Start section, and reach a deployed GitHub Pages URL with their own About content and at least one of their own projects — within **15 minutes** end-to-end (excluding deploy queue time).
- **SC-002**: The test suite passes (`npm run test`, `npm run test:e2e`, `npm run lighthouse`) on a clean checkout of `main` with no environment variables set — **100%** green, on every commit, with **zero** hand-maintained test fixtures outside `src/content/`.
- **SC-003**: The test suite continues to pass on a clean checkout of `content/add-projects` with `HIDE_EXAMPLES=true` and the author's real projects present — **100%** green, with the same e2e assertions adapted (or a documented subset skipped) so the author's CI is also green.
- **SC-004**: When `HIDE_EXAMPLES=true` is set during build, the resulting `dist/` directory contains **zero** `/projects/example-*/` pages, the sitemap lists **zero** `example-` URLs, and the rendered HTML contains **no** references to example project slugs anywhere.
- **SC-005**: The README's "Common Issues" section is discoverable from the table of contents (or top of the README) and addresses the "do not delete examples" pitfall **before** any other troubleshooting topic, so a forker hits it before they make the mistake.
- **SC-006**: The dual-branch workflow described in the README requires **zero** manual conflict resolution on project-content files when the author rebases or merges `main` into `content/add-projects` — because no project files are co-modified across the two branches.
- **SC-007**: A forker who keeps the examples and does not set `HIDE_EXAMPLES` still has a perfectly functional, deployable site (their projects mixed with examples) with **zero** broken links and **zero** layout regressions — the "do nothing" path is safe.
- **SC-008**: The README's documentation enables a forker to swap the visible identity of the site (favicon, theme tokens, About content, social links) **without** editing any TypeScript/Astro source files — only config, content, and asset files.

## Assumptions

- The repository owner is comfortable maintaining two long-lived branches (`main` for the template, `content/add-projects` for their personal portfolio) and has a workflow for merging template improvements from `main` into `content/add-projects` periodically.
- Forkers will use GitHub Pages as their hosting platform (Astro static output works on any static host, but the README's Quick Start is opinionated about GitHub Pages because that's the path with the existing deploy workflow). Other hosts are mentioned briefly but not stepped through.
- The `example-personal`, `example-startup`, `example-corporate` slugs are already canonical in the e2e tests (verified in `tests/e2e/navigation.spec.ts`, `tests/e2e/project-detail.spec.ts`, etc.) and renaming them is out of scope. The new template-mode work will preserve these exact slugs.
- The seeded About content (`src/content/about/profile.md` from feature 002) is treated the same way as example projects — kept on `main` as a working example, optionally hidden via the same flag (or a sibling pattern) so a forker who fills in their real About content cleanly replaces the example.
- A "marker" for example content is the slug prefix `example-`. A separate `isExample: true` frontmatter field is considered out of scope for v1 because slug-prefix detection is sufficient and avoids a schema migration; this assumption is recorded so it can be revisited if forkers ever want non-example projects whose slug happens to start with `example-`.
- The `HIDE_EXAMPLES` boolean is the only new environment variable introduced by this feature. No new content fields, no new config files, no new build modes — keeping the surface area minimal so the template stays easy to fork.
- GitHub Pages limits one publish source per repository. The author publishing both `main` (template demo) and `content/add-projects` (personal portfolio) from the same repo is **not** supported by GitHub Pages and is explicitly out of scope; the README will document the recommended workaround (publish `content/add-projects`; link to the public template repo from the README for prospective forkers to see the unmodified template).
