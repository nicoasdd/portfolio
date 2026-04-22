---
title: "csgo-try.com — Bootstrapped CS:GO Skin Betting Platform"
description: "Founded and operated a real-money CS:GO skin-betting platform: in-kind coinflips and weighted skin-pot lotteries on the Steam Web API. Ran ~2 years, scaling from zero to 70k users and ~500 concurrent on a single Node.js box."
role: "Founder, CEO & Solo Developer"
period:
  start: "2015-09"
  end: "2017-05"
techStack:
  - "Node.js"
  - "Socket.IO"
  - "MySQL"
  - "jQuery"
  - "Steam Web API"
thumbnail: "/projects/csgo-try/thumbnail.svg"
featured: true
order: 280
---

## Overview

Founded and ran csgo-try.com: a web platform where CS:GO players deposited
Steam skins into escrow on a dedicated bot account and bet them in-kind
across two game modes — 1v1 coinflips and a multi-player skin-pot lottery
weighted by deposit value. Winners were paid out in the actual items
wagered, minus a 5% house fee taken in skins. Every deposit, payout, and
inventory move was brokered through the Steam Web API and reconciled
against an internal MySQL ledger.

The hard part was never the gambling math — it was the realtime layer
(live coinflip animations and lottery countdowns synced across hundreds
of viewers), the Steam side (trade offers, inventory polling, market
price lookups, recovering gracefully when Steam's API went down — which
was often), and getting the fee-collection mechanics right without
drowning the bot inventory. The site ran from late 2015 to mid-2017 and
grew from zero to **~70,000 registered users** with **~500 concurrent**
at peak.

## Highlights

- **Realtime, three rewrites at scale** — the live game layer evolved
  from AJAX long-polling to Server-Sent Events to Socket.IO, each
  rewrite forced by the next user-count milestone. At peak, sustained
  ~500 concurrent users on a single Node.js box with Socket.IO fan-out,
  two active game modes running side by side.
- **Knapsack-based fee selection** — the 5% house fee was taken in
  skins, not credit. Wrote a knapsack-style selector that picked the
  smallest set of items totalling at least 5% of pot value while
  prioritising liquid skins (case keys first), so the bot's inventory
  stayed shallow and the house was never under-paid.
- **Steam Web API + escrow ledger** — Steam login, inventory sync,
  trade offer creation/acceptance, and market price lookups, all
  reconciled against a MySQL ledger so the house balance was always
  provable down to the skin.
- **Founder across the whole product** — built and operated the
  platform end-to-end: code, product design, marketing, partnerships,
  social channels, payouts, and player support. The roadmap was driven
  entirely by what the community asked for in chat.

## Lessons Learned

This was the first product I founded, and the one that taught me what
scalability actually means in practice. The realtime layer alone went
through three rewrites — AJAX long-polling, then Server-Sent Events,
then Socket.IO — each forced by the next traffic milestone, and each one
a lesson I could not have picked up from a tutorial. Even a feature as
small as the 5% house fee turned into an algorithms problem (a knapsack
selector tuned for inventory health), which set the tone for how I have
treated "small" operational features ever since. Running a real-money
product solo also taught me how much of "engineering" is really
accounting, fraud handling, and reconciliation — themes I have come
back to in every payments-adjacent system I have built since. Letting
the community drive the roadmap was the best product instinct I picked
up in those two years, and the hardest one to scale alongside the user
base.
