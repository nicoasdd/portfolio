# Research: Portfolio Showcase Site

**Feature**: Portfolio Showcase Site (`001-portfolio-showcase`)  
**Date**: 2026-04-17  
**Purpose**: Resolve all technology choices and architectural unknowns before design.

---

## R1. Static-Site Framework

**Decision**: Astro 5.x

**Rationale**:
- Ships zero JavaScript by default — directly supports the Static-Site Performance principle.
- First-class Content Collections with Zod schema validation — directly maps to the Content-Driven Architecture principle (FR-004, FR-006, FR-012).
- Native Markdown + frontmatter support, optional MDX if richer content is later needed.
- Built-in image optimization (`astro:assets`) emits responsive WebP/AVIF.
- `getStaticPaths` generates per-project and per-category pages from the content collection — no hand-wired routes.
- Mature GitHub Pages adapter (`@astrojs/sitemap`, `site` + `base` config).

**Alternatives considered**:
- **Next.js (static export)**: Heavier, React-runtime overhead; harder to hit zero-JS pages without extra effort. Rejected.
- **Hugo**: Extremely fast builds and zero-JS, but Go templates are less ergonomic than Astro components and the team toolchain is JS/TS-first. Rejected.
- **Gatsby**: Declining momentum; GraphQL layer is overkill for filesystem Markdown. Rejected.
- **Eleventy**: Excellent and minimal, but lacks built-in typed content collections and image pipeline. Rejected.

---

## R2. Styling Approach

**Decision**: Tailwind CSS 4.x via `@astrojs/tailwind` integration, with design tokens declared in `tailwind.config.ts`.

**Rationale**:
- Utility-first satisfies the Visual Polish & Consistency principle when paired with a strict token system (no ad-hoc colors).
- Purges unused CSS at build → tiny stylesheet → contributes to Lighthouse 90+.
- Excellent responsive primitive (`sm`, `md`, `lg`, `xl`) maps cleanly to the 320/768/1280+ breakpoints required by FR-008.
- Plugin ecosystem (`@tailwindcss/typography` for Markdown body content).

**Alternatives considered**:
- **Vanilla CSS + custom-properties**: Smaller dependency surface but slower to build a polished, consistent UI quickly. Rejected.
- **CSS Modules**: Good locality but no design-token enforcement out of the box. Rejected.
- **UnoCSS**: Similar to Tailwind, smaller, but smaller ecosystem and less proven for accessibility-friendly defaults. Rejected.

---

## R3. Content Modeling & Schema Validation

**Decision**: One Astro Content Collection per category (`personal`, `startup`, `corporate`), each with a shared Zod schema defined in `src/content/config.ts`. Build fails on schema mismatch.

**Rationale**:
- Three collections give us `category` for free at the directory level — no need to repeat `category` in every frontmatter.
- Slugs derived from filename, with explicit `slug` override support for redirects/renames.
- Zod schema covers FR-012 (build-time validation error on missing/invalid required fields).
- Slug collision check implemented in `src/lib/slug.ts` and run as part of `npm run build`.

**Alternatives considered**:
- **Single collection with `category` field in frontmatter**: Simpler in some ways but loses the directory-as-category convention that makes the file tree self-documenting. Rejected.
- **External CMS (Contentful, Sanity, etc.)**: Violates Content-Driven Architecture's "version-controlled alongside source code" requirement. Rejected.

---

## R4. Image Optimization Pipeline

**Decision**: `astro:assets` with `<Image>` and `<Picture>` components; thumbnails generated at build time as WebP and AVIF with multiple `srcset` widths. Original images stored under `public/projects/<slug>/`.

**Rationale**:
- Built into Astro — no extra service or runtime needed.
- Emits modern formats automatically; Lighthouse rewards this.
- Lazy loading by default for off-screen images.

**Alternatives considered**:
- **Manual `sharp` script in CI**: More control but redundant given Astro's built-in pipeline. Rejected.
- **Cloudinary/Imgix**: Adds external dependency and runtime cost; violates "no runtime dependencies". Rejected.

---

