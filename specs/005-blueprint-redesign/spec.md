# Feature Specification: Blueprint Portfolio Redesign

**Feature Branch**: `005-blueprint-redesign`
**Created**: 2026-04-24
**Status**: Draft
**Input**: User description: "change the style of the portfolio to this one in the images, here is an image of the home, the personal projects and about page. Ensure to keep the images as reference and read all the specifics of spacing, logos, etc."

## Visual References

Three reference mockups are stored in `specs/005-blueprint-redesign/assets/` and are the **source of truth** for every visual decision in this feature:

- `assets/home-blueprint.png` — Home page ("Selected work across personal, startup, and corporate projects.")
- `assets/personal-projects-blueprint.png` — Personal projects listing page ("Personal projects" hero + featured cards with metric panels + architecture strip)
- `assets/about-blueprint.png` — About page ("ABOUT / Nico / Senior Frontend Engineer & Product Builder")

Each mockup is rendered on a blueprint canvas (1440px desktop frame) with a legend, spacing scale, color system, tech-icon key, responsive breakpoint list, typography specimen, and right-side annotation callouts. These side rails are **design documentation** embedded in the mockup — they describe the intended UI system and are NOT themselves UI to ship. The **inside of the 1440px frame** is the actual page UI to implement.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Restyled Home Page Makes Impact Immediately Obvious (Priority: P1)

A recruiter or prospective collaborator lands on the portfolio home page. Within the first screen they understand who the owner is, what categories of work he ships (personal, startup, corporate), and can scan a featured grid that puts traction and tech stack ahead of prose. The page feels like a technical blueprint — confident, precise, and engineered — rather than a generic marketing site.

**Why this priority**: The home page is the dominant entry point for every unknown visitor (direct links, job applications, social bios). A redesign that does not land here does not ship the feature. The blueprint aesthetic is what differentiates the portfolio from templates.

**Independent Test**: Open the home URL with no prior context and verify (a) the hero greeting, headline, subcopy, two CTAs, and isometric illustration are present and laid out as in `home-blueprint.png`; (b) a "What I bring" credibility strip with 6 pill chips appears under the hero; (c) a 3×2 "Featured Projects" grid with numbered cards renders; (d) an author card and footer systems strip appear at the bottom — all using the navy/cyan palette and blueprint styling.

**Acceptance Scenarios**:

1. **Given** a visitor on desktop ≥1440px, **When** they load `/`, **Then** they see a sticky top bar with the `Nico` wordmark on the left, five text nav links (Home, About, Personal, Startup, Corporate) on the right with the current page underlined in cyan, and a light/dark theme toggle.
2. **Given** a visitor on the home page, **When** they scan the hero, **Then** they see the greeting "Hi, I'm Nico 👋" in cyan above a 3-line H1 "Selected work across personal, startup, and corporate projects.", followed by a short subparagraph, a primary cyan CTA "View selected work →" and a secondary outlined CTA "About me".
3. **Given** a visitor scrolls past the hero, **When** the credibility strip comes into view, **Then** they see a pill rail labeled "What I bring" with six icon chips (e.g. Frontend, Full-stack, Architecture, Web3, Fintech, Marketplace systems) on a single row at desktop and wrapping on smaller screens.
4. **Given** a visitor reaches Featured Projects, **When** they look at any card, **Then** they see a 2-digit index (`01`, `02`, …), project title, category tag (CORPORATE / STARTUP / PERSONAL) in cyan caps, a one-sentence outcome line, a small single-metric line with a sparkline glyph, and up to four tech-stack pills — all on a dark navy surface with hairline cyan border and a corner-tick blueprint frame.
5. **Given** a visitor is on mobile (≤767px), **When** they load the home page, **Then** every section stacks to a single column with no horizontal scroll and the sticky top bar collapses nav behind a menu affordance.

---

### User Story 2 - Category Pages Lead With Outcomes, Not Tech Prose (Priority: P1)

A visitor clicks `Personal` (or `Startup` / `Corporate`) in the top nav. They arrive on a listing page whose hero immediately frames the *kind* of work in that category and whose featured cards put big impact metrics before any narrative. The page keeps the blueprint styling of the home page and adds an architecture/system-diagram strip for the top items.

