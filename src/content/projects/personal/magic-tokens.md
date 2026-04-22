---
title: "MTG Token Dataset & 3D-Print Pipeline"
description: "A Python data pipeline that fetches every Magic token from Scryfall, deduplicates on (name + P/T + colour + type), links each token to the cards that create it, ranks by EDHREC, and generates Hueforge prompts for 3D printing the top 50."
role: "Solo Engineer & Dataset Architect"
period:
  start: "2026-01"
  end: "2026-03"
techStack:
  - "Python"
  - "Scryfall API"
  - "Pandas"
  - "EDHREC"
  - "Hueforge"
thumbnail: "/projects/magic-tokens/thumbnail.svg"
links:
  source: "https://github.com/nicoasdd/magic-tokens"
order: 30
draft: true
---

## Overview

A data pipeline and dataset that fetches every Magic: The Gathering token from
Scryfall, deduplicates them by gameplay characteristics, links each token back
to the cards that produce it, and ranks the result by EDHREC Commander
popularity. Both Commander-wide and Standard-legal slices are produced.

Built originally to feed a side-project: generating Hueforge prompts for the
top-50 most-played tokens so they can be 3D-printed as multi-color physical
tokens.

## Highlights

- **Two-axis dedup** — tokens are unique on (name + power/toughness + color + type), printings are tracked separately.
- **Source-card linking** — every unique token carries a list of the cards that create it, sorted by EDHREC rank.
- **Format slicing** — Commander-wide and Standard-legal datasets share the same pipeline, with format passed as a CLI arg.
- **Hueforge integration** — automatically generates AI image prompts tuned for flat-top, multi-filament 3D prints of the most popular tokens.

## Lessons Learned

The hard part of a "small" data project is rarely the fetching — it's the
deduplication rules. Spending an afternoon writing down what counts as "the
same token" before touching code saved several days of confused output
later. It's the same pattern I keep hitting in larger systems: the
domain-modelling step that *feels* like procrastination is usually the
single highest-leverage hour in the project.
