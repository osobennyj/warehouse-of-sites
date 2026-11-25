---
title: AI Token Due Diligence Agent
tagline: Token research takes hours across ten tabs — an agent gathers the data and writes a sourced report without inventing numbers.
description: LLM agent with tool calling that collects market, protocol, unlock and holder data and produces a structured, sourced token due-diligence report with a risk score.
status: in-progress
tags: [AI, Research]
stack: [Next.js, TypeScript, Vercel AI SDK, Zod, Postgres]
metric:
  value: 0 invented
  label: numbers — every figure is traced to a tool result
links:
  github: https://github.com/osobennyj/ai-token-due-diligence
accent: sky
order: 4
date: 2026-11-25
---

## Problem

Evaluating a token properly means collecting tokenomics, FDV vs market cap, unlock schedules, protocol revenue and
holder concentration from half a dozen sources — then writing it up. LLMs can speed that up, but they hallucinate
numbers, which makes a naive "ask ChatGPT" report useless for investment work.

## Solution

Enter a ticker, CoinGecko id or contract address. An agent calls typed data tools and produces a report validated
against a strict schema:

- **Tools** — market data (CoinGecko), protocol metrics (DefiLlama TVL, fees, revenue), unlocks, top-holder
  concentration and recent news; each with Zod input and output schemas.
- **Structured report** — summary, tokenomics, fundamentals, on-chain distribution, catalysts, red flags and a
  0–100 score with its breakdown.
- **Hallucination guard** — numeric fields can only be filled from tool outputs, and every claim links to its source.
- **Shareable output** — streaming progress, Markdown and PDF export, cached reports and a public gallery.

## Architecture

```mermaid
flowchart LR
  U[User: ticker / address] --> AG[Agent orchestrator · AI SDK]
  AG -->|tool calls| T1[Market data]
  AG --> T2[Protocol metrics]
  AG --> T3[Unlocks]
  AG --> T4[Holder concentration]
  T1 & T2 & T3 & T4 --> V{ReportSchema validation}
  V --> R[Report + sources + score]
  R --> C[(Cache 24h)]
  R --> G[Gallery · export]
```

## Key decisions & trade-offs

- **Schema-first output.** The model fills a Zod schema rather than free text, so reports are comparable and
  machine-checkable.
- **Provider abstraction.** OpenAI or Anthropic via configuration; the agent is tested with a mocked provider that
  returns scripted tool calls.
- **Cost controls.** Per-IP rate limits, a daily budget cap and cached reports keep a public demo affordable.

## Status

In active development. Example reports and the live demo will be linked here on release.

## Next steps

An evaluation script over ten known tokens that checks every number in the report against tool outputs, and reuse of
the DeFi Strategist analytics as additional tools.
