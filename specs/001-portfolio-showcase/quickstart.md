# Quickstart: Portfolio Showcase Site

**Feature**: `001-portfolio-showcase`  
**Date**: 2026-04-17

This document is the runnable smoke test for the feature. After implementation (`/speckit.implement`), every step below should succeed end-to-end.

---

## Prerequisites

- Node.js 20 LTS (see `.nvmrc`)
- npm 10+
- Git

---

## 1. Install & verify environment

```bash
nvm use            # picks up .nvmrc
npm install
npm run typecheck  # tsc --noEmit
npm run lint
```

**Expected**: All commands exit 0.

---

## 2. Run the dev server

```bash
npm run dev
```

**Expected**:
- Astro dev server starts at `http://localhost:4321/`.
- Landing page renders with hero, featured projects, and category navigation.
- Visiting `/category/personal/`, `/category/startup/`, `/category/corporate/` lists the projects in each category.
- Visiting `/projects/<slug>/` for any seeded project renders the detail page.

---

## 3. Add a new project (template workflow — User Story 3)

```bash
cp templates/project.md src/content/projects/personal/example-new.md
# edit src/content/projects/personal/example-new.md and fill in all required fields
mkdir -p public/projects/example-new
# add your thumbnail.webp and any screenshots
```

**Expected**:
- Dev server hot-reloads.
- Project "example-new" appears on `/category/personal/` and (if `featured: true`) on the landing page.
- `/projects/example-new/` renders correctly.

**Negative test (FR-012)**:
1. Remove the `title` field from the new project's frontmatter.
2. Run `npm run build`.
3. **Expected**: Build fails with a clear error identifying the file and the missing `title` field.
4. Restore `title` and rebuild — should succeed.

---

## 4. Slug-collision guard

```bash
cp src/content/projects/personal/example-new.md src/content/projects/startup/example-new.md
npm run build
```

**Expected**: Build fails with an error reporting that slug `example-new` is duplicated across two files (lists both paths).

Clean up: `rm src/content/projects/startup/example-new.md`.

---

## 5. Build & preview production

```bash
npm run build
npm run preview
```

**Expected**:
- `dist/` is generated containing `index.html`, `404.html`, `category/<name>/index.html`, `projects/<slug>/index.html`, sitemap.xml, and optimized assets.
- Preview server serves the site identically to dev.

---

## 6. Run automated quality gates

```bash
npm run test            # Vitest unit tests
npm run test:e2e        # Playwright e2e + axe accessibility
npm run lighthouse      # Lighthouse CI against built site
```

**Expected**:
- All unit tests pass.
- All e2e tests pass at viewports 320, 768, 1280.
- Axe finds zero serious/critical violations on home, category, project detail, and 404.
- Lighthouse: Performance ≥ 90 (mobile), Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

---

## 7. Acceptance walkthrough (mapped to spec user stories)

| Step | Story | Acceptance Scenario |
|------|-------|----|
| Visit `/`. See hero, featured projects, category nav. | US1 | AS-1 |
| Click "Startup" in nav. URL becomes `/category/startup/`. Only Startup projects visible. | US1 | AS-2 |
| Click "Personal" from category page. List updates. | US1 | AS-3 |
| Visit a category that has no projects. See empty state. | US1 | AS-4 |
| Click any project card. URL becomes `/projects/<slug>/`. | US2 | AS-1 |
| Verify detail page shows title, description, category badge, tech stack tags, role, period, screenshots. | US2 | AS-2 |
| Open a project with no `links.live`. Confirm no broken "Live demo" link is rendered. | US2 | AS-3 |
| Add new project per Step 3 above. Build & preview. | US3 | AS-1, AS-2 |
| Resize browser to 320px / 768px / 1280px. Confirm layout adapts. | US4 | AS-1, AS-2, AS-3 |
| Push to `main`. Watch GitHub Actions deploy workflow. | US5 | AS-1, AS-2 |

---

## 8. Validate success criteria

| SC | How to verify |
|----|----|
| SC-001 (≤2 clicks to any project) | From `/`, one click reaches a category or featured project; one more reaches a detail page. |
| SC-002 (add project = 1 file) | Step 3 above demonstrates this. |
| SC-003 (load < 3s on 3G) | Lighthouse mobile (Slow 4G throttling proxy) reports LCP < 2.5s. |
| SC-004 (Lighthouse perf ≥ 90) | `npm run lighthouse` enforces this. |
| SC-005 (WCAG 2.1 AA) | Playwright + axe pass with zero violations. |
| SC-006 (responsive at 320/768/1280) | Playwright responsive specs pass. |
| SC-007 (auto deploy on push) | Push to `main` triggers `deploy.yml`; site updates. |
| SC-008 (100% template-conforming files render) | All seeded + `example-new` projects appear on the built site. |
