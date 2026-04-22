---
title: "UE4 Factory Builder Prototype"
description: "A Factorio-inspired UE4 prototype: snapped-grid placement, belts, splitters/mergers, storages, presses and furnaces — refactored onto a shared `AContraption` component base so each new machine was a small subclass plus content."
role: "Solo Developer"
period:
  start: "2020-08"
  end: "2020-09"
techStack:
  - "Unreal Engine 4"
  - "C++"
  - "Blueprints"
thumbnail: "/projects/factory-game/thumbnail.svg"
featured: false
order: 240
draft: true
---

## Overview

A first dive into Unreal Engine 4 with a Factorio-inspired factory-builder
prototype. Over a focused month, it grew from a snapping placement system
into a small working factory loop: belts that move items, splitters and
mergers that route them, storages with output slots, and machines like a
saw, press, and furnace that transform stacks into new items.

The interesting part of the codebase is the refactor toward components: an
`AContraption`-style base with `Press`, `Furnace`, and `WaterPump` derived
classes, plus an item-movement layer that handles collision and pipes. Item
metadata (name, stack size) and the building UI (one input / one output
contraptions) round out the loop.

Source code lives in a private repository.

## Highlights

- **Snapped grid placement** — building system that snaps and rotates on a
  grid, with collision fixes for belt segments.
- **Component-driven machines** — refactored `Press` and `Furnace` (and
  later pumps) onto a shared `AContraption` base so adding a new machine
  was mostly content + a small subclass.
- **Belts, splitters, mergers** — items physically move along belts and
  route through splitter/merger components, simulating a real factory
  pipeline.
- **Storage with output** — storages expose outputs and tracked stack sizes
  so they integrate naturally with belts and machines.

## Lessons Learned

The first version had per-machine logic crammed onto the actor classes;
refactoring to a `Component` per behaviour made every later feature cheaper.
UE4's component model is the right answer for "a thousand machines that
share three behaviours", and getting there early was the difference between
a demo and something actually extensible. It was also my first concrete
encounter with composition-over-inheritance as an extensibility tool —
the same instinct I now apply outside game engines whenever a class starts
collecting `if (type == ...)` branches.
