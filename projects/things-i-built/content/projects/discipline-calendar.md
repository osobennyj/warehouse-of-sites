---
title: Discipline Calendar
tagline: "A trading journal that colors every day by one question: did each trade follow the plan?"
description: Calendar-based trading journal with by-plan vs off-plan stats, skipped-trade tracking, mood and notes. Demo runs on sample data in the browser.
status: live
tags: [Trading]
stack: [Next.js, TypeScript, React, Supabase]
metric:
  value: Plan vs impulse
  label: green and red days, monthly stats
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

Most trading journals track profit and loss. The thing that actually moves results is discipline: whether you took only the trades your plan allows. A losing trade that followed the plan is fine. A winning trade that broke it is a warning sign.

## Solution

A monthly calendar where each day gets one color:

- **Green:** every trade followed the plan, or it was a deliberate no-trade day.
- **Red:** at least one off-plan trade (tagged FOMO, revenge, overtrade or impulse).
- **Gray:** nothing logged.

Open a day to log trades with result and RR, setups you skipped and what they would have done, mood, notes and screenshots. The monthly stats compare by-plan and off-plan trades: win rate, average RR, current green streak, best and worst asset.

I built it for my own trading, so the feature set follows real needs: skipped trades are tracked because "what would have happened" is the question I kept asking.

## Architecture

```mermaid
flowchart LR
  U[Calendar and day form] --> S[Journal API]
  S --> D[(Supabase: days, trades, skips)]
  S --> L[(Browser storage: demo mode)]
  D & L --> M[Monthly metrics]
  M --> UI[Stats and calendar colors]
```

The same screens run on two backends. The private version signs in and stores data in Supabase. The public demo swaps in a local backend, so no login is needed and nothing leaves your browser.

## Key decisions & trade-offs

- **Demo mode instead of a read-only copy:** you can add and delete trades to see the stats react.
- **Sample data is invented** and generated per month, so the calendar is never empty. It is not real trading history.
- **No profit and loss numbers.** RR is recorded per trade, but the calendar color depends only on discipline.

## Results

- Used daily for my own trading journal.
- Static demo with no server and no account.

## Next steps

Weekly review view, export to CSV, and tag-based breakdown of off-plan trades.
