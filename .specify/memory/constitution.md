<!--
=== Sync Impact Report ===
- Version change: 0.0.0 (template) → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections:
  - Core Principles (6 principles: Showcase-First Design, Project Categorization,
    Static-Site Performance, Content-Driven Architecture, Responsive & Accessible,
    Visual Polish & Consistency)
  - Technology Stack & Constraints
  - Content Management & Deployment Workflow
  - Governance
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (generic)
  - .specify/templates/spec-template.md ✅ no changes needed (generic)
  - .specify/templates/tasks-template.md ✅ no changes needed (generic)
- Follow-up TODOs: None
===========================
-->

# Portfolio Showcase Site Constitution

## Core Principles

### I. Showcase-First Design

Every design and architectural decision MUST prioritize the visual presentation
and discoverability of projects. The site exists to impress visitors and
communicate competence — layout, navigation, and interactions MUST serve that
goal above all else.

- Hero sections, project cards, and detail pages MUST be the primary focus of
  design effort.
- Navigation MUST allow visitors to reach any project within two clicks from
  the landing page.
- Each project MUST have a dedicated detail view with description, tech stack,
  visuals (screenshots or demos), and links to source/live versions where
  available.

### II. Project Categorization

All projects MUST be organized into three explicit categories: **Personal**,
**Corporate**, and **Startup**. This separation MUST be visible in navigation
and filtering.

- Each category MUST be clearly labeled and visually distinguishable.
- Visitors MUST be able to filter or browse by category.
- Projects MUST include metadata: title, description, category, tech stack,
  date/period, role, and optional links (repo, live demo, case study).
- Corporate and startup projects MUST respect confidentiality — no proprietary
  code or NDA-protected details. Descriptions MUST focus on role, impact, and
  technologies used.

### III. Static-Site Performance

The site MUST be a statically generated site deployed to GitHub Pages.
Performance is non-negotiable — the site itself demonstrates technical
capability.

- Pages MUST achieve a Lighthouse performance score of 90+ on mobile.
- Initial page load MUST complete in under 3 seconds on a 3G connection.
- All assets (images, fonts) MUST be optimized: WebP/AVIF for images, subset
  fonts, lazy loading for off-screen content.
- No server-side runtime dependencies — the build output MUST be purely static
  HTML, CSS, and JS.

### IV. Content-Driven Architecture

Project data MUST be separated from presentation logic. Adding or updating a
project MUST NOT require changes to layout components or page templates.

- Project definitions MUST live in structured data files (Markdown with
  frontmatter, JSON, or YAML) — not hardcoded in components.
- The build system MUST generate pages from these data sources automatically.
- Adding a new project MUST require only creating/editing a content file and
  optionally adding assets.

### V. Responsive & Accessible

The site MUST be fully responsive and meet WCAG 2.1 AA accessibility
standards. This is both a professional obligation and a showcase of front-end
competence.

- Layouts MUST adapt gracefully to mobile (320px), tablet (768px), and desktop
  (1280px+) viewports.
- All interactive elements MUST be keyboard-navigable.
- Images MUST have meaningful alt text.
- Color contrast MUST meet AA ratio (4.5:1 for normal text, 3:1 for large
  text).
- Semantic HTML MUST be used throughout (headings hierarchy, landmarks, ARIA
  where needed).

### VI. Visual Polish & Consistency

The site MUST present a cohesive, professional visual identity. Inconsistent
styling undermines the credibility the portfolio is meant to establish.

- A design token system (colors, spacing, typography) MUST be defined and used
  consistently across all pages.
- Animations and transitions MUST be subtle, purposeful, and respect
  `prefers-reduced-motion`.
- A dark/light theme toggle is RECOMMENDED but not required for v1.
- Typography MUST be legible and hierarchy MUST be clear (headings, body,
  captions).

## Technology Stack & Constraints

- **Framework**: A modern static-site generator or front-end framework with
  static export capability (e.g., Next.js, Astro, Gatsby, Hugo, or similar).
  Final choice deferred to the planning phase.
- **Hosting**: GitHub Pages (enforced by project scope).
- **Styling**: CSS framework or utility-first approach (e.g., Tailwind CSS) —
  final choice deferred to planning.
- **Build**: MUST produce a self-contained static build with no runtime
  server dependencies.
- **CI/CD**: GitHub Actions MUST automate build and deployment on push to the
  main branch.
- **Domain**: Custom domain configuration is OPTIONAL but MUST be supported
  if desired later.
- **Analytics**: Privacy-respecting analytics (e.g., Plausible, Umami) are
  RECOMMENDED but OPTIONAL. No Google Analytics or tracking pixels.

## Content Management & Deployment Workflow

- Project content MUST be version-controlled alongside source code in the same
  repository.
- Content updates MUST follow the same PR/review workflow as code changes.
- Deployment MUST be automated: merge to main triggers build and deploy via
  GitHub Actions.
- The README MUST include instructions for adding a new project to the
  portfolio.
- Image assets MUST be stored in a dedicated directory with clear naming
  conventions (e.g., `public/projects/<slug>/`).

## Governance

This constitution defines the non-negotiable principles for the Portfolio
Showcase Site. All feature specifications, implementation plans, and pull
requests MUST be evaluated against these principles.

- **Amendments**: Any principle change MUST be documented with rationale,
  reflected in a version bump, and propagated to dependent templates.
- **Versioning**: MAJOR for principle removals or redefinitions, MINOR for
  new principles or material expansions, PATCH for wording/clarification fixes.
- **Compliance**: Every PR review SHOULD include a constitution compliance
  check, verifying that new code does not violate core principles.
- **Complexity justification**: Any deviation from simplicity (extra
  frameworks, runtime dependencies, complex build pipelines) MUST be justified
  against the Static-Site Performance and Content-Driven Architecture
  principles.

**Version**: 1.0.0 | **Ratified**: 2026-04-17 | **Last Amended**: 2026-04-17
