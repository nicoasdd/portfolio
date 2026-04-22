---
title: "BaseBallToken — Production-Shaped Base ERC-20 Launch"
description: "A small but production-shaped ERC-20 launch on Base: Hardhat + OpenZeppelin contract with a per-tx limit guardrail, multi-target config (Base mainnet, Base Goerli, pinned-block forked Hardhat node), TypeChain client glue."
role: "Solo Contract Engineer"
period:
  start: "2023-07"
  end: "2023-08"
techStack:
  - "Solidity"
  - "Hardhat"
  - "TypeScript"
  - "OpenZeppelin"
  - "TypeChain"
  - "Base"
thumbnail: "/projects/etherium-killer/thumbnail.svg"
featured: false
order: 180
draft: true
---

## Overview

A small but production-shaped ERC-20 deploy on Base (the
"ethereumkiller" experiment, with `BaseBallToken.sol` as the token
contract). Built on Hardhat + OpenZeppelin, configured for three
networks out of the box — Base mainnet, Base Goerli, and a hardhat node
that forks Base mainnet at a pinned block — with Etherscan/Basescan
verification keys plumbed into the same config.

The contract picked up an explicit per-transaction limit through a
`chore: add transaction limit` and `Add max tx` pass, the kind of small
guardrail an early-launch token needs to keep behaviour predictable
while liquidity is still thin.

Source code lives in a private repository.

## Highlights

- **Base-first config** — Base mainnet, Base Goerli, and a forked-Base
  hardhat node share one Hardhat config, so deploys and local sims
  speak the same chain.
- **Per-tx limit guardrail** — the contract enforces a maximum
  transaction size, locked in by a focused commit before launch to keep
  behaviour predictable on day one.
- **TypeChain for client glue** — `generate-typechain` script keeps
  ABI typings in sync, so any consumer dapp gets typed contract calls
  for free.

## Lessons Learned

The interesting part of a launch ERC-20 isn't the token, it's the
guardrails. Adding a max-tx limit before mainnet — and pinning the local
fork to a real Base block — turned what could have been a vibes-based
deploy into something testable and reversible. "What guardrail makes
this reversible if it goes wrong on day one?" is the question I now ask
on every contract that touches users, before the question of what
features it ships with.
