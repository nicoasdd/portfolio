# Dual-Branch Workflow (Template Author Guide)

This document is for the **original maintainer** of this repository — the person publishing both:

1. The **portfolio template** itself (so other people can fork it and stand up their own portfolios), and
2. Their own **personal portfolio**, deployed from the same repo.

If you forked this repo to build your own portfolio, you can stop reading. You only need [the README](../README.md). This doc is the maintenance playbook for the template author.

---

## Why two branches

GitHub Pages serves only **one source per repository**. To use the same repo as both a public template *and* your live portfolio, content has to live in two places:

| Branch | Purpose | What lives here | What's deployed |
|---|---|---|---|
| `main` | Public template | Examples only (`example-personal.md`, `example-startup.md`, `example-corporate.md`), placeholder About content, all template scaffolding. | The "template demo" site (visible to anyone who lands on the repo's GitHub Pages URL when forks point at it). |
| `content/add-projects` | Your personal portfolio | Your real projects + your real About content. Examples remain on disk (they're test fixtures) but are hidden from the rendered site by `HIDE_EXAMPLES=true`. | Your actual portfolio, live at the same GitHub Pages URL. |

The deploy workflow (`.github/workflows/deploy.yml`) auto-resolves which one to deploy — see [How `HIDE_EXAMPLES` is wired](#how-hide_examples-is-wired) below.

> Why not just delete the examples on `main`? Because the test suite uses them as fixtures (`tests/e2e/project-detail.spec.ts`, `tests/unit/examples.test.ts`). Removing them would break CI on every fork. The `HIDE_EXAMPLES=true` switch lets the files stay in tree while disappearing from the rendered output.

---

## How `HIDE_EXAMPLES` is wired

`.github/workflows/deploy.yml` derives `HIDE_EXAMPLES` at build time:

```yaml
env:
  HIDE_EXAMPLES: ${{ github.ref == 'refs/heads/content/add-projects' && 'true' || vars.HIDE_EXAMPLES || 'false' }}
```

Resolution order:

1. **Branch override** — pushes to `content/add-projects` always build with `HIDE_EXAMPLES=true`. Your real projects ship; examples don't.
2. **Repo variable** — for any other branch, the workflow falls back to `vars.HIDE_EXAMPLES` (Settings → Secrets and variables → Actions → Variables).
3. **Default** — `false`. Examples visible, perfect for a freshly-forked template demo.

Forkers don't need to think about any of this — the default-`false` path is what they get for free.

---

## One-time setup

Run these commands once when adopting the dual-branch model. Assumes you're on a clean checkout of `main`.

```bash
git checkout main
git pull --ff-only

git checkout -b content/add-projects
git push -u origin content/add-projects
```

Then in the GitHub UI:

1. **Settings → Pages → Build and deployment → Source = GitHub Actions** (a single setting; the workflow handles per-branch routing).
2. **Settings → Branches → Add branch protection rule**:
   - For `main`: require PRs, require CI green, restrict who can push (just you, ideally via PR + Bugbot).
   - For `content/add-projects`: same protections, plus **disallow force-pushes** so deployment history is auditable.
3. *(Optional but recommended)* Add a repository **variable** `TEMPLATE_DEMO_URL` pointing at a separate "pure template demo" deployment (e.g. a second fork of your own repo with no personal content). The README's "Quick Start" can then link forkers there. If you don't want a second deployment, skip this — the examples on `main` already document themselves.

That's it. Both branches are live. Pushes to `main` deploy the template demo (examples visible). Pushes to `content/add-projects` deploy your personal portfolio (examples hidden, real projects shown).

---

## Day-to-day: adding a real project

Real projects live **only** on `content/add-projects`. Never commit personal project files to `main`.

```bash
git checkout content/add-projects
git pull --ff-only

cp templates/project.md src/content/projects/personal/my-new-project.md
$EDITOR src/content/projects/personal/my-new-project.md
mkdir -p public/projects/my-new-project && cp ~/screenshots/* public/projects/my-new-project/

npm run build      # validate frontmatter + thumbnail
git add src/content/projects/personal/my-new-project.md public/projects/my-new-project/
git commit -m "Add project: my-new-project"
git push
```

Push triggers the deploy workflow on `content/add-projects` → `HIDE_EXAMPLES=true` → site rebuilt with your real projects, examples filtered out.

---

## Syncing template improvements `main` → `content/add-projects`

When you ship a template improvement (a fix, a feature, a doc update) on `main`, it needs to land on `content/add-projects` so your live portfolio gets it too. Because real-project content **never co-exists** on both branches, the merge surface is small and conflict-free in practice.

### Recipe A — Merge (recommended for normal updates)

```bash
git checkout content/add-projects
git pull --ff-only

git fetch origin main
git merge --no-ff origin/main -m "Sync template updates from main"

# Resolve conflicts only if they touch shared files (e.g. astro.config, tailwind config).
# Project content under src/content/projects/<category>/ should never conflict —
# personal projects live only on content/add-projects, examples live only on main.

npm run build && npm run lint && npm run test
git push
```

### Recipe B — Rebase (use only if you haven't pushed `content/add-projects` recently)

```bash
git checkout content/add-projects
git fetch origin main
git rebase origin/main
# resolve conflicts as above
npm run build && npm run lint && npm run test
git push --force-with-lease   # required after rebase; never plain --force
```

> Avoid rebase once `content/add-projects` has been deployed and other tools (Bugbot, GitHub Actions logs, etc.) reference its commit hashes.

### Recipe C — Cherry-pick (for hotfixes you don't want on main yet)

Rarely needed; useful for quick patches you want live before they're polished into a `main` PR.

```bash
git checkout content/add-projects
git cherry-pick <commit-sha-from-feature-branch>
git push
# Open a follow-up PR to land the same fix properly on main.
```

---

## Schema migrations

When `main` changes a Content Collection schema (`src/content.config.ts`) — adding a required field, tightening a regex, splitting a category — you have to update your real project frontmatter on `content/add-projects` to match. The build is the source of truth here:

```bash
git checkout content/add-projects
git merge origin/main          # Recipe A
npm run build                  # Will fail loudly with Zod errors per-file
# Fix each reported file.
npm run build                  # Re-run until clean.
npm run test
git commit -am "Sync schema migration from main"
git push
```

Tips:

- The Zod errors print **filename + field path + reason**. Just walk the list.
- Add a one-line note to your project frontmatter (e.g. `# migrated 2026-04` in a comment) if you want to track which projects you've touched per migration.
- If a migration drops a field, don't bother removing it from your old projects — Astro's content collection will ignore unknown fields silently after the schema change.

---

## Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| You see your examples on the deployed personal portfolio | You forgot you were on `main` and pushed there. | `git checkout content/add-projects && git cherry-pick <commit> && git push origin :main^..main` to revert. Then push the cherry-picked commit on the right branch. |
| `HIDE_EXAMPLES=true` deploy still shows examples in the sitemap | You set `vars.HIDE_EXAMPLES=true` but pushed an empty commit to `main` to retrigger — `main` honors the repo variable, but that variable might still be unset / `false`. | Either set the repo variable, or push to `content/add-projects` (auto-overrides). |
| Schema migration broke real projects after a sync | `main` tightened a Zod schema and your old frontmatter doesn't match. | Run `npm run build` locally on `content/add-projects`, fix each file the build complains about, commit, push. |
| Forkers on the template see your real projects | You accidentally committed personal project files to `main`. | Revert those commits on `main` immediately; they won't propagate to forks that pull later. Existing forks need a manual cleanup PR. |
| `git merge origin/main` complains about conflicts in `src/content/projects/` | Someone (probably a stale local branch) committed a personal project to `main`. | Remove the personal file on `main` first (`git rm`), commit, then re-merge. |

---

## Single-source publishing trade-off

GitHub Pages can only serve one branch at a time per repo. The dual-branch model picks **`content/add-projects` as the deployment source** (because that's the personal portfolio you want public). The template demo on `main` then has no automatic public URL on this same repo — but:

- The README links to the live deployment as a "what a finished portfolio looks like" demo.
- Forkers see `main`'s code (with examples visible) the moment they fork — that *is* their template demo, just hosted under their own GitHub Pages instead of yours.
- If you want a *separate* always-on template demo URL, fork your own repo into a second account/org, leave it on `main`, and set its Pages source to GitHub Actions. That fork will deploy with `HIDE_EXAMPLES=false`.

For 99% of cases the README + per-fork demos are enough; the second-fork demo is overkill.

---

## Related docs

- [README → Quick Start](../README.md#quick-start-15-minutes) — the forker-facing onboarding flow.
- [README → Hiding the examples](../README.md#hiding-the-examples) — what the `HIDE_EXAMPLES` flag does and where to set it.
- [`specs/003-template-mode/spec.md`](../specs/003-template-mode/spec.md) — the original feature spec that introduced this workflow.
- [`specs/003-template-mode/contracts/hide-examples.contract.md`](../specs/003-template-mode/contracts/hide-examples.contract.md) — the behavioral contract for `HIDE_EXAMPLES`.
