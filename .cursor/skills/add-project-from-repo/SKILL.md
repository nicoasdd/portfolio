---
name: add-project-from-repo
description: >-
  Adds one or more new project entries to the portfolio from GitHub repository
  URLs. Accepts a single URL or a batch of URLs and processes them one by one.
  For each repo, clones to a temp directory, analyzes README, package
  manifests, and source, then generates a schema-compliant markdown file under
  src/content/projects/<category>/<slug>.md and a placeholder thumbnail at
  public/projects/<slug>/thumbnail.svg. Use when the user provides one or
  several GitHub repo URLs (public or private) and asks to add them as
  portfolio projects, create project entries, or import repos into the
  portfolio.
---

# Add Project From Repo

Generates portfolio project entries from one or more GitHub repository URLs.
Works for public and private repos (relies on the user's local git auth — do
not prompt for credentials).

## Inputs

Confirm with the user before starting:

1. **Repo URL(s)** (HTTPS or SSH) — required. Accepts one URL or a list of
   URLs (newline-, comma-, or space-separated). If missing, ask once and stop
   until provided.
2. **Category** — `personal`, `startup`, or `corporate`. Default: `personal`.
   Applies to every repo in the batch unless the user specifies per-repo
   overrides.
3. **Featured** — `true` / `false`. Default: `false`. Same batch semantics as
   category.
4. **Role** — e.g. "Solo Developer". Default: `"Solo Developer"`. Same batch
   semantics.

Other fields are inferred from the repo. Never invent them.

## Batch processing

When the user provides more than one URL:

1. **Parse and de-duplicate** the URL list. Normalize each to its canonical
   HTTPS form before comparing.
2. **Show the plan once** before starting: list the repos in order with their
   intended category, then begin.
3. **Process repos sequentially**, one at a time, running Steps 1–5 fully for
   each repo before moving to the next. Never interleave clones or writes
   across repos — one finished entry, then the next.
4. **Track per-repo status** in a short checklist (e.g. ✓ added,
   ⚠ skipped, ✗ failed). Reuse the Step-by-Step checklist below per repo.
5. **Isolate failures**: if one repo fails (clone error, schema error, user
   declines an overwrite), record it as failed/skipped and continue with the
   remaining repos. Do not abort the batch.
6. **Run `npm run build` once at the end** of the whole batch (Step 6),
   instead of after each repo. If the build fails, report which entry caused
   it and offer to fix or revert that entry only.
7. **Final summary**: after the batch, print a compact report —
   `<n> added, <m> skipped, <k> failed` — with one line per repo and the
   path to each new markdown file. Remind the user that thumbnails are
   placeholders.

For a single URL, treat it as a batch of one and skip the plan/summary
ceremony.

## Workflow

For each repo in the batch, copy this checklist and track progress as you go.
Steps 1–5 run per repo; Step 6 runs once at the end of the whole batch.

```
- [ ] Step 1: Clone repo to a temp folder
- [ ] Step 2: Analyze repo contents
- [ ] Step 3: Derive frontmatter fields
- [ ] Step 4: Write the markdown file
- [ ] Step 5: Create thumbnail placeholder
```

After every repo in the batch has been processed:

```
- [ ] Step 6: Validate with npm run build and clean up all temp clones
```

### Step 1: Clone to a temp folder

Always shallow-clone into a unique temp dir. Never clone into the workspace.
Each repo in a batch gets its own temp dir so failures stay isolated.

```bash
TMP=$(mktemp -d -t portfolio-import-XXXX)
git clone --depth 50 <repo-url> "$TMP/repo"
```

Use `--depth 50` (not `--depth 1`) so `git log` can derive the project period.

If the clone fails, surface the auth error verbatim and stop. Do not retry with
a different URL form unless the user asks.

#### Detect visibility

Right after cloning, determine whether the repo is public or private. This
decides whether `links.source` ends up in the frontmatter (public) or is
omitted (private).

Try in order, stopping at the first that succeeds:

1. **`gh` CLI** (preferred, most reliable):
   ```bash
   gh repo view <owner>/<repo> --json visibility -q .visibility
   # → "PUBLIC" or "PRIVATE"
   ```
