---
# === REQUIRED FIELDS ===

# Display name (1–80 chars).
title: "Project Title Here"

# One-line summary shown on cards and as the meta description (1–240 chars).
description: "A concise description of what this project is and why it matters."

# Optional URL slug; defaults to the filename without extension.
# Must be kebab-case and globally unique across all categories.
# slug: "my-project-slug"

# Your role on the project.
role: "Lead Engineer"

# Time period: start (YYYY-MM) and end (YYYY-MM or "present").
period:
  start: "2024-03"
  end: "present"

# Technologies / frameworks / languages used (1–20 items).
techStack:
  - "TypeScript"
  - "Astro"
  - "Tailwind CSS"

# Path (under public/) to the card thumbnail.
thumbnail: "/projects/my-project-slug/thumbnail.webp"

# === OPTIONAL FIELDS ===

# Extra images shown on the detail page (max 10).
screenshots:
  - "/projects/my-project-slug/screenshot-1.webp"
  - "/projects/my-project-slug/screenshot-2.webp"

# External links (all optional). Omit any you don't have.
links:
  source: "https://github.com/your-username/your-repo"
  live: "https://your-project.example.com"
  # caseStudy: "https://your-blog.example.com/post"

# Whether to surface this project on the landing page featured section.
featured: false

# Sort order within the category (lower = earlier). Default: 100.
order: 100

# Set true to keep this file out of the production build (visible in dev only).
draft: false
---

## Overview

Write the long-form description of the project here using normal Markdown.

You can use **bold**, _italics_, `code`, lists, and links freely.

## Highlights

- Key accomplishment one
- Key accomplishment two
- Key accomplishment three

## Lessons Learned

Reflect on what you learned, what you'd do differently, and what made the project
interesting.
