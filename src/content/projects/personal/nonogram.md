---
title: "Nonogram + City-Builder — Godot 3 Prototype"
description: "A focused weekend Godot 3 prototype: nonogram (Picross) puzzles wrapped in a city-building reveal, built on a 2D grid-movement template — scenes, tilemaps, and signal-driven UI, kept small on purpose."
role: "Solo Developer"
period:
  start: "2021-11"
  end: "2021-11"
techStack:
  - "Godot 3"
  - "GDScript"
thumbnail: "/projects/nonogram/thumbnail.svg"
featured: false
order: 230
draft: true
---

## Overview

A small Godot 3 prototype experimenting with the nonogram (Picross) puzzle
format wrapped in a city-building progression. Built on top of an
open-source 2D grid-movement template, it adds a menu scene, a board scene,
and a "City 1" tile setup — the start of a flow where solving puzzles
gradually reveals a small isometric world.

The project was a focused weekend dive into Godot's scene model, tilemaps,
and signal-based UI, ahead of bigger Godot work. It's intentionally small
and stops at first-playable prototype.

Source code lives in a private repository.

## Highlights

- **Godot scene composition** — scenes for menu, board, and city tile setup
  composed cleanly, leaning on Godot's idiomatic node hierarchy.
- **Tilemap-driven board** — used Godot's TileMap node (occupied,
  non-occupied, always-on-top layers) to build the puzzle board on top of
  reusable terrain layers.
- **Prototype-sized scope** — kept the loop small (menu -> board -> reveal)
  to learn the engine without drifting into months of art.

## Lessons Learned

Godot rewards leaning into its scene + signal idioms instead of dragging in
patterns from other engines. Even at prototype size, the cleanest progress
came from letting nodes do their job and gluing them together with signals
rather than threading state through code paths — the same "use the
framework's seams instead of fighting them" instinct that saves time in
any opinionated stack.
