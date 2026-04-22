---
title: "Divergent Terrains UE5 — Components-Over-Inheritance Prototype"
description: "An Unreal Engine 5 survival prototype with unusual structural discipline for a one-month build: `BasePlayerCharacter` plus Health/Weapon/FireScene components, data-table-driven items, replicated weapon flow, and a working gather loop."
role: "Solo Engineer & Gameplay Architect"
period:
  start: "2024-05"
  end: "2024-06"
techStack:
  - "Unreal Engine 5"
  - "C++"
  - "Blueprints"
thumbnail: "/projects/divergent-terrains-ue5/thumbnail.svg"
featured: false
order: 60
draft: true
---

## Overview

A survival-genre prototype built in Unreal Engine 5 with an unusual amount
of structural discipline for a one-month build. The player is composed of a
`BasePlayerCharacter` plus dedicated components — `HealthComponent`,
`WeaponComponent`, `FireSceneComponent` — driven by multicast delegates so
HUD, gameplay, and replication stay decoupled.

Items live in data tables, surfaced through a `GameCoreDataManager` and
`DataService`, so adding a new pickup or weapon is a row + a Blueprint, not
a code change. Gameplay-wise the prototype gets to a real loop: pick up
wood, equip an axe, attack a tree, and have the environment react.

Source code lives in a private repository.

## Highlights

- **Components over inheritance** — Health, Weapon, and FireScene as
  attachable components on `BasePlayerCharacter`, replacing a previous
  `MyCharacter` god-class with composable behaviour.
- **Data-driven items** — pickups and weapons defined in data tables,
  loaded through `DataService`, so balancing changes don't touch C++.
- **Replicated weapon flow** — `FireSceneComponent` handles ammo
  replication and attaches weapons to character sockets, validating the
  multiplayer story early.
- **Environment that reacts** — axe-on-tree destruction and basic pickup
  flow (`BP_Pickup_Wood`) close the loop between the player, items, and
  the world.

## Lessons Learned

UE5 rewards aggressively pulling logic into components and data tables. The
biggest momentum gain came after the `MyCharacter` → `BasePlayerCharacter`
refactor: every later feature plugged in as a component instead of
threading through one giant actor — the same composition-over-inheritance
move that pays back outside game engines whenever a class starts sprouting
"this only matters when X" branches.
