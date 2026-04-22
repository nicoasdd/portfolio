---
title: "BSC New-LP Telegram Bot — Event-Driven, Not Polled"
description: "A focused Node.js Telegram bot that subscribes to BSC factory `PairCreated` events through Web3 and pushes alerts to subscribers within seconds — no polling, no rate-limit pain, MongoDB-persisted clients across deploys."
role: "Solo Engineer"
period:
  start: "2021-09"
  end: "2021-09"
techStack:
  - "Node.js"
  - "Web3.js"
  - "Telegram Bot API"
  - "MongoDB"
  - "Mongoose"
thumbnail: "/projects/new-lp/thumbnail.svg"
featured: false
order: 170
draft: true
---

## Overview

A focused Telegram bot for the 2021 BSC moment when half the alpha was
"there's a new LP for Token X". It subscribes to factory `PairCreated`
events through Web3, looks up the new pair's tokens, and notifies the bot's
registered users in real time.

The whole bot is a few files: `subscribeNewLp.js` owns the event
subscription, `notifyUsers.js` handles fan-out, and `telegramBot.js` /
`bot.js` keep the chat side straight. Clients are persisted in MongoDB so
restarts don't lose subscribers.

Source code lives in a private repository.

## Highlights

- **Event-driven, not polled** — listens to factory events directly via
  Web3 instead of poking the chain on a timer, so alerts land seconds after
  the pair is born.
- **Tiny, single-purpose** — one job, done well; the whole project is small
  enough to read in a coffee break and own end-to-end.
- **Persistent subscribers** — Mongoose `client.model.js` keeps the
  registered users between deploys.

## Lessons Learned

For a niche signal, going event-driven instead of polling was the cheapest
way to feel "real time" with no infra and no rate-limit pain — which made
keeping the bot alive trivial compared to anything that scrapes. "Subscribe
to the event the source already emits, instead of asking it the same
question on a timer" is one of those defaults that pays compounding
operational dividends.
