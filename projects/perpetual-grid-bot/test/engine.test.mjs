import { test } from "node:test";
import assert from "node:assert/strict";
import { GridSim, buildLevels } from "../src/engine.mjs";
import { generatePath } from "../src/paths.mjs";

const noFees = { makerFee: 0, takerFee: 0, fundingEvery: 0 };

function run(sim, path) {
  const events = [];
  for (const price of path.slice(1)) {
    events.push(...sim.step(price));
  }
  return events;
}

test("buildLevels spaces levels evenly across the range", () => {
  assert.deepEqual(buildLevels({ lower: 90, upper: 110, levels: 5 }), [90, 95, 100, 105, 110]);
});

test("buildLevels rejects an inverted range and too few levels", () => {
  assert.throws(() => buildLevels({ lower: 110, upper: 90, levels: 5 }));
  assert.throws(() => buildLevels({ lower: 90, upper: 110, levels: 1 }));
});

test("constructor rejects a start price outside the range", () => {
  assert.throws(() => new GridSim({ lower: 90, upper: 110, levels: 5, startPrice: 120, qtyPerLevel: 1, capital: 1000 }));
});

test("a full oscillation through the grid banks the gain of each cycle", () => {
  const sim = new GridSim({
    lower: 90, upper: 110, levels: 5, startPrice: 100,
    qtyPerLevel: 1, capital: 1000, ...noFees,
  });
  run(sim, [100, 96, 94, 89, 96, 101]);

  assert.equal(sim.fillCount, 4);
  assert.equal(sim.pos, 0);
  assert.ok(Math.abs(sim.realized - 10) < 1e-9, `realized was ${sim.realized}`);
  assert.ok(Math.abs(sim.equityAt(101) - 1010) < 1e-9);
});

test("funding: a long pays a positive rate", () => {
  const sim = new GridSim({
    lower: 90, upper: 110, levels: 3, startPrice: 100,
    qtyPerLevel: 1, capital: 1000, makerFee: 0, takerFee: 0,
    fundingRate: 0.001, fundingEvery: 1,
  });
  run(sim, [100, 90, 95]);
  // Tick 1 at price 90: -1 * 90 * 0.001 = -0.09. Tick 2 at price 95: -0.095.
  assert.ok(Math.abs(sim.funding - -0.185) < 1e-9, `funding was ${sim.funding}`);
});

test("stop-loss closes the position at the stop and halts the grid", () => {
  const sim = new GridSim({
    lower: 90, upper: 110, levels: 3, startPrice: 100,
    qtyPerLevel: 10, capital: 100, stopLow: 85, ...noFees,
  });
  const events = run(sim, [100, 90, 85, 80]);

  assert.equal(sim.status, "stopped");
  assert.equal(sim.pos, 0);
  assert.ok(Math.abs(sim.realized - -50) < 1e-9);
  assert.ok(events.some((e) => e.type === "stop" && e.price === 85));
});

test("liquidation triggers when equity falls below maintenance margin", () => {
  const sim = new GridSim({
    lower: 90, upper: 110, levels: 3, startPrice: 100,
    qtyPerLevel: 10, capital: 100, ...noFees,
  });
  run(sim, [100, 90]);
  assert.ok(Math.abs(sim.liquidationPrice() - 80.402) < 0.01, `liq was ${sim.liquidationPrice()}`);

  run(sim, [90, 80]);
  assert.equal(sim.status, "liquidated");
  assert.equal(sim.pos, 0);
  assert.ok(Math.abs(sim.equityAt(80) - 0) < 1e-9);
});

test("worst-case loss counts the buys that would fill on a drop out of range", () => {
  const sim = new GridSim({
    lower: 90, upper: 110, levels: 5, startPrice: 100,
    qtyPerLevel: 1, capital: 1000,
  });
  // Buys at 90 and 95 would fill. Loss at 90 is (95 - 90) * 1 = 5 for the 95 lot.
  assert.equal(sim.worstCaseLoss().down, 5);
  assert.equal(sim.worstCaseLoss().up, 5);
});

test("accounting reconciles on a random path", () => {
  const sim = new GridSim({
    lower: 80, upper: 120, levels: 10, startPrice: 100,
    qtyPerLevel: 0.5, capital: 1000,
  });
  const path = generatePath({ scenario: "range", start: 100, steps: 300, seed: 7 });

  let netFills = 0;
  for (const price of path.slice(1)) {
    for (const e of sim.step(price)) {
      if (e.type === "fill") netFills += e.side === "buy" ? e.qty : -e.qty;
    }
  }

  assert.ok(Math.abs(sim.pos - netFills) < 1e-9, "position must equal the net of all fills");
  const snapshot = sim.snapshot();
  const expected =
    sim.capital + sim.realized - sim.fees + sim.funding + sim.pos * (sim.last - sim.entry);
  assert.ok(Math.abs(snapshot.equity - expected) < 1e-6, "equity must match its components");
});

test("generatePath is deterministic for a given seed", () => {
  const a = generatePath({ scenario: "trendUp", start: 100, steps: 50, seed: 3 });
  const b = generatePath({ scenario: "trendUp", start: 100, steps: 50, seed: 3 });
  assert.deepEqual(a, b);
  assert.equal(a.length, 51);
});
