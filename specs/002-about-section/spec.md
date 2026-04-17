# Feature Specification: About Section

**Feature Branch**: `002-about-section`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "I want the about section, so potential clients/recruiters can know some about me on top of the projects."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recruiter Discovers Who the Owner Is (Priority: P1)

A recruiter or potential client lands on the portfolio site, browses a few projects, and wants to know who built them. They click an "About" link in the primary navigation and arrive at a dedicated About page that introduces the portfolio owner — name, professional title, a short personal/professional bio, key skills, and ways to get in touch. After ~30 seconds of reading they have a clear sense of who the owner is, what they do, and how to contact them.

**Why this priority**: This is the entire point of the feature. Projects show *what* was built; the About section explains *who* built it and *why* they should be hired or contacted. Without it, the portfolio is anonymous and harder to convert into opportunities.

**Independent Test**: Can be fully tested by clicking the "About" link from any page, confirming the About page loads with bio, skills, and contact information, and confirming all contact links open correctly.

**Acceptance Scenarios**:

1. **Given** a visitor is anywhere on the portfolio site, **When** they click the "About" link in the main navigation, **Then** they are taken to the About page with the owner's introduction visible above the fold.
2. **Given** a visitor is on the About page, **When** the page renders, **Then** they see the owner's name, professional title/headline, a profile photo or avatar, a short bio paragraph, a skills/expertise summary, and at least one contact method.
3. **Given** a visitor wants to contact the owner, **When** they click an email link or social profile link, **Then** the appropriate action is triggered (mail client opens, social profile loads in a new tab).
4. **Given** a recruiter wants the owner's resume, **When** a CV/resume download link is provided, **Then** clicking it downloads or opens the resume document.

---

### User Story 2 - Landing Page Teaser Drives About Discovery (Priority: P2)

A visitor on the landing page sees not only featured projects but also a short "About me" teaser section — a brief intro line, photo, and a "Read more" link to the full About page. This makes it natural to learn about the owner without requiring active navigation.

**Why this priority**: Many visitors will not actively click "About" unless they're curious. A landing-page teaser surfaces the owner's identity passively and increases the likelihood that visitors form a personal connection before leaving.

**Independent Test**: Can be tested by loading the landing page and verifying that an About teaser section is present with the owner's name, headline, photo, and a working link to the full About page.

**Acceptance Scenarios**:

1. **Given** a visitor opens the landing page, **When** they scroll past the hero/featured projects, **Then** they see an "About me" teaser block with the owner's photo, headline, and a short intro.
2. **Given** a visitor is on the landing page, **When** they click the "Read more" link in the About teaser, **Then** they are navigated to the full About page.

---

### User Story 3 - Owner Edits About Content via Markdown (Priority: P2)

The portfolio owner wants to update their bio, add a new skill, or change their contact details. They edit a single Markdown content file (with frontmatter for structured fields and body for the long-form bio). After committing and pushing, the About page rebuilds and shows the updated content — no code or template changes required.

**Why this priority**: Consistency with the existing content-driven architecture (projects are Markdown files). The owner must be able to keep About content fresh without developer involvement, but it serves the owner rather than visitors directly — hence P2.

**Independent Test**: Can be tested by editing the About Markdown file (e.g., updating the bio or adding a skill), rebuilding the site, and confirming the changes appear on the About page.

**Acceptance Scenarios**:

1. **Given** the portfolio owner wants to update their bio, **When** they edit the About Markdown file's body and commit, **Then** the rebuilt site shows the updated bio on the About page.
2. **Given** the owner wants to add a new skill or social link, **When** they update the corresponding frontmatter list field and commit, **Then** the new entry appears on the About page in the correct section.
3. **Given** the About Markdown file is missing a required field (e.g., name or headline), **When** the build runs, **Then** a clear validation error identifies the missing field.

---

### Edge Cases

