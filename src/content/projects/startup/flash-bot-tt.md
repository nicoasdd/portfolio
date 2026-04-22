---
title: "Flash Bot TT — Flash-Loan Arbitrage Backend, Not a Script"
description: "A NestJS service that turns flash-loan arbitrage from a one-off script into a real backend: endpoint-driven opportunity feed, on-chain executor, trailing stop-loss controller, Sequelize-persisted decisions, Pushover + Telegram ops fan-out."
role: "Solo Engineer & Service Designer"
period:
  start: "2022-11"
  end: "2023-02"
techStack:
  - "TypeScript"
  - "NestJS"
  - "Node.js"
  - "Ethers.js"
  - "Sequelize"
  - "PostgreSQL"
  - "Telegram Bot API"
  - "Pushover"
  - "Docker"
thumbnail: "/projects/flash-bot-tt/thumbnail.svg"
featured: false
order: 10
draft: true
---

## Overview

A NestJS service that turns flash-loan arbitrage from "a script someone runs"
into a real backend. It exposes a `flash-loan/feed` endpoint that ingests
candidate opportunities, persists them through Sequelize, and decides which
ones to execute against the on-chain flash-loan contract. Successful entries
are then watched by a trailing stop-loss controller that closes positions
when price retraces past a configurable threshold.

Operator visibility is first-class: every meaningful event (opportunity
seen, trade fired, stop triggered) is fanned out to a Telegram bot and a
Pushover channel, so a real human knows what the bot did without having to
tail logs. The whole stack ships as a single NestJS app with a Dockerfile
and Procfile, which made it deployable to a small box without a full
orchestration setup.

Source code lives in a private repository.

## Highlights

- **Endpoint-driven feed** — `POST /flash-loan/feed` decouples the
  opportunity scanner from the executor, so multiple scanners can feed the
  same bot.
- **Trailing stop-loss controller** — open positions are tracked and exited
  on retrace, keeping risk bounded after a successful entry.
- **Multi-channel ops** — Pushover plus Telegram notifications for the same
  events, so operators get the right urgency on the right device.
- **Persisted decisions** — Sequelize-backed tables for flash-loan data and
  outcomes, giving a paper trail for post-mortems on every execution.

## Lessons Learned

The hardest part of this kind of bot isn't the trade — it's knowing what it
did and trusting it overnight. Wiring observability and trailing-stop logic
into the same NestJS app, with persistence underneath, made the difference
between a script people babysat and a service people slept through. Every
production system that touches money eventually faces the same test: not
"does it work" but "do you trust it at 3 a.m." — and persistence + alerts
+ bounded risk are the three knobs that move the needle on that question.
