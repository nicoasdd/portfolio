# Phase 0 Research: Blueprint Portfolio Redesign

This document resolves every unknown flagged in the spec Assumptions and plan Technical Context. Each section follows the `Decision / Rationale / Alternatives considered` format. After this phase there are **zero** `NEEDS CLARIFICATION` items remaining.

---

## 1. Light-theme palette

**Decision**: Introduce a second theme called `light` with the following token bindings:

| Token | Dark | Light |
|-------|------|-------|
| `--bp-canvas`   | `#0B1326` | `#F2F5FB` |
| `--bp-surface`  | `#0F1A33` | `#FFFFFF` |
| `--bp-text`     | `#E6F0FF` | `#0B1326` |
| `--bp-text-mut` | `#9AB0D6` | `#475569` |
| `--bp-line`     | `#22D3EE` (hairline at 24 % alpha over canvas) | `#0E7490` (hairline at 24 % alpha over canvas) |
| `--bp-accent`   | `#22D3EE` | `#0891B2` |
| `--bp-accent-contrast` | `#0B1326` | `#FFFFFF` |
| `--bp-focus`    | `#22D3EE` | `#0E7490` |
| `--bp-grid`     | `#22D3EE` @ 8 % | `#0E7490` @ 8 % |

**Rationale**: The dark values are taken verbatim from the mockup COLOR SYSTEM legend. Light values are chosen so (a) the blueprint motifs (hairline cyan borders, corner ticks, isometric glyphs) stay legible against a light canvas, and (b) cyan used on *text* meets WCAG AA — pure `#22D3EE` over white fails 4.5:1, so the light theme drops accent to `#0891B2` which measures 4.66:1 over `#FFFFFF` and 4.54:1 over `#F2F5FB`. Accent stays vivid on surfaces (CTAs use `--bp-accent` background with `--bp-accent-contrast` text, which always passes).

**Alternatives considered**:
- **Pure inversion** (`#F2F5FB` text on `#E6F0FF` canvas, cyan unchanged): rejected — blue-on-blue is low contrast and the mockup's "blueprint" feeling comes from the relationship between cyan and a non-cyan canvas.
- **Sepia blueprint** (paper + sanguine): rejected — inconsistent with the cyan accents and would require new illustrations.
- **Skip light theme entirely**: rejected — the toggle is drawn in every reference mockup and spec US5 requires it.

---

## 2. Theme toggle — persistence + flash prevention

**Decision**:
1. Store the user's explicit choice in `localStorage` under the key `bp-theme` with values `"dark" | "light"`.
2. Resolve the effective theme in an **inline `<script>` in `<head>`** *before* any stylesheet paints:
   ```js
   const stored = localStorage.getItem("bp-theme");
   const osDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
   const theme = stored ?? (osDark ? "dark" : "light");
   document.documentElement.dataset.theme = theme;
   ```
3. All theme tokens are defined under `:root[data-theme="dark"] { … }` and `:root[data-theme="light"] { … }` so changing `dataset.theme` swaps every token in one operation.
4. The `ThemeToggle.astro` component's client script only runs after hydration; it updates both `localStorage` and `document.documentElement.dataset.theme`.

**Rationale**:
- The inline-head script is the standard way to prevent a "flash of wrong theme" on static sites; it runs synchronously before paint.
- `data-theme` on `<html>` keeps the implementation CSS-only for 99 % of the page — the JS does nothing except flip one attribute.
- `localStorage` is sufficient because the constitution forbids server-side runtime and there is no user account.

**Alternatives considered**:
- **`class="dark"` on `<html>` + Tailwind `dark:` variant**: rejected — Tailwind 4 supports this, but we need *both* a dark and a light theme with custom tokens, not only a dark override. `data-theme` with explicit token blocks is clearer.
- **Cookie-based with SSR**: rejected — build output is pure static; no SSR available.
- **CSS `color-scheme` + `light-dark()`**: rejected — `light-dark()` is widely supported but would not let us persist an explicit user choice that overrides OS preference.

---

## 3. Tailwind CSS 4 token wiring

**Decision**: Define a single `@theme` block in `src/styles/global.css` containing *static* design primitives (spacing scale, type scale, breakpoints, font families, radius scale) and define *theme-variable* colors as plain CSS custom properties inside `:root[data-theme="dark"]` and `:root[data-theme="light"]`. Wire Tailwind utilities to those custom properties via `@theme` color aliases (e.g. `--color-bp-canvas: var(--bp-canvas)`) so `bg-bp-canvas`, `text-bp-accent`, etc., work as utilities but still flip with the theme attribute.

**Rationale**: Tailwind 4's `@theme` block generates static utilities at build time. Binding those utilities to runtime CSS variables is the supported way to make them theme-aware without duplicating every utility per theme. This keeps the authoring experience Tailwind-idiomatic while preserving the runtime toggle.

