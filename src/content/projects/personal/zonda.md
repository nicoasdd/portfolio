---
title: "Zonda Platform — Two-Year, Three-Repo Multi-App Build"
description: "A multi-year platform across three repos: a Clean-Architecture NestJS core API with executable layer rules and CASL RBAC+ABAC, an npm-workspaces monorepo wrapping back-office, front-office, and dApp, plus upgradeable Zonda Cash contracts."
role: "Solo Engineer & Platform Architect"
period:
  start: "2023-10"
  end: "2025-12"
techStack:
  - "TypeScript"
  - "NestJS"
  - "Next.js"
  - "Prisma"
  - "PostgreSQL"
  - "CASL"
  - "JWT"
  - "Passport"
  - "Resend"
  - "Jest"
  - "npm workspaces"
  - "Solidity"
  - "Hardhat"
  - "ethers.js"
  - "OpenZeppelin"
  - "OpenZeppelin Upgrades"
  - "Docker"
  - "Spec Kit"
thumbnail: "/projects/zonda/thumbnail.svg"
featured: false
order: 60
draft: true
---

## Overview

Zonda is a multi-year platform shipped across three repos that bracket the
journey from "on-chain payments primitive" (2023) to "full multi-app
platform with shared abilities and spec-driven development" (2025).

**Cash Contracts (2023).** The on-chain contracts behind Zonda Cash
payments. A Hardhat + TypeScript project built on OpenZeppelin Contracts and
the upgradeable variants, with `@openzeppelin/hardhat-upgrades` wiring for
proxy management and a fee-model contract whose maximum was capped at 10 %
during the test review cycle. Deployment was multi-network from day one:
separate scripts for Fantom testnet and BSC testnet
(`deploy:testnet:fantom`, `deploy:testnet:bsc`) and an `upgrade` script for
the Fantom proxy, so the same code could ship to several chains as Zonda
Cash expanded.

**Core API (2025).** A NestJS backend organised around Clean Architecture
and bounded contexts. Each context (auth, users, permissions, audit,
notifications, api-credentials, example) has its own `domain/`,
`application/`, and `infrastructure/` folders, with repository interfaces
sitting in the domain layer and Prisma implementations bound to them
inside each context's NestJS module. The unusual part is that the
architectural rules are themselves executable — `architecture.spec.ts`
walks every TypeScript file in `src/`, classifies it by layer, parses its
imports, and fails the test run if a `domain` file reaches into
`application` or `infrastructure`. The same suite enforces an 80 %
coverage floor on the domain and application layers via
`test:cov:check`, so the layering discipline survives contact with
deadlines. Authorization is layered: JWT verification, then a
token-revocation guard backed by a Postgres table with an in-memory cache
for O(1) lookups, then a CASL ability check for fine-grained permissions —
all composable through a single `@FullyProtected({ roles, abilities })`
decorator.

**Monorepo (2025).** The umbrella repository that ties it all together.
Five workspaces — `back-office`, `front-office`, `dapp` (all Next.js),
`core-api` (NestJS), and a shared `@zonda/abilities` package built around
CASL — share dependencies, types, and tooling through npm workspaces. The
repo also ships a real-world ops layer: separate Docker compose files for
development, test, and production, cross-platform test scripts (`.sh`,
`.bat`, `.ps1`), and Spec Kit + Claude Code configuration so feature work
follows a documented spec-driven cycle (`init constitution.md` is one of
the first commits).

Source code lives in private repositories.

## Highlights

- **Upgradeable payments from the start (Cash)** — built on
  `@openzeppelin/contracts-upgradeable` plus
  `@openzeppelin/hardhat-upgrades`, so live contracts could be evolved
  without redeploying users.
- **Capped fee model (Cash)** — fee logic exposed through a configurable
  knob but bounded to a 10 % maximum, locked in by tests as part of the
  feature/fee-and-test PR.
- **Multi-chain deploys (Cash)** — Fantom and BSC testnet deploy scripts as
  separate npm targets, keeping per-network parameters explicit instead of
  magic.
- **Architecture-as-test (Core API)** — `architecture.spec.ts` enforces
  Clean Architecture layer rules in CI; an illegal cross-layer import
  fails the build, not a reviewer.
- **Bounded contexts (Core API)** — 8 vertical slices (auth, users,
  permissions, audit, notifications, api-credentials, health, example)
  with strict layer folders and per-context NestJS modules wiring
  repository interfaces to Prisma adapters.
- **Composable authorization (Core API)** — `@CheckRoles`,
  `@CheckAbilities`, and the `@FullyProtected({ roles, abilities })`
  decorator stack JWT, revocation, RBAC, and CASL ability checks in a
  fixed guard order.
- **Token revocation with O(1) lookup (Core API)** — revoked JWTs are
  persisted to Postgres and mirrored in an in-memory cache so the
  per-request check stays constant-time even as the deny-list grows.
- **Coverage gate on the right layers (Core API)** — `test:cov:check`
  enforces 80 % coverage on `domain/` and `application/` only, where
  business invariants live.
- **Five-app monorepo (Mono)** — back-office, front-office, dApp, core-api,
  and a shared abilities package, wired through npm workspaces with
  per-app scripts and a `--workspaces` switch for fan-out commands.
- **Shared CASL abilities (Mono)** — `@zonda/abilities` keeps RBAC + ABAC
  types and helpers in one package consumed by every app, so role logic
  doesn't drift across surfaces.
- **Dev / test / prod compose (Mono)** — three Docker compose files
  describe each environment, paired with portable test scripts so CI can
  run the same suite on Linux, Mac, and Windows.
- **Spec-driven from day one (Mono)** — Spec Kit and Claude Code are
  configured in the initial commits, anchoring future feature work to
  versioned specs and a project constitution.

## Lessons Learned

Capping configurable fees at the contract level — not the front-end —
turned a debate about trust into a one-line invariant on the Cash
contracts. Pairing that with upgradeable proxies meant I could keep
moving fast without making end users carry the cost of every change.
That pattern — *put the invariant where it can't be argued with* — is
the same reflex I bring to payments and authorisation work today.

Two years later, on the Core API, putting layering rules in an executable
spec instead of a contributor guide changed how the codebase aged.
Reviewers stopped having to police imports, and "just this once"
violations surfaced in CI within seconds — the same loop that catches a
broken test catches a broken architecture. And standing up the monorepo
with shared types, a shared abilities package, and multi-environment
compose files before the first feature lands was a heavy upfront cost,
but it's also the reason adding the next Zonda surface won't require
re-deciding tooling, roles, or deployment shape.
