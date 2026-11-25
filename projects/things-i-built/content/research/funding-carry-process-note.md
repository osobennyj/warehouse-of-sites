---
title: How I use funding carry research in public
summary: A public Telegram trading diary and Funding Rate Radar for fee-aware carry math. I log process and mechanics, not headline returns.
kind: note
tags: [Trading, DeFi]
readingMinutes: 3
date: 2026-11-18
---

I run a public Telegram channel where I document funding and basis trades I am watching or running. The channel is a
diary of **setup, risks, and what changed**, not a performance leaderboard.

## Short outcome: faster filtering

Before Funding Rate Radar existed, I tab-switched across four exchange UIs to compare funding intervals and fees. The
dashboard normalized APR and added a net-yield calculator with taker/maker assumptions visible in the UI. That cut
time-to-shortlist for ideas I might write about.

## What I deliberately do not post

I avoid posting "% up this week" screenshots without context. If I cannot tie a number to a source (exchange API,
on-chain event, or CV-sourced engineering metric), I describe the idea qualitatively instead.

## Long outcome: repeatable review

The carry workflow is: rank spreads → check liquidity on both legs → stress fees and holding period → only then
decide size. Funding Rate Radar encodes the first half; the diary covers judgment calls the UI cannot automate.

## Tools used

- **Funding Rate Radar** (this portfolio): live MVP under `/demos/funding-rate-radar/`.
- **DeFi Strategist MCP** `funding_carry` tool when I want the same math inside an agent session.

_Not financial advice._