**Alternatives considered**:
- **Duplicate Tailwind utility sets per theme**: rejected — bloats CSS output and doubles the maintenance surface.
- **Drop Tailwind, hand-write CSS**: rejected — the project already depends on Tailwind 4; removing it is disproportionate.

---

## 4. Isometric illustration delivery

**Decision**: Hand-author three inline SVG components at `public/blueprint/hero-*.svg` and render them through a small `IsoIllustration.astro` wrapper that inlines the SVG source (so they can use the current theme's `currentColor` and `--bp-*` variables). Each illustration composes geometric primitives present in the mockups: cube, cloud, cylinder-stack, shield, spinner, and a labeled JSON snippet.

**Rationale**:
- Inline SVG enables `currentColor` + CSS variable inheritance → illustrations automatically flip with theme.
- Hand-authored = no dependency on an illustration CDN or icon library (constitutional: no new runtime deps).
- SVG compresses to well under 10 KB per illustration, keeping LCP targets (SC-006) comfortably in reach.

**Alternatives considered**:
- **Icon library (Lucide, Tabler, Heroicons)**: rejected — none match the isometric blueprint aesthetic shown in the mockups.
- **Raster exports (PNG/WebP)**: rejected — they don't respond to theme, and raster breaks the "blueprint line-art" feel.
- **Lottie/JSON animation**: rejected — adds a runtime dependency and fights the reduced-motion requirement (FR-037).

---

## 5. Architecture diagram strip (per project)

**Decision**: Each project that opts into a featured-card architecture strip supplies a short, ordered list of **nodes** (label + icon key) in frontmatter. A single `ArchitectureStrip.astro` component renders the nodes as boxed blueprint glyphs connected by hairline arrows. Icon keys resolve to the SVG set used by `IconChip.astro` (a fixed vocabulary: `users`, `api`, `db`, `cache`, `queue`, `server`, `web`, `messaging`, `blockchain`, `cloud`). Projects that do not supply this list simply omit the diagram — the featured card hides the strip (per spec edge case).

**Rationale**: Parametric rendering from frontmatter satisfies the Content-Driven Architecture principle. A fixed icon vocabulary keeps the SVG bundle small (< 5 KB gzipped) and ensures every project's diagram shares the same visual language. Full free-form per-project SVG would break consistency and increase content authoring overhead.

**Alternatives considered**:
- **One bespoke SVG per project** (authored by hand): rejected — too expensive and inconsistent; also stored as external files which hurts content-collection validation.
- **Mermaid render at build time**: rejected — Mermaid output does not match the blueprint aesthetic; customization would require a themed renderer.

---

## 6. Sparkline glyph on compact featured cards

**Decision**: Render a small **static** SVG polyline (40 × 12 px) next to the single-metric line. The polyline points are fixed per card and encoded as a compact `points="..."` string inside `SparklineGlyph.astro`; the component takes a `trend: "up" | "down" | "flat"` prop to select one of three preset point sequences. No data binding, no animation.

**Rationale**: The mockup shows a sparkline but the metric is a single headline number, not a series. A purely decorative three-preset glyph delivers the visual signal without pretending to plot data. It also costs zero runtime and respects `prefers-reduced-motion` trivially (nothing animates).

**Alternatives considered**:
- **Live data-driven sparkline**: rejected — no time-series data exists in the content model, and fabricating one would be misleading.
- **Animated line draw**: rejected — fails reduced-motion by default and adds complexity for zero payoff.

---

## 7. Content-schema extensions (additive only)

**Decision**: Extend `src/content.config.ts` in a **strictly additive** way:

- **`projectSchema`** — add optional `highlightMetric`, `metrics` (array of 3 tiles), `narrative` (object with optional `challenge`, `built`, `impact` bullet arrays), and `architecture` (array of node objects). When absent, every feature that depends on them simply hides that block. No existing `.md` file needs to change.
- **`aboutSchema`** — add optional `availability` pill array (renamed internally to `availabilityPills` to not collide with the existing scalar `availability`, which is kept for backward compatibility and rendered only if `availabilityPills` is absent), `values` array (Craft / Performance / Accessibility / Pragmatism style cards), `process` array of exactly 5 steps, and `contact` object pinning email/github/linkedin aliases. Existing `email`, `socialLinks`, `skills`, `intro` continue to work when new fields are absent.
- **NEW `site` collection** — single-entry collection at `src/content/site/` providing `credibilityStrip` (6 items), `systemsStrip` (4 groups of {title, description, icons[]}), and an optional `heroPrimaryCtaHref` override.

All new fields are `.optional()` so every existing content file validates unchanged.

**Rationale**: Honors FR-041 "no existing content altered", Content-Driven Architecture principle, and the spec's Assumption that new About fields go on the existing profile schema. Because the defaults hide affected UI, the redesign ships immediately with only the most-featured projects opting in — a gentle adoption curve.

**Alternatives considered**:
- **Separate sidecar files** (`<slug>.meta.yml`): rejected — splits project data across two sources, harder to validate.
- **JSON config in `src/lib/`**: rejected — violates Content-Driven Architecture (adding/editing a project would require a code change).

---

## 8. Filter-chip implementation on category pages

**Decision**: Render the filter chip row as plain anchor links pointing to `/` (for `All`) and `/category/<slug>/` (for each category), with the active chip styled via current-route detection in `CategoryNav.astro`. No JavaScript is required for filtering — every "filter" is already a distinct route with its own statically rendered page.

**Rationale**: Static-Site Performance principle + zero-JS is the simplest implementation that satisfies FR-020 ("without a full page reload being required for correctness (a link-based implementation is acceptable)"). Chrome caches the SPA feel via prefetch-on-hover (Astro's built-in `<ClientRouter>` is *not* added — plain links are sufficient and avoid the SPA complexity).

**Alternatives considered**:
- **Client-side filter with `display:none`**: rejected — hides content from the router, breaks direct links, and duplicates DOM for no SEO benefit.
- **Astro View Transitions (`<ClientRouter>`)**: deferred — the feature is scoped to visual redesign; transitions can be evaluated as a follow-up once the new chrome is stable.

---

## 9. Accessibility strategy

**Decision**:
- Every decorative SVG (illustrations, architecture glyphs, corner ticks, sparkline) is marked `aria-hidden="true"` and `role="presentation"`.
- Every meaningful icon (status pill icons, contact-row icons, toggle icons) has a visually-hidden label or an `aria-label` on its parent control.
- The theme toggle uses `role="switch"` with `aria-checked` reflecting `dark === true`.
- Focus ring is implemented as `outline: 2px solid var(--bp-focus); outline-offset: 2px; border-radius: 2px;` in the base layer, never removed.
- axe-core scans run in Playwright e2e on Home, About, one Category, one Project detail — in both themes.

**Rationale**: Matches FR-035 through FR-039 and SC-005 without introducing any new a11y tooling beyond what the project already depends on (`@axe-core/playwright`).

**Alternatives considered**:
- **Third-party a11y overlay**: rejected — overlays are anti-patterns and the constitution forbids tracking scripts.

---

## 10. Performance budget

**Decision**:
- **Inline SVGs only** for illustrations (no `<img>`, no raster, no external fetch).
- **System-font fallback first** via `font-family: "Inter", system-ui, …` — self-hosted Inter is NOT added in this feature to avoid increasing the critical-path byte count. If Inter is desired, it can be added in a follow-up with `font-display: swap` and subset files.
- **No client-side router, no hydration islands beyond `ThemeToggle` and `CategoryNav` mobile menu** — both are tiny (`<2 KB` of JS each).
- **Images** — existing project thumbnails/screenshots continue to use Astro's Sharp-backed image pipeline; no changes.

**Rationale**: Matches SC-006 (Lighthouse ≥ 90 mobile) and FR-040 (LCP < 2.5 s mid-tier mobile). Staying with system fonts and inline SVG removes the two most common culprits for a sub-90 performance score on this class of site.

**Alternatives considered**:
- **Self-host Inter v4 (variable font)**: deferred to a follow-up; not part of this feature's scope.
- **Edge image service**: rejected — there is no server; Astro Sharp at build time is sufficient.

---

## 11. Test strategy (what gets covered where)

**Decision**:
- **Unit (Vitest)** — theme resolution helpers (`theme.ts`), site-collection loader (`site.ts`), schema validation of new optional fields (extends existing `content-schema.test.ts`).
- **E2E (Playwright)** — structural checks for each page (hero present, chip row present, author card present, systems strip present), theme toggle persistence across navigation, mobile-menu keyboard operability.
- **A11y (axe-core via Playwright)** — zero critical/serious on Home, About, `/category/personal/`, one project detail — in both themes.
- **Lighthouse CI (`@lhci/cli`)** — performance ≥ 90, accessibility ≥ 95 on Home + About in a built preview.

**Rationale**: Uses only the test harness already in the project. Each spec SC gets exactly one class of test that proves or falsifies it.

---

## 12. Motion and animation

**Decision**:
- No scroll-triggered reveals.
- Card hover: 150 ms ease-out cyan border brightening only; no translate/tilt.
- Theme toggle: no cross-fade; instant attribute swap (spec SC-007 requires < 100 ms and the attribute swap is instant).
- All motion in a `@media (prefers-reduced-motion: no-preference)` block; the `reduce` branch declares no transitions/animations.

**Rationale**: Cleanest possible path to constitution III (performance) and spec FR-037. "Blueprint" styling derives its feel from typography, color, and composition — not motion — so omitting motion costs nothing.

---

## Summary

All 12 unknowns resolved. Zero `NEEDS CLARIFICATION` markers remain. Constitution gates continue to pass post-research. Proceed to Phase 1 design artifacts.
