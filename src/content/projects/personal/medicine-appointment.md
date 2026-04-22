---
title: "Swiss Medical Appointment Notifier — TOTP + Encryption-at-Boundary"
description: "A NestJS service that polls Swiss medical-appointment APIs and pings Telegram the moment a slot opens — TOTP-aware login, async-locked jobs to stop double-notifies, and an `encrypter` boundary so credentials never sit in plaintext."
role: "Solo Engineer & Security Designer"
period:
  start: "2023-05"
  end: "2023-12"
techStack:
  - "TypeScript"
  - "NestJS"
  - "Node.js"
  - "MongoDB"
  - "Mongoose"
  - "Telegram Bot API"
  - "Axios"
  - "TOTP"
  - "Docker"
thumbnail: "/projects/medicine-appointment/thumbnail.svg"
featured: false
order: 270
draft: true
---

## Overview

The actual work for this project lives on the
`feature/add-swiss-apis` branch — `main` is just the scaffold. The
service polls Swiss medical-appointment APIs on a schedule and, when a
slot opens that matches a user's filters, fans out a notification
through a Telegram chatbot.

Built on NestJS with a clear domain split: `domains/swiss/jobs` runs
the scheduled checks, `domains/chatBot` owns the Telegram surface,
`domains/auth` handles JWT-based account access (with a TOTP path for
accounts that need it), and `infrastructure/shared/swissMedicalApi`
isolates the integration. Sensitive values flow through an
`encrypter` helper rather than living in plaintext, and `async-lock`
keeps concurrent job runs from double-booking the same slot.

The repo also tracks a real ops journey — the December 2023 commits
are a sequence of Dockerfile / `compose-dev.yaml` revisions where the
service was being shaped into something that runs cleanly under a
container, not just on a laptop.

Source code lives in a private repository.

## Highlights

- **Scheduled poll → Telegram fan-out** — `@nestjs/schedule` drives a
  `domains/swiss/jobs` worker; matching slots become Telegram messages
  via `node-telegram-bot-api`, so users don't have to refresh anything.
- **TOTP-aware login** — `totp-generator` plus the `auth` domain means
  accounts that require a 2FA code on the Swiss provider can still be
  driven end-to-end by the bot.
- **Encryption at the boundary** — an `encrypter` helper in
  `infrastructure/shared` keeps stored credentials encrypted and
  isolates the keys to the configuration layer.
- **Async-locked jobs** — `async-lock` prevents the polling loop from
  racing itself, which matters the moment two slots open in the same
  tick and a naive run would notify twice.

## Lessons Learned

The interesting failure mode of an "appointment finder" isn't missing a
slot — it's notifying users about a slot that's already gone. Pulling
the polling loop behind `async-lock` and doing the "is this still
available" check inside the same critical section turned a noisy bot
into one users actually trusted. Encryption-at-the-boundary was the
other non-negotiable: a bot that holds people's medical-portal
credentials has to treat them like the bank credentials they
effectively are — the same posture I default to whenever a service
holds anything regulated, from PII to wallet keys to payments
secrets.
