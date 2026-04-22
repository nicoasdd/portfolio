---
title: "TD Color Mixing — Flat-Top 3MF Generator (Paused Prototype)"
description: "A browser 3MF generator using Beer-Lambert Transmission Distance math + a LUT inverse solver to reproduce images as flat-top multi-filament prints. Off-thread compute, IndexedDB filament library, 24 unit tests — slicer export still broken."
role: "Solo Engineer"
period:
  start: "2026-04"
  end: "2026-04"
techStack:
  - "TypeScript"
  - "Next.js"
  - "React"
  - "Tailwind CSS"
  - "Web Workers"
  - "Dexie (IndexedDB)"
  - "JSZip"
  - "Vitest"
thumbnail: "/projects/transmission-distance-mixing/thumbnail.svg"
links:
  source: "https://github.com/nicoasdd/transmision-disntance-mixing"
order: 40
draft: true
---

## Overview

A browser-based generator for **flat-top, multi-material 3MF files** that
reproduce a source image by stacking translucent filament layers at varying
thicknesses. The math comes from **Transmission Distance (TD)** color mixing —
a Beer-Lambert forward model paired with a LUT-based inverse solver that
finds, per pixel, the layer heights that best reproduce its color while
keeping the top of the print perfectly flat.

Status: **prototype / paused**. The color model and UI work end-to-end; the
3MF that gets written out is a structurally valid ZIP but is not interpreted
correctly by BambuStudio.

## Highlights

- **Beer-Lambert TD solver** with a LUT + grid-search inverse, enforcing the flat-top constraint that all layer heights sum to a constant.
- **Off-thread compute** — TD solving and mesh generation run in a Web Worker so the UI stays responsive on large images.
- **Local filament library** — full CRUD with IndexedDB persistence (Dexie) and JSON import/export, so my real spools live with the app.
- **24 unit tests** covering the colour math, the TD model, and the mesh builder — the parts that have to be correct before anything else matters.

## Lessons Learned

I shipped the UI and the algorithm before validating the output format
end-to-end against a real slicer. Next time, the very first integration test
should be: round-trip a known-good vendor file through the writer and confirm
it still imports. That single check would have saved the project — and it's
the exact lesson that generalises to any system whose final output is consumed
by something I don't control: validate the *interop seam* before investing in
anything that depends on it.
