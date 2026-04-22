---
title: "Kuady Digital Wallet"
description: "Architected a mobile-first digital wallet from scratch as Software Architect — .NET Core services, MongoDB, Microsoft Entra ID, and Azure cloud across the whole platform."
role: "Software Architect"
period:
  start: "2024-01"
  end: "2024-12"
techStack:
  - ".NET Core"
  - "C#"
  - "MongoDB"
  - "Microsoft Entra ID"
  - "Azure"
  - "Azure Functions"
  - "Azure Service Bus"
  - "REST APIs"
  - "Mobile-First"
thumbnail: "/projects/kuady/thumbnail.svg"
featured: true
order: 5
---

## Overview

Joined Kuady as Software Architect to design and build a mobile-first digital
wallet from scratch. The remit covered the whole platform: backend services,
data model, identity, cloud topology, and the contracts the mobile clients
would consume. Decisions made in the first weeks would shape how every
feature shipped after, so the early work was as much about constraints as
about code.

The backend was built on .NET Core, with MongoDB as the primary store for
user, account, and ledger data. Identity ran on Microsoft Entra ID so we
inherited a hardened auth surface — multi-factor, conditional access, token
lifetimes — instead of rolling our own. The platform sat on Azure end to
end: App Services and Functions for compute, Service Bus for asynchronous
flows between wallet operations, Key Vault for secrets, and Application
Insights for the observability story. Every API was designed mobile-first:
small payloads, idempotent writes, and explicit error envelopes that the
mobile clients could surface without translation.

## Highlights

- **Greenfield architecture** — defined the service boundaries, data model,
  and Azure topology from a blank page, with no legacy to carry.
- **.NET Core + MongoDB** — picked for fast iteration on the document-shaped
  wallet/ledger data and for the team's existing C# strength.
- **Entra ID for identity** — delegated authentication, MFA, and conditional
  access to a managed identity provider instead of building it in-house.
- **Mobile-first API contracts** — payload shape, pagination, and error
  envelopes were designed against the mobile clients' real constraints, not
  retrofitted later.
- **Azure-native operations** — Service Bus, Key Vault, and Application
  Insights wired in from day one so deploys, secrets, and incidents had a
  single, consistent story.

## Lessons Learned

The hardest part of greenfield work isn't picking the stack — it's saying no
to features long enough to get the foundations right. Every shortcut on
identity, ledger consistency, or API shape would have cost more in the
second year than it saved in the first. Leaning on Entra ID and managed
Azure services freed us from owning problems that have already been solved
well, and that decision paid off every time the team needed to ship instead
of debug infrastructure.
