---
title: Discipline Calendar
tagline: "A trading journal that colors each day green or red by one question: did every trade follow the plan?"
description: "Trading journal that colors each day by whether every trade followed the plan, with skipped-trade tracking, mood and notes. Demo on sample data."
solves: "Most journals track profit and loss, not whether the trader followed their own rules."
decision: "The day color depends only on discipline. Profit and loss never changes it."
status: demo
tags: [Trading]
stack: [Next.js, TypeScript, React, Supabase]
metric:
  value: 5 off-plan tags
  label: FOMO, revenge, overtrade, impulse, other
role: Product, design, AI-assisted implementation
links:
  live: https://osobennyj.github.io/warehouse-of-sites/demos/discipline-calendar/
  github: https://github.com/osobennyj/warehouse-of-sites/tree/master/projects/discipline-calendar
cover:
  src: /projects/discipline-calendar/cover-v3.png
  alt: Calendar of green and red trading days with a selected day
accent: sky
featured: true
order: 3
date: 2026-11-26
---

## Problem

Most trading journals track profit and loss. A losing trade that followed the plan is fine. A winning trade that broke the plan is a warning sign. I wanted a journal that records that difference.

## What it does

Each day in a monthly calendar gets one color:

- **Green:** every trade followed the plan, or it was a deliberate no-trade day.
- **Red:** at least one off-plan trade, tagged FOMO, revenge, overtrade, impulse or other.
- **Gray:** nothing logged.

Open a day to log trades (result and RR), setups you skipped and what they would have done, mood, notes and screenshots. Monthly stats compare by-plan and off-plan trades: win rate, average RR, green streak, best and worst asset.

## Decisions

- **Color ignores profit and loss.** RR is recorded per trade, but the color only answers whether the plan was followed.
- **Skipped trades are tracked.** "What would have happened" is the question that comes up after every skipped setup, so the journal stores the answer.
- **Demo mode, not a read-only copy.** You can add and delete trades and watch the stats change.

## Architecture

```mermaid
flowchart LR
  U[Calendar and day form] --> S[Journal API]
  S --> D[(Supabase: private version)]
  S --> L[(Browser storage: demo)]
  D & L --> M[Monthly metrics]
  M --> UI[Stats and calendar colors]
```

The same screens run on two backends. The private version signs in and stores data in Supabase. The public demo uses browser storage, so no login is needed and nothing leaves your device.

## Limits

- The demo data is invented and generated per month. It is not real trading history.
- No automated tests.
- Not investment advice.

## Next steps

Weekly review, CSV export, breakdown of off-plan trades by tag.
