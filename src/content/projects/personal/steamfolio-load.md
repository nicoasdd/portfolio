---
title: "Steamfolio Inventory Loader — Zero-Backend Glue"
description: "A local-first Next.js app that imports a Steam CS2 inventory into Steamfolio against a disabled vendor endpoint — API key in `localStorage` only, every imported item stamped with a back-link to its Steam source for provenance."
role: "Solo Developer"
period:
  start: "2026-03"
  end: "2026-03"
techStack:
  - "TypeScript"
  - "Next.js"
  - "React"
  - "Tailwind CSS"
  - "Steam Web API"
  - "Steamfolio API"
thumbnail: "/projects/steamfolio-load/thumbnail.svg"
links:
  source: "https://github.com/nicoasdd/steamfolio-load"
order: 20
draft: true
---

## Overview

A small, local-first web app that loads a Steam account's CS2 inventory into
a [Steamfolio](https://steamfolio.com) portfolio. Steamfolio's own inventory
import endpoint is disabled, so this tool fills the gap by combining an
alternative inventory source with the Steamfolio write API.

The Steamfolio API key lives in `localStorage` only — nothing is sent to a
server I control — and every imported item's note field is stamped with a link
back to the origin Steam account so provenance is never lost.

## Highlights

- **Zero backend** — everything runs in the browser; the API key is stored locally and the Steam profile is fetched directly.
- **Provenance preserved** — every imported item carries a back-link to the source Steam account in its note field.
- **Forgiving identifier handling** — accepts SteamID, vanity URL, or full profile URL and resolves to a canonical SteamID64.
- **Idempotent imports** — re-running an import on the same account skips items already present in the destination portfolio.

## Lessons Learned

Building a tool that explicitly works around a disabled vendor endpoint is a
useful exercise in writing code that is honest about its assumptions: this is a
glue layer, not a product, and the README says so. That honesty made the design
decisions much easier — a small reminder that naming the *shape* of what you're
shipping (glue layer, scaffold, prototype, product) is itself a load-bearing
design decision.
