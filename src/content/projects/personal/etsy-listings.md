---
title: "Etsy + Cults Multi-Marketplace Listing Pipeline"
description: "A local Next.js tool that turns one canonical listing JSON into ready-to-publish Etsy and Cults entries, with OAuth 2.0 + PKCE, SigV4-signed Asendia shipping, and a ChatGPT image-to-listing drafter behind it."
role: "Solo Engineer & Integration Architect"
period:
  start: "2026-03"
  end: "2026-03"
techStack:
  - "TypeScript"
  - "Next.js"
  - "React"
  - "Tailwind CSS"
  - "Etsy API"
  - "Cults API"
  - "OAuth 2.0 (PKCE)"
  - "OpenAI"
  - "AWS Signature v4"
thumbnail: "/projects/etsy-listings/thumbnail.svg"
links:
  source: "https://github.com/nicoasdd/etsy-listings"
featured: false
order: 5
draft: true
---

## Overview

A local-first tool that compresses my craft-shop publishing flow from "an hour
of clicking" to "paste JSON, hit upload". It connects to Etsy via OAuth 2.0
with PKCE, exchanges the same listing JSON into the Etsy and Cults APIs, and
pulls Asendia shipping rates so postage is set correctly per country.

ChatGPT (Codex) integration turns a single product photo into a draft listing
JSON — title, description, tags, materials, price band — that I edit and then
push live in one click.

## Highlights

- **Multi-marketplace** — one canonical listing JSON, two destinations (Etsy + Cults), with marketplace-specific transforms isolated behind a clear interface.
- **OAuth done right** — PKCE flow, automatic refresh-token rotation, encrypted local token storage, and a clear "you are connected as X" status panel.
- **AI-assisted drafting** — the ChatGPT image-to-listing flow turns a single product photo into editable structured JSON, dramatically cutting time-to-publish.
- **Real shipping** — Asendia integration (AWS SigV4 signed) computes per-country postage instead of relying on flat estimates.

## Lessons Learned

The most valuable part of building integrations isn't the integration itself —
it's the canonical schema in the middle. Writing the listing JSON shape *first*
made adding Cults a few-hour job instead of a rewrite — the same lesson I keep
re-learning in payments-adjacent work, where the "boring" internal contract
between systems is what determines whether the next channel takes a sprint or
a quarter.
