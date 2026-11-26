---
title: Funding Rate Radar
tagline: Cross-venue funding spreads across Binance, Bybit, OKX and Hyperliquid in one APR-ranked, fee-aware table.
description: Funding arbitrage dashboard with symbol normalization, 7-day history, filters and a net-yield calculator. Static export, no API keys.
status: live
tags: [Trading, DeFi]
stack: [Next.js, TypeScript, TanStack Query, Recharts, Zod]
metric:
  value: 4 exchanges
  label: refreshed every 5 min
role: Product, architecture, AI-assisted implementation
links:
  live: https://osobennyj.github.io/warehouse-of-sites/demos/funding-rate-radar/
  github: https://github.com/osobennyj/warehouse-of-sites/tree/master/projects/funding-rate-radar
cover:
  src: /projects/funding-rate-radar/cover-v2.png
  alt: Funding Rate Radar dashboard showing cross-exchange funding spreads and opportunities table
accent: teal
order: 1
date: 2026-11-25
---

## Problem

Funding-rate arbitrage is tedious to operationalize: every exchange uses different symbols, funding intervals (1h / 4h / 8h) and fee schedules. A spread that looks rich often disappears once you normalize APR and account for thin liquidity on one leg.

## Solution

A static client-side dashboard that polls public REST APIs, normalizes funding to a common **annualized APR**, and ranks delta-neutral opportunities:

- **Opportunities table:** best long vs short venue per asset, spread APR, min OI/volume across legs, filters by spread, volume and exchange.
- **Per-asset history:** seven days of funding per venue and spread over time.
- **Net yield calculator:** capital, leverage, holding period and taker/maker fees, with net APR and PnL formulas visible in the UI.
- **Graceful degradation:** if one exchange fails, the others keep working with a clear stale flag.

Four adapters implement a shared `ExchangeFundingSource` interface; domain math and API parsing are covered by recorded fixtures and Vitest.

## Architecture

```mermaid
flowchart LR
  subgraph Sources
    B[Binance] & Y[Bybit] & O[OKX] & H[Hyperliquid]
  end
  Sources --> A[ExchangeFundingSource adapters]
  A --> N[Normalize → APR]
  N --> UI[Static dashboard]
  UI --> T[Opportunities]
  UI --> K[Net yield]
```

## Results

- **~80%** line coverage on domain and adapter layers with recorded JSON fixtures (no live network in CI).
- Steiger-enforced FSD layout, Playwright smoke, GitHub Actions CI.
- Shipped in monorepo PR, ready to extract to a dedicated repo when permissions allow.

## Next steps

Postgres history via cron on a serverful host, spread alerts, more venues.