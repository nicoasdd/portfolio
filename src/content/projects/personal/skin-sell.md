---
title: "Skin Sell — Three-Repo CS:GO Trading Shop"
description: "A two-year CS:GO skin shop across three repos: an Express + MongoDB API with Steam OpenID, forced-price overrides and exchange rates; a React + Ant Design storefront; and a single-repo full-stack edition collapsing both for easier deploy."
role: "Solo Engineer"
period:
  start: "2019-01"
  end: "2020-12"
techStack:
  - "React"
  - "Ant Design"
  - "styled-components"
  - "Formik"
  - "Node.js"
  - "Express"
  - "Passport (Steam)"
  - "MongoDB"
  - "Mongoose"
  - "Heroku"
  - "Axios"
thumbnail: "/projects/skin-sell/thumbnail.svg"
featured: false
order: 120
draft: true
---

## Overview

Skin Sell was a CS:GO skin trading shop, built across three repos that grew
into each other: a long-running Express + MongoDB API, a React + Ant Design
storefront that consumed it, and a final all-in-one repo that collapsed both
into a single artefact for easier deployment.

**API.** A REST surface for items, prices, forced (manually overridden)
prices, exchange rates, configuration, and users — backed by MongoDB through
Mongoose models — sitting behind Steam authentication so traders could log
in with their Steam identity and link their trade URL. A lot of the
iteration was around making Steam interactions cheaper: conditional calls
to the Steam API, batching item updates, and an explicit "forced price"
model so a single item could be repriced without recomputing the whole
catalogue. Auth and SSL got tightened over time so the cookie flow worked
behind a reverse proxy in production.

**Storefront.** The customer-facing React app that talked to the API. Built
on top of a React + Context + custom-hooks boilerplate, with Ant Design for
the catalogue, Formik for trade forms, and styled-components for theming, it
showed live skin inventory, prices, and exchange rates and walked the buyer
through Steam-authenticated trades. Served by a small Express layer in
`server/` so the same artefact could ship as a single Node process, with
environment-aware builds (`.env.development` / `.env.production`) for
staging and live.

**Full-stack edition.** The all-in-one version: React storefront, Express
API, and MongoDB-backed sessions in a single repo. Plugs straight into
Steam — Passport with `passport-steam` for OpenID, `get-steam-inventory`
and `steamcommunity-inventory` for live inventory reads, and
`steam-market-pricing` / `steam-price-api` for valuation — so a buyer can
sign in, see real Steam stock, and complete a trade against persistent
sessions stored in `connect-mongodb-session`. 54 commits in two months
added filters, fixed the long tail of styling and prod-environment edge
cases, and shaped the trade flow into something a real customer could use.

Source code lives in private repositories.

## Highlights

- **Steam OpenID + inventory + pricing** — three different Steam libraries
  combined behind one trade flow, so the same UI handles auth, stock, and
  price in one place.
- **Forced prices override** — a dedicated model and route to manually pin
  a single item's price without touching the rest of the pipeline,
  surfaced as first-class state on the storefront.
- **Cost-aware Steam usage** — a conditional-call layer so expensive Steam
  endpoints only fired when item state actually changed, fixing rate-limit
  pain that showed up early.
- **Persistent sessions** — `connect-mongodb-session` stores Express
  sessions in Mongo so the auth flow survives restarts and horizontal
  scaling.
- **Catalogue with filters and sort** — antd-driven list backed by the API,
  with the same forced-price overrides surfaced as first-class state.
- **Steam-aware trade flow** — front-end side of the auth + trade-URL flow,
  matching the backend's Passport-style Steam handshake.
- **Single-artefact deploy options** — both the storefront-only repo and
  the full-stack edition built React assets served from an Express server
  in the same repo, simplifying ops down to "one Node process".
- **State without Redux** — the boilerplate's Context + Hooks pattern
  carried the whole app; the project never needed to reach for Redux.

## Lessons Learned

The earliest version called Steam every refresh; bills and rate-limit pain
showed up fast. Modelling "forced prices" and a conditional Steam-call gate
turned the catalogue from a Steam-coupled feed into a backend that owned
its own state and only reached out when it had to. That single redesign —
*own your prices, treat the upstream as a sometimes-input* — is the same
shape I now recognise in any pricing or billing system: the read path has
to keep working when the source of truth is slow, missing, or just
expensive.

When the third-party surface (Steam) does most of the heavy lifting, the
codebase's job is mostly resilience: persisted sessions, defensive calls,
and filters that degrade gracefully when an inventory call comes back empty.
Most of the late-stage commits were small fixes in exactly those joints.
And for a small storefront, Context + custom hooks turned out to be the
right ceiling — the app stayed easy to reason about end-to-end, and the
"thunk-like" custom hooks gave just enough structure for the async flows
without dragging in Redux machinery I didn't need.
