---
title: "Telegram MTProto Broadcaster — Account-Level Bot Service"
description: "A NestJS service that drives a real Telegram user account (MTProto, not Bot API) to broadcast across configurable groups bots can't reach — domain-driven layout, login + group-id flows wrapped behind a single adapter."
role: "Solo Engineer & Service Designer"
period:
  start: "2024-04"
  end: "2024-04"
techStack:
  - "TypeScript"
  - "NestJS"
  - "Node.js"
  - "Telegram MTProto"
  - "Mongoose"
  - "Sequelize"
  - "Docker"
thumbnail: "/projects/telegram-shiller/thumbnail.svg"
featured: false
order: 80
draft: true
---

## Overview

A NestJS service that automates "shilling" — broadcasting promotional messages
about a token across a configurable set of Telegram groups using a real user
account. It uses the MTProto client (the `telegram` library) instead of the
Bot API so it can post in groups where bots aren't allowed, and wraps the
account workflow in a Domain-Driven Design layout under `src/domains/telegram`.

The point of the project was less about the marketing use-case and more about
exercising NestJS modules, configuration, and adapter patterns around an
account-level Telegram client — including login flows, group ID resolution,
and a development Docker compose for the MongoDB and Postgres dependencies.

Source code lives in a private repository.

## Highlights

- **Account-level Telegram client** — uses the MTProto-based `telegram`
  package so the bot can send into groups the standard Bot API cannot reach.
- **Domain-driven layout** — `src/domains/{telegram,health,example}` with
  shared infrastructure helpers, keeping the broadcast workflow isolated from
  framework concerns.
- **Configurable groups** — group IDs and intervals live in environment-driven
  config so adding a new target is a config change, not a code change.
- **Containerised deps** — Docker compose for MongoDB plus a Procfile entry,
  so the whole bot can run in a single command both locally and on a PaaS.

## Lessons Learned

Most of the friction with account-level Telegram automation lives at the
boundary: session handling, login codes, and group ID resolution. Wrapping
those flows in a single adapter inside the `telegram` domain made the
broadcaster service itself trivial — and easy to swap out if the upstream
client library ever changes. It's the same architectural move I keep
defaulting to: when an external integration is fragile, the cheapest
insurance is collapsing all of its quirks into one named adapter and
keeping the domain layer ignorant.