**Why this priority**: Category pages are the second-most-visited surface and carry the deepest proof-of-work content (metrics, architecture, tech stacks). Without restyling them, the visual language would fracture mid-journey.

**Independent Test**: Navigate to `/category/personal`, `/category/startup`, and `/category/corporate` and verify each renders the same hero/filter/featured-card/author-card pattern as `personal-projects-blueprint.png`, differing only by the active filter chip, the category label text, and the project data.

**Acceptance Scenarios**:

1. **Given** a visitor on any category page, **When** the hero renders, **Then** they see a breadcrumb (`Home / <Category>`), an H1 that matches the category (e.g. "Personal projects"), a one-sentence category mission under the H1, and an isometric illustration on the right that includes a framed "Independent Builder" (or analogous) callout card with three bullet points.
2. **Given** a visitor on a category page, **When** they look below the hero, **Then** they see a filter chip row `[All] [Personal] [Startup] [Corporate]` with the active chip filled in cyan and the others outlined.
3. **Given** a visitor on the Personal category page, **When** the top featured card renders, **Then** it occupies full content width and contains: a 2-digit index, project name, tagline, a 3-tile metric panel (e.g. `70K USERS` / `~500 CONCURRENT` / `~2 YEARS`), a short description, a three-column CHALLENGE / BUILT / IMPACT block, a blueprint-style architecture diagram strip underneath, and a tech-stack pill row labeled `TECH STACK`.
4. **Given** a visitor on a category page that has fewer than two featured entries, **When** the Featured section renders, **Then** no empty placeholder is shown and the listing falls back to the standard card grid directly under the hero.
5. **Given** the page fully renders, **When** the visitor scrolls to the bottom, **Then** they see the same author card and systems strip (Cloud Infrastructure, Systems Thinking, Built For Scale, Ownership Mindset) as on the home page, styled identically.

---

### User Story 3 - About Page Establishes Identity and Working Style (Priority: P1)

A recruiter or collaborator reaches `/about`. The page presents identity (name, role, avatar), availability signals (remote, open to collaborations, open to opportunities), three direct contact affordances (email, GitHub, LinkedIn), a two-paragraph bio, a "What I care about" value grid (Craft / Performance / Accessibility / Pragmatism), a "Why work with me" process banner (Understand → Design → Build → Iterate → Deliver), a skills chip row, and an "Elsewhere" links block.

**Why this priority**: About is the trust-closing page for anyone who already liked a project. Keeping it on the old visual language while Home/Category ship the blueprint style would undermine the redesign's credibility.

**Independent Test**: Navigate to `/about` and verify it renders every block shown in `about-blueprint.png` in the documented order, using the navy/cyan palette and the same header/footer chrome as the rest of the site.

**Acceptance Scenarios**:

1. **Given** a visitor on `/about`, **When** the hero renders, **Then** they see an `ABOUT` eyebrow, a giant `Nico` name, the role subtitle `Senior Frontend Engineer & Product Builder` in cyan, three availability pills (`⌂ Remote`, `⌥ Open to new collaborations`, `✦ Open to opportunities`), and three contact lines (email, `github.com/<handle>`, `linkedin.com/in/<handle>`) — with an avatar on the right framed in a blueprint tick-corner box.
2. **Given** a visitor reads the bio block, **When** the "About me" section renders, **Then** they see a section heading and two short paragraphs of prose (no marketing hyperbole), both sourced from a single editable profile document.
3. **Given** a visitor reaches the values grid, **When** "What I care about" renders, **Then** they see four cards (Craft, Performance, Accessibility, Pragmatism), each with an isometric/line icon, a card title, and a two-sentence description — laid out 4-up on desktop, 2-up on tablet, and 1-up on mobile.
4. **Given** a visitor reaches the process banner, **When** "Why work with me" renders, **Then** they see a short commitment paragraph on the left and a five-step horizontal flow `Understand → Design → Build → Iterate → Deliver` on the right with each step glyph outlined in cyan.
5. **Given** a visitor reaches Skills and Elsewhere, **When** those sections render, **Then** Skills shows an icon+label pill for each core skill in a wrapping grid, and Elsewhere shows two wide cards for GitHub and LinkedIn with handle, URL, and external-link arrow.

---

### User Story 4 - Project Detail Pages Inherit the Blueprint Chrome (Priority: P2)

