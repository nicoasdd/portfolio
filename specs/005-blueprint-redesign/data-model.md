# Phase 1 Data Model: Blueprint Portfolio Redesign

This document describes the content-collection entities touched by this feature. Every change is **strictly additive** — no existing field is removed, renamed (except internal property names where noted), or made required. Every existing Markdown file under `src/content/` continues to validate and render without edits.

All schemas live in `src/content.config.ts`.

---

## 1. `project` schema (extends existing `projectSchema`)

### New optional fields

| Field | Type | Cardinality | Validation | Used by |
|-------|------|-------------|------------|---------|
| `highlightMetric` | `{ label: string; value: string; trend?: "up" \| "down" \| "flat" }` | 0..1 | `label` ≤ 40, `value` ≤ 20 | Compact featured card single-metric line + sparkline |
| `metrics` | `{ label: string; value: string; unit?: string }[]` | 0..3 items (0, 1, 2, or 3) | Each `label` ≤ 20, `value` ≤ 20, `unit` ≤ 20 | Large featured card 3-tile metric panel |
| `narrative.challenge` | `string[]` | 0..4 bullets | Each ≤ 160 chars | CHALLENGE column |
| `narrative.built` | `string[]` | 0..4 bullets | Each ≤ 160 chars | BUILT column |
| `narrative.impact` | `string[]` | 0..4 bullets | Each ≤ 160 chars | IMPACT column |
| `architecture` | `{ label: string; icon: IconKey; note?: string }[]` | 0..8 nodes | `label` ≤ 24, `icon` in fixed vocabulary, `note` ≤ 40 | Architecture diagram strip |
| `impactTagline` | `string` | 0..1 | ≤ 140 chars | One-liner under project title on home card (falls back to existing `description`) |

### `IconKey` vocabulary (closed set)

`users | api | db | cache | queue | server | web | messaging | blockchain | cloud`

Any `architecture[].icon` not in this set fails Zod validation.

### Rendering rules

- If `metrics.length === 0`, the 3-tile metric panel is **not rendered** (edge case in spec).
- If `metrics.length < 3`, only the supplied tiles render; no empty tiles.
- If `narrative.challenge.length + narrative.built.length + narrative.impact.length === 0`, the CHALLENGE / BUILT / IMPACT row is **not rendered**.
- If `architecture.length < 2`, the architecture strip is **not rendered** (a single node is not informative).
- `highlightMetric` renders only on compact cards; `metrics` renders only on large category-level featured cards. They do not compete.

### Example (augmented, no file contents shown for existing projects)

```yaml
# ... existing frontmatter unchanged ...
highlightMetric:
  label: "users"
  value: "70K"
  trend: "up"
metrics:
  - { label: "TOTAL REGISTERED", value: "70K", unit: "USERS" }
  - { label: "PEAK USERS", value: "~500", unit: "CONCURRENT" }
  - { label: "RAN IN PRODUCTION", value: "~2", unit: "YEARS" }
narrative:
  challenge:
    - "Build a trustworthy platform in a high-risk, high-abuse environment."
    - "Handle real-money flows, inventory volatility, and real-time bets."
  built:
    - "Real-time betting engine with provably fair transparent results."
    - "Steam inventory integration, deposits, withdrawals, and refunds."
  impact:
    - "70,000 total users onboarded organically."
    - "Sustained operation for ~2 years with real revenue."
architecture:
  - { label: "USERS", icon: "users" }
  - { label: "FRONTEND", icon: "web", note: "jQuery / UI" }
  - { label: "REALTIME SERVER", icon: "server", note: "Node.js + Socket.IO" }
  - { label: "STEAM WEB API", icon: "api" }
  - { label: "DB", icon: "db", note: "MySQL — users/bets/trades" }
```

---

## 2. `about` schema (extends existing `aboutSchema`)

### New optional fields

| Field | Type | Cardinality | Validation | Used by |
|-------|------|-------------|------------|---------|
| `availabilityPills` | `{ icon: PillIcon; label: string }[]` | 0..4 | `label` ≤ 40 | About identity hero pill row |
| `contact` | `{ email?: string; github?: string; linkedin?: string }` | 0..1 (all fields optional) | Each ≤ 120 chars; validates against existing `email`/`socialLinks` when absent | Contact lines in identity hero |
| `values` | `{ icon: ValueIcon; title: string; body: string }[]` | 0..4 | `title` ≤ 24, `body` ≤ 200 | "What I care about" value grid |
| `process` | `string[]` | exactly 5 when supplied, else 0 | Each ≤ 16 chars | "Why work with me" process flow |
| `processStatement` | `string` | 0..1 | ≤ 240 chars | Left-side copy of the process banner |

### `PillIcon` vocabulary (closed set)

