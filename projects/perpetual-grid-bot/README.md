# Perpetual Grid Bot (simulator)

An arithmetic grid strategy on a simulated BTC perpetual. It shows how the grid fills, how PnL builds up across cycles, how funding and fees eat into it, and where stops and liquidation sit.

**No API keys, no exchange connection, no live orders.** Prices are synthetic and generated from a seed.

## What it shows

- One resting limit order per level. A buy fill places a sell one level up, and a sell fill places a buy one level down.
- Realized PnL per cycle, unrealized PnL, fees (maker and taker), and funding paid or received.
- A liquidation price estimate for the current position.
- Stop-loss levels that close the position and halt the grid.
- A worst-case estimate for a one-way move out of the range.
- A replay slider so you can step through the run.

## Run it

```bash
npm test          # engine tests (Node 22+, no dependencies)
# open index.html in a browser, or serve the folder statically
```

## Layout

- `src/engine.mjs`: grid logic (`GridSim`, `buildLevels`). Pure functions and state, no I/O.
- `src/paths.mjs`: seeded price paths for the scenarios `range`, `trendUp` and `breakdown`.
- `test/engine.test.mjs`: round-trip accounting, funding sign, stop, liquidation, worst-case loss, reconciliation on a random path.
- `app.mjs` and `index.html`: the visual UI. No build step.

## Assumptions and limits

- Fees, funding interval and maintenance margin are fixed demo values. They are not taken from any exchange.
- Money and quantities are JavaScript numbers. This is fine for a demo but not for real order sizing, where you would use integer or decimal math.
- The position is netted. Longs and shorts offset each other, and there is no hedge mode.
- The worst-case figure ignores fees, funding and grid replacement orders during the move.
- The liquidation model is a simplified single-margin approximation. It is not a copy of any exchange's rules.

## Next step (not built)

The engine has no exchange code. It takes prices and returns fills. Connecting a real exchange would mean writing an adapter that places and cancels orders, and that is deliberately not included here.

Not financial advice.
