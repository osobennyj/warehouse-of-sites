---
title: Funding Rate Radar
tagline: "Funding rates for the same perpetual differ by exchange. This ranks the spreads by net profit after fees."
description: "Compares perpetual funding rates across Binance, Bybit, OKX and Hyperliquid and ranks spreads by net profit after fees. Live public data, no API keys."
solves: "Comparing funding by hand across four exchanges with different symbols, intervals and fees."
decision: "Rank by net USD after taker fees at a chosen size, not by raw APR, which favors illiquid markets."
status: live
tags: [Trading, DeFi]
stack: [TypeScript, Next.js]
role: Product, architecture, AI-assisted implementation
links:
  live: https://osobennyj.github.io/warehouse-of-sites/demos/funding-rate-radar/
  github: https://github.com/osobennyj/warehouse-of-sites/tree/master/projects/funding-rate-radar
cover:
  src: /projects/funding-rate-radar/cover-v3.png
  alt: Funding Rate Radar dashboard showing cross-exchange funding spreads and opportunities table
accent: teal
order: 1
date: 2026-11-25
---

## Problem

Funding-rate arbitrage means going long a perpetual on the exchange that pays less and short on the one that pays more. Each exchange uses different symbols, funding intervals (1h, 4h, 8h) and fees, so comparing them by hand is slow and error-prone. A spread that looks large often disappears after fees or sits on a market with little liquidity.

## What it does

- Reads public REST APIs from Binance, Bybit, OKX and Hyperliquid (top 50 markets each) every 5 minutes. No API keys.
- Converts every rate to an annualized APR so the venues are comparable.
- Ranks assets by net USD for the next funding window, after taker fees on both legs, at the position size you enter.
- Shows 7 days of funding history per asset, and a net yield calculator with the formulas visible.
- If one exchange fails, the others keep working and the failed one is flagged.

## Decisions

- **Rank by net USD, not APR.** The highest APRs on the page are usually thin markets. Net USD at a fixed size is the number that decides whether the trade is worth opening.
- **Taker fees on both legs, entry and exit.** The conservative case, so the result is not flattered.
- **Everything runs in the browser.** No backend to maintain. The cost is that history is limited to what the exchange APIs return.

## Architecture

```mermaid
flowchart LR
  subgraph Sources
    B[Binance] & Y[Bybit] & O[OKX] & H[Hyperliquid]
  end
  Sources --> A[One adapter per exchange]
  A --> N[Normalize to APR]
  N --> R[Rank by net USD]
  R --> UI[Dashboard]
```

## Tests

50 unit tests (Vitest) cover APR conversion, spread ranking, the calculator and the parsing of each exchange response. Responses are recorded as fixtures, so CI does not call the live APIs. A Playwright smoke test and GitHub Actions run on every push.
