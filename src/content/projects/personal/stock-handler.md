---
title: "Multi-Channel Stock Reconciliation Service"
description: "An Express service that reconciles product stock between a WooCommerce store and Mercado Libre listings — append-only audit log of every movement, Telegram operator surface, and a shared internal contract behind both SDKs."
role: "Solo Engineer"
period:
  start: "2021-05"
  end: "2021-05"
techStack:
  - "Node.js"
  - "Express"
  - "WooCommerce REST API"
  - "Mercado Libre SDK"
  - "MongoDB"
  - "Mongoose"
  - "Telegram Bot API"
thumbnail: "/projects/stock-handler/thumbnail.svg"
featured: false
order: 190
draft: true
---

## Overview

A glue service for small e-commerce sellers running both a WooCommerce store
and Mercado Libre listings. It listens for stock changes on either side via
the WooCommerce and Mercado Libre SDKs, reconciles them, and propagates the
update to the other channel so the same SKU never oversells.

A small Express server exposes the integration health and webhook endpoints,
a Telegram bot pings on errors and notable updates, and a `log.model` keeps
an append-only history of stock movements so post-mortems on "where did
that unit go" are a Mongo query away.

Source code lives in a private repository.

## Highlights

- **Two-way WooCommerce + MercadoLibre sync** — `mercadolibre-integration`
  and `woocommerce-integration` services in `src/services/` own their
  respective SDK calls behind a shared internal contract.
- **Telegram operator surface** — `telegramBot` + `notifyUsers` give the
  shop owner a real-time read on what the sync did without needing a
  dashboard.
- **Append-only audit log** — `log.model.js` records every stock movement
  so reconciliation issues can be replayed instead of guessed at.

## Lessons Learned

Multi-channel inventory is mostly about reconciliation, not transport.
The Telegram operator UI proved more important than a fancy admin panel —
when something went sideways, a single chat message saved a shipping
mistake faster than any UI ever did. The append-only stock-movement log
turned out to be the unsung hero: every "where did that unit go" question
became a Mongo query instead of a guess. That same pattern — *write the
ledger first, derive UIs from it* — is what I now reach for in any
system where money or inventory has to be traceable after the fact.
