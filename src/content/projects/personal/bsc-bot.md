---
title: "BSC Telegram Trading Bot — Two-Year Build to 20k Users"
description: "A two-year, 1200+ commit Telegram trading bot for BSC — price/pump/whale/flashloan alerts, group features, and a freemium plans+points monetisation evolved from a donations-only start. Grew to 20k+ users on a multi-process Node.js stack."
role: "Solo Developer"
period:
  start: "2021-04"
  end: "2023-05"
techStack:
  - "TypeScript"
  - "Node.js"
  - "MongoDB"
  - "Mongoose"
  - "Redis"
  - "Socket.IO"
  - "Telegram Bot API"
  - "ethers.js"
  - "Web3.js"
  - "PancakeSwap"
  - "Jest"
  - "New Relic"
  - "Forever"
thumbnail: "/projects/bsc-bot/thumbnail.svg"
featured: true
order: 290
---

## Overview

A two-year build of a Telegram-first trading bot for the Binance Smart
Chain — Users talk to the bot to add tokens, set
price/pump/whale/flashloan alerts, manage watchlists, link a wallet,
refer friends, and pay through a freemium plans-and-points subscription
(Free → Starter → Advanced → Professional) — a model I evolved from a
donations-only start once the user base outgrew goodwill funding. The
bot grew to over 20,000 users on this architecture.

Architecturally it's not "one bot" — it's four cooperating processes
behind `forever`: a `bot` entry point that owns Telegram I/O, a `core`
process that runs alert evaluation, a `subscriber` that listens to the
chain, and a `jobs` runner for cron tasks (`UPDATE_BEST_LP_JOB`,
`SUBSCRIPTION_JOB`, `FALLBACK_PRICE_FETCH`). MongoDB holds users,
tokens, alerts, and groups; Redis fronts hot reads and rate-limits
external calls; Socket.io carries a control-plane channel between the
processes and a future web UI.

By release 3.x the bot had grown a real product surface: an
auto-token-adder (`feature/auto-add-tokens`), a refactored alert
service (`refactor/alert-service`), group flashloan features
(`feature/add-fl-filters`, `Add UI for flashloan filters`), an ad
slot system (`feature/ads`), and migration tooling for moving fields
across releases.

## Highlights

- **Multi-process by design** — `bot`, `core`, `subscriber`, and
  `jobs` are separate entry points wired through `forever`, so a
  Telegram outage doesn't take down chain ingestion and a slow job
  doesn't block alert delivery.
- **Five alert primitives** — `priceAlert`, `pumpAlert`, `whaleAlert`,
  `flashloanAlert`, and `variationAlert` each have their own
  repository + message + service trio, so adding the next alert type
  is a slot, not a rewrite.
- **Donations → freemium pivot** — started on donations to learn
  what users would actually pay for, then converted to a four-tier
  freemium model (Free / Starter / Advanced / Professional) with a
  points economy (referrals, task completion, BUSD purchases). All
  of it lives inside Telegram — no external checkout flow.
- **Group flashloan UI inside Telegram** — `groupFlashloanMenu`,
  `groupFlashloanRepository`, and a filter UI built out of Telegram
  inline keyboards turn group chats into real trading dashboards.
- **Operationally honest** — `forever-beta-config.json` and
  `forever-prod-config.json`, New Relic instrumentation, a
  `smart-request-balancer` for Pancake calls, fallback price fetch
  jobs, and migration scripts that run on real data — none of it
  optional once you have paying users at five-figure scale.

## Lessons Learned

The biggest single lesson from two years on this codebase: the right
unit of separation for a trading bot isn't "domain" — it's
**process**. Splitting `bot` (latency-sensitive Telegram I/O) from
`core` (CPU-bound alert evaluation) from `subscriber` (chain
ingestion) from `jobs` (long-running cron work) meant I could
restart, profile, and scale each one independently when it mattered
— and it mattered constantly. Monetisation taught the second lesson:
starting on donations was the right way to learn what users would
actually pay for, but the migration to a freemium plans-and-points
model — run entirely inside Telegram, no external checkout — is what
turned the bot into a sustainable product at 20k+ users. Every
feature has to be reachable in three taps, and "the user might be on
a phone in a group chat" is the right design constraint.
