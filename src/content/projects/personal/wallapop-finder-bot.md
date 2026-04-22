---
title: "Wallapop + Marketplace Finder — Cost-Budgeted Hexagonal Bot"
description: "A NestJS Telegram bot hunting Wallapop + Facebook Marketplace deals on demand — hexagonal so each marketplace is a swappable adapter, with an explicit per-call cost budget for the paid Apify integration baked into config and README."
role: "Solo Engineer & Service Designer"
period:
  start: "2026-01"
  end: "2026-02"
techStack:
  - "TypeScript"
  - "NestJS"
  - "Node.js"
  - "Telegram Bot API"
  - "Apify"
  - "Docker"
  - "Jest"
thumbnail: "/projects/wallapop-finder-bot/thumbnail.svg"
links:
  source: "https://github.com/nicoasdd/wallapop-finder-bot"
featured: false
order: 10
draft: true
---

## Overview

A Telegram bot that hunts deals across Wallapop and Facebook Marketplace and
notifies me directly in chat. Built with NestJS using a clean ports-and-adapters
architecture so each marketplace integration is swappable, testable in
isolation, and easy to extend.

The bot runs in two modes — long-polling for local development and webhook for
production — and ships with retry logic, health checks, graceful shutdown, and a
Docker deployment story.

## Highlights

- **Dual transport** — switches between Telegram polling and webhook with a single env var, so the same code runs locally and in production.
- **Facebook Marketplace integration** via Apify, designed around an explicit cost budget (default 5 results × $0.005, ~200 free-tier searches/month).
- **Hexagonal architecture** — Telegram, Wallapop, and Facebook are adapters behind well-defined ports, keeping the domain layer marketplace-agnostic.
- **Production-ready posture** — webhook secret validation, structured logging, Swagger/OpenAPI docs, and Dockerfile + compose setup.

## Lessons Learned

Designing around an explicit cost budget changed how I think about
third-party-dependent features. Surfacing per-call costs in config (and in the
README) made the trade-offs visible up-front instead of being a surprise on the
monthly invoice — the same instinct I now apply to anything billed per
request: model the cost the same way you model the latency, and put it
somewhere a future-you can actually see.
