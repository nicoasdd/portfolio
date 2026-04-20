# Quickstart: Template Mode

**Feature**: `003-template-mode`
**Date**: 2026-04-17
**Audience**: anyone validating that the feature works end-to-end (developer doing the implementation, reviewer, or future maintainer).

This is a runnable acceptance walkthrough. Copy each block into a terminal at the repo root and verify the expected output. Each step maps back to a user-story acceptance scenario or a contract clause.

---

## Prerequisites

```bash
nvm use            # Node 20
npm install
npx playwright install --with-deps chromium    # first time only
```

---

## Step 1 — Default flow: examples visible (validates US1 step 1, C1)

```bash
unset HIDE_EXAMPLES
npm run build
```

Expected:
- Build succeeds.
- `ls dist/projects/` shows `example-personal/`, `example-startup/`, `example-corporate/`, plus any real projects.
- `grep -c 'example-' dist/sitemap-*.xml` returns at least 3.

```bash
npm run dev
```

Open `http://localhost:4321/` — you should see the three example projects on the landing grid (and on each `/category/<cat>/` page).

---

## Step 2 — Hidden flow: build with examples filtered out (validates FR-002, SC-004, C2)

```bash
HIDE_EXAMPLES=true npm run build
```

Expected:
- Build succeeds.
- `ls dist/projects/` shows **no** `example-*` directories.
- `grep -c 'example-' dist/sitemap-*.xml` returns `0`.
- `grep -c 'example-' dist/index.html` returns `0`.
- `for cat in personal startup corporate; do grep -c 'example-' dist/category/$cat/index.html; done` returns `0` for each category.

---

## Step 3 — Empty-grid graceful fallback (validates FR-014, C3)

This step verifies the landing page does not break when every featured project is an example (the seeded state on `main`).

```bash
HIDE_EXAMPLES=true npm run build
grep -c 'aria-labelledby="projects"' dist/index.html
```

Expected: `1` (the heading is still there because the fallback renders the first 6 real projects under "Recent projects" — or `0` if there are no real projects, which is acceptable as long as no orphan empty grid renders).

Manually open `dist/index.html` in a browser; verify there is no empty `<ul>` and no orphan heading. Run an axe-core sweep against the built page (already covered by `tests/e2e/a11y.spec.ts`).

---

## Step 4 — Safety net fires when an example is deleted (validates US3 acceptance #3, C5)

```bash
git stash push -- src/content/projects/personal/example-personal.md
npm run test -- tests/unit/examples.test.ts
```

Expected:
- The test fails.
- The failure message contains:
  - `src/content/projects/personal/example-personal.md`, AND
  - the substring `Common Issues` (or a clear pointer to the README anchor).

```bash
npm run build
```

Expected:
- Build succeeds (warning, not error).
- The build log contains `[content-validator]` followed by the missing-file path and a pointer to the README.

Restore the file:

```bash
git stash pop
```

Re-run `npm run test` to confirm the suite is green again.

---

## Step 5 — Add a real project, examples remain (validates US1 step 4)

```bash
cp templates/project.md src/content/projects/personal/my-real-project.md
# Edit the file: set title, description, role, period, techStack, thumbnail
mkdir -p public/projects/my-real-project
# Add a placeholder thumbnail: cp public/projects/example-personal/thumbnail.svg public/projects/my-real-project/thumbnail.svg
# Update my-real-project.md: thumbnail: "/projects/my-real-project/thumbnail.svg"
npm run build
```

Expected:
- Build succeeds.
- `dist/projects/my-real-project/index.html` exists.
- `dist/projects/example-personal/index.html` still exists (examples remain when `HIDE_EXAMPLES` is unset).

```bash
HIDE_EXAMPLES=true npm run build
```

Expected:
- `dist/projects/my-real-project/index.html` exists.
- No `dist/projects/example-*/` directories.
- `dist/index.html` shows the real project, no examples.

Clean up:

```bash
rm src/content/projects/personal/my-real-project.md
rm -rf public/projects/my-real-project
```

---

## Step 6 — Author flow: deploy from `content/add-projects` auto-hides examples (validates US2 acceptance #4, C8)

This step is verified by reading the deploy workflow rather than running it (it requires a real GitHub Actions trigger).

```bash
grep -A2 'HIDE_EXAMPLES' .github/workflows/deploy.yml
```

Expected output (or equivalent):

```yaml
HIDE_EXAMPLES: ${{ github.ref == 'refs/heads/content/add-projects' && 'true' || vars.HIDE_EXAMPLES || 'false' }}
```

```bash
grep -A3 'branches:' .github/workflows/deploy.yml
```

Expected: `branches:` includes both `main` and `content/add-projects`.

To verify in a real environment:
1. Push a no-op commit to `content/add-projects`.
2. Watch the deploy workflow run on GitHub.
3. In the build step's logs, confirm `HIDE_EXAMPLES=true` was passed to `npm run build`.
4. After deploy completes, visit the live site and confirm no example projects are visible.

---

## Step 7 — Default tests stay green (validates US3, SC-002)

```bash
unset HIDE_EXAMPLES
npm run lint
npm run typecheck
npm run test
HIDE_EXAMPLES= npm run build
npm run test:e2e
npm run lighthouse
```

Expected: all six commands succeed, with **zero** modifications to test fixtures or to the example content. The default-flow test pass is the entire mechanism that lets US1 (forkers stand up a site) and US2 (author keeps personal projects on a separate branch) coexist.

---

## Acceptance summary

| Step | Maps to | Pass criterion |
|---|---|---|
| 1 | US1 step 1, C1 | `dist/` contains all three `example-*` paths; sitemap includes them. |
| 2 | FR-002, SC-004, C2 | `dist/` contains zero `example-*` paths; zero references in HTML; sitemap clean. |
| 3 | FR-014, C3 | Landing page renders without empty grids or orphan headings; axe-core passes. |
| 4 | US3 #3, C5 | Test fails with file path + README pointer; build warns but succeeds. |
| 5 | US1 step 4 | New project appears with examples (default) and replaces them (hidden). |
| 6 | US2 #4, C8 | Deploy workflow has the right env-derivation rule. |
| 7 | US3, SC-002 | All test commands pass on a clean checkout, no env tweaks. |

If any step's expected output diverges, the implementation is incomplete — capture the divergence in the PR description and link it back to the relevant FR/SC/C clause.
