# Quickstart: About Section

**Feature**: `002-about-section`  
**Date**: 2026-04-17

This document is the runnable smoke test for the About section. After implementation (`/speckit.implement`), every step below should succeed end-to-end.

---

## Prerequisites

- Node.js 20 LTS (see `.nvmrc`)
- npm 10+
- Git
- The portfolio site from `001-portfolio-showcase` already builds and runs locally.

---

## 1. Install & verify environment

```bash
nvm use
npm install
npm run typecheck
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
- Visiting `/about/` renders the About page with: profile photo, name, headline, optional location/availability badges, the long-form bio, the skills chip cloud, social links, contact email link, and (if configured) a "Download CV" button.
- The site header now contains an "About" link, marked as `aria-current="page"` when on `/about/`.
- The landing page (`/`) shows a new "About me" teaser block below the project grid, with photo, name, headline, the `intro` text, and a "Read more" link to `/about/`.

---

## 3. Edit the About content (User Story 3)

```bash
# The template is at templates/about.md. The live content file is at src/content/about/profile.md.
$EDITOR src/content/about/profile.md
```

Make a small change — for example:
- Update `headline` to a new title.
- Add a new entry to `skills`.
- Add a new social link.

**Expected**:
- The Astro dev server hot-reloads.
- `/about/` reflects the new value immediately.
- The teaser on `/` reflects updates to `name`, `headline`, `intro`, and `photo` (it does not show skills or socials).

---

## 4. Build & preview production

```bash
npm run build
npm run preview
```

**Expected**:
- `dist/about/index.html` is generated.
- The preview server serves `/about/` identically to dev.
- Build logs include a single line confirming the About entry was validated, e.g. `[content-validator] About profile validated: profile.md (6 skills, 2 social links)`.

---

## 5. Validation: required field missing (FR-006)

```bash
# Temporarily remove the `headline` field from src/content/about/profile.md and rebuild:
npm run build
```

**Expected**: Build fails with a clear error identifying the file (`src/content/about/profile.md`) and the missing field (`headline`).

Restore the `headline` field and rebuild — should succeed.

---

## 6. Validation: missing About file (Edge Case)

```bash
mv src/content/about/profile.md /tmp/profile.md.bak
npm run build
```

**Expected**: Build fails with: `About content is required at src/content/about/profile.md` (or equivalent clear message).

```bash
mv /tmp/profile.md.bak src/content/about/profile.md
npm run build
```

**Expected**: Build succeeds again.

---

## 7. Optional fields gracefully omitted (FR-011)

Edit `src/content/about/profile.md` and:
- Remove (or comment out) `availability`, `location`, `resumeUrl`, and the entire `socialLinks` array.

```bash
npm run build
npm run preview
```

**Expected**:
- `/about/` renders cleanly with no empty placeholders, no "undefined", and no broken sections.
- The "Download CV" button does not appear.
- The location/availability badges do not appear.
- The Social Links section either does not render at all, or renders an empty-state-free block (per the implementation choice — the test asserts no orphan heading is shown).

Restore the optional fields when done.

---

## 8. Run automated quality gates

```bash
npm run test            # Vitest unit tests (includes new about.test.ts)
npm run test:e2e        # Playwright e2e + axe accessibility (includes /about/)
npm run lighthouse      # Lighthouse CI against built site (includes /about/)
```

**Expected**:
- `about.test.ts` schema and helper tests pass.
- `about.spec.ts` e2e flows pass (page renders, contact links work, teaser → /about/ navigation works, header link is `aria-current` on /about/).
- `a11y.spec.ts` finds zero serious/critical violations on `/about/`.
- `responsive.spec.ts` confirms `/about/` renders at 320, 768, 1280 viewports.
- Lighthouse: `/about/` achieves Performance ≥ 90 (mobile), Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.

---

## 9. Acceptance walkthrough (mapped to spec user stories)

| Step | Story | Acceptance Scenario |
|------|-------|---------------------|
| Open any page on the site, click "About" in the header. URL becomes `/about/`. | US1 | AS-1 |
| Confirm name, headline, photo, bio, skills, and at least one contact method are visible above the fold. | US1 | AS-2 |
| Click the email link — `mailto:` opens the system mail client. | US1 | AS-3 |
| Click a social link — opens the external profile in a new tab with `rel="noopener noreferrer"`. | US1 | AS-3 |
| If a resume is configured, click the "Download CV" link — the resume opens/downloads. | US1 | AS-4 |
| Visit `/`, scroll past the project grid, see the About teaser with photo + intro. | US2 | AS-1 |
| Click "Read more" in the teaser — navigates to `/about/`. | US2 | AS-2 |
| Edit `src/content/about/profile.md` (e.g., add a skill), rebuild. | US3 | AS-1, AS-2 |
| Remove a required field, rebuild — see clear validation error. | US3 | AS-3 |
| Resize browser to 320 / 768 / 1280px — `/about/` adapts cleanly at each breakpoint. | All | (Responsive principle) |

---

## 10. Validate success criteria

| SC | How to verify |
|----|---------------|
| SC-001 (≤1 click to About from any page) | "About" link is present in the header on every page (Step 9, row 1). |
| SC-002 (recruiter identifies key info ≤30s) | Manual test: ask a peer to scan `/about/` and recall name, role, key skills, contact method. |
| SC-003 (100% links resolve) | Playwright e2e asserts each `socialLinks[].url`, the `mailto:`, and the resume link respond without error/match expected behavior. |
| SC-004 (1 file edit) | Step 3 above demonstrates this. |
| SC-005 (Lighthouse perf ≥ 90 on /about/) | `npm run lighthouse` enforces this. |
| SC-006 (WCAG 2.1 AA on /about/) | `a11y.spec.ts` runs axe-core on `/about/` with zero serious/critical violations. |
| SC-007 (responsive at 320/768/1280) | `responsive.spec.ts` covers `/about/` at each breakpoint. |
| SC-008 (teaser drives CTR — qualitative) | Manual review confirms teaser is visible, scannable, and the "Read more" link is unambiguous. |
