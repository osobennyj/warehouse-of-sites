// Arithmetic grid engine for a simulated perpetual futures market.
// Pure logic: no I/O, no exchange calls, no keys. Money and quantities are plain
// JS numbers, which is fine for a demo but not for real order sizing.

const EPS = 1e-10;

const snap = (x) => (Math.abs(x) < EPS ? 0 : Number(x.toFixed(10)));

export function buildLevels({ lower, upper, levels }) {
  if (!(lower > 0) || !(upper > lower)) {
    throw new Error("Need 0 < lower < upper");
  }
  if (!Number.isInteger(levels) || levels < 2) {
    throw new Error("Levels must be a whole number, at least 2");
  }
  const step = (upper - lower) / (levels - 1);
  return Array.from({ length: levels }, (_, i) => lower + i * step);
}

export class GridSim {
  constructor(config) {
    const {
      lower,
      upper,
      levels: levelCount,
      startPrice,
      qtyPerLevel,
      capital,
      leverage = 5,
      makerFee = 0.0002,
      takerFee = 0.0005,
      fundingRate = 0.0001,
      fundingEvery = 8,
      maintenanceMargin = 0.005,
      stopLow = null,
      stopHigh = null,
    } = config;

    if (!(startPrice >= lower && startPrice <= upper)) {
      throw new Error("Start price must be inside the range");
    }
    if (!(qtyPerLevel > 0) || !(capital > 0)) {
      throw new Error("Order size and capital must be greater than zero");
    }

    this.levels = buildLevels({ lower, upper, levels: levelCount });
    this.lower = lower;
    this.upper = upper;
    this.qty = qtyPerLevel;
    this.capital = capital;
    this.leverage = leverage;
    this.makerFee = makerFee;
    this.takerFee = takerFee;
    this.fundingRate = fundingRate;
    this.fundingEvery = fundingEvery;
    this.maintenanceMargin = maintenanceMargin;
    this.stopLow = stopLow;
    this.stopHigh = stopHigh;

    this.orders = this.levels.map((level) => {
      if (level < startPrice) return "buy";
      if (level > startPrice) return "sell";
      return null;
    });
    this.initialOrders = [...this.orders];

    this.pos = 0;
    this.entry = 0;
    this.realized = 0;
    this.fees = 0;
    this.funding = 0;
    this.last = startPrice;
    this.tick = 0;
    this.status = "running";
    this.fillCount = 0;
  }

  // Advance the simulation to a new price. Returns the events that happened.
  step(price) {
    if (this.status !== "running") return [];
    const events = [];
    const prev = this.last;
    this.tick += 1;

    const movingDown = price < prev;
    const movingUp = price > prev;
    const crossed = [];

    this.levels.forEach((level, i) => {
      const side = this.orders[i];
      if (side === "buy" && movingDown && prev > level && price <= level) {
        crossed.push({ i, level });
      }
      if (side === "sell" && movingUp && prev < level && price >= level) {
        crossed.push({ i, level });
      }
    });
    // Fill in the order the price actually travels through the levels.
    crossed.sort((a, b) => (movingDown ? b.level - a.level : a.level - b.level));
    for (const { i } of crossed) {
      events.push(this.fill(i));
    }

    if (this.fundingEvery > 0 && this.tick % this.fundingEvery === 0 && this.pos !== 0) {
      // Positive rate: longs pay shorts. Negative rate: the reverse.
      const payment = -this.pos * price * this.fundingRate;
      this.funding += payment;
      events.push({ type: "funding", price, amount: payment });
    }

    this.last = price;

    if (this.stopLow !== null && price <= this.stopLow) {
      events.push(this.closeAll(price, "stop"));
    } else if (this.stopHigh !== null && price >= this.stopHigh) {
      events.push(this.closeAll(price, "stop"));
    } else if (this.pos !== 0 && this.equityAt(price) <= this.maintenanceMargin * Math.abs(this.pos) * price) {
      events.push(this.closeAll(price, "liquidated"));
    }

    return events;
  }

  fill(i) {
    const side = this.orders[i];
    const level = this.levels[i];
    const signed = side === "buy" ? this.qty : -this.qty;

    this.fees += this.qty * level * this.makerFee;
    this.applyTrade(signed, level);
    this.orders[i] = null;
    this.fillCount += 1;

    // Buy fills place a sell one level up; sell fills place a buy one level down.
    // A level holds at most one order, so an occupied slot is left alone.
    if (side === "buy" && i + 1 < this.levels.length && this.orders[i + 1] === null) {
      this.orders[i + 1] = "sell";
    }
    if (side === "sell" && i - 1 >= 0 && this.orders[i - 1] === null) {
      this.orders[i - 1] = "buy";
    }
    return { type: "fill", side, level, price: level, qty: this.qty, index: i };
  }

  applyTrade(signed, price) {
    const pos = this.pos;
    if (pos === 0 || Math.sign(pos) === Math.sign(signed)) {
      const newPos = snap(pos + signed);
      this.entry = newPos === 0 ? 0 : (Math.abs(pos) * this.entry + Math.abs(signed) * price) / Math.abs(newPos);
      this.pos = newPos;
      return;
    }
    const closing = Math.min(Math.abs(pos), Math.abs(signed));
    this.realized += (price - this.entry) * closing * Math.sign(pos);
    const newPos = snap(pos + signed);
    if (newPos === 0) {
      this.entry = 0;
    } else if (Math.sign(newPos) !== Math.sign(pos)) {
      this.entry = price; // the position flipped; the remainder opens at this price
    }
    this.pos = newPos;
  }

  closeAll(price, reason) {
    const size = this.pos;
    if (size !== 0) {
      this.fees += Math.abs(size) * price * this.takerFee;
      this.applyTrade(-size, price);
    }
    this.orders = this.orders.map(() => null);
    this.status = reason === "stop" ? "stopped" : "liquidated";
    return { type: reason, price, closedQty: size };
  }

  equityAt(price) {
    const unrealized = this.pos === 0 ? 0 : this.pos * (price - this.entry);
    return this.capital + this.realized - this.fees + this.funding + unrealized;
  }

  liquidationPrice() {
    if (this.pos === 0) return null;
    const base = this.capital + this.realized - this.fees + this.funding;
    const sign = Math.sign(this.pos);
    const p = (this.pos * this.entry - base) / (this.pos * (1 - sign * this.maintenanceMargin));
    return p > 0 ? p : null;
  }

  // Rough loss if price walks out of the range one way and never comes back.
  worstCaseLoss() {
    let down = 0;
    let up = 0;
    this.initialOrders.forEach((side, i) => {
      const level = this.levels[i];
      if (side === "buy") down += this.qty * (level - this.lower);
      if (side === "sell") up += this.qty * (this.upper - level);
    });
    return { down, up };
  }

  snapshot() {
    const price = this.last;
    return {
      tick: this.tick,
      price,
      status: this.status,
      pos: this.pos,
      entry: this.entry,
      realized: this.realized,
      unrealized: this.pos === 0 ? 0 : this.pos * (price - this.entry),
      fees: this.fees,
      funding: this.funding,
      equity: this.equityAt(price),
      fillCount: this.fillCount,
      liquidationPrice: this.liquidationPrice(),
      openOrders: this.orders.filter((o) => o !== null).length,
    };
  }
}
