---
title: "Binance P2P Trading Bot — API + Browser Hybrid"
description: "A NestJS Telegram bot that fully automates a Binance P2P trading account: lists ads, reprices against live quotes, confirms orders. Where the public API stops, a long-lived Selenium session takes over — both behind one service interface."
role: "Solo Engineer & Integration Architect"
period:
  start: "2023-03"
  end: "2023-04"
techStack:
  - "TypeScript"
  - "NestJS"
  - "Node.js"
  - "Selenium WebDriver"
  - "Telegram Bot API"
  - "Binance API"
  - "MongoDB"
  - "Mongoose"
  - "Docker"
thumbnail: "/projects/binance-p2p/thumbnail.svg"
featured: false
order: 110
draft: true
---

## Overview

A NestJS service that runs as a Telegram bot and operates a Binance P2P
trading account end-to-end. Traders interact with it through chat commands
(`/login`, `/getqr`, `/getads`, status buttons) and the bot does the work
behind the scenes — pulling quotes, listing or cancelling ads, confirming
orders, and persisting order history to MongoDB.

The interesting half is the Selenium layer: parts of the Binance P2P workflow
have no public API, so the bot keeps a long-lived authenticated browser
session, drives it from a `selenium` domain, and exposes the same operations
through the same NestJS service used by the API integration. That hybrid —
official API where it exists, automated browser where it doesn't — is what
made fully automated repricing possible.

Source code lives in a private repository.

## Highlights

- **Domain-driven NestJS** — `src/domains/{binance,selenium,chatBot,payments,health}`
  separates the trading logic from transport concerns and from the browser
  automation.
- **Selenium fallback for missing endpoints** — a persistent WebDriver session
  with QR/OTP login, performance-log capture, and a webdriver helper turn
  unsupported P2P actions into normal service calls.
- **Conversational UX in Telegram** — inline buttons with confirmations for
  destructive actions (cancel ad, change price), plus jobs that surface
  Binance quote stats on demand.
- **Order persistence** — Mongoose models for ads, orders, and job config
  give the bot enough memory to reconcile state after restarts and crashes.

## Lessons Learned

When part of a workflow lives behind a UI you don't control, the only thing
that keeps the rest of the system sane is putting that part behind a port
you do control. Wrapping Selenium in the same service shape as the official
API meant the rest of the bot — Telegram, jobs, orders — never had to know
which path was taken. That same pattern — *one stable port, swappable
adapters under it* — is what I now reach for whenever a system has to
straddle a third-party seam, from payments rails to chain RPCs to
half-documented vendor SDKs.
