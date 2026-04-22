---
title: "Stop-Loss Service — 100% Coverage as a Forcing Function"
description: "A two-week pair-programming sprint on top of Andrew Ortiz's `base-nest-boilerplate`: NestJS service shaped by dependency-cruiser layer rules, secured-entity authorisation, Husky-enforced gates, and a hard 100% domain-coverage target."
role: "Architecture & Review Pair (with Andrew Ortiz)"
period:
  start: "2023-10"
  end: "2023-11"
techStack:
  - "TypeScript"
  - "NestJS"
  - "Node.js"
  - "Jest"
  - "dependency-cruiser"
  - "Husky"
  - "ESLint"
  - "Prettier"
thumbnail: "/projects/stop-loss/thumbnail.svg"
featured: false
order: 250
draft: true
---

## Overview

A pair-programming sprint with Andrew Ortiz, building on top of his
`base-nest-boilerplate`. The two of us drove a NestJS service over a
short two-week window — Andrew at the keyboard for most of it, with me
pairing on architecture, code reviews, and the occasional commit — to
hit a self-imposed bar: 100 % test coverage on the domain layer,
explicit module boundaries, and pre-commit hooks tight enough that
nothing untested could land.

The repo's commit log is the artefact: a `feature/setup-coverage`
branch, a `feature/hooky` branch wiring Husky + lint-staged, a
`refactor/secured-entities` pass, a `feature/user-add-merchant`
endpoint, and a final push from 96 % → 98.84 % → 100 % coverage.

Source code lives in a private repository.

## Highlights

- **100 % coverage as a forcing function** — the late commits
  (`coverage 96%`, `coverage 100%`, "make domain service for effective
  tests increase coverage to 98.84%") show the architecture being
  reshaped in service of testability, not the other way round.
- **dependency-cruiser boundaries** — `.dependency-cruiser.js` enforces
  that the domain layer doesn't reach into infrastructure, locked in by
  a "fix: add ignore folder test for cruiser package" pass.
- **Husky + lint-staged + commitlint** — the `feature/hooky` PR makes
  the unhappy path (broken tests, unformatted code) impossible to
  commit, not just discouraged.
- **Secured entities pattern** — a `refactor/secured-entities` PR
  reorganises the domain so authorisation is part of the entity surface
  rather than something the controller has to remember.

## Lessons Learned

Pair-programming on someone else's boilerplate is an underrated way to
learn opinionated patterns fast — Andrew's
`base-nest-boilerplate` brought conventions I would not have arrived at
alone (the dependency-cruiser config, the secured-entities split, the
shape of his test layout). The 100 % coverage goal was the right kind
of artificial constraint: it surfaced abstractions that wouldn't have
emerged from "just write tests for the happy path". The bigger
takeaway is that *executable* architecture — `dependency-cruiser` rules
that fail the build, hooks that refuse the bad commit — ages much
better than the same rules written down in a contributor guide.
