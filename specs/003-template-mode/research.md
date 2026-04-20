# Research: Template Mode

**Feature**: `003-template-mode`
**Date**: 2026-04-17
**Status**: Phase 0 complete — all NEEDS CLARIFICATION resolved

This document captures the technical decisions taken during planning, with the alternatives considered and the reasons for rejection. The intent is that anyone reading the codebase a year from now can understand why we picked the boring option without having to re-derive it.

---

## R1. How do we mark example projects as "examples"?

**Decision**: Slug-prefix detection. A project is an example if its slug begins with `example-`.

**Rationale**:
- Zero schema migration. The Zod schema in `src/content.config.ts` stays untouched.
- Zero per-file authoring overhead — forkers don't have to remember to set a flag when adding their projects.
- The e2e suite already uses these exact slugs (`example-personal`, `example-startup`, `example-corporate`) as anchors in `tests/e2e/project-detail.spec.ts`, so the convention is already cemented in the test layer; making it the marker too removes a parallel naming concept.
- A single canonical predicate lives in `src/lib/examples.ts` so the rule is one line of code, one test, one place to change.

**Alternatives considered**:
- *Frontmatter `isExample: true` field*: rejected because it forces a schema change that propagates to validators, types, the JSON schema contract, and the README's "fields" table — all to express something that is already implied by the slug. The flexibility (a non-`example-`-slugged file could be marked) has no concrete use case the user has asked for.
- *Separate directory (e.g., `src/content/examples/`)*: rejected because the examples must live in the same content collections the rest of the site uses — that's the entire point of them being valid fixtures. Splitting collections would require rewiring `getStaticPaths`, the validator, and every test. Cost vastly exceeds benefit.
- *Filename convention without slug propagation* (e.g., file is `example-personal.md` but slug is set to something else in frontmatter): rejected because Astro's `slug` field can override the filename; tying the example marker to the slug (with the filename mirroring it as a convention) is more robust than tying it to the filename alone.

---

## R2. Where is `HIDE_EXAMPLES` read?

**Decision**: Read once, server-side, from `process.env.HIDE_EXAMPLES` via a typed helper exported from a new file `src/lib/env.ts`. Never expose to the client bundle.

**Rationale**:
- Astro's `astro build` runs in Node; `process.env` is the canonical surface.
- The flag is a build-time decision — it changes which pages exist in `dist/`, not which pages a client requests. There is zero need for it to reach the browser.
- `import.meta.env` would require a `PUBLIC_` prefix to be available at runtime, which would unnecessarily ship the flag to clients and pollute the public env namespace.
- Centralizing in `src/lib/env.ts` gives us:
  - One typed coercer (`'true' | '1' | 'yes'` → `true`, anything else → `false`) instead of repeating string comparisons.
  - One place to add future flags (e.g., `HIDE_DRAFTS`) without sprawl.
  - One test that locks down the parsing rules.

**Alternatives considered**:
- *`import.meta.env.HIDE_EXAMPLES`*: rejected — see above (client-bundle leak, `PUBLIC_` prefix).
- *Astro config plugin reading env into `defineConfig`*: rejected as over-engineering for a single boolean. A 5-line helper is enough.
- *Inline `process.env.HIDE_EXAMPLES === 'true'` at every read site*: rejected — three or four read sites are enough to drift; the helper costs nothing and locks the parsing.

---

## R3. Where does the filter run?

**Decision**: At the data-loading layer in `src/lib/projects.ts`. Specifically, augment `shouldInclude(entry)` so it returns `false` when `HIDE_EXAMPLES` is true and the slug starts with `example-`.

**Rationale**:
- Every page (`/`, `/category/[category]/`, `/projects/[slug]/`) and the sitemap consume from `getAllProjects()`, `getByCategory()`, `getFeatured()`, or directly from `getCollection(...)` via these helpers. A filter at this layer is impossible to bypass accidentally.
- `getStaticPaths` for `/projects/[slug]/` already iterates over `getAllProjects()`-derived data, so example pages stop being generated; nothing reaches `dist/`.
- `@astrojs/sitemap` derives URLs from the actual generated pages; filtering at the loader removes them from the sitemap automatically with no sitemap-specific code.

