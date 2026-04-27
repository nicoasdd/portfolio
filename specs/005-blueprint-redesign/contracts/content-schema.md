# Contract: Content Collection Schema Deltas

All additions below are **optional** in Zod and MUST NOT break validation on any existing `src/content/**/*.md` file. Paired with `data-model.md` §§1–3. This file is the machine-checkable surface of those schema changes.

---

## 1. `projectSchema` — additive fields

```ts
const iconKeySchema = z.enum([
  "users", "api", "db", "cache", "queue",
  "server", "web", "messaging", "blockchain", "cloud",
]);

const metricTileSchema = z.object({
  label: z.string().min(1).max(20),
  value: z.string().min(1).max(20),
  unit: z.string().min(1).max(20).optional(),
}).strict();

const narrativeSchema = z.object({
  challenge: z.array(z.string().min(1).max(160)).max(4).optional(),
  built:     z.array(z.string().min(1).max(160)).max(4).optional(),
  impact:    z.array(z.string().min(1).max(160)).max(4).optional(),
}).strict().optional();

const architectureNodeSchema = z.object({
  label: z.string().min(1).max(24),
  icon: iconKeySchema,
  note: z.string().min(1).max(40).optional(),
}).strict();

const highlightMetricSchema = z.object({
  label: z.string().min(1).max(40),
  value: z.string().min(1).max(20),
  trend: z.enum(["up", "down", "flat"]).optional(),
}).strict();

// Merged into existing projectSchema:
//
// .extend({
//   highlightMetric: highlightMetricSchema.optional(),
//   metrics:         z.array(metricTileSchema).max(3).optional(),
//   narrative:       narrativeSchema,
//   architecture:    z.array(architectureNodeSchema).max(8).optional(),
//   impactTagline:   z.string().min(1).max(140).optional(),
// })
```

Existing `.strict()` is preserved. `slug`, `period`, `techStack`, `thumbnail`, `screenshots`, `links`, `featured`, `order`, `draft` are unchanged.

---

## 2. `aboutSchema` — additive fields

```ts
const pillIconSchema = z.enum([
  "remote", "onsite", "hybrid",
  "collab", "opportunities", "contract", "sparkle",
]);

const valueIconSchema = z.enum([
  "craft", "performance", "accessibility",
  "pragmatism", "security", "systems",
]);

const availabilityPillSchema = z.object({
  icon: pillIconSchema,
  label: z.string().min(1).max(40),
}).strict();

const contactSchema = z.object({
  email: z.string().email().optional(),
  github: z.string().min(1).max(120).optional(),
  linkedin: z.string().min(1).max(120).optional(),
}).strict();

const valueCardSchema = z.object({
  icon: valueIconSchema,
  title: z.string().min(1).max(24),
  body: z.string().min(1).max(200),
}).strict();

// Merged into existing aboutSchema:
//
// .extend({
//   availabilityPills: z.array(availabilityPillSchema).max(4).optional(),
//   contact: contactSchema.optional(),
//   values: z.array(valueCardSchema).max(4).optional(),
//   process: z.array(z.string().min(1).max(16))
//     .refine((arr) => arr === undefined || arr.length === 5, "process must have exactly 5 steps when supplied")
//     .optional(),
//   processStatement: z.string().min(1).max(240).optional(),
// })
```

Existing `name`, `headline`, `intro`, `photo`, `photoAlt`, `email`, `location`, `availability`, `skills`, `socialLinks`, `resumeUrl` are unchanged.

---

## 3. `siteSchema` — NEW collection

```ts
const credibilityIconSchema = z.enum([
  "frontend", "fullstack", "architecture",
  "web3", "fintech", "marketplace",
  "cloud", "security", "mobile", "design",
]);

const systemsIconSchema = z.enum([
  "aws", "azure", "cloudflare", "gcp",
  "app", "api", "db", "shield",
  "users", "globe", "lock", "code",
]);

const siteSchema = z.object({
  credibilityStrip: z.array(z.object({
    icon: credibilityIconSchema,
    label: z.string().min(1).max(28),
  }).strict()).min(4).max(8),

  systemsStrip: z.array(z.object({
    title: z.string().min(1).max(28),
    description: z.string().min(1).max(80),
    icons: z.array(systemsIconSchema).min(1).max(4),
  }).strict()).length(4),

  heroPrimaryCtaHref: z.string().refine(
    (v) => v.startsWith("/") || /^https?:\/\//.test(v),
    "heroPrimaryCtaHref must be an absolute URL or a path starting with /",
  ).default("/category/personal/"),
}).strict();

const site = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/site' }),
  schema: siteSchema,
});
```

Registered via:

```ts
export const collections = { personal, startup, corporate, about, site };
```

---

## 4. Loader expectations

- `src/lib/site.ts` exports `getSite(): Promise<{ entry, data }>`.
- Mirrors `getAbout()`: throws if zero entries, throws if more than one entry.
- Called from `src/pages/index.astro` (Home — full data) and `src/pages/category/[category].astro` (uses only `systemsStrip`).

---

## 5. Validator integration

`src/integrations/content-validator.ts` must:
1. Continue validating every existing project + about file as before.
2. Emit a **warning** (not error) when a project has `featured: true` and supplies neither `metrics` nor `narrative` — helpful during opt-in rollout.
3. Emit an **error** when the site collection is missing entirely (the redesign ships with a seed, so missing means a content author deleted it).
4. Continue to reject unknown frontmatter keys (`.strict()` enforcement).

---

## 6. Tests

`tests/unit/content-schema.test.ts` MUST cover:
- A minimal existing project file validates unchanged.
- A project with all new optional fields validates.
- A project with `architecture[].icon: "nope"` fails validation with the enum error.
- A project with 5 entries in `metrics` fails (`max(3)`).
- An about doc without any new fields validates.
- An about doc with `process` of length 4 fails; length 5 passes; absent passes.
- A site doc with `systemsStrip` of length 3 or 5 fails (`length(4)`).
- Missing `site` collection surfaces a loader error (not a silent fallback).
