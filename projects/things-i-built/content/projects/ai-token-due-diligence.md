---
title: AI Token Due Diligence Agent
tagline: Five data tools → scored, source-linked token memo with a numeric hallucination guard.
description: Static Next.js agent that gathers market, protocol, unlock, holder and news data, then writes a structured report — mock LLM by default, real keys optional.
status: live
tags: [AI, Research]
stack: [Next.js, Vercel AI SDK, Zod, Tailwind, Vitest]
metric:
  value: 5 samples
  label: ARB · ENA · AAVE · UNI · PENDLE
role: Product, architecture, AI-assisted implementation
links:
  github: https://github.com/osobennyj/warehouse-of-sites/pull/3
cover:
  src: /projects/ai-token-due-diligence/cover.png
  alt: AI Token Due Diligence Agent gallery with sample token reports
accent: sky
order: 4
date: 2026-11-25
---

## Problem

Token diligence spans half a dozen tabs; naive LLM reports invent numbers. I wanted an auditable pipeline where every figure ties to a tool result.

## Solution

- **Parallel data tools** — CoinGecko, DefiLlama, vesting, holder concentration, news; Zod on inputs and outputs.
- **Composable agent** — deterministic risk score, then Anthropic/OpenAI (or mock) for narrative only.
- **Gallery** — five live-data sample reports (ARB, ENA, AAVE, UNI, PENDLE) with offline eval script that checks numeric fields match tool output.
- **Static export** — works on GitHub Pages without API keys; plug in `ANTHROPIC_API_KEY` locally for real runs.

FSD layout, Vitest coverage, Playwright smoke, hallucination eval in CI.

## Architecture

```mermaid
flowchart LR
  U[User input] --> T[Tools parallel]
  T --> S[Deterministic score]
  S --> L[LLM narrative · optional]
  L --> R[Report + gallery]
```

## Results

- End-to-end LLM product signal: adapters, structured output, guardrails, eval — not a chat wrapper.
- Crypto fit: unlock pressure, TVL/revenue, holder concentration in one flow.

## Next steps

Rate-limited public demo with serverless host, reuse DeFi Strategist analytics as extra tools.