A visitor clicks a featured card and lands on a project detail page. The header, footer, color palette, and section framing match the rest of the redesigned site — no page feels visually orphaned. Project body content (Markdown from content collections) renders inside a dark surface with the same hairline borders, cyan accents, and blueprint corner ticks used everywhere else.

**Why this priority**: Detail pages are only visited *after* the visitor is already engaged, so a day-one lift on these is lower-impact than Home/Category/About — but they still need to match to avoid a jarring break in the visual language once the redesign ships.

**Independent Test**: Open any `/projects/<slug>` URL and verify it reuses the new site header and footer, renders its body prose on the dark blueprint surface with the documented typography scale, and displays project metadata (period, tech stack, links) in the blueprint visual style.

**Acceptance Scenarios**:

1. **Given** any project detail page, **When** it renders, **Then** it uses the new sticky top bar, navy base surface, cyan accents, and blueprint chrome — not the prior light theme.
2. **Given** a project with screenshots, **When** the detail page renders, **Then** each screenshot sits inside a corner-tick blueprint frame matching the style of the hero illustrations elsewhere.
3. **Given** a project page with prose sections (Overview, Highlights, Lessons Learned), **When** it renders, **Then** headings, body copy, code fences, and pill chips all use the new typography scale and color tokens.

---

### User Story 5 - Theme Toggle Offers a Readable Light Mode (Priority: P3)

A visitor uses the sun/moon toggle in the sticky top bar to flip between the default dark blueprint theme and a light blueprint theme. The light theme preserves the blueprint motifs (hairline borders, corner ticks, numbered cards, isometric illustrations, cyan accent) but swaps the navy canvas for a very light blue-gray paper surface so the design stays recognizable. The choice persists across page loads on the same device.

**Why this priority**: The toggle is visible in every reference mockup so shipping without it would break parity with the design, but dark mode is the primary presentation and light mode is a refinement, not the critical-path experience.

**Independent Test**: From any page, click the toggle and verify (a) the canvas, surface, text, and border tokens swap to the light variants while accent cyan and blueprint motifs remain; (b) reloading the page keeps the chosen theme; (c) the toggle icon updates to reflect the current state.

**Acceptance Scenarios**:

1. **Given** a visitor on a fresh device, **When** they first load any page, **Then** the theme follows their OS-level color-scheme preference and the toggle reflects that state.
2. **Given** a visitor toggles the theme, **When** they navigate to another page, **Then** the chosen theme is still active.
3. **Given** a visitor with reduced-motion preference enabled, **When** the theme changes, **Then** no transition animation runs.

---

### Edge Cases

- **Very long project titles** in Featured cards must truncate to two lines with an ellipsis; category tag must never wrap.
- **Missing metrics** on a Featured card (a project has no `users` / `concurrent` / `years` equivalents) must hide the metric panel entirely rather than render empty tiles.
- **Missing avatar** on About must show a monogram placeholder (`N` glyph) inside the same blueprint corner-tick frame.
- **Single-featured category** (only one project marked featured) must render that one card at full width with no "View all" affordance duplication.
- **No featured projects at all** in a category must hide the Featured band entirely and render the default grid directly under the hero.
- **Prefers-reduced-motion** users must see no scroll-triggered reveals, no sparkline path animations, and no hover tilt on cards.
- **Keyboard-only users** must be able to tab through the sticky nav, hero CTAs, filter chips, every featured card (as a single focusable link), and every footer link in a logical order with a visible 2px cyan focus ring.
- **Narrow viewports <320px** (older devices) must still render without horizontal scrollbars; content gracefully stacks and the top bar stays sticky.
- **Slow network / image decode** must show a solid navy placeholder tile for each blueprint illustration before the SVG paints, not a broken-image glyph.

## Requirements *(mandatory)*

### Functional Requirements

#### Global visual system

