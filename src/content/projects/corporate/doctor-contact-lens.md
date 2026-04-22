---
title: "Doctor Contact Lens Ordering Platform"
description: "Web interface for optometrists to load contact lens prescriptions and automatically dispatch orders to the lab — Meteor.js application with AWS SQS for batch processing."
role: "Full Stack Developer"
period:
  start: "2019-09"
  end: "2021-03"
techStack:
  - "Meteor.js"
  - "Node.js"
  - "JavaScript"
  - "MongoDB"
  - "AWS SQS"
  - "AWS"
thumbnail: "/projects/doctor-contact-lens/thumbnail.svg"
featured: false
order: 15
---

## Overview

Worked at Asamblo, a software factory, embedded on the Doctor Contact
Lens client engagement: a web platform for optometry clinics to load
patient contact lens prescriptions and turn them into orders sent to the
lab. The interface is where the doctor or clinic staff lives day-to-day —
capture the prescription, validate it against the catalogue, attach it
to the patient, and queue the order. Everything from that capture screen
down to the dispatch pipeline was part of the remit.

The application was a Meteor.js stack — Node.js on the server, MongoDB as
the primary store, and Meteor's reactive layer driving the clinic-facing
UI. Order dispatch was decoupled from the request/response path through
AWS SQS: each placed order was enqueued, then picked up by workers that
batched orders, applied the lab's submission rules, and pushed them out.
Pulling that work off the request thread kept the UI snappy and let the
batch side be retried, throttled, and observed independently of the
clinical workflow.

## Highlights

- **Clinic-facing prescription UI** — a Meteor.js front end built around
  the doctor's real workflow: capture prescription, validate, attach to
  patient, send.
- **SQS-backed batch dispatch** — orders were enqueued to AWS SQS and
  drained by workers in batches, so spikes in clinic activity didn't
  translate into spikes in lab submissions.
- **End-to-end ownership** — frontend forms, server methods, MongoDB
  schema, queue producers, and SQS consumers all sat in the same
  full-stack remit.
- **Operational separation** — putting the lab handoff behind a queue
  meant retries, dead-letter handling, and rate limits lived in one place
  instead of being scattered through the UI flows.

## Lessons Learned

The single best decision on the project was not letting the lab dispatch
sit on the same code path as the prescription form. Once orders went
through SQS, the clinic-facing app stopped caring about lab outages, rate
limits, or batching rules — those problems became the worker's job, with
their own retries and visibility. Meteor's reactive stack made the
clinical UI fast to build, but the real reliability story was on the
asynchronous side, where the queue gave us room to recover from anything
the downstream lab pipeline threw at us.
