// Deterministic synthetic price paths for the simulator. No market data is fetched.

// Small seeded PRNG (mulberry32): the same seed always gives the same path.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Gaussian sample via Box-Muller, using the seeded generator.
function gaussian(rand) {
  const u = Math.max(rand(), 1e-12);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const SCENARIOS = {
  range: "Боковик: цена колеблется внутри диапазона",
  trendUp: "Рост: цена уходит вверх через верхнюю границу",
  breakdown: "Пробой вниз: цена уходит ниже диапазона",
};

// Returns an array of prices of length steps + 1, starting at `start`.
export function generatePath({ scenario = "range", start, steps = 400, vol = 0.004, seed = 1 }) {
  const rand = mulberry32(seed);
  const path = [start];
  let price = start;
  for (let t = 1; t <= steps; t += 1) {
    const progress = t / steps;
    let drift = 0;
    if (scenario === "trendUp") drift = 0.0009 * Math.sin(progress * Math.PI / 2) + 0.0003;
    if (scenario === "breakdown") drift = -0.001 * progress;
    const noise = vol * gaussian(rand);
    const meanReversion = scenario === "range" ? -0.02 * Math.log(price / start) : 0;
    price = Math.max(price * (1 + drift + meanReversion + noise), 1e-6);
    path.push(Number(price.toFixed(6)));
  }
  return path;
}