**Alternatives considered**:
- *Filter at each consumer (page templates)*: rejected — three pages × multiple component loops × the sitemap = at least seven places to keep in sync. Bug magnet.
- *Custom Astro integration that prunes generated pages post-build*: rejected — slower (we'd pay the cost of building + then deleting), uglier (post-hoc surgery on `dist/`), and more error-prone (could miss in-HTML references to hidden URLs).
- *`getStaticPaths` filter only*: would prevent pages from being generated but landing-page grid would still try to render hidden examples. Loader-layer filter is strictly more correct.

---

## R4. What about the About profile? Does `HIDE_EXAMPLES` hide it too?

**Decision**: No. `HIDE_EXAMPLES` only affects projects. The About profile is not affected.

**Rationale**:
- There is exactly one About entry by design (`src/content/about/profile.md`) — the validator already rejects multiple entries.
- The forker's intended workflow is "open `profile.md`, edit in place, ship" — not "hide the example, add my own." Making the About hideable would imply support for multiple About entries, which is explicitly out of scope.
- The seeded `profile.md` is a working starter, not an "example" in the same sense as the project cards. Forkers replace its content; they don't need a way to suppress it.

**Alternatives considered**:
- *Apply `HIDE_EXAMPLES` to About too*: rejected — would break the About page entirely (no profile to render) when the flag is on, unless we also added a "real About" mechanism. Out of scope for this feature.
- *Add a sibling `HIDE_ABOUT` flag*: rejected — no user need has been articulated. YAGNI.

---

## R5. How does the deploy workflow learn whether to hide examples?

**Decision**: Two complementary mechanisms in `.github/workflows/deploy.yml`:
1. A repository variable `HIDE_EXAMPLES` (set in repo Settings → Variables) that defaults to `false` if unset. Forkers and the original author both use this for explicit control.
2. An automatic override: when the deploying ref is `refs/heads/content/add-projects`, the build step sets `HIDE_EXAMPLES=true` regardless of the repository variable.

The `branches:` trigger list is extended to include `content/add-projects` so the author's branch deploys naturally — but only fires if the branch actually exists on the fork (so forkers without that branch are unaffected).

**Rationale**:
- Forkers do nothing: variable unset → `false` → examples visible. They get a working site immediately.
- The original author does nothing for the common case: pushes to `content/add-projects` → auto-detected → `true` → examples hidden. No yaml editing required.
- For non-default workflows (e.g., the author wants to deploy from a differently named branch), the repository variable provides explicit control without code changes.
- The auto-detection rule is a single line of conditional shell expression in YAML — small, transparent, easy to undo if undesired.

**Alternatives considered**:
- *Workflow input only* (the operator must trigger via `workflow_dispatch` to pick a value): rejected — defeats automatic deploy on push.
- *Branch-specific deploy file (`.github/workflows/deploy-personal.yml` on `content/add-projects` only)*: rejected — duplicates configuration, drifts over time, requires explaining "two deploy files" in the README.
- *Environment-based*: GitHub Actions environments support per-environment variables. Rejected as heavier than needed (requires creating the environment, configuring protection rules) for a single boolean.

---

## R6. How do we make sure forkers see a clear error when they delete the examples?

**Decision**: A three-layer safety net, ordered by how early the forker hits it.

1. **Build-time (warning)**: `src/integrations/content-validator.ts` checks for the three canonical example files and emits a `console.warn(...)` with a one-line pointer to the README's Common Issues section if any are missing. This fires on every `npm run build` and `npm run dev` startup, so a forker iterating locally sees it immediately.
2. **Test-time (hard fail)**: a new `tests/unit/examples.test.ts` asserts the three files exist and have the expected slug. Failure message names the missing file and links the README anchor. Runs in CI on every PR — blocks merge.
3. **E2E-time (organic fail)**: existing tests in `tests/e2e/project-detail.spec.ts` would fail with 404s if examples are missing. We don't add anything for this layer — it's the existing safety net, and it's the worst of the three because the failure message is generic.

**Rationale**:
- Three layers, ordered by error-message quality and earliness, gives the forker the best chance of hitting a *good* error first.
- The build-time warning is non-fatal (a determined forker who has chosen to delete examples can still build) but loud (every build prints it). This balances "don't lock people out" with "make damn sure they see it."
- The test is the actual gate — CI fails, PR can't merge to `main`. Same forker who decided to delete examples will get blocked from pushing to their own `main` if they forget to also remove or skip the test.

**Alternatives considered**:
- *Hard-fail at build time*: rejected — too restrictive. A forker who wants to remove examples and adopt a different test strategy should be able to (by editing the test), without us holding their build hostage.
- *Test-only*: rejected — the build-time warning is cheap and significantly improves discoverability for someone who hasn't run tests yet.
- *Custom CLI command (`npm run check:examples`)*: rejected — extra script to remember; the existing build/test commands already run on every iteration cycle.

---

## R7. What about `HIDE_EXAMPLES` in `dev` and `preview` modes?

**Decision**: Honored everywhere. `dev`, `build`, and `preview` all read from the same `process.env.HIDE_EXAMPLES` via the same helper.

**Rationale**:
- Forkers iterating on their personal site locally with `HIDE_EXAMPLES=true npm run dev` should see what production will see. Diverging dev from build would cause "works on my machine" bugs.
- Astro's dev server runs the same content collections code paths as the build — we get this for free by filtering in `src/lib/projects.ts`.

**Alternatives considered**: none — the reverse (only honor in `build`) would be a footgun.

---

## R8. Default value: should `HIDE_EXAMPLES` default to `true` or `false`?

**Decision**: `false` (examples visible by default).

**Rationale**:
- Forker UX: a fresh fork with no env var set must produce a working, populated site. If we defaulted to `true`, a fresh fork would render a half-empty landing page until the forker discovers the flag — terrible first impression.
- Test UX: the user explicitly stated tests run with `HIDE_EXAMPLES=false` (default) so examples are present as fixtures. Matching the default to test expectations means there's no env juggling for `npm run test`.
- Author UX: the original author's `content/add-projects` branch is a one-time setup (set the repo variable or rely on the auto-detection). Tiny one-time cost vs. recurring forker friction.

**Alternatives considered**:
- *Default `true`*: rejected for the reasons above.

---

## R9. Should we also filter by category, e.g. `HIDE_EXAMPLES=personal` to hide only personal examples?

**Decision**: No. Boolean only.

**Rationale**:
- The user asked for a boolean. Adding parsed values introduces edge cases (what if there are no real personal projects but we hide the example?) without solving any stated need.
- Easy to add later if a use case emerges — change the parser in `src/lib/env.ts`, no other code changes.

**Alternatives considered**: deferred to a hypothetical future feature.

---

## R10. Documentation strategy for the dual-branch workflow

**Decision**: README contains a short, opinionated Quick Start (forker-focused) and a Common Issues section. A separate `docs/dual-branch-workflow.md` holds the long-form author-side explanation (rebase recipes, conflict expectations, deploy auto-detection, recommended cadence).

**Rationale**:
- Forkers don't need (or want) to read about the original author's personal-branch maintenance — pushing it into the README would dilute the Quick Start.
- The author and curious forkers ("How does the original repo author handle this?") can deep-link from the README to `docs/dual-branch-workflow.md`.
- Keeping it as a separate file means future updates to the author workflow don't churn the README.

**Alternatives considered**:
- *Single huge README*: rejected — bad scannability, slower to find Quick Start.
- *Wiki page on GitHub*: rejected — not version-controlled with the repo, can't be reviewed in PRs, can't be opened in an offline clone.