`remote | onsite | hybrid | collab | opportunities | contract | sparkle`

### `ValueIcon` vocabulary (closed set)

`craft | performance | accessibility | pragmatism | security | systems`

### Backward-compatibility rules

- When `availabilityPills` is absent, render exactly one pill derived from the existing `availability` scalar (if set) and one derived from `location` (if set) — preserves the current About page signal without any edit.
- When `values` is absent, the "What I care about" section is **hidden** (no placeholder).
- When `process` is absent or not exactly 5 entries, the process banner is **hidden**.
- When `contact` is absent, the identity hero falls back to `email` + `socialLinks` items whose `icon` matches `github` or `linkedin`.

---

## 3. `site` collection (NEW)

Purpose: single-document landing-page rails data (credibility strip + footer systems strip). Lives at `src/content/site/site.md`. Zero-content markdown body is acceptable (all data in frontmatter).

### Schema

```ts
const siteSchema = z.object({
  credibilityStrip: z.array(z.object({
    icon: z.enum([
      "frontend", "fullstack", "architecture",
      "web3", "fintech", "marketplace",
      "cloud", "security", "mobile", "design",
    ]),
    label: z.string().min(1).max(28),
  })).min(4).max(8),
  systemsStrip: z.array(z.object({
    title: z.string().min(1).max(28),
    description: z.string().min(1).max(80),
    icons: z.array(z.enum([
      "aws", "azure", "cloudflare", "gcp",
      "app", "api", "db", "shield",
      "users", "globe", "lock", "code",
    ])).min(1).max(4),
  })).length(4),
  heroPrimaryCtaHref: z.string().refine(
    (v) => v.startsWith("/") || /^https?:\/\//.test(v),
    "heroPrimaryCtaHref must be an absolute http(s) URL or a path beginning with /",
  ).default("/category/personal/"),
}).strict();
```

### Rendering rules

- If the `site` collection has zero entries, loaders in `src/lib/site.ts` throw a clear build-time error (symmetric to the existing `about` loader).
- If more than one entry is present, the loader throws — mirroring `getAbout()` semantics.

### Initial seed (shipped with this feature)

```yaml
---
credibilityStrip:
  - { icon: "frontend",    label: "Frontend" }
  - { icon: "fullstack",   label: "Full-stack" }
  - { icon: "architecture", label: "Architecture" }
  - { icon: "web3",        label: "Web3" }
  - { icon: "fintech",     label: "Fintech" }
  - { icon: "marketplace", label: "Marketplace systems" }
systemsStrip:
  - title: "Cloud Infrastructure"
    description: "I love open source. Many projects are public & documented."
    icons: ["aws", "azure", "cloudflare", "gcp"]
  - title: "Systems Thinking"
    description: "User → App → API → DB."
    icons: ["users", "app", "api", "db"]
  - title: "Built For Scale"
    description: "High availability. Security by design. Performance focused."
    icons: ["app", "api", "db"]
  - title: "Open Systems"
    description: "Accessible contrast. Semantic HTML. Focus states."
    icons: ["globe", "shield", "code"]
heroPrimaryCtaHref: "/category/personal/"
---
```

---

## 4. Relationships

- **Project → Architecture nodes** — 1-to-many, stored inline on the project; no separate node collection.
- **About → Values / Pills / Process** — 1-to-many, stored inline on the single profile document.
- **Site (credibility + systems strip) → pages** — singleton, consumed by Home (full) and Category pages (systems strip only).

No cross-collection references (e.g. projects don't reference site, about doesn't reference projects). This keeps build-time graph resolution O(1) per page.

---

## 5. State transitions

None. All entities are static content. Runtime state is limited to `document.documentElement.dataset.theme` (see research §2), which is browser-local and non-persisting beyond `localStorage`.

---

## 6. Validation rules (in addition to per-field validators above)

- `projectSchema.strict()` is preserved — unknown keys still fail validation.
- `aboutSchema.strict()` is preserved.
- `siteSchema.strict()` is used from day one.
- `src/integrations/content-validator.ts` (existing pre-build check) is extended to:
  - **warn** (not error) when a project sets `featured: true` but supplies no `metrics` or `narrative` (because the featured card will render without those blocks) — helps content authors opt into richer presentation without making it required.
  - **error** when `architecture[].icon` or `availabilityPills[].icon` or `values[].icon` is outside the closed vocabulary — this is already implicit in Zod `enum` but the integration surfaces a human-readable message before the Astro build error.

---

## 7. Migration path for existing content

No migration is required. Existing project files render identically through the new `ProjectCard.astro` (compact) using their existing `title`, `description`, `techStack`, `thumbnail`. Existing about renders identically with pills derived from `availability` + `location` fallback. Authors may opt projects into the richer featured-card treatment one at a time by adding the new optional fields — there is no flag day.
