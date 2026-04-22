---
title: "Bigger Game — Two-Repo Prototype-to-Production On-Chain Build"
description: "An on-chain contribution-curve game across two repos: a Hardhat + CRA prototype that validated the player loop, then a Foundry contract project on OpenZeppelin Upgradeable + UUPS, with storage-layout output wired into the build."
role: "Solo Engineer & Contract Architect"
period:
  start: "2024-05"
  end: "2024-06"
techStack:
  - "TypeScript"
  - "React"
  - "Solidity"
  - "Hardhat"
  - "Foundry"
  - "Forge"
  - "OpenZeppelin"
  - "OpenZeppelin Upgrades"
  - "Ethers.js"
thumbnail: "/projects/bigger-game/thumbnail.svg"
featured: false
order: 30
draft: true
---

## Overview

Bigger Game is a contribution-curve on-chain game shipped across two
deliberately-different repos: a single-repo prototype that validated the
player loop end-to-end, and a serious-side Foundry project that holds the
upgradeable contracts ready to go live.

**Prototype.** A spike at the "bigger game" idea: a contribution-curve game
contract paired with a React front-end that lets a player connect a wallet,
see the curve state, and contribute. The Solidity side lives in
`contracts/Game.sol` and holds the rules; the React side is a small
Create-React-App project that talks to the deployed contract through
Ethers. The point of the prototype was to validate the player loop —
deploy locally, connect, contribute, watch the on-chain state move —
before investing in a real client and the full Foundry contract suite that
became the second repo.

**Contracts.** The serious-side counterpart: a Foundry project built on
OpenZeppelin Contracts plus `openzeppelin-foundry-upgrades` and
`openzeppelin-contracts-upgradeable`. Foundry profile enables FFI, builds
storage layouts and AST output, and wires in a `.env` profile for deploys.
The single contract — `src/Game.sol` — is intentionally small and focused;
the value of the repo is the surrounding scaffolding (Forge tests, gas
snapshots, deploy scripts) that makes it deployable and verifiable on a
real network.

Source code lives in private repositories.

## Highlights

- **End-to-end loop in the prototype** — Solidity contract + React client
  side by side, so the local "deploy and play" cycle stays tight.
- **Wallet-driven actions** — every meaningful interaction goes through
  the user's wallet, validating the gas + UX story before touching
  production infrastructure.
- **Validation first, production second** — the prototype was kept
  intentionally small to answer "does the loop feel right" before the
  Foundry contracts and a real front-end were built.
- **Foundry-native workflow** — `forge build`, `forge test`, `forge fmt`,
  `forge snapshot`, `anvil`, all wired in via the README so contributors
  can self-serve.
- **Upgradeable from day one** — depends on
  `openzeppelin-contracts-upgradeable` plus `openzeppelin-foundry-upgrades`,
  so the game contract can ship behind a UUPS proxy without retrofitting.
- **Storage layout in CI surface** — Foundry profile sets
  `extra_output = ["storageLayout"]`, so storage drift is visible across
  releases.
- **Configurable deploys** — `[profile.dotenv]` plus a `script/` directory
  keep RPC URLs and private keys out of source while staying easy to use.

## Lessons Learned

Putting the contract and the client in one repo for the prototype was the
right move — it kept the iteration loop single-command, and the moment the
contract API stabilised, splitting it out into its own Foundry project was
trivial. Choosing Foundry plus the official OpenZeppelin upgrade tooling at
that split removed a whole class of upgrade-time pain later: wiring storage
layout output into the build means a future migration won't be a research
project, it'll be a diff. The broader pattern — *one repo while shape is
unstable, split when the boundary stops moving* — is the same heuristic
I apply outside Solidity, every time the right answer for "should this be
its own service?" is "not yet, but soon".
