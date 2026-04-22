---
title: "LP Calc — Open-Source BSC LP Position Valuator"
description: "An open-source React + Web3 calculator that values an LP position across BSC yield farms fully on-chain — wallet-connect, router/factory/pair walks (no centralised feed), and a year of community-driven farm coverage through 2021."
role: "Open-Source Maintainer"
period:
  start: "2021-03"
  end: "2021-12"
techStack:
  - "TypeScript"
  - "React"
  - "Web3.js"
  - "Ethers.js"
  - "BSC"
  - "Firebase Hosting"
thumbnail: "/projects/lp-calc/thumbnail.svg"
links:
  source: "https://github.com/nicoasdd/lp-calc"
featured: false
order: 130
draft: true
---

## Overview

A web tool that answers a single question for BSC LP-token holders: how much
is my LP position actually worth right now? It connects a wallet, reads the
pair contract on-chain via Web3.js / Ethers, walks the router and factory
ABIs to resolve token prices, and renders a breakdown across the major BSC
yield farms (PancakeSwap, ApeSwap, BakerySwap and friends).

I came in as a maintainer extending an existing open-source base, focusing
on adding farms (PancakeSwap V2, CaramelSwap, Pepper Finance, ZEFI,
Bitblocks and others), keeping constants alphabetised, fixing bugs around
pairs that lacked stablecoin or BNB sides, and shipping the deploy pipeline
to Firebase Hosting.

## Highlights

- **Wallet + on-chain pricing** — Web3-React + injected connector for
  wallets, with router/factory/pair ABIs for valuation that doesn't depend
  on any centralised price feed.
- **Continuous farm coverage** — recurring updates throughout 2021 to add
  new BSC yield farms as the ecosystem grew, keeping a single tool useful
  across many protocols.
- **Edge-case fixes** — bug fixes for pairs without stablecoin or BNB sides
  so positions in long-tail tokens still showed a meaningful USD value.
- **Open-source workflow** — accepted contributions (PRs for new farms),
  kept constants alphabetical, and shipped to Firebase from the same repo.

## Lessons Learned

The hard part of valuing an LP isn't the math — it's the long tail of
"weird" pairs. Every farm or token added pushed at edge cases in the pricing
walk, and the fixes that survived were the ones that treated the missing
stable/BNB side as a real path to handle, not an exception to swallow.
Maintaining an open-source tool also taught me that "name the missing side
so it has a place in the data model" is a generalisable lesson: it shows
up the same way in DeFi, in payments rails, and in every API integration
where the partner sometimes doesn't return the field.
