---
title: "MercadoLibre Billing Engine"
description: "Java 8 + Spring Boot billing engine powering MercadoLibre's LatAm marketplace — load-tested past 10k TPS."
role: "Java Developer"
period:
  start: "2017-10"
  end: "2019-09"
techStack:
  - "Java 8"
  - "Spring Boot"
  - "Apache Pulsar"
  - "Node.js"
  - "AOP"
  - "Redis"
  - "Oracle"
  - "MySQL"
  - "Cassandra"
  - "Git"
  - "Gitflow"
  - "CI/CD"
thumbnail: "/projects/mercadolibre-billing-engine/thumbnail.svg"
featured: true
order: 10
impactTagline: "Load-tested past 10k TPS"
highlightMetric:
  label: "PEAK THROUGHPUT"
  value: "10k+"
  trend: "up"
metrics:
  - { label: "PEAK THROUGHPUT", value: "10k+", unit: "TPS" }
  - { label: "ACTIVE OWNERSHIP", value: "~2", unit: "YEARS" }
  - { label: "MARKETPLACE", value: "LATAM" }
narrative:
  challenge:
    - "Charge every seller, every transaction, every fee across LatAm — zero room for drift."
    - "Sustain peak load without dropping events."
    - "Keep billing logic legible while auditing and retry policy ride alongside."
  built:
    - "Java 8 + Spring Boot billing core with Apache Pulsar for ordered async flow."
    - "Polyglot persistence: Oracle/MySQL for transactional core, Cassandra for writes, Redis for hot-path cache."
    - "Cross-cutting rules (audit, metrics, retry) factored out via AOP."
  impact:
    - "Sustained well past 10k TPS under stress tests."
    - "Shipped through CI/CD from day one — safe production changes at marketplace scale."
    - "Two years of continuous billing across MercadoLibre's LatAm marketplace."
architecture:
  - { label: "SELLERS", icon: "users" }
  - { label: "PULSAR", icon: "messaging", note: "Topics / consumers" }
  - { label: "BILLING CORE", icon: "server", note: "Spring Boot + AOP" }
  - { label: "REDIS", icon: "cache", note: "Hot-path cache" }
  - { label: "LEDGER DB", icon: "db", note: "Oracle / MySQL / Cassandra" }
---

## Overview

Two years on the team that owned the billing engine powering the entire
MercadoLibre marketplace across Latin America. The platform charges every
seller, every transaction, every fee — so correctness, throughput, and
operability were non-negotiable. My work spanned analysis, design, and
development of the engine itself, plus deployment, communications between
internal services, and day-to-day maintenance of the running system.

The stack was Java 8 with Spring Boot at its core, Apache Pulsar topics
and consumers for asynchronous, ordered event flow, and a polyglot
persistence layer — Oracle and MySQL for relational data, Cassandra for
high-volume write paths, and Redis for caching hot-path lookups. Cross-
cutting concerns (auditing, metrics, retry policy) were factored out
through AOP aspects and interceptors so domain code stayed focused on
billing rules.

## Highlights

- **Load-tested past 10k TPS** — the engine sustained well over ten
  thousand transactions per second under stress, with backpressure handled
  through Pulsar consumer tuning and Redis-backed caches.
- **Polyglot persistence done deliberately** — Oracle/MySQL for the
  transactional core, Cassandra for write-heavy ledger paths, Redis for
  caching: each datastore picked for what it was actually good at.
- **AOP for cross-cutting rules** — auditing, metrics, and retry policy
  lived in interceptors so the billing rules themselves stayed readable.
- **CI/CD from day one** — every change went through automated pipelines
  with continuous integration and continuous delivery, which is how a team
  this size ships to production safely on a marketplace this size.
- **Requirements work, not just code** — analysis, coordination, and
  supervision of incoming requirements from product and finance teams was
  half the job.

## Lessons Learned

Billing is the part of a marketplace where bugs become money — and
sometimes lawsuits. The two habits that mattered most were rigorous code
review backed by CI gates, and treating observability (metrics, logs,
audits via AOP) as a first-class deliverable instead of an afterthought.
The other lesson was about humility with data: at MercadoLibre scale, no
single database is the right answer. Picking Oracle, MySQL, Cassandra, or
Redis for each use case — and being honest about why — paid off every
time we hit a load spike.
