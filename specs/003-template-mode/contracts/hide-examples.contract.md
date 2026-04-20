# Behavioral Contract: `HIDE_EXAMPLES`

**Feature**: `003-template-mode`
**Type**: Build-time behavioral contract (no API surface)
**Date**: 2026-04-17

This document is the executable specification for what `HIDE_EXAMPLES` does. Each clause maps one-to-one to a test assertion in `tests/unit/projects.test.ts`, `tests/unit/examples.test.ts`, or a CI smoke step. If a behavior is not stated here, it is unspecified — do not rely on it.

---

## C1. Default behavior — `HIDE_EXAMPLES` unset

**Given** the environment variable `HIDE_EXAMPLES` is unset OR set to `''`, `'false'`, `'0'`, `'no'`, or `'off'` (any case),

**When** `astro build` runs,

**Then** the resulting `dist/` directory MUST contain:
- `dist/projects/example-personal/index.html`
- `dist/projects/example-startup/index.html`
- `dist/projects/example-corporate/index.html`

**And** the rendered HTML of `dist/index.html` (landing page) MUST contain at least one reference to a slug starting with `example-` (because at least one example is featured).

**And** the rendered HTML of each `dist/category/{personal,startup,corporate}/index.html` MUST contain a reference to the corresponding example slug.

**And** the generated sitemap (`dist/sitemap-*.xml`) MUST contain three URLs whose path includes `example-`.

---

## C2. Hidden behavior — `HIDE_EXAMPLES=true`

**Given** the environment variable `HIDE_EXAMPLES` is set to `'true'`, `'1'`, `'yes'`, or `'on'` (any case),

**When** `astro build` runs,

**Then** the resulting `dist/` directory MUST NOT contain any rendered HTML page for an example project — concretely, no file matching `dist/projects/example-*/index.html`. (Static assets such as `dist/projects/example-personal/thumbnail.svg` MAY remain — they are copied verbatim from `public/` and may be reused by forkers; what matters is that no navigable page exists.)

**And** the rendered HTML of `dist/index.html` MUST NOT contain any reference to a slug starting with `example-` (no card, no link, no title).

**And** the rendered HTML of each `dist/category/{personal,startup,corporate}/index.html` MUST NOT contain a reference to a slug starting with `example-`.

**And** the generated sitemap (`dist/sitemap-*.xml`) MUST contain zero URLs whose path includes `example-`.

**And** the build MUST succeed (exit code 0) — hiding examples is a normal, non-error state.

---

## C3. Empty-grid graceful fallback

**Given** `HIDE_EXAMPLES=true` AND the only `featured: true` projects in the content collections are example projects (i.e., no real project has `featured: true`),

**When** the landing page renders,

**Then** the page MUST NOT render an empty `<ul>` or an orphan "Featured projects" heading.

**Specifically** the page MUST fall back to one of the following (existing fallback behavior in `src/pages/index.astro` is sufficient):
- Render up to 6 real projects under a "Recent projects" heading, OR
- Hide the projects-grid section entirely if no real projects exist at all.

**And** the page MUST remain WCAG 2.1 AA compliant (no axe-core violations introduced by the empty/fallback state).

---

## C4. Test execution does not depend on `HIDE_EXAMPLES`

**Given** any value of `HIDE_EXAMPLES` (including unset),

**When** `npm run test` (Vitest) runs,

**Then** the unit suite MUST pass — including tests that import `getAllProjects()`, because the unit tests stub or override the env helper rather than relying on the real `process.env`.

**And** when `npm run test:e2e` (Playwright) runs against a build produced with `HIDE_EXAMPLES=false` (or unset), the e2e suite MUST pass.

**And** when `npm run test:e2e` runs against a build produced with `HIDE_EXAMPLES=true`, the existing e2e suite is expected to FAIL — this is documented and acceptable. The author's personal-portfolio CI on `content/add-projects` is responsible for either skipping these specific assertions or rewriting them against the author's real projects. (See README "Running tests on `content/add-projects`" for the recipe.)

---

## C5. Required-fixtures safety net

**Given** any one of the three required example files (`src/content/projects/{personal,startup,corporate}/example-{personal,startup,corporate}.md`) is missing from disk,

**When** `npm run test` runs,

**Then** the test in `tests/unit/examples.test.ts` MUST fail with an error message containing:
- The relative path of the missing file, AND
- A pointer to the README's "Common Issues" section, specifically the "Don't delete the example projects" subsection.

**And** when `npm run build` (or `npm run dev`) runs, the content validator MUST emit a `console.warn` containing the same missing-file path and README pointer. The build itself MUST still succeed (warning, not error) so a forker who has deliberately removed examples is not locked out.

---

## C6. Env-helper coercion

**Given** any string value of `process.env.HIDE_EXAMPLES`,

**When** `hideExamples()` from `src/lib/env.ts` is called,

**Then** the function MUST return:
- `true` for (case-insensitive) `'true'`, `'1'`, `'yes'`, `'on'`,
- `false` for (case-insensitive) `'false'`, `'0'`, `'no'`, `'off'`, `''`, OR `undefined`,
- `false` for any other value, AND emit a `console.warn` once per process naming the unrecognized value.

**And** the function MUST never throw.

---

## C7. About profile is unaffected

**Given** any value of `HIDE_EXAMPLES`,

**When** the build runs,

**Then** `dist/about/index.html` MUST exist with the content of `src/content/about/profile.md`. The flag has no effect on the About page.

---

## C8. Deploy-workflow contract

**Given** the deploy workflow in `.github/workflows/deploy.yml` fires on a push to `refs/heads/main`,

**When** the build step runs,

**Then** `HIDE_EXAMPLES` MUST be set from the repository variable `vars.HIDE_EXAMPLES` (defaulting to `false` if the variable is unset).

---

**Given** the deploy workflow fires on a push to `refs/heads/content/add-projects`,

**When** the build step runs,

**Then** `HIDE_EXAMPLES` MUST be set to `true`, regardless of the value of `vars.HIDE_EXAMPLES`.

---

**Given** a fork has no `content/add-projects` branch,

**When** any push happens,

**Then** the auto-detection rule MUST have no effect (no `content/add-projects` push event ever fires) — the forker's experience is identical to the pre-feature state.
