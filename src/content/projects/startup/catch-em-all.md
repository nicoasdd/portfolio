---
title: "Catch 'Em All — Three-Repo Omnichain NFT Stack"
description: "An omnichain NFT product across three repos: LayerZero contracts moving one NFT across chains, a Polygon zkEVM Solidity PoC rendering artwork fully on-chain (no IPFS), and a Next.js + Tailwind frontend on the org's standard skeleton."
role: "Solo Contract Engineer · Frontend Pair (with Andrew Ortiz)"
period:
  start: "2022-04"
  end: "2023-08"
techStack:
  - "Solidity"
  - "Hardhat"
  - "LayerZero"
  - "OpenZeppelin"
  - "TypeChain"
  - "ethers.js"
  - "Polygon zkEVM"
  - "TypeScript"
  - "Next.js"
  - "React"
  - "Tailwind CSS"
  - "Sass"
  - "NextAuth"
  - "Web3"
thumbnail: "/projects/catch-em-all/thumbnail.svg"
featured: false
order: 160
draft: true
---

## Overview

Catch 'Em All was an omnichain NFT product spread across three repos: the
LayerZero-based contracts that let a single NFT live "everywhere" instead of
being pinned to one chain, a separate Solidity experiment that proved the
artwork could be rendered fully on-chain on Polygon zkEVM, and a Next.js +
Tailwind frontend that was meant to sit on top of both.

**Omnichain contracts.** A small but dense Hardhat codebase that defines an
`IAssetsStore` interface and uses LayerZero's `solidity-examples` package
together with OpenZeppelin to ship transfer flows, ownership logic, and
upgradable token URIs. TypeChain typings for ABIs, gas reporter and
solidity-coverage in the dev stack, Etherscan verification for both deploy
targets, and a `feature/set-ua` script for setting LayerZero's User
Application configuration. The repo kept iterating on quality late into 2023
— an `improve quality` pass and a "make uri upgradable" change being the
two most consequential.

**On-chain SVG renderer.** A deliberately small proof-of-concept exploring
fully on-chain dynamic SVG NFTs, intended as the asset layer behind the
omnichain collection. The repo (originally "PolygonZkPunks") ships an
`IParty` interface and a `Party.sol` implementation alongside Hardhat
scaffolding configured for Polygon zkEVM testnet and mainnet. The trick the
contracts demonstrate is composing the token's metadata and SVG artwork in
Solidity itself — no IPFS, no external renderer — using OpenZeppelin's
primitives and `hardhat-contract-sizer` to stay under the 24 KB ceiling.

**Frontend.** A pair-programming session with Andrew Ortiz, started from the
org's standard Next.js skeleton — `providers/web3/chain.ts`,
`providers/lang/Provider.tsx`, NextAuth-typed sessions
(`src/types/next-auth.d.ts`), Husky + Commitlint + lint-staged + import
sorter, Sass for component styles (`_btn.scss`, `_modal.scss`,
`_dropdown.scss`, `_input.scss`) and Tailwind for layout. The committed
shape is small but real: a `pages/index.tsx`, a `pages/comming-soon` route,
a layout layer (`TopBar`, `Container`, `Content`, `Footer`), and an
`appConfig.ts` for meta data. Andrew owned the keyboard; my role was on
layout choices, the NextAuth wiring, and the `comming-soon` first-paint
while the contracts were still landing.

Source code lives in private repositories.

## Highlights

- **LayerZero omnichain transfers** — built directly on
  `@layerzerolabs/solidity-examples`, so cross-chain semantics inherited the
  official patterns instead of being reinvented.
- **AssetsStore interface** — `contracts/interfaces/IAssetsStore.sol`
  decoupled the NFT contract from how assets were stored and queried,
  leaving room for the on-chain SVG renderer to slot in underneath.
- **Upgradable URI** — an explicit pass to make the token URI upgradable, so
  collection metadata could evolve without re-issuing tokens.
- **Fully on-chain SVG** — the NFT image composed inside the contract, so
  the token survives any external storage outage and stays dynamic per
  call; `hardhat-contract-sizer` in the dev stack from day one because
  on-chain SVG always pushes against the 24 KB ceiling.
- **IParty / Party split** — interface + implementation separation for the
  renderer matched the `IAssetsStore` pattern in the omnichain contracts,
  so swapping or mocking either layer stayed cheap.
- **Polygon zkEVM-targeted asset layer** — Hardhat config shaped for zkEVM
  testnet and mainnet with a verify script that included a constructor-args
  file pattern for upgrades.
- **Org-wide Next.js skeleton, applied to NFTs** — same `providers/`,
  layout, i18n, and lint pipeline as the rest of the org's frontends, so
  the NFT app inherited tooling habits the team already knew.
- **NextAuth typings from day one** — `src/types/next-auth.d.ts` extends
  the session shape, so when wallet-bound sign-in landed it was type-safe
  end to end.
- **Coming-soon as a first deploy** — the `pages/comming-soon` route let
  the marketing surface go live well before the full app, instead of
  holding deploys back until everything was wired.

## Lessons Learned

The wins on omnichain NFTs came from leaning hard on the LayerZero reference
contracts rather than rolling our own messaging layer. The most important
late-stage change was the upgradable URI — a small Solidity diff that
prevented an entire class of "metadata frozen" problems from showing up
post-launch. That decision shape — *find the smallest Solidity change
that buys back the most future flexibility* — is now my default lens for
any contract design review.

The on-chain SVG experiment was the kind of binary question that's worth a
single commit's worth of work: "can we render this artwork entirely on-chain
on zkEVM?" The answer (yes, with discipline about contract size) unlocked a
whole class of designs for the omnichain collection downstream. And on the
frontend, pair-programming on someone else's boilerplate turned out to be
the fastest way to internalise their conventions — the Sass + Tailwind
hybrid was the interesting trade-off, but accepting both was cheaper than
picking a fight with the design system the team had already invested in.