- What happens if the About content file is missing entirely? The build MUST fail with a clear error, since the About page is a required part of the site navigation.
- How does the page render when optional fields (resume URL, photo, individual social links) are not provided? Each missing optional field MUST be omitted gracefully — no broken links, empty placeholders, or "undefined" text.
- How does the About teaser on the landing page behave if the bio is very long? The teaser MUST show only a truncated intro (single short paragraph or sentence) with a "Read more" link, not the full bio.
- What happens when a visitor accesses the About page via a direct URL (e.g., shared by another recruiter)? The page MUST load standalone without requiring any prior navigation context.
- How does the page handle a missing or broken profile image? A neutral placeholder avatar MUST be shown so the layout remains intact.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST include a dedicated About page accessible via a stable URL (e.g., `/about`).
- **FR-002**: The primary site navigation MUST include an "About" link visible from every page.
- **FR-003**: The About page MUST display the owner's name, professional title/headline, a profile photo, a personal/professional bio, a list of key skills or areas of expertise, and at least one contact method.
- **FR-004**: The About page MUST support optional fields including resume/CV download link, social profile links (e.g., LinkedIn, GitHub, X, personal website), location, and current availability/status.
- **FR-005**: All About content (structured fields + bio body) MUST be defined in a single Markdown file with frontmatter — no hardcoding in components or templates.
- **FR-006**: The build system MUST validate the About Markdown file and produce a clear error when required fields are missing.
- **FR-007**: The landing page MUST include an "About me" teaser section with the owner's photo, headline, short intro, and a link to the full About page.
- **FR-008**: All contact and social links MUST be interactive — email links MUST open the visitor's mail client, and external profile links MUST open in a new tab with appropriate `rel` attributes for security.
- **FR-009**: The About page MUST be fully responsive across mobile (320px), tablet (768px), and desktop (1280px+) viewports, consistent with the rest of the site.
- **FR-010**: The About page MUST meet WCAG 2.1 AA accessibility standards — meaningful alt text for the profile photo, semantic headings, keyboard-navigable links, and proper contrast ratios.
- **FR-011**: Optional fields that are not provided MUST be gracefully omitted from the rendered page (no empty sections, broken links, or placeholder text).
- **FR-012**: The About page MUST be statically generated and deployed via the existing GitHub Pages workflow — no runtime data fetching.

### Key Entities

- **About Profile**: The single content unit representing the portfolio owner. Attributes: name, headline/professional title, profile photo, location (optional), availability status (optional), bio (long-form body), skills (list), social links (list of label + URL pairs), contact email, optional resume/CV URL.
- **Social Link**: A labeled external link (e.g., LinkedIn, GitHub, X, personal site). Attributes: platform name/label, URL, optional icon identifier.
- **Skill**: A short label representing an area of expertise (e.g., "TypeScript", "Astro", "UX Design"). May optionally be grouped by category (e.g., Languages, Frameworks, Tools).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can locate and open the About page within 1 click from any page on the site.
- **SC-002**: A recruiter reading the About page can identify the owner's name, role, key skills, and at least one contact method within 30 seconds.
- **SC-003**: 100% of contact and social links on the About page resolve without error (no 404s, no broken `mailto:` syntax) at build/check time.
- **SC-004**: Updating any About content (bio, skills, social links, contact) requires editing only the single About Markdown file — no code or template changes.
- **SC-005**: The About page achieves a Lighthouse performance score of 90+ on mobile, matching the rest of the site.
- **SC-006**: The About page passes WCAG 2.1 AA automated accessibility checks.
- **SC-007**: The About page renders correctly and is fully usable at 320px, 768px, and 1280px+ viewport widths.
- **SC-008**: The landing page About teaser drives a measurable click-through to the full About page (qualitative goal: the teaser is visible, scannable, and the "Read more" link is unambiguous).

## Assumptions

- The portfolio owner will provide all About content (bio text, skills list, profile photo, social handles, contact email, optional resume PDF) and is comfortable editing a single Markdown file.
- A single About profile is sufficient for v1 — multi-language or multi-persona profiles are out of scope.
- Contact is one-way (visitor reaches out via email or social) — no in-page contact form, captcha, or backend submission handling is required for v1.
- The profile photo is a static asset stored in the repository; no avatar service or CMS integration is required.
- Standard social platforms (LinkedIn, GitHub, X/Twitter, personal website) cover the v1 use case; obscure or future platforms can be added later by extending the social links list.
- The About page is a single-page experience — no sub-pages (e.g., "Detailed CV", "Testimonials") are part of v1, though the architecture should not preclude them.
- Existing site theming, typography, layout components, and navigation patterns from the portfolio showcase feature will be reused for visual consistency.
