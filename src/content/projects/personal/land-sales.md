---
title: "Play-to-Earn Land Sales Notifier"
description: "A Telegram bot built around one play-to-earn marketplace's land-sales feed: REST polling + Web3 events fan into a single `notifyUsers` path, with MongoDB-backed dedupe so restarts and scheduler hiccups don't double-notify."
role: "Solo Engineer"
period:
  start: "2021-05"
  end: "2021-09"
techStack:
  - "Node.js"
  - "Ethers.js"
  - "Web3.js"
  - "Telegram Bot API"
  - "MongoDB"
  - "Mongoose"
  - "node-fetch"
thumbnail: "/projects/land-sales/thumbnail.svg"
featured: false
order: 180
draft: true
---

## Overview

A small Telegram bot built around a single play-to-earn marketplace's
"land sales" stream. It pulls the marketplace feed, deduplicates against
a Mongoose `sell.model.js`, and notifies registered users when fresh sales
appear. The same plumbing also handles new-LP-style subscription messages,
so the bot doubles as a generic "tell me when X happens" notifier on top of
Web3 + REST sources.

Code is split into focused services (`getLandSales`, `subscribeNewLp`,
`notifyUsers`, `telegramBot`, `web3`) so each input or output channel is
isolated and easy to swap.

Source code lives in a private repository.

## Highlights

- **Marketplace polling with persistence** — `sell.model.js` keeps a record
  of seen sales so restarts and scheduler hiccups don't double-notify.
- **Multiple inputs into one bot** — REST marketplace data and Web3
  subscriptions feed the same notification path through `notifyUsers`.
- **Per-client subscriptions** — `client.model.js` stores who wants what,
  so notifications stay scoped instead of fan-out spam.

## Lessons Learned

The "send Telegram messages when marketplace state changes" pattern shows
up in nearly every play-to-earn project. Building it once with clear inputs
(`web3`, `getLandSales`) and clear outputs (`notifyUsers`, `telegramBot`)
made every later bot in the same shape a half-day project — the first time
I saw, concretely, how much leverage a tiny set of named ports can compound
into across a portfolio of small services.