2. **Unauthenticated HEAD probe** — if `gh` is not available:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://github.com/<owner>/<repo>
   # 200 → public, 404 → private (or doesn't exist)
   ```
3. **Ask the user** — if neither is available or the result is ambiguous,
   ask once: "Is `<owner>/<repo>` a public or private repository?"

Record the result as `VISIBILITY=public|private` and use it in Step 3.

### Step 2: Analyze the repo

Read in this order, stopping when you have enough signal:

1. `README.md` (or `README.*`) — primary source for description, highlights,
   lessons.
2. `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` /
   `requirements.txt` — tech stack signal. Also check `package.json`'s
   `description`, `keywords`, and `scripts` fields.
3. Top-level `src/` (or equivalent) structure — confirms architectural claims.
4. `.github/workflows/`, `Dockerfile`, `docker-compose.*` — deployment hints.

#### Fallback: when steps 1–4 are not enough

If after the four sources above you still cannot confidently fill `description`,
`techStack`, and at least 2 Highlights, escalate **in this order** before
asking the user. Stop as soon as you have enough.

5. **Entry points** — read the files referenced by `package.json` `"main"` /
   `"bin"` / `"scripts"`, or `pyproject.toml` `[project.scripts]`, or
   `cmd/*/main.go`, or `src/main.*`. The first 100 lines usually reveal
   purpose.
6. **Public API surface** — `src/index.*`, `src/app.*`, `src/server.*`,
   route/controller files, or any file exporting the most public symbols.
7. **Tests** — `tests/`, `__tests__/`, `*.test.*`, `*.spec.*`. Test names
   often describe behaviour better than code (`describe('PriceScraper', ...)`,
   `it('returns deals under budget', ...)`).
8. **Configuration and types** — `*.config.*`, `schema.*`, `types.ts`,
   `proto/*.proto`. These often expose the domain vocabulary.
9. **Commit history** — `git -C "$TMP/repo" log --format='%s' | head -30`. The
   first 5 and most recent 10 commit subjects sketch the project's arc.
10. **Repo metadata** — `git -C "$TMP/repo" remote get-url origin` and the
    GitHub repo description if `gh` is available:
    `gh repo view <owner>/<repo> --json description,topics,homepageUrl`.

#### When to ask the user

If after all 10 sources you still cannot honestly fill the required fields,
**stop and ask the user**. Ask only the fields you cannot derive, in one
batched question. Example:

> The repo doesn't have enough info to derive these. Could you fill them in?
> - Description (≤240 chars):
> - 2–3 highlights:
> - Anything missing from the detected tech stack [TS, NestJS, Docker]?

Do **not** invent features, metrics, dates, or architectural claims that the
code or README do not support. Sparse-but-honest is better than detailed-but-
fabricated.

### Step 3: Derive frontmatter

Map findings to the strict schema in `src/content.config.ts`. Authoritative
field rules are inlined in [reference.md](reference.md).

| Field | Source | Notes |
|-------|--------|-------|
| `title` | README H1, else repo name in Title Case | ≤80 chars |
| `description` | First substantive README paragraph, condensed | ≤240 chars |
| `role` | User input | default `"Solo Developer"` |
| `period.start` | `git -C "$TMP/repo" log --reverse --format=%cs \| head -1` then trim to YYYY-MM | format `YYYY-MM` |
| `period.end` | Most recent commit month, or `"present"` if last commit is within 60 days | format `YYYY-MM` or literal `"present"` |
| `techStack` | Languages + frameworks detected from manifests/source | 1–20 entries, each ≤30 chars |
| `thumbnail` | `/projects/<slug>/thumbnail.svg` | Created in step 5 |
| `links.source` | HTTPS form of the repo URL | **Public repos**: include. **Private repos**: omit the entire `source` key (do not leave an empty value or a placeholder) — `ProjectLinks.astro` will then skip the "Source code" button entirely. |
| `featured` | User input | default `false` |
| `order` | Next multiple of 10 after the current max in that category | List existing files first. In a batch, increment by 10 for each successive repo added to the same category so they don't collide. |
| `draft` | Always `false` | Matches existing entries |

**Slug**: derive from the repo name, lowercased and kebab-cased. It must match
`^[a-z0-9]+(?:-[a-z0-9]+)*$`. Reject and rename if invalid.

Before writing, check `src/content/projects/<category>/<slug>.md` does not
already exist. If it does, ask the user whether to overwrite or pick a new slug.

### Step 4: Write the markdown file

Write to `src/content/projects/<category>/<slug>.md` using this template:

```markdown
---
title: "<Title>"
description: "<One-sentence value prop, ≤240 chars>"
role: "<Role>"
period:
  start: "YYYY-MM"
  end: "YYYY-MM"  # or present
techStack:
  - "Tech 1"
  - "Tech 2"
thumbnail: "/projects/<slug>/thumbnail.svg"
links:
  source: "https://github.com/<owner>/<repo>"  # OMIT this line for private repos
featured: false
order: <N>
---

## Overview

<2–3 paragraphs synthesized from README + code. Match the voice of existing
entries: first-person, technical, specific. Read at least 2 entries from
src/content/projects/personal/ before writing.>

## Highlights

- **<Name>** — <concrete fact backed by the code/README>
- **<Name>** — <concrete fact>
- **<Name>** — <concrete fact>

## Lessons Learned

<1 paragraph. Optional but recommended. Skip if the README has no
retrospective material and you can't infer one honestly from the code.>
```

For **private repos**, end the Overview with a short, neutral sentence such as:

> Source code lives in a private repository.

Do not link the URL anywhere in the body either — keep the repo unreachable
from the rendered page.

### Step 5: Thumbnail placeholder

Create `public/projects/<slug>/thumbnail.svg` only if it does not already
exist. Use a minimal 800×600 SVG matching the visual language of existing
thumbnails — see the example and the **SVG content rules** in
[reference.md](reference.md). After creating it, tell the user it is a
placeholder they should replace.

**Mandatory checks before moving on:**

- Text inside `<text>` elements is **ASCII-only**. No emojis, arrows, bullets,
  middle dots, em-dashes, or smart quotes. If a non-ASCII glyph is
  unavoidable, use an XML numeric entity (e.g. `&#183;` for `·`).
- The five XML specials (`<`, `>`, `&`, `"`, `'`) inside text content are
  escaped (`&lt;`, `&gt;`, `&amp;`, `&quot;`, `&apos;`).
- No control bytes (`0x00`–`0x1F` except tab/newline/CR).
- Validate the file parses as XML:

  ```bash
  xmllint --noout public/projects/<slug>/thumbnail.svg
  ```

  If `xmllint` exits non-zero, fix the file and re-run before continuing —
  the renderer will not silently fall back for a broken-but-present SVG; the
  user will see a broken image.

### Step 6: Validate and clean up

Run **once** after every repo in the batch has been processed, to validate
the content collection as a whole:

```bash
npm run build
```

If Astro rejects the frontmatter, identify which entry failed from the error
output, fix that markdown file, and re-run. Common failures:

- `period.end < period.start` — re-check git log
- `period.start` / `period.end` not matching `YYYY-MM` — strip the day component
- `techStack` empty — add at least one entry
- `slug` not kebab-case — rename the file
- `description` over 240 chars — tighten it
- `thumbnail` path missing — confirm the SVG was written
- duplicate `order` within a category — bump the later one by 10

After the build succeeds, remove every temp clone created during the batch:

```bash
rm -rf "$TMP"  # repeat for each TMP dir created in Step 1
```

Then print the final summary described in **Batch processing**.

## Voice and style

Match the existing entries — read 2 of them before writing the prose:

- First-person, past or present tense, no marketing fluff
- Highlights use the form `**Label** — concrete fact` (em-dash, not hyphen)
- Avoid: "leveraged", "robust", "seamless", "cutting-edge", "powerful"
- Numbers and tech names are specific (e.g. "5 results × $0.005", not "low
  cost"; "NestJS" not "a Node.js framework")
- Lessons Learned is one honest paragraph, not a recap of the Overview

## Anti-patterns

- Do **not** clone into the workspace — only into `mktemp -d`
- Do **not** invent features, metrics, or dates the repo doesn't support
- Do **not** commit the new files — leave that to the user
- Do **not** modify `src/content.config.ts` to make a draft fit; fix the draft
- Do **not** leak a private repo URL — neither in `links.source`, nor in
  `links.live`, nor anywhere in the markdown body. If unsure about visibility,
  ask the user before writing.
- Do **not** abort the whole batch when one repo fails — isolate the failure,
  record it, and keep going with the rest.
- Do **not** process repos in parallel — finish one entry end-to-end before
  starting the next, so slugs, `order` values, and any prompts stay coherent.
- Do **not** put emojis or any non-ASCII characters inside `<text>` elements
  in the thumbnail SVG. They tend to land as control bytes / mojibake and
  break the image. Use ASCII or XML numeric entities (`&#183;`, `&#8226;`).

## Additional resources

- For the full Zod schema, valid category folders, and a thumbnail SVG
  template, see [reference.md](reference.md).
