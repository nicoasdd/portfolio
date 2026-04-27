# Quickstart: Blueprint Portfolio Redesign

How to build, run, and verify the redesigned portfolio after Phase 2 implementation completes. This is the exact sequence a reviewer should follow to confirm every Success Criterion in `spec.md`.

---

## 0. Prerequisites

```bash
nvm use                    # pick up Node 20 from .nvmrc
npm ci                     # install locked deps
```

No new runtime dependencies are introduced by this feature, so `npm ci` should complete cleanly against the existing lockfile after Phase 2 has only touched source code.

---

## 1. Run the dev server

```bash
npm run dev
# → http://127.0.0.1:4321
```

Visit:
- `/` — home with blueprint hero, credibility strip, featured grid, author card.
- `/about/` — identity hero, bio, values grid, process banner, skills, elsewhere.
- `/category/personal/`, `/category/startup/`, `/category/corporate/` — category hero, filter chips, featured card (if any project opted in), grid.
- `/projects/<any-slug>/` — detail page with new chrome.

### Sanity checklist (manual, ~2 min)

- [ ] Every page has the sticky navy header with cyan underline on the active route.
- [ ] Sun/moon toggle flips the whole site. Reload. Theme persists.
- [ ] Close the tab, open in a fresh tab — first paint follows OS preference; no flash of the wrong theme.
- [ ] No horizontal scroll at 320 px, 768 px, 1024 px, 1440 px viewports.
- [ ] Keyboard-only: `Tab` through the home page. Every interactive element shows a cyan 2 px focus ring.

---

## 2. Run unit tests

```bash
npm test
```

Must pass. New coverage includes:
- `tests/unit/theme.test.ts` — theme resolution from `localStorage` / OS preference.
- `tests/unit/content-schema.test.ts` — extended with new optional field cases.
- `tests/unit/site-collection.test.ts` — singleton loader semantics.

---

## 3. Typecheck

```bash
npm run typecheck
```

Must pass. Catches any schema-type drift between `content.config.ts` and consumer components.

---

## 4. Lint and format

```bash
npm run lint
npm run format -- --check
```

Must pass.

---

## 5. Production build

```bash
npm run build
npm run preview
# → http://127.0.0.1:4321
```

The build step runs `content-validator` as part of the Astro integration chain; it will fail the build if a content file violates the schema. Warnings about projects missing `metrics`/`narrative` while `featured: true` are acceptable during rollout.

---

## 6. E2E tests (blueprint chrome + behavior)

```bash
npm run test:e2e
```

Runs the full Playwright suite against the production preview. Key specs introduced by this feature:

- `tests/e2e/home.spec.ts` — asserts hero greeting, H1, both CTAs, credibility strip with 6 chips, featured grid count, author card, systems strip.
- `tests/e2e/about.spec.ts` — asserts identity hero, availability pills, contact lines, bio, values grid (when present), process banner (when present), skills, elsewhere.
- `tests/e2e/category.spec.ts` — asserts breadcrumb, category hero, filter chip row with correct active state on each of the three category URLs, featured card (when present) with metric panel + narrative + architecture + tech stack.
- `tests/e2e/project-detail.spec.ts` — asserts the new chrome is applied; body prose renders.
- `tests/e2e/theme-toggle.spec.ts` — toggle flips tokens, survives a navigation + reload, announces state to assistive tech.
- `tests/e2e/routes.spec.ts` — every URL in `contracts/route-contract.md` returns 200.

---

## 7. Accessibility audit

```bash
npm run test:e2e -- tests/e2e/a11y.spec.ts
```

Runs axe-core against Home, About, `/category/personal/`, and one project detail — in **both themes**. The test must report zero critical or serious violations (`SC-005`).

---

## 8. Lighthouse

```bash
npm run lighthouse
```

Must produce:
- Home: Performance ≥ 90, Accessibility ≥ 95 (SC-006).
- About: Accessibility ≥ 95.

If Performance dips below 90, the most likely culprits are (a) new inline SVG weight — inspect `hero-*.svg` sizes, (b) unintended re-inclusion of a web font, or (c) render-blocking script beyond the inline theme resolver.

---

## 9. Observability during development

The blueprint chrome uses:
- A faint grid background (`--bp-grid`) — confirm it renders as a near-imperceptible cyan grid on dark and cyan grid on light.
- Corner ticks (`CornerFrame.astro`) on every card and image — confirm they scale at every breakpoint without clipping.
- An `<IsoIllustration variant="home|category|about" />` that inherits `currentColor` — flipping the theme should re-tint the illustration instantly with no network fetch.

If a blueprint motif renders incorrectly, open the browser DevTools → Elements, toggle `data-theme` on `<html>`, and confirm CSS variable values live-swap. If they don't, the token is likely hard-coded somewhere — search for hex literals in `src/components/`.

---

## 10. Rollback

Because this feature is delivered on branch `005-blueprint-redesign` and every content change is additive + optional, rollback is a branch revert:

```bash
git switch main
git branch -D 005-blueprint-redesign
# or, if already merged:
git revert <merge-commit>
```

No content data loss: existing Markdown files are untouched by this feature.

---

## 11. Definition of Done (for `/speckit.implement` to mark this shipped)

- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes with new unit coverage.
- [ ] `npm run test:e2e` passes with new e2e coverage.
- [ ] `npm run lighthouse` meets SC-006 targets.
- [ ] Every URL in `contracts/route-contract.md` §1 returns 200 in the production build.
- [ ] A manual audit of `/`, `/about/`, each `/category/*/`, and at least one `/projects/*/` confirms no page falls back to the prior light/purple theme (SC-008).
- [ ] `data-theme` on `<html>` toggles cleanly and persists across navigations (SC-007).
- [ ] Every item in the Sanity checklist above is green.
