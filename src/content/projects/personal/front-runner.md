---
title: "BSC Mempool Front-Runner — Forked-Chain Sim Harness"
description: "A research bot that decodes BSC mempool swaps, simulates the post-impact AMM math against a Hardhat/Ganache fork of mainnet, and races a partial-size order in front only when projected output clears `minAmountOut`."
role: "Solo Engineer & Strategy Researcher"
period:
  start: "2021-05"
  end: "2021-10"
techStack:
  - "Node.js"
  - "Hardhat"
  - "Solidity"
  - "Ethers.js"
  - "Web3.js"
  - "Ganache"
  - "BSC"
  - "MongoDB"
thumbnail: "/projects/front-runner/thumbnail.svg"
featured: false
order: 160
draft: true
---

## Overview

A research bot that explored mempool front-running on BSC during the 2021
PancakeSwap era. It runs a Hardhat node forked off BSC mainnet, listens for
large pending swaps, decodes them with `abi-decoder` against the router ABI,
and simulates a partial-size buy at a fraction of the target order. If the
projected output (calculated as if price already moved) is acceptable, the
bot fires its own swap with `minAmountOut` set against the post-impact price.

The Solidity side is a small "trader" contract deployed to the local fork;
the JS side wires together mempool subscription, decoding, simulation, and
the trade decision. The README spells out the local recipe with both
`hardhat node --fork` and `ganache-cli --fork`, and a script that fakes a
50 BNB swap so the bot can be tested end-to-end without burning real chain.

Source code lives in a private repository.

## Highlights

- **Forked-chain simulation** — Hardhat / Ganache forks of BSC mainnet so
  every candidate trade is priced against real liquidity without real risk.
- **Decoded mempool intents** — `abi-decoder` over the router ABI turns
  pending tx data into structured swap intents the bot can reason about.
- **Slippage-aware sizing** — only fires when 10 % of the target order plus
  a `minAmountOut` set against the post-impact price still produces a win.
- **Trader contract** — a Solidity contract handles the on-chain side, kept
  small so the JS layer owned the strategy.

## Lessons Learned

The interesting work wasn't the trade itself — it was the simulation
harness. Once the fork + decode + replay loop existed, swapping strategies
became a one-file change. Most of the long tail of bugs were really
"my model of the AMM math wasn't quite right yet". The deeper lesson
generalised well beyond MEV: in any system that decides things against
external state, the fastest way to a trustworthy product is to invest
in a deterministic simulator first and treat the strategy as a thin
layer on top.
