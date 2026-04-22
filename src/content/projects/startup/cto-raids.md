---
title: "CTO Raids — Community-Takeover Coordination Bot"
description: "A NestJS Telegram bot for coordinating community-takeover (CTO) campaigns — CTO registration, group listings with GMT timestamps, a `/suggestion` flow keyed back to the CTO record, and defensive UX baked into the bot itself."
role: "Solo Engineer"
period:
  start: "2024-05"
  end: "2024-05"
techStack:
  - "TypeScript"
  - "NestJS"
  - "Node.js"
  - "Telegram Bot API"
  - "MongoDB"
  - "Mongoose"
  - "Docker"
thumbnail: "/projects/cto-raids/thumbnail.svg"
featured: false
order: 40
draft: true
---

## Overview

A NestJS-driven Telegram bot for coordinating CTO ("community takeover")
campaigns. Communities register CTOs, the bot keeps a list of associated
groups (with counts and creation timestamps surfaced as GMT for clarity),
and members can submit `/suggestion` proposals that get tagged with the
sender's username and persisted alongside the CTO record.

The bot is intentionally minimal — a couple of NestJS modules wrapping a
Telegram client and a Mongoose layer — but its behaviour is opinionated:
it splits `@` mentions out of group commands, refuses to send empty
descriptions, and ships with a `compose-dev.yaml` so contributors can run
the whole thing locally in one command.

Source code lives in a private repository.

## Highlights

- **Community-first commands** — `/cto-list`, `/groups`, and a `/suggestion`
  flow are first-class commands so a CTO leader can run the whole campaign
  without leaving Telegram.
- **Suggestion model** — a dedicated Mongoose schema captures who suggested
  what, attached to the originating CTO, so proposals don't get lost in
  chat scroll-back.
- **Operator polish** — small UX guards (no empty descriptions, GMT
  timestamps, splitting `@` from commands) prevent the most common operator
  mistakes.

## Lessons Learned

For tools that live inside a chat client, the user experience is mostly
defensive UX — the polish that stops people from typing the wrong thing.
Codifying those rules in the bot itself made support cheaper than any
documentation effort would have. The lesson generalises: any time the
"docs say don't do X" pattern shows up, the durable fix is making the
system refuse X instead of asking the user to remember it.