- **FR-001**: The site MUST use a single cohesive blueprint visual system across Home, Category pages, About, and Project detail pages, with no page falling back to the prior light/purple theme.
- **FR-002**: The system MUST expose two themes — a default dark blueprint theme and a light blueprint theme — and a theme toggle accessible from every page.
- **FR-003**: The dark theme MUST use these named color roles, bound to the exact values shown in the mockups: Navy Base `#0B1326` (page canvas), Surface `#0F1A33` (cards, raised panels), Line/Text `#E6F0FF` (primary text and hairline borders), Accent Cyan `#22D3EE` (primary accent, active nav, CTAs, numbered indices, metric sparklines). The light theme MUST mirror these roles with values chosen to preserve contrast (see Assumptions).
- **FR-004**: Body and display typography MUST be Inter (with a system-sans fallback chain) at the six responsive sizes documented in the reference typography specimen; headings MUST retain the existing tight letter-spacing and weight-700 styling so body prose remains highly legible.
- **FR-005**: The spacing scale MUST be `8, 16, 24, 32, 48, 64, 96` pixels, and every layout gap, padding, and section rhythm MUST snap to this scale.
- **FR-006**: The layout MUST use a 12-column grid with a 1440px maximum content width on desktop, with gutters and margins defined in the spacing scale.
- **FR-007**: The site MUST define four breakpoints — Mobile 320–767px, Tablet 768–1023px, Laptop 1024–1439px, Desktop ≥1440px — and every page MUST render without horizontal scroll at the low end of each.
- **FR-008**: Cards, metric tiles, illustration frames, and avatars MUST use a blueprint frame treatment (hairline cyan border with small L-shaped corner ticks) as shown in the mockups.
- **FR-009**: Featured project cards MUST display a 2-digit zero-padded index (`01`, `02`, …) in monospace cyan in the top-left, reset per listing.
- **FR-010**: Category tags on cards MUST render in cyan uppercase small-caps (`CORPORATE`, `STARTUP`, `PERSONAL`) and MUST NOT use category-colored backgrounds from the prior design.
- **FR-011**: Tech-stack items MUST render as outlined pill chips with the label in the primary text color and a hairline cyan border; no filled background.

#### Sticky header and footer

- **FR-012**: Every page MUST render a sticky top bar containing the `Nico` wordmark on the left, five text nav links on the right (Home, About, Personal, Startup, Corporate), and a theme toggle, with the active page underlined in cyan.
- **FR-013**: On tablet and mobile, the nav links MUST collapse behind a keyboard- and screen-reader-accessible menu control while the wordmark and theme toggle remain visible.
- **FR-014**: Every page MUST render a footer "systems strip" with four labeled groups — Cloud Infrastructure, Systems Thinking, Built For Scale, Open Systems (or the Ownership Mindset variant on category pages) — each with its own icon row and one-line description as shown in the mockups.

#### Home page

- **FR-015**: The home page MUST render, in order: sticky header → hero (greeting + H1 + sub + two CTAs + isometric illustration) → "What I bring" credibility pill strip → "Featured Projects" grid → author card → footer systems strip.
- **FR-016**: The home Featured grid MUST show six project cards in a 3-column layout on desktop, 2 columns on tablet, 1 column on mobile, ordered by the existing `featured` + `order` fields on the content collection.
- **FR-017**: The home hero isometric illustration MUST include at least the following blueprint glyphs visible in `home-blueprint.png`: server/API cube, cloud, shield, database, and a labeled code-response snippet — these may be delivered as a single SVG.
- **FR-018**: The hero primary CTA MUST link to the all-projects or Personal category view (see Assumptions) and the secondary CTA MUST link to `/about`.

#### Category pages

- **FR-019**: Each category page (`/category/personal`, `/category/startup`, `/category/corporate`) MUST render, in order: sticky header → breadcrumb → category hero (H1 + mission sub + isometric illustration with "Independent Builder"-style callout card) → filter chip row → Featured band → standard card grid → author card → footer systems strip.
- **FR-020**: The filter chip row MUST allow navigating between `All`, `Personal`, `Startup`, and `Corporate` without a full page reload being required for correctness (a link-based implementation is acceptable).
- **FR-021**: A project marked `featured: true` on a category page MUST render as a large Featured card with: full-width layout, 3-tile metric panel, three-column CHALLENGE / BUILT / IMPACT block, a blueprint architecture diagram strip, and a labeled `TECH STACK` pill row.
- **FR-022**: Non-featured projects on a category page MUST render in the same compact card style as the home Featured grid.

#### About page

