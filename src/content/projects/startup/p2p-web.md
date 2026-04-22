---
title: "P2P Web — Org-Standard Frontend Skeleton, Reused"
description: "The Next.js + Tailwind frontend skeleton for a P2P crypto trading product — pre-shaped routes (`pages/ads`, `pages/home`, `pages/api`), web3 chain providers, i18n, and the org's standard Husky/Commitlint/Prettier pipeline."
role: "Frontend Engineer"
period:
  start: "2023-04"
  end: "2023-04"
techStack:
  - "TypeScript"
  - "Next.js"
  - "React"
  - "Tailwind CSS"
  - "Web3"
  - "Husky"
  - "Conventional Commits"
thumbnail: "/projects/p2p-web/thumbnail.svg"
featured: false
order: 130
draft: true
---

## Overview

The Next.js skeleton for a P2P trading product, kicked off as a single
intentional initial commit. It's the same opinionated stack as the
adjacent Gamewall web app — Tailwind, TypeScript, Husky + Conventional
Commits + Commitlint + Import Sorter + Prettier + ESLint, plus i18n and a
configurable web3 chain provider — pre-shaped around the routes the P2P
product needs (`pages/ads`, `pages/home`, `pages/api`).

Source code lives in a private repository.

## Highlights

- **Pre-shaped routes** — `pages/ads` and `pages/home` (plus an `_app.tsx`
  shell) are scaffolded so the first feature PR doesn't have to invent
  the URL layout.
- **Same playbook as the rest of the org** — i18n through
  `providers/lang`, web3 chain config through `providers/web3/chain.ts`,
  and the same lint / commit pipeline as Gamewall.
- **Tooling-first** — Husky, lint-staged, Commitlint, Prettier, ESLint
  and import-sorter are all wired into the initial commit, so the next
  contributor inherits a known shape.

## Lessons Learned

Re-using the same opinionated frontend skeleton across products turned
the "set up a Next.js app" step into a non-event. The cost of repeating
the toolchain per repo was tiny compared to the savings of every
contributor knowing exactly where things live — the multi-repo version
of the same lesson that internal frameworks teach inside a single
codebase: shared shape is what makes velocity scale beyond one person.
