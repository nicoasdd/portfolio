# Contract: Routes & URL Invariants

This feature MUST NOT add, remove, rename, or redirect any existing URL. Site navigation structure is stable; only visual presentation and in-page composition change.

---

## 1. Existing routes that MUST continue to resolve (HTTP 200, same slug)

| Route | Source | Notes |
|-------|--------|-------|
| `/` | `src/pages/index.astro` | Home — rewritten internally, same URL |
| `/about/` | `src/pages/about.astro` | About — rewritten internally |
| `/category/personal/` | `src/pages/category/[category].astro` (`getStaticPaths`) | Category listing |
| `/category/startup/` | idem | Category listing |
| `/category/corporate/` | idem | Category listing |
| `/projects/<slug>/` | `src/pages/projects/[slug].astro` | One per project Markdown file; slugs unchanged |
| `/404.html` | `src/pages/404.astro` | Minimal blueprint refresh only |
| `/sitemap-index.xml`, `/sitemap-0.xml` | `@astrojs/sitemap` output | Unchanged |
| `/robots.txt` | `src/pages/robots.txt.ts` | Unchanged |

---

## 2. New routes that this feature introduces

**None.** The blueprint redesign is a zero-new-route feature.

---

## 3. Redirects

**None.** No redirects are created because no URL moves.

---

## 4. Canonical, meta, and sitemap invariants

- `BaseLayout.astro` MUST continue to emit:
  - `<link rel="canonical" href="…">`
  - `<meta property="og:url" …>`
  - `<meta property="og:title" …>` and `og:description`, `og:type`, `og:site_name`
  - Twitter card tags
- The `<meta name="theme-color">` value MUST update to match the active theme:
  - dark: `#0B1326`
  - light: `#F2F5FB`
  - This MAY be swapped by the same inline head script that sets `data-theme`.
- `@astrojs/sitemap` output MUST continue to enumerate every page; the sitemap count MUST not decrease.

---

## 5. Link integrity

- Internal links MUST use `withBase()` from `src/lib/url.ts` (existing helper) to stay correct under the `BASE_PATH` env var.
- The home hero primary CTA target is governed by `site.heroPrimaryCtaHref` (see `data-model.md` §3). Default `/category/personal/` — a route that already resolves.
- The About page contact lines:
  - email → `mailto:<address>`
  - GitHub → `https://github.com/<handle>` (absolute external)
  - LinkedIn → `https://www.linkedin.com/in/<handle>/` (absolute external)
- External links MUST carry `rel="noopener noreferrer"` and `target="_blank"`.

---

## 6. Test obligations

`tests/e2e/routes.spec.ts` (existing) MUST be extended to verify HTTP 200 on every URL in §1 after the redesign build. Playwright base URL remains `http://127.0.0.1:4321` (Astro dev/preview default). See `quickstart.md`.
