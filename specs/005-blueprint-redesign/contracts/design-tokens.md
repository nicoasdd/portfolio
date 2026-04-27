# Contract: Design Tokens

This contract defines the named token set that every component in this feature MUST consume. Components MUST NOT hard-code color hex values, pixel spacings outside the scale, or font sizes outside the scale. Token names are stable — changing a token's *name* is a breaking change to this contract; changing a token's *bound value* (e.g. tweaking the cyan accent shade) is a non-breaking refinement.

---

## 1. Color tokens

Defined as CSS custom properties under `:root[data-theme="dark"]` and `:root[data-theme="light"]` in `src/styles/global.css`.

| Token | Role | Dark value | Light value |
|-------|------|------------|-------------|
| `--bp-canvas` | Page background | `#0B1326` | `#F2F5FB` |
| `--bp-surface` | Card / panel background | `#0F1A33` | `#FFFFFF` |
| `--bp-surface-raised` | Elevated panel (e.g. metric tile inside card) | `#132246` | `#F8FAFC` |
| `--bp-text` | Primary text | `#E6F0FF` | `#0B1326` |
| `--bp-text-mut` | Secondary / caption text | `#9AB0D6` | `#475569` |
| `--bp-line` | Hairline separators (solid) | `#22D3EE` at 40 % alpha | `#0E7490` at 40 % alpha |
| `--bp-line-soft` | Hairline separators (subtle) | `#22D3EE` at 18 % alpha | `#0E7490` at 18 % alpha |
| `--bp-accent` | Primary accent (CTAs, indices, active nav) | `#22D3EE` | `#0891B2` |
| `--bp-accent-hover` | Accent hover | `#67E8F9` | `#0E7490` |
| `--bp-accent-contrast` | Text on accent background | `#0B1326` | `#FFFFFF` |
| `--bp-focus` | Focus ring color | `#22D3EE` | `#0E7490` |
| `--bp-grid` | Faint grid-paper background lines | `#22D3EE` at 8 % alpha | `#0E7490` at 8 % alpha |
| `--bp-danger` | Form errors only (no current use) | `#FB7185` | `#BE123C` |

### Usage rules

- Text over `--bp-canvas` or `--bp-surface` MUST use `--bp-text` or `--bp-text-mut`.
- Cyan text on a non-accent background MUST be ≥ 18 px or ≥ 14 px bold to stay AA.
- Accent background buttons MUST pair `--bp-accent` with `--bp-accent-contrast`.
- Hairlines MUST use `--bp-line` (or `--bp-line-soft` for inner subdivisions); they MUST NOT be pure `--bp-accent` at 100 % alpha.

---

## 2. Spacing tokens

Defined in the Tailwind 4 `@theme` block; emitted as `--spacing-bp-{n}` custom properties and as `gap-bp-*` / `p-bp-*` / `m-bp-*` utilities.

| Token | Pixels |
|-------|--------|
| `--spacing-bp-1` | 8 px |
| `--spacing-bp-2` | 16 px |
| `--spacing-bp-3` | 24 px |
| `--spacing-bp-4` | 32 px |
| `--spacing-bp-5` | 48 px |
| `--spacing-bp-6` | 64 px |
| `--spacing-bp-7` | 96 px |

### Usage rules

- Every gap, padding, and margin that is part of the blueprint design MUST resolve to one of these seven values.
- Component-internal tight spacing (e.g. chip icon-to-label, sparkline-to-metric) MAY use Tailwind's default `px` / `1` / `2` scales only when the mockup demonstrably shows sub-8-px rhythm.

---

## 3. Typography tokens

Defined in the Tailwind 4 `@theme` block.

| Token | Value | Use |
|-------|-------|-----|
| `--font-bp-sans` | `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | All prose, UI, display |
| `--font-bp-mono` | `ui-monospace, "SF Mono", Menlo, Consolas, monospace` | Card indices, code fences |
| `--text-bp-xs`   | `0.75rem` / 1.4 | Captions, pill labels |
| `--text-bp-sm`   | `0.875rem` / 1.5 | Secondary prose |
| `--text-bp-base` | `1rem` / 1.6 | Body prose |
| `--text-bp-lg`   | `1.125rem` / 1.5 | Card titles |
| `--text-bp-xl`   | `1.25rem` / 1.4 | Section eyebrows |
| `--text-bp-2xl`  | `1.5rem` / 1.3 | H3 / callout heading |
| `--text-bp-3xl`  | `1.875rem` / 1.25 | H2 |
| `--text-bp-hero` | `clamp(2.5rem, 5vw + 1rem, 4.5rem)` / 1.05 | Home H1, About name |

### Usage rules

- `h1` uses `--text-bp-hero`; `h2` uses `--text-bp-3xl`; `h3` uses `--text-bp-2xl`.
- `font-weight` MUST be 700 for h1/h2/h3, 600 for card titles and eyebrows, 400/500 for body.
- `letter-spacing` MUST be `-0.01em` on display text, normal on body.

---

## 4. Radius tokens

| Token | Value | Use |
|-------|-------|-----|
| `--radius-bp-sm` | `4 px`  | Pill chips, small buttons, focus ring |
| `--radius-bp-md` | `8 px`  | Inputs, medium buttons |
| `--radius-bp-lg` | `12 px` | Cards, metric tiles |
| `--radius-bp-xl` | `20 px` | Hero CTAs (primary) |

No other radii are permitted in blueprint-styled components.

---

## 5. Border tokens

| Token | Value | Use |
|-------|-------|-----|
| `--border-bp-hairline` | `1px solid var(--bp-line)` | Card outlines, metric tiles, image frames |
| `--border-bp-hairline-soft` | `1px solid var(--bp-line-soft)` | Internal section dividers |
| `--border-bp-dashed` | `1px dashed var(--bp-line)` | Blueprint measurement guides, architecture strip connectors |

---

## 6. Breakpoints

| Name | Min-width | Max-width |
|------|-----------|-----------|
| `mobile` | `320px` | `767px` |
| `tablet` | `768px` | `1023px` |
| `laptop` | `1024px` | `1439px` |
| `desktop` | `1440px` | — |

Every layout MUST render without horizontal scroll at the *minimum* of each range.

---

## 7. Focus ring contract

```css
:focus-visible {
  outline: 2px solid var(--bp-focus);
  outline-offset: 2px;
  border-radius: 2px;
}
```

This declaration lives in the `@layer base` block of `global.css`. Components MUST NOT override it with `outline: none` except when the focus ring is visibly replicated elsewhere (e.g. a border-color change on the exact same element, equally contrasted).

---

## 8. Motion contract

| Behavior | When motion is allowed | When `prefers-reduced-motion: reduce` |
|----------|------------------------|---------------------------------------|
| Card hover | 150 ms ease-out border-color | No transition; instant color change |
| Filter chip active | 120 ms ease-out background | No transition |
| Theme toggle | Instant (attribute swap) | Instant |
| Scroll reveals | **None** in either mode | **None** |

Every transition MUST sit inside a `@media (prefers-reduced-motion: no-preference)` block; the outside declaration is the final state.

---

## 9. Contract stability

This contract is **v1** for the feature. Any change to a token *name* between now and ship date is a breaking change and MUST be reflected in every consumer. Changes to a token *value* (e.g. tweaking cyan for light theme AA) are non-breaking and do not require contract version bump.