- **FR-023**: The About page MUST render, in order: sticky header → identity hero (`ABOUT` eyebrow + big `Nico` + role subtitle + availability pills + contact lines + framed avatar) → "About me" two-paragraph bio → "What I care about" 4-up value grid → "Why work with me" process banner → Skills chip grid → Elsewhere links block → footer systems strip.
- **FR-024**: The availability pills MUST be data-driven so each pill can be shown, hidden, or re-labeled by editing the existing `src/content/about/profile.md` document without code changes.
- **FR-025**: The contact lines MUST render email, GitHub handle, and LinkedIn handle with their respective monochrome icons and MUST each be individually clickable affordances.
- **FR-026**: The four "What I care about" cards MUST each render an icon, a one-word title, and a 1–3 sentence description, and the set of cards MUST be data-driven from the profile document so labels can be edited without code changes.
- **FR-027**: The "Why work with me" five-step flow MUST render the steps in the fixed order `Understand → Design → Build → Iterate → Deliver` with connecting hairline arrows between each glyph.
- **FR-028**: The Elsewhere block MUST render one card per external profile (GitHub, LinkedIn at minimum), each showing the service name, the full URL, and an external-link affordance.

#### Project detail pages

- **FR-029**: Project detail pages MUST reuse the new sticky top bar, blueprint canvas, typography scale, and footer systems strip.
- **FR-030**: Project body content sourced from Markdown MUST render on the dark surface with readable contrast (WCAG AA for body text) and MUST preserve existing headings, code fences, tables, lists, and inline links byte-for-byte.
- **FR-031**: Screenshot galleries MUST present each image inside the blueprint corner-tick frame treatment.

#### Theme toggle

- **FR-032**: On first visit the site MUST follow the visitor's OS-level `prefers-color-scheme`.
- **FR-033**: A manual toggle in the sticky top bar MUST override the OS preference, and the choice MUST persist across navigations and reloads on the same device.
- **FR-034**: The toggle control MUST be keyboard-operable, reachable by tab order, announce its current state to assistive tech, and show a visible focus ring.

#### Accessibility and performance

- **FR-035**: All interactive elements MUST meet WCAG 2.1 AA contrast in both themes. Text on Navy Base MUST use `#E6F0FF` or brighter; cyan accent MUST only be used on text when the text size is ≥18px or ≥14px bold.
- **FR-036**: Every page MUST be fully keyboard-navigable with a visible 2px cyan focus ring on every focusable element.
- **FR-037**: The site MUST honor `prefers-reduced-motion: reduce` by disabling scroll-reveal animations, sparkline path animations, and hover tilt effects.
- **FR-038**: Blueprint decorative SVGs (isometric illustrations, architecture diagrams, icon glyphs) MUST be marked `aria-hidden` and MUST NOT interfere with screen-reader reading order.
- **FR-039**: Every page MUST retain a "Skip to main content" link that is visible on focus.
- **FR-040**: The redesigned home page MUST achieve Largest Contentful Paint under 2.5s on a simulated mid-tier mobile connection in a production build.

#### Content preservation

- **FR-041**: No existing project content (Markdown bodies, frontmatter, thumbnails, screenshots, links) MUST be altered by this feature. Only presentation changes.
- **FR-042**: No existing content collection schema or slug/URL MUST change as a result of this feature; `/`, `/about`, `/category/<slug>`, and `/projects/<slug>` MUST all continue to resolve.
- **FR-043**: Existing sitemap and canonical URL behavior MUST continue to work unchanged.

### Key Entities

