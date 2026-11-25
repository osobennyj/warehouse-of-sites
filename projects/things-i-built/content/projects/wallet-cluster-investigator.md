---
title: Wallet Cluster Investigator
tagline: Seed EVM address → funding graph → explainable wallet clusters and a public investigation gallery.
description: Python CLI plus a static React viewer that clusters wallets with four documented heuristics, Blockscout v2 data and committed public case studies.
status: live
tags: [Research]
stack: [Python, networkx, React, Cytoscape.js, Blockscout]
metric:
  value: 3 cases
  label: live investigations in the gallery
role: Product, architecture, AI-assisted implementation
links:
  live: https://osobennyj.github.io/warehouse-of-sites/demos/wallet-cluster-investigator/
  github: https://github.com/osobennyj/warehouse-of-sites/pull/5
cover:
  src: /projects/wallet-cluster-investigator/cover.png
  alt: Wallet Cluster Investigator graph view with clusters colored and evidence panel open
accent: violet
order: 2
date: 2026-11-25
---

## Problem

On-chain hiring managers want reproducible attribution, not black-box labels. I needed to show I understand wallet clustering methodology, not only that I used Arkham.

## Solution

- **`wci` CLI:** BFS expansion over native and ERC-20 transfers with guards (min value, max counterparties, CEX/bridge stop-list), disk cache, polite rate limits.
- **Four heuristics:** common funder, CEX deposit reuse, synchronized activity, sweep-to-collector; each returns evidence (addresses, confidence, tx hashes).
- **Union-find clustering** with transparent weighted scores surfaced in the UI.
- **Static viewer:** Cytoscape graph, filters, evidence panel, cluster table, optional live +1 hop via Blockscout CORS.
- **Three committed investigations** on public, documented fund flows (e.g. known exploit hops).

Versioned investigation JSON (Pydantic) + Markdown reports. Ethics copy in UI: probabilistic attribution, not an accusation.

## Architecture

```mermaid
flowchart LR
  BS[Blockscout v2] --> CLI[wci CLI]
  CLI --> H[Heuristics]
  H --> J[Investigation JSON]
  J --> V[React viewer · GitHub Pages artifact]
```

## Results

- Full CI: ruff/mypy/pytest on collector, eslint/tsc/vitest/playwright on viewer.
- Demonstrates analyst-grade workflow hiring teams ask for in 2026 job posts.

## Next steps

More chains, timing heuristics, bridge-aware tracing.