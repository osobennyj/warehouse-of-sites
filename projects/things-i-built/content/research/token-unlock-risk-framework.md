---
title: A five-question framework for token unlock risk
summary: "How I check whether an upcoming unlock actually matters: supply overhang, liquidity, who receives the tokens and what they are likely to do with them."
kind: note
tags: [Tokenomics, Valuation]
readingMinutes: 4
date: 2026-11-25
---

Unlock calendars are everywhere, yet most of them answer the wrong question. "1.2% of supply unlocks on Friday"
says nothing about price impact on its own. Before I treat an unlock as a risk, I go through five questions.

## 1. How big is it relative to what is already trading?

Measure the unlock against **circulating** supply, not total supply. A 2% of total-supply unlock is a 10% dilution
for a token with only 20% in circulation. A low circulating ratio (or a low MC/FDV) means the market has priced only
a small slice of the eventual supply.

## 2. Can the market absorb it?

The ratio I care about most is **unlock pressure**:

```text
unlock pressure = USD value unlocked in the next 30 days / average daily spot volume
```

Below ~1 day of volume, an unlock is usually noise. Several days of volume means sellers need patience or a
discount.

## 3. Who receives the tokens?

Categories behave differently. Ecosystem and treasury allocations often stay put; **early investors with a low cost
basis** and team members after a long cliff are the most likely sellers. The first unlock after a cliff matters
more than linear drip that the market has been absorbing for months.

## 4. Is there evidence of distribution?

This is where on-chain data beats calendars: transfers from vesting contracts to exchange deposit addresses, OTC desk
wallets or market makers in the days around the unlock. Tools such as Arkham, Nansen and Dune make this visible.

## 5. What is the offsetting demand?

Staking lock-ups, buybacks, emissions sinks or a genuine catalyst can absorb supply. Without them, the default
assumption is that unlocked tokens eventually look for an exit.

## Putting it together

None of these questions is decisive alone. A large unlock to long-term ecosystem funds with deep liquidity can be a
non-event, while a modest unlock to seed investors in an illiquid token can define the chart for weeks. The goal is
a short, transparent checklist, the same one I encode into my tools, so that every score can be traced back to an
input.

_Not financial advice._