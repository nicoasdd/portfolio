# Portfolio Template

A statically generated portfolio template you can fork to publish your own projects on GitHub Pages — no design work, no build configuration, no code changes required to add new content. Built with Astro and Tailwind CSS.

The template ships with three working **example projects** (one per category) and a fillable **About page**, so the moment you fork it you have a deployable site. From there, swap in your own content one Markdown file at a time.

> Looking for the full feature history? See [`specs/`](./specs/) for the spec, plan, and tasks of every shipped change.

---

## Quick Start (≈ 15 minutes)

1. **Get your own copy.** Click **Use this template → Create a new repository** (preferred) or fork the repo. Pick a repo name — your site will be served at `https://<your-username>.github.io/<repo-name>/`.

2. **Enable GitHub Pages.** In your new repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**. No workflow file changes needed.

3. **Install locally.**

   ```bash
   nvm use            # picks up .nvmrc (Node 20)
   npm install
   npx playwright install --with-deps chromium    # first time only, for tests
   npm run dev        # http://localhost:4321
   ```

   You should see the three example projects, the example About page, and the category navigation working.

4. **Replace the About content.** Open `src/content/about/profile.md`. Fill in `name`, `headline`, `intro`, `email`, `skills`, and the bio body. Drop your photo at the path you reference from `photo:` (e.g. `public/about/profile.webp`). Detailed instructions are in [Edit your About content](#edit-your-about-content) below.

5. **Add your first project.** Copy `templates/project.md` into `src/content/projects/<category>/<slug>.md`, fill in the frontmatter, and drop a thumbnail under `public/projects/<slug>/`. Full walkthrough in [Adding a project](#adding-a-project) below.

6. **Push and deploy.**

   ```bash
   git add . && git commit -m "First content"
   git push
   ```

   The deploy workflow runs automatically on every push to `main`. When it finishes (≈2 min), your site is live at the URL from step 1.

That's it. From here, every new project is one Markdown file plus a thumbnail.

---

## Common Issues

> Read this section **before** customizing — the first item catches the most common mistake people make with template repos.

### Don't delete the example projects

The three files under `src/content/projects/{personal,startup,corporate}/example-*.md` are doing **two jobs at once**:

- They are working examples that demonstrate the schema and give a forked repo something to render.
- They are also the test fixtures the e2e suite asserts against. The unit suite has a dedicated check (`tests/unit/examples.test.ts`) that fails loudly with a pointer back to this section if any of the three is missing.

**Do not delete them.** If you want them out of your published site, set the environment variable `HIDE_EXAMPLES=true` on your deploy (see [Hiding the examples](#hiding-the-examples)) — they'll stay on disk for the test suite but disappear from the rendered site. Two safe paths:

| Want | Do this |
|---|---|
| Keep examples mixed with your real projects | Nothing — the default works. |
| Hide examples but keep tests passing | Set `HIDE_EXAMPLES=true` on your deploy (recommended). |
| Replace examples in-place with your own | Edit the file content but **keep the slug `example-personal` / `example-startup` / `example-corporate`** so existing tests still resolve. Then update the assertions in `tests/e2e/project-detail.spec.ts` to match your new content. |

The build will print a `[content-validator]` warning if it can't find an example file, and CI will fail the unit suite — so you'll know immediately if something went missing.

### My deploy succeeded but the site is empty

Open your repo's **Settings → Pages** and confirm the source is set to **GitHub Actions**. If you previously had it pointing at a branch (`main` / `gh-pages`), switch to GitHub Actions and re-run the workflow.

### My BASE_PATH is wrong (links 404 on a project repo)

The deploy workflow auto-resolves `BASE_PATH` from `actions/configure-pages`. If you serve from a custom domain (apex), `BASE_PATH` should be `/`. If you serve from `https://<user>.github.io/<repo>/`, it should be `/<repo>/`. The workflow handles both — but if you customize `astro.config.mjs`, make sure the `base` value still respects the `BASE_PATH` env var.

### `npm run test:e2e` fails on a fresh checkout

You probably haven't installed Playwright browsers yet:

```bash
npx playwright install --with-deps chromium
```

---

## Local development

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

`HIDE_EXAMPLES` is honored in **dev**, **build**, and **preview** — set it in front of any of the above to preview the hidden state locally:

```bash
HIDE_EXAMPLES=true npm run dev
HIDE_EXAMPLES=true npm run build && npm run preview
```

---

## Adding a project

Adding a project takes **one Markdown file** — no code changes.

### 1. Copy the template

```bash
cp templates/project.md src/content/projects/<category>/<slug>.md
```

`<category>` is one of `personal`, `startup`, `corporate`. `<slug>` is lowercase kebab-case (e.g. `cli-toolkit`).

### 2. Fill in the frontmatter

| Field | Description |
|---|---|
| `title` | Display name (1–80 chars). |
| `description` | One-line summary (1–240 chars). |
| `role` | Your role on the project. |
| `period` | `{ start: YYYY-MM, end: YYYY-MM \| "present" }`. |
| `techStack` | Array of 1–20 technologies/frameworks. |
| `thumbnail` | Path under `public/` to the card image. |

Optional: `slug` (override filename), `screenshots[]`, `links.{source,live,caseStudy}`, `featured`, `order`, `draft`.

The full schema lives in [`src/content.config.ts`](./src/content.config.ts).

### 3. Add image assets

```bash
mkdir -p public/projects/<slug>
# add a thumbnail.svg/png/webp and any screenshots
```

### 4. Verify locally

```bash
npm run build      # fails fast if frontmatter is invalid
npm run dev
```

Visit `http://localhost:4321/projects/<slug>/`.

### 5. Commit and push

```bash
git add src/content/projects/<category>/<slug>.md public/projects/<slug>/
git commit -m "Add project: <slug>"
git push
```

The deploy workflow takes over.

---

## Edit your About content

The About page (`/about/`) and the landing-page teaser are both driven by **a single Markdown file**: `src/content/about/profile.md`. There must be exactly one `*.md` file under `src/content/about/`.

### 1. (First time only) Copy the template

```bash
cp templates/about.md src/content/about/profile.md
```

A starter `profile.md` already ships with the repo, so usually you just edit it in place.

### 2. Fill in the frontmatter

| Field | Required | Description |
|---|---|---|
| `name` | yes | Your display name (1–80 chars). |
| `headline` | yes | Professional title or one-line tagline (1–120 chars). |
| `intro` | yes | Short paragraph used by the landing-page teaser (1–240 chars). |
| `photo` | yes | Path under `public/` to your photo. |
| `email` | yes | Contact email — rendered as a `mailto:` link. |
| `skills` | yes | Array of 1–40 strings (skills, focus areas). |
| `photoAlt` | no | Override the default `alt` (defaults to `"Portrait of {name}"`). |
| `location` | no | E.g. `"Remote · EU timezone"`. |
| `availability` | no | E.g. `"Open to opportunities"`. |
| `socialLinks` | no | Array of `{ label, url, icon? }`. URLs must be `http(s)`. |
| `resumeUrl` | no | Absolute URL or path under `public/` (e.g. `/about/resume.pdf`). |

`socialLinks[].icon` accepts: `github`, `linkedin`, `x`, `mastodon`, `bluesky`, `email`, `website`.

The body of the file (after the closing `---`) is the long-form bio with full Markdown support. **The body must not be empty.**

### 3. Add your photo and optional CV

```bash
cp ~/Pictures/me.webp public/about/profile.webp
# Then update profile.md: photo: "/about/profile.webp"

# Optional CV
cp ~/Documents/cv.pdf public/about/resume.pdf
# In profile.md: resumeUrl: "/about/resume.pdf"
```

If the photo file is missing at build time, the site falls back to a placeholder so the layout never breaks — but `[content-validator]` will warn in the build log.

### 4. Verify locally

```bash
npm run build      # fails fast if any required About field is missing
npm run dev        # http://localhost:4321/about/
```

The validator prints a confirmation line on success:

```text
[content-validator] About profile validated: profile.md (N skills).
```

---

## Hiding the examples

The example projects are visible by default — that's what makes the freshly-forked site immediately deployable. To hide them on your deployed site (without deleting the files, so the test suite stays green), set the environment variable:

```text
HIDE_EXAMPLES=true
```

### What it does

When `HIDE_EXAMPLES=true`, every project whose slug starts with `example-` is excluded from:

- The landing page project grid.
- The featured-projects list.
- Every category page (`/category/personal/`, `/category/startup/`, `/category/corporate/`).
- The individual project pages (`/projects/example-*/index.html` are not generated).
- The generated `sitemap-*.xml`.

Your real projects are unaffected.

### Where to set it

| Environment | How |
|---|---|
| Local dev/build/preview | `HIDE_EXAMPLES=true npm run dev` (or `build` / `preview`) |
| GitHub Pages deploy (default) | Repository **Settings → Secrets and variables → Actions → Variables → New repository variable** named `HIDE_EXAMPLES` set to `true`. |
| GitHub Pages deploy (auto for `content/add-projects`) | Push to a branch named `content/add-projects` — the deploy workflow auto-sets `HIDE_EXAMPLES=true` for that branch regardless of the repo variable. See [For the template author](#for-the-template-author). |

### Default

If unset, defaults to `false`. Tests always run with `HIDE_EXAMPLES=false` (the default) so the example projects supply the e2e fixtures.

Accepted truthy values (case-insensitive): `true`, `1`, `yes`, `on`. Accepted falsy values: `false`, `0`, `no`, `off`, empty. Anything else falls back to `false` with a warning in the build log.

---

## Deployment to GitHub Pages

The site is deployed automatically on every push to `main` (and to `content/add-projects`, if you maintain one — see below).

### One-time setup

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. (Optional) Add a custom domain under **Settings → Pages → Custom domain**.
5. (Optional) If you want to hide the examples on your deployed site, add a repository variable `HIDE_EXAMPLES=true` (see [Hiding the examples](#hiding-the-examples)).

The first push to `main` after this setup will deploy your site to `https://<your-username>.github.io/<repo-name>/` (or your custom domain).

### Workflows

- `.github/workflows/ci.yml` — runs on every PR and push: lint, typecheck, unit tests, default build, hidden-examples build smoke step, Playwright e2e + axe-core, Lighthouse CI.
- `.github/workflows/deploy.yml` — runs on push to `main` and `content/add-projects`: build and deploy to GitHub Pages.

If a build fails, the live site stays untouched.

---

## For the template author

If you're maintaining this repo as both a public template **and** your own personal portfolio, the recommended pattern is to keep two long-lived branches:

- **`main`** — the template. Examples only, no personal content. What forkers see.
- **`content/add-projects`** — your personal portfolio. Real projects added here. Deploy workflow automatically sets `HIDE_EXAMPLES=true` on this branch, so the deployed site shows only your real work.

Template improvements (fixes, features, doc updates) flow `main` → `content/add-projects` via merge or rebase. Project content never lives on both branches at once, so merges are conflict-free.

The full author workflow — branch setup, sync recipes, schema-migration handling, and the GitHub Pages "one source per repo" trade-off — is in [`docs/dual-branch-workflow.md`](./docs/dual-branch-workflow.md).

---

## Project structure

```text
src/
├── content/
│   ├── projects/{personal,startup,corporate}/*.md   # Project content
│   └── about/profile.md                             # About content (single entry)
├── content.config.ts                                # Zod schemas + collections
├── components/   # Hero, ProjectCard, ProjectGrid, CategoryNav, AboutTeaser, SkillsList, SocialLinks, ...
├── layouts/      # BaseLayout, ProjectLayout
├── lib/          # projects, about, sort, slug, assets, url, env, examples helpers
├── integrations/ # build-time content validator
├── pages/        # / , /about/ , /category/[category]/ , /projects/[slug]/ , 404
└── styles/global.css                                # Tailwind 4 + @theme tokens

templates/project.md                                 # Copy this to add a project
templates/about.md                                   # Copy this to author the About page
public/{projects,about}/                             # Static assets
.github/workflows/                                   # CI + deploy
tests/{unit,e2e}/                                    # Vitest + Playwright
docs/dual-branch-workflow.md                         # Author-side dual-branch guide
specs/{001,002,003}*/                                # Spec, plan, tasks per feature
```

---

## Constitution & process

This project follows a Spec-Kit driven workflow:

- [`.specify/memory/constitution.md`](./.specify/memory/constitution.md) — non-negotiable principles (showcase-first, categorization, performance, content-driven, accessible, polished).
- [`specs/001-portfolio-showcase/`](./specs/001-portfolio-showcase/) — original site spec, plan, tasks.
- [`specs/002-about-section/`](./specs/002-about-section/) — About section feature.
- [`specs/003-template-mode/`](./specs/003-template-mode/) — this template-mode feature.