- **Theme Token Set**: Named color, spacing, typography, border, and radius tokens. Two variants (dark, light). Drives every surface.
- **Project Card (compact)**: Used on home Featured grid and category standard grid. Holds: index, category tag, title, outcome line, single metric, up to four tech pills, thumbnail or illustration.
- **Project Card (featured, category-level)**: Used for the top item(s) on a category page. Holds everything in the compact card plus: 3-tile metric panel, CHALLENGE / BUILT / IMPACT block, architecture diagram strip, TECH STACK pill row.
- **Profile Document** (existing `src/content/about/profile.md`, unchanged schema): Identity, role, availability pills, contact links, bio paragraphs, values list, skills list, elsewhere links — all consumed by the About page.
- **Credibility Strip Item** (home-only): Icon + label pair used in the "What I bring" row.
- **Systems Strip Group** (footer): Heading + icon row + one-line description. Four groups per page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can identify the portfolio owner's name, role, and the three work categories within 5 seconds of the home page painting above-the-fold content.
- **SC-002**: On each of Home, `/category/personal`, and `/about`, at least three pieces of outcome-oriented information (role, featured project title, featured metric, or availability pill) are visible without scrolling on a 1440×900 desktop viewport.
- **SC-003**: Every page (Home, each Category, About, any Project detail) renders without horizontal scroll at viewport widths of 320px, 768px, 1024px, and 1440px.
- **SC-004**: Keyboard-only users can reach every link, filter chip, card link, and footer link on every page using only Tab / Shift-Tab, with a visible focus indicator on every step.
- **SC-005**: Automated accessibility audits (axe-core or equivalent) report zero critical or serious issues on Home, `/about`, `/category/personal`, and at least one project detail page, in both themes.
- **SC-006**: The redesigned home page scores ≥90 on Lighthouse Performance and ≥95 on Lighthouse Accessibility in a production build on a simulated mid-tier mobile profile.
- **SC-007**: The theme toggle completes a theme change in under 100ms on a mid-tier laptop and persists the choice across at least one full navigation to a different route and back.
- **SC-008**: Zero pages surface the prior light/purple theme after the redesign ships; a manual audit of every published route confirms navy base, cyan accent, and blueprint framing throughout.
- **SC-009**: 100% of existing published URLs (`/`, `/about`, `/category/personal`, `/category/startup`, `/category/corporate`, every `/projects/<slug>`) continue to resolve with HTTP 200 after the redesign, with no link rot.
- **SC-010**: On mobile (≤767px), the sticky top bar remains visible while scrolling and never overlaps hero copy or CTAs.

## Assumptions

- **Reference fidelity**: The reference mockups are canonical for layout, palette, spacing, typography, and blueprint motifs. The side-rail annotations in each mockup (BLUEPRINT LEGEND, SPACING SYSTEM, COLOR SYSTEM, TECH ICON KEY, RESPONSIVE BREAKPOINTS, TYPOGRAPHY, and the right-side numbered callouts) are **design documentation embedded in the mockup**, not UI chrome — they will NOT ship as side panels on the live site. The 1440px framed inner canvas is what ships.
- **Exact values**: Navy `#0B1326`, Surface `#0F1A33`, Line/Text `#E6F0FF`, Accent Cyan `#22D3EE`. Inter is the single type family. Spacing scale is `8 / 16 / 24 / 32 / 48 / 64 / 96` px. Breakpoints are `320–767 / 768–1023 / 1024–1439 / 1440+`. These are taken directly from the mockup specimens.
- **Light theme values**: Not specified in the mockups. Assumed mapping: canvas `#F2F5FB`, surface `#FFFFFF`, line/text `#0B1326`, accent cyan retained at `#0891B2` for sufficient contrast on light surfaces. These will be finalized in `/speckit.plan` if needed.
- **Primary hero CTA target**: The mockup reads "View selected work". Assumed to link to `/category/personal` (the most visited category in the current site), with the "All" filter preselected. Can be overridden in planning.
- **Scope of pages**: This feature redesigns every existing route — `/`, `/about`, `/category/<slug>`, `/projects/<slug>`, and `/404` — so the visual language is consistent across the entire site.
- **Content is preserved**: All Markdown project entries, their frontmatter, their thumbnails, their screenshots, and `src/content/about/profile.md` remain untouched. If the About page surfaces new fields (availability pills, value cards, process steps), they will be added as optional fields to the existing profile schema rather than introduced as a new collection.
- **Existing framework stack is reused**: Astro 5 + Tailwind CSS 4 + Astro Content Collections + Zod — per the workspace guidelines — with no new runtime dependencies introduced by this redesign.
- **Monogram avatar fallback**: When no `photo` is configured in the profile document, a cyan `N` glyph on surface navy inside the blueprint corner-tick frame is rendered.
- **Illustration assets**: The three main isometric illustrations (home hero, category hero, about hero) will be produced as hand-authored SVGs that compose the icon glyphs defined in the mockup's tech-icon key. No external illustration CDN or raster fallback is assumed.
- **Category count**: Exactly three categories (Personal, Startup, Corporate) are assumed, matching the current content collection layout.
- **Theme persistence storage**: Assumed to be `localStorage` on the visitor's device with a single key; no server-side user account is needed.