## R5. Hosting & Deployment

**Decision**: GitHub Pages with two GitHub Actions workflows:
- `ci.yml` (on PR + push): lint → typecheck → unit tests → build → e2e + axe → Lighthouse CI
- `deploy.yml` (on push to `main`): build → upload artifact → `actions/deploy-pages@v4`

**Rationale**:
- GitHub Pages is mandated by constitution Principle III.
- Splitting CI vs Deploy keeps the deploy job lean and the CI job rich (validation runs on PRs without deploying).
- Lighthouse CI in the validation workflow enforces the 90+ score gate per Principle III.

**Alternatives considered**:
- **Single combined workflow**: Simpler config but couples deploy to validation, increasing deploy time and risk. Rejected.
- **Cloudflare Pages / Netlify**: Better DX in some ways but constitution mandates GitHub Pages. Rejected.

---

## R6. Testing Strategy

**Decision**:
- **Unit**: Vitest for pure helpers (`src/lib/`) and Zod schema round-trip tests using fixture Markdown files.
- **E2E + Accessibility**: Playwright for navigation, project detail, responsive checks (320/768/1280px viewports), and `axe-core/playwright` automated WCAG 2.1 AA scans on key routes (home, category, project detail, 404).
- **Performance**: `@lhci/cli` (Lighthouse CI) with budgets file; runs against the built static site in CI.

**Rationale**:
- Vitest is the canonical fast unit runner for Vite/Astro projects.
- Playwright covers responsive (FR-008, SC-006), accessibility (FR-009, SC-005), and primary user flows (US1, US2) in one tool.
- Lighthouse CI directly enforces SC-003 and SC-004.

**Alternatives considered**:
- **Cypress**: Comparable to Playwright but Playwright has better mobile-viewport emulation and built-in trace viewer. Rejected.
- **WebdriverIO**: More complex setup for the testing surface needed. Rejected.

---

## R7. Accessibility Approach

**Decision**:
- Semantic HTML enforced by component design (BaseLayout uses `<header>`, `<nav>`, `<main>`, `<footer>`).
- Color tokens audited against WCAG AA contrast (4.5:1 body, 3:1 large text) at design time and asserted via `axe-core` in e2e.
- Skip-to-content link in `BaseLayout`.
- All interactive elements are real `<a>` or `<button>` (no role-only divs).
- `prefers-reduced-motion` media query disables non-essential transitions.
- Images include alt text; decorative images use `alt=""`.

**Rationale**: Aligns with constitution Principle V and FR-009. Catching violations in CI prevents regressions.

---

## R8. Performance Budgets

**Decision** (enforced via `lighthouserc.json`):
- Performance ≥ 90 (mobile)
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95
- LCP < 2.5s
- Total bundle < 500 KB (HTML+CSS+JS+fonts) on landing page
- Image weight per project card < 80 KB (responsive srcset will pick smaller variants)

**Rationale**: Maps directly to SC-003 and SC-004; budgets are enforced in CI so regressions block merges.

---

## R9. Project URL & Slug Strategy

**Decision**:
- Project URL: `/projects/<slug>/` (slug from filename, optionally overridden in frontmatter).
- Category URL: `/category/<personal|startup|corporate>/`.
- Slugs are kebab-case ASCII; collisions across categories cause a build error (one global namespace for project URLs).
- 404 page (`src/pages/404.astro`) is generated for unknown URLs (FR-011).

**Rationale**: Flat `/projects/<slug>/` keeps URLs short and stable; category in path would couple URL to category and break links if a project moves between categories.

---

## R10. Markdown Template Distribution

**Decision**: Provide `templates/project.md` at the repo root with the full frontmatter schema documented inline as comments. The README links to it and shows a copy command. Adding a project = `cp templates/project.md src/content/projects/<category>/<slug>.md` then edit.

**Rationale**: Satisfies FR-005 and US3 with zero tooling required — just a copy-paste workflow.

---

## Summary

All technical context items resolved — no `NEEDS CLARIFICATION` markers remain. Ready to proceed to Phase 1 (Design & Contracts).
