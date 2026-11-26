---
title: Perpetual Grid Bot
tagline: A visual arithmetic grid on a simulated BTC perpetual, showing fills, cycle PnL, funding and liquidation risk.
description: Grid strategy simulator with seeded price scenarios, replay slider, fee and funding accounting, stops and a worst-case estimate. No API keys, no live orders.
status: beta
tags: [Trading, DeFi]
stack: [JavaScript, Canvas, node:test]
metric:
  value: Simulated
  label: synthetic prices, no live orders
role: Product, architecture, AI-assisted implementation
links:
  live: https://osobennyj.github.io/warehouse-of-sites/demos/grid-bot/
  github: https://github.com/osobennyj/warehouse-of-sites/tree/master/projects/perpetual-grid-bot
accent: amber
cover:
  src: /projects/grid-bot/cover.png
  alt: Grid bot price chart with buy and sell fills marked on the grid levels
featured: true
order: 2
date: 2026-11-26
---

## Problem

A grid strategy looks simple on paper, but its results depend on details that are easy to miss: how fees and funding accumulate, how far the price can travel before the position becomes dangerous, and what a stop actually closes. A chart of the grid rarely shows these.

## Solution

A browser simulator that places one resting limit order per level and replays a synthetic price path:

- **Fills and cycles:** a buy fill places a sell one level up, and a sell fill places a buy one level down. Each completed cycle books its gain.
- **Accounting:** realized and unrealized PnL, maker and taker fees, and funding paid or received, all shown side by side.
- **Risk:** a liquidation price estimate, stop-loss levels that close the position, and a worst-case loss for a one-way move out of the range.
- **Replay:** a slider steps through the run so you can see exactly when each fill happened.

The engine is pure logic with no exchange code. It has 10 tests, including a reconciliation check on a random path.

## Architecture

```mermaid
flowchart LR
  P[Seeded price path] --> E[GridSim engine]
  C[Config: range, levels, size, stops] --> E
  E --> F[Fills and cycles]
  E --> A[PnL, fees, funding]
  E --> R[Liquidation and worst case]
  F & A & R --> U[Canvas chart and replay]
```

## Results

- Engine tests cover round-trip cycle accounting, funding sign, stop and liquidation triggers, worst-case loss and reconciliation.
- Runs entirely in the browser with no build step and no runtime dependencies.

## Limits

- The simulator uses synthetic prices, and fees and funding are fixed demo values.
- Money is handled as JavaScript numbers, which is fine for a demo and not for real order sizing.
- No exchange adapter is included. Connecting one would be a separate project.

## Next steps

A real exchange adapter behind the same engine interface, tested on recorded data before any live use.
