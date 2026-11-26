---
title: DeFi Strategist MCP
tagline: MCP tools that encode a DeFi researcher's analytics (yields, Pendle, looping, funding carry), not another raw-data proxy.
description: TypeScript MCP server for Claude/Cursor plus a browser playground on the same core. Zod schemas, methodology resources, npm-ready release workflow.
status: live
tags: [AI, DeFi]
stack: [TypeScript, MCP SDK, Zod, React, Vitest]
metric:
  value: 5 tools
  label: find_yields · Pendle · loop · carry · compare
role: Product, architecture, AI-assisted implementation
links:
  live: https://osobennyj.github.io/warehouse-of-sites/demos/defi-strategist-mcp/
  github: https://github.com/osobennyj/warehouse-of-sites/pull/1
cover:
  src: /projects/defi-strategist-mcp/cover.png
  alt: DeFi Strategist MCP playground showing tool forms and scenario results
accent: amber
order: 3
featured: false # replaced by the grid bot on the home page
date: 2026-11-25
---

## Problem

Raw-data MCP servers already exist for prices and TVL. The hard part is methodology: implied vs underlying APY, health factors, reward-vs-base yield quality, knowledge that lives in a researcher's head.

## Solution

**MCP tools** (Zod input/output, LLM-oriented descriptions):

| Tool | Output |
|------|--------|
| `find_yields` | DefiLlama pools ranked by transparent risk-adjusted score |
| `analyze_pendle_market` | PT/YT verdict with formulas |
| `simulate_loop` | Leverage, HF, liquidation price, net APY |
| `funding_carry` | Hyperliquid funding annualized + fee-aware carry |
| `compare_strategies` | Side-by-side net APR, risk score, key risks |

Resources `methodology://scoring` and `methodology://formulas`, prompt templates for due diligence and stablecoin ladders.

**Monorepo:** `packages/core` (pure domain → adapters → use cases), `packages/mcp-server`, `apps/playground`. MCP SDK v2 in-memory integration tests + Playwright smoke.

## Architecture

```mermaid
flowchart LR
  C[packages/core] --> M[mcp-server]
  C --> P[playground]
  M --> A[Claude / Cursor / ChatGPT]
```

## Results

- CI: typecheck, unit + MCP integration, daily snapshot workflow stub, npm release workflow with `NPM_TOKEN`.
- Strong signal for analyst and builder roles: domain expertise packaged as installable tools.

## Next steps

More chains on Pendle, richer carry fees, publish to npm registry after owner adds `NPM_TOKEN`.