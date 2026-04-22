---
title: "Lobo Trader — Three-Repo DeFi Trader-Discovery Stack"
description: "Three-repo DeFi product on BSC: an AlphaRegistry-governed Solidity protocol with on-chain stop-loss and revenue distribution, a React + PancakeSwap-UIKit trader-discovery dApp, and a Next.js landing. Built pair-style on the smart contracts."
role: "DApp Engineer & Solidity Pair Programmer (with Andrew Ortiz)"
period:
  start: "2021-11"
  end: "2022-03"
techStack:
  - "Solidity"
  - "Truffle"
  - "OpenZeppelin"
  - "PancakeSwap"
  - "TypeScript"
  - "React"
  - "Redux Toolkit"
  - "Web3-React"
  - "PancakeSwap SDK"
  - "PancakeSwap UIKit"
  - "ethers.js"
  - "Next.js"
  - "Sass"
thumbnail: "/projects/lobo-trader/thumbnail.svg"
featured: true
order: 110
draft: false
---

## Overview

Lobo Trader was a trader-discovery DeFi product on BSC, shipped across three
cooperating repos: a Solidity protocol that governed strategies on-chain,
a React + PancakeSwap-UIKit dApp where investors discovered and followed
traders, and a Next.js marketing landing that introduced the product
publicly.

**Protocol.** A Truffle + Solidity 0.7 codebase organised around a single
authorisation surface — the `AlphaRegistry` contract — which governed the
lifecycle of `Strategy` contracts deployed through `BasicFactory` instances.
Traders created proposals on-chain, the registry approved them, the resulting
strategy swapped through PancakeSwap (via `IPancakeRouterSimplified` +
`PancakeLibrary`), and at exit time the registry distributed revenues back
to followers in proportion to their participation. Authorship on the
contracts was three-quarters Andrew Ortiz and one-quarter mine — the commit
log includes explicit "Refactor wip with tambu22" pair sessions. My
contributions concentrated on the parts that turn a strategy contract into a
real product: the stop-loss trigger path, the initial profit-based token
re-distribution, and the contract events layer (suffixes, naming, the events
PR).

**Webapp (`app.lobo.trade`).** A React + Redux Toolkit dApp built on the
PancakeSwap SDK and UIKit so the swap path felt at home for BSC users from
day one. Web3-React handled connectors (Binance Chain + injected +
WalletConnect), `ethers.js` and `bignumber.js` did the arithmetic,
`lightweight-charts` rendered trader performance, IPFS pieces (`cids`,
`multihashes`, `multicodec`) carried off-chain content, Sentry traced errors
in production, and Crowdin drove translations. A "switch role" feature let a
single wallet flip between trader and investor views without re-onboarding.

**Landing.** A deliberately small Next.js + Sass site that told the "what is
Lobo Trader" story — explainer copy, footer URLs, social meta tags — with
the kind of polish iterations that came from real review feedback ("solved
phrase coming", "fix footer url and meta tag"). The stack was kept
embarrassingly small (Next + React + Sass) so future copy changes stayed
cheap.

Source code lives in private repositories.

## Highlights

- **`AlphaRegistry` as the single authorisation surface** — only the
  registry could deploy strategies through intermediate factories, and the
  full proposal lifecycle (`create → cancel pending → approve → runStopLoss
  → revenue distribution`) lived on-chain, with proposal IDs auto-resetting
  once a flow finished.
- **Stop-loss, profit redistribution, and the events layer** — my
  contributions to the strategy contracts: the `feature/trigger-stop-loss`
  path, the initial profit-based token redistribution, and the
  `feature/events` PR that became the source of truth the dApp and
  back-office actually listened to.
- **dApp on PancakeSwap rails, with role-switching** — React + Redux
  Toolkit built on `@pancakeswap/sdk` and `@pancakeswap/uikit`, Web3-React
  for connectors (Binance Chain + injected + WalletConnect),
  `lightweight-charts` for trader performance, and a single-wallet "switch
  role" between trader and investor surfaces.
- **Production-ready posture** — Sentry tracing, Crowdin i18n, IPFS
  (`cids`, `multihashes`, `multicodec`) for off-chain content, `ethers.js`
  + `bignumber.js` arithmetic, and a deliberately small Next + React +
  Sass landing that stayed cheap to iterate on.

## Lessons Learned

The biggest lesson of pairing on-chain code with Andrew was how unforgiving
Solidity is about *where* trust lives. A single `AlphaRegistry` as the only
thing that could deploy strategies through factories — instead of letting
strategies self-register — kept the audit story simple as the protocol
grew, and is the same chokepoint pattern I have leaned on in every
payments-adjacent system since. "Events as documentation" wasn't a
metaphor on-chain either: the bot, the back-office, and the dApp all
consumed events as the source of truth, so naming and suffix discipline in
the events PR paid off for months.

On the dApp, layering custom features on the PancakeSwap UIKit was a force
multiplier right up until the design system needed to bend; once the trader
role showed up, the right answer was to wrap UIKit in our own components
rather than fight it. And on the landing, keeping the toolchain almost
embarrassingly small turned out to be the long-term win — fewer moving
parts meant copy changes six months later were a five-minute job, not a
project.
