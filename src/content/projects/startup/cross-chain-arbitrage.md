---
title: "Cross-Chain Arbitrage Bot — Scaffold-First Platform"
description: "A deliberate scaffold for a cross-chain arbitrage bot: NestJS skeleton with ethers, PancakeSwap, encrypter, and Telegram helpers wired into the first commit, plus an `eventEmitter` / `eventReceiver` example for strategy authors."
role: "Solo Engineer & Platform Author"
period:
  start: "2023-09"
  end: "2023-09"
techStack:
  - "TypeScript"
  - "NestJS"
  - "Node.js"
  - "ethers.js"
  - "PancakeSwap"
  - "Telegram Bot API"
  - "MongoDB"
  - "Docker"
thumbnail: "/projects/cross-chain-arbitrage/thumbnail.svg"
featured: false
order: 220
draft: true
---

## Overview

A deliberate scaffold for an upcoming cross-chain arbitrage bot. The
single committed snapshot already wires in the things you'd want any
arbitrage strategy to reach for on day one — `infrastructure/shared/ethers`
for chain calls, `infrastructure/shared/pancakeSwap` for DEX queries,
`infrastructure/shared/telegram` for operator alerts, and an
`infrastructure/shared/encrypter` so wallet keys never sit in plaintext.

The `domains/example` slice ships the full `controller` + `service` +
`job` + `eventEmitter` + `eventReceiver` quartet, so the next
contributor sees the convention rather than having to invent it: long-
running scheduled jobs publish events, services react, and the
controller exists for ops endpoints. The bot strategy was planned for
the next iteration — this commit is the load-bearing platform under
it.

Source code lives in a private repository.

## Highlights

- **Scaffold-first deliberate** — the first commit already includes
  ethers + pancakeSwap + telegram + encrypter helpers, so feature work
  doesn't pay scaffolding cost twice.
- **Event-driven shape** — the example domain's `eventEmitter` /
  `eventReceiver` split shows the intended pattern: jobs publish
  observations, services act, no big monolithic worker.
- **Same NestJS posture as the rest of the org** — Dockerfile,
  Procfile, TypeScript path aliases, ESLint + Prettier all match the
  sibling services so deploys and reviews feel familiar.
- **Helpers ready for arbitrage shape** — `bigNumber.helper`,
  `address.helper`, and `file.helper` are the three small things every
  arbitrage codebase eventually grows; getting them in upfront avoided
  later "should this be in utils or domain" debates.

## Lessons Learned

There's a real cost to "we'll add the boilerplate when we need it" —
once a bot is live and someone's chasing a flaky alert at midnight,
nobody wants to refactor where the Telegram client lives. Investing a
single commit's worth of work to ship the helpers, the event split,
and the encryption pattern up front made the eventual strategy code
genuinely easy to start. Scaffolds done well are a leverage decision,
not a perfectionism one — they spend a day to save a quarter.
