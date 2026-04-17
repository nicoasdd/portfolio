---
title: "Open-Source CLI Toolkit"
description: "A small, fast command-line toolkit for everyday developer tasks — file watching, log filtering, and project scaffolding."
role: "Solo Maintainer"
period:
  start: "2024-01"
  end: "present"
techStack:
  - "TypeScript"
  - "Node.js"
  - "Vitest"
thumbnail: "/projects/example-personal/thumbnail.svg"
links:
  source: "https://github.com/your-username/cli-toolkit"
featured: true
order: 10
---

## Overview

A personal weekend project that grew into a tool I use every day. The toolkit
bundles three commands: a debounced file watcher, a structured-log filter, and a
project scaffolder driven by simple YAML templates.

## Highlights

- Zero runtime dependencies in the published bundle.
- Sub-50ms cold start via lazy command loading.
- 100% test coverage on the public API surface.

## Lessons Learned

Working in public taught me to write better changelogs and to design APIs that
are pleasant to read on their own — without docs in front of you.
