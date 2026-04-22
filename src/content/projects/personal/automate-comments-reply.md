---
title: "Instagram LLM Auto-Reply Service"
description: "A NestJS service that auto-replies to Instagram comments with an LLM, behind a hexagonal `ILLMService` port. Meta webhook ingest, MongoDB-backed dedupe, Graph API replies — designed so the LLM provider is swappable in one file."
role: "Solo Engineer & Service Designer"
period:
  start: "2025-05"
  end: "2025-05"
techStack:
  - "TypeScript"
  - "NestJS"
  - "MongoDB"
  - "Mongoose"
  - "OpenRouter"
  - "Instagram Graph API"
  - "Swagger / OpenAPI"
  - "Jest"
  - "Render"
thumbnail: "/projects/automate-comments-reply/thumbnail.svg"
links:
  source: "https://github.com/ourfirstlab/automate-comments-reply"
order: 50
draft: true
---

## Overview

A NestJS service that listens to Instagram comment webhooks, generates a reply
with an LLM, and posts it back through the Instagram Graph API. The bot
operates as the persona **Quest** on `@gptquest`, with its tone, formatting
rules, and refusal behaviour encoded directly in the system prompt.

The codebase is laid out in a hexagonal style — `domain/`, `infrastructure/`,
and `presentation/` — so the LLM provider sits behind an `ILLMService` port
and the current OpenRouter adapter can be swapped without touching the webhook
or persistence layers. Comments and media are persisted in MongoDB so the bot
can dedupe its own replies and reuse post captions as additional context for
the model.

## Highlights

- **Webhook → LLM → reply pipeline** — Meta verifies the webhook via the
  hub.challenge handshake; incoming comment events are stored in MongoDB,
  passed to the LLM with the parent post's caption as context, then posted
  back via `graph.instagram.com/v22.0/<comment-id>/replies`.
- **Hexagonal LLM port** — `ILLMService` defines the contract; `OpenRouterService`
  implements it against OpenRouter's OpenAI-compatible endpoint, defaulting to
  `mistralai/mistral-7b-instruct` and configurable via env var.
- **Persona baked into the system prompt** — a 220-character cap, English
  default with language-mirroring fallback, plain-text-only output, emoji
  whitelist, and explicit handling for spam, NSFW, and infinite-loop prompts.
- **Self-reply guard** — comments authored by the bot's own username are
  stored as `isProcessed: true` and skipped, preventing reply loops on its own
  responses.
- **Operational scaffolding** — Swagger/OpenAPI docs, request-logger
  middleware scoped to the `webhook` route, structured Nest `Logger`, and a
  `render.yaml` that wires every secret as an unsynced env var for one-click
  deploy on Render.

## Lessons Learned

The hard part wasn't the LLM — it was the boundary work: signature
verification, self-reply dedupe, on-demand media fetches, and surviving
Meta's webhook retries without thrashing Mongo. Holding the model behind
an `ILLMService` port made the rest tractable and turned a provider swap
into a one-file change.

The bigger lesson was a platform one. Even on the official Graph API
with signed webhooks and a refusing persona, the account was banned
multiple times — shadow-bans first, then full takedowns — because reply
cadence and uniformity tripped Meta's automation heuristics. "Is the API
call legal?" and "will the platform tolerate it at volume?" are
different questions, and the second one decides whether the project
ships. I now treat per-account ToS risk as a first-class design
constraint on social integrations, not a deployment-time afterthought.
