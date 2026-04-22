---
title: "Wanaka Farm Player Toolchain — Two-Repo Data + Bot Split"
description: "A two-repo player toolchain for the Wanaka Farm marketplace: a Node.js crawler normalising land + season state into MongoDB, plus a Telegram bot that fans personal alerts on listings, last-sold prices, and replants from REST + on-chain."
role: "Solo Engineer"
period:
  start: "2021-09"
  end: "2021-11"
techStack:
  - "Node.js"
  - "Telegram Bot API"
  - "MongoDB"
  - "Mongoose"
  - "Web3.js"
  - "Ethers.js"
  - "node-fetch"
  - "dotenv"
thumbnail: "/projects/wanaka-farm/thumbnail.svg"
featured: false
order: 140
draft: true
---

## Overview

A two-repo toolchain around the Wanaka Farm play-to-earn marketplace,
designed so the data layer and the player-facing layer could evolve
independently.

**Land Data crawler.** A small Node.js worker that hits the public
marketplace endpoints, normalises each land into a Mongoose model that
includes seasonal state, and writes it to MongoDB so the rest of the
toolchain can query lands without hammering the upstream API. The codebase
is deliberately small — `src/services/landService.js` is the whole crawl
loop — but it owns the data contract that downstream tools rely on: a
stable land model with seasons, prices, and identifiers that survive
upstream API changes.

**Tracking bot.** A Telegram bot that gives Wanaka Farm players a personal
radar over the marketplace. Users register through chat, configure filters
(land type, price, plot, alerts), and the bot watches the marketplace +
on-chain events in the background and pings them when something matches.
It pulls from two sides of the world: the marketplace REST data (kept
fresh by the Land Data crawler) and on-chain events through Web3 / Ethers,
so the bot reacts to both listings and contract-level activity such as
replants or last-sold prices.

Source code lives in private repositories.

## Highlights

- **Single-purpose worker** — `npm start` runs the crawler, no framework
  ceremony, no scheduler beyond what the host provides.
- **Season-aware land model** — the schema explicitly tracks season state
  per land so seasonal modifiers don't get lost in the snapshot.
- **Decoupled fetch + react** — the bot queries the database instead of
  scraping live, so notification logic stays fast and independent of
  marketplace latency.
- **Per-user filters** — alerts, plots, and lands each have their own
  Telegram menu and Mongoose model so users can scope notifications to
  what they actually care about.
- **Marketplace + on-chain inputs** — combines the REST snapshot from the
  data crawler with Web3 event reads, giving "last sold" and "replant"
  notifications on top of plain listing alerts.
- **Conversational menu** — `src/telegram/{land,plot,alert,marketplace}`
  splits the bot into intent-shaped folders so each command stays small
  and testable in isolation.
- **Pluggable services** — `notifyUsers`, `bot`, `web3`, `landService` and
  `gamelandService` each handle one concern, making it easy to add a new
  source or notification channel without touching the rest.

## Lessons Learned

Splitting "fetch and normalise" from "consume and react" was the right call
even at this size. The bot stayed fast and offline-capable, and any change
to upstream payloads only needed to be absorbed in one tiny service. Two
clean inputs (marketplace REST + on-chain events) made the bot's most
useful feature — "tell me when something just sold and the floor moved" —
trivial to express. The bot itself stayed boring; the win came from
getting the data shape right upstream. That ingest-vs-react split is
the same architectural shape I now reach for the moment a system has
both a polling source and a streaming source: it's almost always
cheaper to absorb the difference once than to push it into every
consumer.
