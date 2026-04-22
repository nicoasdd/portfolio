---
title: "Multi-Tenant Telegram Price Bot Framework"
description: "A class-based Telegram price-bot framework where each chat owns its `TokenPoints`, prices come on-chain through an `HttpMultiProvider` with RPC failover, and admin/event logs are persisted per group for an audit trail."
role: "Solo Engineer & Framework Designer"
period:
  start: "2021-06"
  end: "2021-06"
techStack:
  - "Node.js"
  - "Telegram Bot API"
  - "Web3.js"
  - "Ethers.js"
  - "MongoDB"
  - "Mongoose"
  - "BSC"
thumbnail: "/projects/group-price-bots/thumbnail.svg"
featured: false
order: 200
draft: true
---

## Overview

A Telegram bot designed to be dropped into multiple project chat groups at
once and act as their price ticker. Each group can register a list of tokens
(its `TokenPoints`) and the bot reports current prices through chat
commands, callbacks, and scheduled updates — all backed by an
`HttpMultiProvider` so RPC failures fail over instead of taking the bot
down.

Internally it leans into a class-based core: `TokenPoints` describes a
group's tracked tokens, `ContextData` carries per-message state, and the
`telegram-functions` and `tokenInfoService` layers turn that into responses.
Admin actions, event logs, and per-group ad logs are persisted in MongoDB so
ops have a paper trail.

Source code lives in a private repository.

## Highlights

- **Multi-tenant by design** — token configurations, ad logs, and event
  logs are all keyed per chat, not global, so the same bot serves many
  communities at once.
- **Multi-RPC failover** — `HttpMultiProvider` rotates over multiple
  endpoints so a single dead RPC doesn't take down price reads for every
  group.
- **Class-based domain** — `TokenPoints` and `ContextData` make it explicit
  what a group "owns" vs what each callback needs to handle a single
  interaction.
- **Markdown-safe output** — uses `markdown-escape` so token tickers and
  user input don't accidentally break Telegram message formatting.

## Lessons Learned

The first version had a single hard-coded RPC and a single set of tracked
tokens. Re-shaping around `TokenPoints` per group plus a multi-provider
turned a fragile demo into a tool that could quietly serve many chats with
no operator attention for weeks at a time. "Multi-tenant from the second
commit, even when there's only one tenant" became a heuristic I keep
reaching for — refactoring tenancy in after the fact is always more
expensive than designing for it before there's a second customer.
