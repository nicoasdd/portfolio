---
title: "Geometry of Fate — Phaser 3 Arena Shooter"
description: "A weekend top-down arena shooter prototype in TypeScript + Phaser 3, with `tsc --noEmit` wired into the Vite build so even a one-weekend project keeps the discipline of typed entity contracts."
role: "Solo Developer"
period:
  start: "2025-03"
  end: "2025-03"
techStack:
  - "TypeScript"
  - "Phaser 3"
  - "Vite"
  - "Node.js"
thumbnail: "/projects/geometry-of-fate/thumbnail.svg"
featured: false
order: 70
draft: true
---

## Overview

A small top-down arena shooter prototype built in a single weekend with
TypeScript and Phaser 3. The goal was to feel out Phaser's scene system, get
fast iteration with Vite, and ship a focused vertical slice with three game
entities (Player, Enemy, Projectile) and tight movement feel.

The whole game lives in a handful of files under `src/scenes` and
`src/entities`, with a Preloader scene handling assets and a single GameScene
running the loop. Type-checking is wired into the build (`tsc --noEmit` before
`vite build`) so the project keeps the discipline of a real codebase even at
prototype size.

Source code lives in a private repository.

## Highlights

- **Phaser 3 + TypeScript** — strict types over Phaser's API forced clean
  separation between entities, the scene, and the input layer.
- **Dash with cooldown** — early commits chased the right "feel" for the dash
  mechanic, including the bug fix that made it actually cancel cleanly.
- **Vite-powered DX** — sub-second hot reload meant tuning movement, walls,
  and enemy death felt closer to playing than coding.

## Lessons Learned

Phaser's scene + entity model is fast to get into, but most of the value came
from leaning on TypeScript to keep entity contracts honest. The few hours
spent on types up-front paid back every time movement or collision changed —
the same shape-the-contract-first instinct I rely on at work, just compressed
into a weekend.
