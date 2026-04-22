---
title: "Volume Generator — One NestJS Shape Across Solana + EVM"
description: "Two repos, one operator model: a NestJS volume-generation bot on Solana (with retry-aware connections), then re-shaped onto EVM through Uniswap's Universal Router + Permit2 — wallet management, scheduler, and PK-safety hardening shared."
role: "Solo Engineer & Cross-Chain Service Designer"
period:
  start: "2024-09"
  end: "2025-01"
techStack:
  - "TypeScript"
  - "NestJS"
  - "Node.js"
  - "Solana Web3.js"
  - "ethers.js"
  - "Uniswap Universal Router"
  - "Permit2 SDK"
  - "Uniswap v3 SDK"
  - "MongoDB"
  - "Mongoose"
  - "Docker"
thumbnail: "/projects/volume-generator/thumbnail.svg"
featured: false
order: 120
draft: true
---

## Overview

Volume Generator is one product across two repos: a NestJS service that runs
market-making style trading volume on DEX pools, first on Solana and then —
re-using the same shape — on EVM chains through Uniswap's Universal Router.
Both sides own a small wallet management layer (`walletBase` service) that
provisions wallets in configurable batches, surfaces their addresses (and
optionally keys) for funding, and hands them off to a scheduler that runs
the trading strategy on a tick.

**Solana edition.** The original. Connections include retry handling and
extra connection slots to ride out RPC hiccups; strategy constants live at
the top of `scheduler.service` so traders can tune cadence and fees without
hunting through the codebase. The README spells out the operational dance —
create wallets, fund them, run the scheduler — and `showWallets` surfaces
the keys exactly once so private keys don't leak into logs by accident.

**EVM edition.** Same NestJS shape, now wired into the Uniswap stack:
`@uniswap/universal-router-sdk`, `@uniswap/permit2-sdk`,
`@uniswap/v3-sdk`, and `ethers v5` for transactions. Permit2 keeps token
allowances scoped per trade instead of permanent. The late commits show
exactly the kind of hardening you'd expect from a bot that operates on real
keys: an explicit "remove show wallets to avoid logging PKs" pass before
the README was finalised. The Solana folder is kept in the tree
(`src/domains/solana`) so EVM and SVM strategies can share helpers if
needed.

Source code lives in private repositories.

## Highlights

- **One operator model, two chains** — batch wallet provisioning, optional
  one-time key surfacing for funding, scheduler-as-config; a single mental
  model serves both bots.
- **Strategy-as-config** — top-of-file constants in `scheduler.service`
  turn the bot into something operators can tune without redeploying code.
- **Resilient connections (Solana)** — explicit fee tuning and extra
  connection slots, plus retry logic, so transient RPC failures don't
  stall the schedule.
- **Universal Router + Permit2 (EVM)** — trades go through Uniswap's
  Universal Router with Permit2 approvals, so token allowances stay scoped
  per trade instead of permanent.
- **PK safety hardening** — late-stage commit removes the show-wallets
  helper from default code paths so private keys never end up in logs.
- **NestJS posture** — Dockerfile + Procfile keep deploys identical between
  local and PaaS, and the modular layout keeps wallet, scheduler, and
  connection concerns separate across both repos.

## Lessons Learned

The hardest operational part of a volume bot isn't the trade — it's keeping
fees bounded and connections alive overnight. Pulling fee + retry behaviour
into a small number of named knobs at the top of the scheduler turned tuning
sessions from code reviews into config tweaks — the same surface every
production trader needs and almost no prototype starts with.

Re-using the Solana bot's NestJS layout for the EVM build paid off
immediately — most of the difference between chains is the SDK call, not
the operational shape. The non-obvious part was tightening logging defaults:
by the time a volume bot is running overnight, "convenient debug output" is
the same thing as "private keys in log files". That posture — *assume
defaults will outlive the human who set them* — is the one I now apply
to any codebase that handles credentials.
