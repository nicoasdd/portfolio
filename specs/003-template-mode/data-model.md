# Data Model: Template Mode

**Feature**: `003-template-mode`
**Date**: 2026-04-17

This feature introduces no new persisted data and no new content-schema fields. The "data model" here is the small set of in-memory primitives that the build-time filter uses.

---

## 1. `HIDE_EXAMPLES` environment variable

**Source**: `process.env.HIDE_EXAMPLES`
**Read site**: `src/lib/env.ts` exports `hideExamples(): boolean`. Read once per build.
**Type**: `boolean` (after coercion).
**Default**: `false` when unset, empty, or any falsy string.

### Coercion rules

| Raw `process.env.HIDE_EXAMPLES` (case-insensitive) | Coerced value |
|---|---|
| `'true'`, `'1'`, `'yes'`, `'on'` | `true` |
| `'false'`, `'0'`, `'no'`, `'off'`, `''`, unset | `false` |
| Any other string | `false` (with a one-time `console.warn` naming the unrecognized value) |

### Validation

- Coercion never throws; the helper always returns a boolean. Builds never fail because of a malformed flag — they just fall back to the safe default (visible examples).
- Unrecognized values trigger a one-time warning so a typo (e.g., `HIDE_EXAMPLES=ture`) is visible in build logs without breaking the build.

### Lifecycle

- Read at module-load time of `src/lib/env.ts`.
- Cached in a module-level constant; downstream callers always see a consistent value within a single build.
- Not exposed to the client bundle (no `PUBLIC_` prefix; never imported from a `.astro` component's client script).

---

## 2. Example slug marker

**Type**: predicate function `isExampleSlug(slug: string): boolean`.
**Module**: `src/lib/examples.ts`.
**Definition**: returns `slug.startsWith('example-')`.

### Justification

- Lowercase only — slugs are normalized to lowercase on load (existing behavior in `src/integrations/content-validator.ts`).
- The single hyphen after `example` is intentional: it prevents `examples-of-x` (a hypothetical real project) from being misclassified.
- Centralizing as a predicate, rather than inlining the `startsWith` check, means rule changes (e.g., adopting a frontmatter `isExample` field later) touch one file.

---

## 3. Required-example registry

**Type**: `readonly RequiredExample[]` where:

```ts
interface RequiredExample {
  category: 'personal' | 'startup' | 'corporate';
  slug: string;          // e.g., 'example-personal'
  filePath: string;      // e.g., 'src/content/projects/personal/example-personal.md'
}
```

**Module**: `src/lib/examples.ts` (alongside the predicate).

**Constant**:

```ts
export const REQUIRED_EXAMPLES: readonly RequiredExample[] = [
  {
    category: 'personal',
    slug: 'example-personal',
    filePath: 'src/content/projects/personal/example-personal.md',
  },
  {
    category: 'startup',
    slug: 'example-startup',
    filePath: 'src/content/projects/startup/example-startup.md',
  },
  {
    category: 'corporate',
    slug: 'example-corporate',
    filePath: 'src/content/projects/corporate/example-corporate.md',
  },
] as const;
```

### Consumers

- `tests/unit/examples.test.ts` — asserts every `filePath` exists on disk.
- `src/integrations/content-validator.ts` — emits a warning naming any missing `filePath` plus the README pointer.

Single source of truth. Adding or renaming an example is a one-file change.

---

## 4. `ProjectWithMeta` filter contract

**Existing type** (in `src/lib/projects.ts`, unchanged):

```ts
export interface ProjectWithMeta {
  entry: ProjectEntry;
  category: CategoryKey;
  slug: string;
  url: string;
}
```

**Filter contract**: `getAllProjects()`, `getByCategory(...)`, and `getFeatured()` MUST exclude any `ProjectWithMeta` whose `slug` satisfies `isExampleSlug(slug)` when `hideExamples()` returns `true`. Otherwise they MUST behave exactly as before.

### Implementation note

- The filter lives inside `shouldInclude(entry)` — the existing predicate that already strips drafts in production. Adding one more clause keeps the filter cohesive.
- The check operates on the resolved slug (post-`deriveSlug`), not the raw filename, because frontmatter `slug:` overrides exist in the schema.

---

## 5. Sitemap consequences

`@astrojs/sitemap` reads from the actual generated pages in `dist/`. Because the example pages are never generated when `HIDE_EXAMPLES=true` (their `getStaticPaths` entries are filtered out upstream), the sitemap has no example URLs without any sitemap-specific code change.

### Verifiable assertion (covered by quickstart)

```bash
HIDE_EXAMPLES=true npm run build
grep -c 'example-' dist/sitemap-*.xml || true   # expected: 0
```

---

## 6. State-transition diagram

There is no per-entity state machine. The only "state transition" is the boolean transition of `HIDE_EXAMPLES` between builds:

```text
HIDE_EXAMPLES unset/false   →   build emits  /, /about/, /category/{p,s,c}/, /projects/example-{p,s,c}/, /projects/<real-*>/
HIDE_EXAMPLES=true          →   build emits  /, /about/, /category/{p,s,c}/,                              /projects/<real-*>/
```

No persisted state. No migrations. No backward-compatibility shims required.
