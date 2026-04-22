---
title: "Dashboard Crypto Games — Two Marketing Sites, One Studio"
description: "Two iterations of the studio's marketing site a year apart: a lean Next.js + Bootstrap landing with one-command S3 + CloudFront deploy, then a TypeScript launch redesign with GSAP, Lottie, Steam OAuth, and a Dockerised release."
role: "Frontend Engineer & Deploy Owner"
period:
  start: "2021-11"
  end: "2022-10"
techStack:
  - "TypeScript"
  - "Next.js"
  - "React"
  - "Bootstrap"
  - "Sass"
  - "GSAP"
  - "Lottie"
  - "AWS S3"
  - "CloudFront"
  - "AWS Amplify"
  - "Docker"
thumbnail: "/projects/dg-landing/thumbnail.svg"
featured: false
order: 50
draft: true
---

## Overview

The Dashboard Crypto Games studio went through two marketing-site
iterations, a year apart, that bracket how the studio's identity changed
between "we exist" and "we're launching".

**First landing (2021–2022).** The first marketing site for the studio.
A Next.js project styled with React-Bootstrap, exported to a static
`build/` folder and shipped to an S3 bucket fronted by CloudFront, with a
one-command deploy that ran the build, synced, and invalidated the CDN
(`npm run deploy`). The repo also shipped an `amplify.yml` so the same
project could push through AWS Amplify for review previews — useful when
designers and founders wanted to look at a branch before it shipped.
Dependency surface was deliberately lean: `next` + `react-bootstrap` and
not much else.

**Launch site (2022).** The redesigned site for the studio's launch
moment. A Next.js + TypeScript app organised into `pages`, `components`,
`contexts`, `domains`, and `hooks`, styled with Sass, and brought to life
with GSAP transitions plus Lottie animations. The site doesn't stop at
marketing copy — it integrates Steam OAuth so visitors can sign in
directly with their Steam account, captures newsletter emails through a
small form pipeline, and ships behind a Dockerfile so the same artefact
can run on Amplify or any container host.

Source code lives in private repositories.

## Highlights

- **One-command static deploy (v1)** — `client-s3-deploy` +
  `client-cloudfront-invalidation` scripts wired into a single `deploy`
  script so shipping was an `npm run` away.
- **Amplify-ready previews (v1)** — `amplify.yml` let the same Next.js
  project produce per-branch previews without changing the build.
- **Lean dependency surface (v1)** — `next` + `react-bootstrap` and not
  much else, so the marketing site stayed cheap to maintain across studio
  re-brands.
- **Steam login on a marketing site (v2)** — `SteamButton` component plus
  an auth hook delivered an unusual bit of identity right on the landing
  page, not buried inside an app.
- **Motion as a first-class layer (v2)** — GSAP scroll-driven transitions
  plus Lottie animations kept the launch-era story feeling alive without
  ballooning the bundle.
- **Domain-shaped structure (v2)** — `components`, `contexts`, `domains`,
  `helpers`, `hooks`, `routes` instead of a flat `pages` dump, so the
  site could grow without becoming a tangle.
- **Container deploy (v2)** — Dockerfile + a downgrade to Next 11.1 for
  Amplify-compatible deploys, with a `feature/docker` PR pinning the
  build behaviour.

## Lessons Learned

For a marketing site, owning the deploy story was as important as owning
the design. A single `npm run deploy` that touched both S3 and CloudFront
removed the most common excuse for "we'll ship the new copy tomorrow" —
the reflex I now bring to *any* surface where shipping friction quietly
becomes shipping cadence. A year later, when the launch site wanted real
logic — Steam auth, newsletter, animations — the site aged badly without
structure. Putting `domains/`, `hooks/`, and `contexts/` in from day one
made it possible to add features later without rewriting the page layer.
