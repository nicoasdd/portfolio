# Portfolio

A statically generated portfolio site that showcases projects in three explicit
categories — **Personal**, **Startup**, and **Corporate** — with project content
authored as Markdown files. Built with Astro and Tailwind CSS, deployed to
GitHub Pages via GitHub Actions.

> See [`specs/001-portfolio-showcase/`](./specs/001-portfolio-showcase/) for the
> full specification, plan, data model, and tasks.

## Tech stack

- [Astro 5](https://astro.build/) — static site generator (zero JS by default)
- [Tailwind CSS 4](https://tailwindcss.com/) — utility-first styling with CSS-based theme tokens
- [Zod](https://zod.dev/) — frontmatter schema validation at build time
- [Vitest](https://vitest.dev/) — unit tests
- [Playwright](https://playwright.dev/) + [`@axe-core/playwright`](https://www.npmjs.com/package/@axe-core/playwright) — end-to-end + accessibility tests
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) — performance budgets in CI

## Local development

```bash
nvm use            # picks up .nvmrc (Node 20)
npm install
npm run dev        # http://localhost:4321
```

### Available scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Astro dev server with hot reload |
| `npm run build` | Build the static site to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | `astro check` + `tsc --noEmit` |
| `npm run lint` | ESLint over `.js`, `.ts`, `.astro` |
| `npm run format` | Prettier across the project |
| `npm run test` | Vitest unit tests (`tests/unit/`) |
| `npm run test:e2e` | Playwright end-to-end tests (`tests/e2e/`) |
| `npm run lighthouse` | Lighthouse CI against the built site |

> First-time Playwright setup: `npx playwright install --with-deps chromium`.

## Adding a new project

Adding a project to the portfolio takes **one Markdown file** — no code changes.

### 1. Copy the template

```bash
cp templates/project.md src/content/projects/<category>/<slug>.md
```

Where `<category>` is one of `personal`, `startup`, `corporate`, and `<slug>` is
a lowercase kebab-case identifier (e.g. `cli-toolkit`).

### 2. Fill in the frontmatter

Open the new file and complete the required fields:

| Field | Description |
|---|---|
| `title` | Display name (1–80 chars). |
| `description` | One-line summary (1–240 chars). |
| `role` | Your role on the project. |
| `period` | `{ start: YYYY-MM, end: YYYY-MM \| "present" }`. |
| `techStack` | Array of 1–20 technologies/frameworks. |
| `thumbnail` | Path under `public/` to the card image. |

Optional fields: `slug` (override filename), `screenshots[]`, `links.{source,live,caseStudy}`, `featured`, `order`, `draft`.

The full schema is in [`src/content.config.ts`](./src/content.config.ts) and
documented in
[`specs/001-portfolio-showcase/data-model.md`](./specs/001-portfolio-showcase/data-model.md).

### 3. Add image assets

Create a directory matching your slug under `public/projects/`:

```bash
mkdir -p public/projects/<slug>
# add thumbnail and screenshot files
```

### 4. Verify locally

```bash
npm run build      # fails fast if frontmatter is invalid or slugs collide
npm run dev
```

Visit `http://localhost:4321/projects/<slug>/` to see the new project.

### 5. Commit and push

```bash
git add src/content/projects/<category>/<slug>.md public/projects/<slug>/
git commit -m "Add project: <slug>"
git push
```

The deploy workflow takes over from there (see below).

## Edit your About content

The About page (`/about/`) and the landing-page teaser are both driven by a
**single Markdown file**: `src/content/about/profile.md`. There is no code to
touch — edit the frontmatter and body, run `npm run build`, ship.

### 1. (First time only) Copy the template

```bash
cp templates/about.md src/content/about/profile.md
```

A starter `profile.md` already ships with the repo, so you usually just edit it
in place. There must be **exactly one** `*.md` file under `src/content/about/`.

### 2. Fill in the frontmatter

| Field | Required | Description |
|---|---|---|
| `name` | yes | Your display name (1–80 chars). |
| `headline` | yes | Professional title or one-line tagline (1–120 chars). |
| `intro` | yes | Single short paragraph used by the landing-page teaser (1–240 chars). |
| `photo` | yes | Path under `public/` to your photo (e.g. `/about/profile.svg`). |
| `email` | yes | Contact email — rendered as a `mailto:` link. |
| `skills` | yes | Array of 1–40 strings (skills, focus areas). |
| `photoAlt` | no | Override the default `alt` (defaults to `"Portrait of {name}"`). |
| `location` | no | E.g. `"Remote · EU timezone"`. Renders as a small badge. |
| `availability` | no | E.g. `"Open to opportunities"`. Renders as an accent badge. |
| `socialLinks` | no | Array of `{ label, url, icon? }`. URLs must be `http(s)`. |
| `resumeUrl` | no | Absolute URL or path under `public/` (e.g. `/about/resume.pdf`). |

`socialLinks[].icon` accepts: `github`, `linkedin`, `x`, `mastodon`, `bluesky`,
`email`, `website`. Unknown values are rejected at build time.

The body of the file (everything after the closing `---`) is the long-form bio
and is rendered with full Markdown support beneath the header. **The body must
not be empty.**

The full schema lives in [`src/content.config.ts`](./src/content.config.ts) and
is documented in
[`specs/002-about-section/data-model.md`](./specs/002-about-section/data-model.md).

### 3. Add your photo (and optional CV)

Drop your photo at the path you referenced from `photo`:

```bash
# Replace the placeholder
cp ~/Pictures/me.webp public/about/profile.webp
# Then update profile.md: photo: "/about/profile.webp"
```

If `resumeUrl` is set to a relative path, place the file alongside it:

```bash
cp ~/Documents/cv.pdf public/about/resume.pdf
# In profile.md: resumeUrl: "/about/resume.pdf"
```

If the photo file is missing at build time, the site falls back to the shared
placeholder so the layout never breaks — but you'll see a warning in the build
log from `[content-validator]`.

### 4. Verify locally

```bash
npm run build      # fails fast if any required About field is missing
npm run dev        # http://localhost:4321/about/
```

The validator prints a confirmation line on success:

```text
[content-validator] About profile validated: profile.md (N skills).
```

If you remove a required field or empty out the body, the build halts with a
clear, file-and-field-specific error.

## Project structure

```text
src/
├── content/
│   ├── projects/{personal,startup,corporate}/*.md   # Project content
│   └── about/profile.md                             # About content (single entry)
├── content.config.ts                                # Zod schemas + collections
├── components/   # Hero, ProjectCard, ProjectGrid, CategoryNav, AboutTeaser, SkillsList, SocialLinks, ...
├── layouts/      # BaseLayout, ProjectLayout
├── lib/          # projects, about, sort, slug, assets, url helpers
├── integrations/ # build-time content validator
├── pages/        # / , /about/ , /category/[category]/ , /projects/[slug]/ , 404
└── styles/global.css                                # Tailwind 4 + @theme tokens

templates/project.md                                 # Copy this to add a project
templates/about.md                                   # Copy this to author the About page
public/{projects,about}/                             # Static assets
.github/workflows/                                   # CI + deploy
tests/{unit,e2e}/                                    # Vitest + Playwright
specs/{001-portfolio-showcase,002-about-section}/    # Spec, plan, tasks
```

## Deployment to GitHub Pages

The site is deployed automatically on every push to `main`.

### One-time setup

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. (Optional) Add a custom domain under **Settings → Pages → Custom domain**.

The first push to `main` after this setup will deploy your site to
`https://<your-username>.github.io/<repo-name>/` (or your custom domain).

### Workflows

- `.github/workflows/ci.yml` — runs on every PR + push: lint, typecheck, unit tests, build, Playwright e2e + axe-core, Lighthouse CI.
- `.github/workflows/deploy.yml` — runs on push to `main`: build and deploy to GitHub Pages.

If a build fails, the live site stays untouched.

## Constitution & process

This project follows a Spec-Kit driven workflow. See:

- [`.specify/memory/constitution.md`](./.specify/memory/constitution.md) — non-negotiable principles (showcase-first, categorization, performance, content-driven, accessible, polished).
- [`specs/001-portfolio-showcase/spec.md`](./specs/001-portfolio-showcase/spec.md) — feature specification.
- [`specs/001-portfolio-showcase/plan.md`](./specs/001-portfolio-showcase/plan.md) — implementation plan.
- [`specs/001-portfolio-showcase/tasks.md`](./specs/001-portfolio-showcase/tasks.md) — task breakdown.
