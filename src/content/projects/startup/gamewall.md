---
title: "Gamewall — Three-Repo Steam-to-On-Chain Social Platform"
description: "Six months and ~180 PRs across three cooperating repos: an ERC1155 achievement protocol, a NestJS + AWS SNS/SQS backend that turned Steam into queryable game state, and a Next.js social-profile front-end with on-chain badge minting."
role: "Backend Lead · Frontend Engineer · Sole Protocol Author"
period:
  start: "2022-10"
  end: "2023-04"
techStack:
  - "TypeScript"
  - "Solidity"
  - "Hardhat"
  - "OpenZeppelin"
  - "NestJS"
  - "Sequelize"
  - "PostgreSQL"
  - "AWS SNS"
  - "AWS SQS"
  - "AWS S3"
  - "IPFS"
  - "Next.js"
  - "React"
  - "Tailwind CSS"
  - "Web3"
  - "Docker"
thumbnail: "/projects/gamewall/thumbnail.svg"
featured: true
order: 20
draft: false
---

## Overview

Gamewall was a gaming social profile product built across three cooperating
repos — an on-chain achievement protocol, a backend that turned Steam into
queryable game state, and a Next.js front-end where players actually lived.
Across six months and ~180 merged PRs the three layers grew together: every
new badge type started as a contract change in the protocol, surfaced through
the backend's `gameWallWeb3Protocol` domain, and landed in the user's profile
on the web app.

**Protocol.** A Hardhat project defining the achievement protocol behind a
clean `IAchievement` interface, with ERC1155-flavoured contracts that mint
and transfer both fungible (points) and non-fungible (badges) achievement
tokens from a single surface. The repo iterated through a real review cycle
(multi-part "PR request change" commits, a mid-stream "Mega Refactor") and
ended in a state where deploys to BSC testnet were a single
`npm run deploy:testnet` away — with verification scripts and a Hardhat
config tuned for the contract-sizer extension.

**Backend.** A NestJS + TypeScript service organised by domain — `steam`,
`achievement`, `gameWallWeb3Protocol`, `userGame`, `userAchievement`,
`gameWallBadge`, `normalizer`, and more — backed by Sequelize over
PostgreSQL. AWS SNS topics and SQS FIFO queues acted as the spine between
raw Steam ingestion and the normalised game/achievement model
(`RawData_For_Normalizer`, `RawData_For_SteamRaw`, `NormalizedData_For_*`),
reproduced locally with a docker-compose + `CreateLocalQueues.sh` so devs
weren't coupled to AWS to test. The PR history traces the actual journey:
Steam OAuth + sign-in, achievements and badges, on-chain protocol
integration, wallet attach/detach endpoints, S3 avatar uploads, IPFS-backed
achievement metadata, admin auth, Discord IDs, migrations, mainnet gas-price
fixes, and a 1.1.0 → 1.1.1 release cycle.

**Web.** The user-facing Next.js application — a social profile around
gaming achievements. Users signed in, connected a wallet, linked Steam,
Twitter, and Discord, uploaded an avatar, and minted badges from the protocol
on-chain, all behind per-user public pages (`pages/[username].tsx`).
Translations loaded from `public/lang/*.json` through a `LangProvider`, so
adding a language was a JSON file plus a single registration. The codebase
leaned on a strict toolchain — Husky + lint-staged + Conventional Commits +
Commitlint + Import Sorter + Prettier + ESLint — and shipped behind a
Dockerfile with environment-driven web3 chain configuration (a new EVM
chain was a config change in `providers/web3/chain.ts`).

Source code lives in private repositories.

## Highlights

- **Interface-first protocol** — `IAchievement` defined the protocol surface
  so client contracts and tests could speak to it without depending on a
  specific implementation; ERC1155 from the start collapsed "points" and
  "badges" into one parametrised contract.
- **Domain-driven NestJS layout** — `src/domains/*` kept `steam`,
  `achievement`, `web3 protocol`, `user`, `userGame`, and the `normalizer`
  worker each in its own module instead of one giant service.
- **AWS SNS/SQS pipeline, reproducible locally** — RawData topics fanned out
  into per-consumer FIFO queues, with a docker-compose + script combo that
  let devs run the whole pipe on a laptop.
- **Web3 + IPFS where it matters** — a dedicated `gameWallWeb3Protocol`
  domain plus IPFS integration for achievement metadata (image thumbnails +
  external URLs) kept the on-chain story coherent across the three layers.
- **Per-user public profile** — Next.js dynamic routing rendered a public
  page per username, integrating Steam stats, social links, and on-chain
  badges in a single view.
- **Web3 + traditional auth in one shell** — wallet connect alongside
  Twitter / Discord OAuth flows, with the same UI driving badge minting and
  profile editing.
- **Contributor workflow as a feature** — Husky / lint-staged / Commitlint /
  Conventional Commits / Prettier / Import Sorter on the front-end, Solhint
  + Prettier + ESLint + `hardhat-contract-sizer` on the protocol, so PRs
  arrived in a known shape across all three repos.
- **Operational reality** — PR history shows the actual ops calls (mainnet
  gas-price fix, S3 image uploads, achievement disable, wallet delete
  endpoint, default values for non-required props) that turn a prototype
  into something that runs.

## Lessons Learned

The hardest part of bridging Steam into a game-state product wasn't the
ingest — it was decoupling the Steam-side schema from the normalised
game/achievement model the rest of the system spoke. SNS topics + per-
consumer FIFO queues were the right shape: every consumer (normalizer,
raw store, future readers) could subscribe without forcing producers to
know about them, and re-running the normaliser against the `RawData_For_*`
queue became a one-line operational knob. That ingest-vs-domain split is
the same architectural move I now reach for whenever a third-party schema
is going to outlive any single feature consuming it: keep the raw shape,
own the normalised one, and let consumers subscribe to the second.

Designing achievements as ERC1155 from the start collapsed two roadmaps
into one — fungible "points" and non-fungible "badges" became the same
contract, parametrised. And on the web side, putting wallet, OAuth, and
i18n behind providers from day one paid back when the team needed to add
chains and locales without touching feature code. The biggest accelerator,
across all three repos, wasn't a framework — it was the contributor
workflow that made every PR cheap to review. Tooling-as-feature is one
of the highest-leverage things a senior engineer can ship into a team
that's about to scale.
