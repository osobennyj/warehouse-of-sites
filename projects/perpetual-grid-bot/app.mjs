import { GridSim } from "./src/engine.mjs";
import { generatePath, SCENARIOS } from "./src/paths.mjs";

const STEPS = 400;
const FUNDING_EVERY = 8;
const MAKER_FEE = 0.0002;
const TAKER_FEE = 0.0005;
const MAINTENANCE = 0.005;

const $ = (id) => document.getElementById(id);
const fmt = (x, d = 2) => (x === null || x === undefined || !Number.isFinite(x) ? "—" : x.toFixed(d));
const cls = (x) => (x > 0 ? "pos" : x < 0 ? "neg" : "");

let frames = [];
let fillMarks = [];
let timer = null;
let view = null; // { path, cfg }

for (const [key, label] of Object.entries(SCENARIOS)) {
  $("scenario").add(new Option(label, key));
}

function readConfig() {
  const num = (id) => Number($(id).value);
  const opt = (id) => ($(id).value === "" ? null : Number($(id).value));
  return {
    startPrice: num("startPrice"),
    vol: num("vol"),
    seed: num("seed"),
    scenario: $("scenario").value,
    lower: num("lower"),
    upper: num("upper"),
    levels: num("levels"),
    qtyPerLevel: num("qty"),
    capital: num("capital"),
    leverage: num("leverage"),
    fundingRate: num("fundingRate"),
    stopLow: opt("stopLow"),
    stopHigh: opt("stopHigh"),
  };
}

function runSimulation(input) {
  const path = generatePath({
    scenario: input.scenario,
    start: input.startPrice,
    steps: STEPS,
    vol: input.vol,
    seed: input.seed,
  });
  const sim = new GridSim({
    lower: input.lower,
    upper: input.upper,
    levels: input.levels,
    startPrice: input.startPrice,
    qtyPerLevel: input.qtyPerLevel,
    capital: input.capital,
    leverage: input.leverage,
    fundingRate: input.fundingRate,
    fundingEvery: FUNDING_EVERY,
    makerFee: MAKER_FEE,
    takerFee: TAKER_FEE,
    maintenanceMargin: MAINTENANCE,
    stopLow: input.stopLow,
    stopHigh: input.stopHigh,
  });

  frames = [{ snap: sim.snapshot(), events: [] }];
  fillMarks = [];
  for (const price of path.slice(1)) {
    const events = sim.step(price);
    events.forEach((e) => {
      if (e.type === "fill") fillMarks.push({ frame: frames.length, side: e.side, price: e.price });
    });
    frames.push({ snap: sim.snapshot(), events });
  }
  return { path, sim };
}

function drawChart(index) {
  const canvas = $("chart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const { path, cfg, sim } = view;
  const shown = path.slice(0, index + 1);
  const lows = [...shown, cfg.lower, ...sim.levels];
  const highs = [...shown, cfg.upper, ...sim.levels];
  if (cfg.stopLow !== null) lows.push(cfg.stopLow);
  if (cfg.stopHigh !== null) highs.push(cfg.stopHigh);
  const min = Math.min(...lows) * 0.995;
  const max = Math.max(...highs) * 1.005;
  const padX = 48;
  const x = (i) => padX + (i / Math.max(path.length - 1, 1)) * (width - padX - 12);
  const y = (p) => height - 16 - ((p - min) / (max - min)) * (height - 32);

  const light = document.documentElement.dataset.theme === "light";
  ctx.strokeStyle = "#27272a";
  ctx.fillStyle = "#71717a";
  ctx.font = "11px system-ui";
  ctx.lineWidth = 1;

  // Grid levels
  sim.levels.forEach((level) => {
    ctx.beginPath();
    ctx.moveTo(padX, y(level));
    ctx.lineTo(width - 12, y(level));
    ctx.strokeStyle = light ? "#d4d4d8" : "#3f3f46";
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  });
  // Range bounds
  [cfg.lower, cfg.upper].forEach((bound) => {
    ctx.beginPath();
    ctx.moveTo(padX, y(bound));
    ctx.lineTo(width - 12, y(bound));
    ctx.strokeStyle = light ? "#71717a" : "#a1a1aa";
    ctx.stroke();
  });
  // Stops
  [cfg.stopLow, cfg.stopHigh].forEach((stop) => {
    if (stop === null) return;
    ctx.beginPath();
    ctx.moveTo(padX, y(stop));
    ctx.lineTo(width - 12, y(stop));
    ctx.strokeStyle = "#f87171";
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Price line
  ctx.beginPath();
  shown.forEach((p, i) => (i === 0 ? ctx.moveTo(x(i), y(p)) : ctx.lineTo(x(i), y(p))));
  ctx.strokeStyle = light ? "#0f766e" : "#2dd4bf";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.lineWidth = 1;
  // Soft area under the price line
  if (shown.length > 1) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(45,212,191,0.18)");
    grad.addColorStop(1, "rgba(45,212,191,0)");
    ctx.lineTo(x(shown.length - 1), height - 16);
    ctx.lineTo(x(0), height - 16);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Filled orders: triangle up = buy, triangle down = sell, with a ring so they stand out
  fillMarks
    .filter((m) => m.frame <= index)
    .forEach((m) => {
      const cx = x(m.frame);
      const cy = y(m.price);
      const up = m.side === "buy";
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fillStyle = up ? "rgba(74,222,128,0.18)" : "rgba(248,113,113,0.18)";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, cy + (up ? -8 : 8));
      ctx.lineTo(cx - 7, cy + (up ? 6 : -6));
      ctx.lineTo(cx + 7, cy + (up ? 6 : -6));
      ctx.closePath();
      ctx.fillStyle = up ? "#4ade80" : "#f87171";
      ctx.fill();
    });

  // Axis labels
  ctx.fillStyle = "#71717a";
  ctx.fillText(fmt(max, 2), 4, 12);
  ctx.fillText(fmt(min, 2), 4, height - 4);
}

function liqLabel(s) {
  if (!s.liquidationPrice) return "—";
  if (Math.abs(s.liquidationPrice / s.price - 1) >= 0.5) return "far away";
  return fmt(s.liquidationPrice);
}

function renderStats(index) {
  const s = frames[index].snap;
  const { cfg } = view;
  const cards = [
    ["Price", fmt(s.price)],
    ["Position, BTC", fmt(s.pos, 4)],
    ["Average entry", s.pos === 0 ? "—" : fmt(s.entry)],
    ["Realized PnL", fmt(s.realized), cls(s.realized)],
    ["Unrealized PnL", fmt(s.unrealized), cls(s.unrealized)],
    ["Fees", fmt(s.fees)],
    ["Funding", fmt(s.funding), cls(s.funding)],
    ["Equity", fmt(s.equity), cls(s.equity - cfg.capital)],
    ["Orders filled", String(s.fillCount)],
    ["Open orders", String(s.openOrders)],
    ["Liquidation price (est.)", liqLabel(s), s.liquidationPrice && Math.abs(s.liquidationPrice / s.price - 1) < 0.5 ? "warn" : ""],
    ["Status", s.status === "running" ? "running" : s.status === "stopped" ? "stop hit" : "liquidated"],
  ];
  $("stats").innerHTML = cards
    .map(([label, value, c]) => `<div class="stat"><span>${label}</span><b class="${c ?? ""}">${value}</b></div>`)
    .join("");
  $("stepLabel").textContent = `step ${index} of ${frames.length - 1}`;
}

function renderLog(index) {
  const items = [];
  for (let i = 1; i <= index; i += 1) {
    for (const e of frames[i].events) {
      const t = `#${i}`;
      if (e.type === "fill") items.push(`${t} ${e.side === "buy" ? "buy" : "sell"} ${fmt(e.qty, 4)} BTC at ${fmt(e.price)}`);
      if (e.type === "funding") items.push(`${t} funding ${fmt(e.amount, 4)} USDT`);
      if (e.type === "stop") items.push(`${t} stop: position closed at ${fmt(e.price)}`);
      if (e.type === "liquidated") items.push(`${t} liquidated at ${fmt(e.price)}`);
    }
  }
  $("log").innerHTML = items.slice(-20).reverse().map((t) => `<li>${t}</li>`).join("") || "<li>No events yet</li>";
}

function render(index) {
  drawChart(index);
  renderStats(index);
  renderLog(index);
}

function stopPlayback() {
  if (timer !== null) clearInterval(timer);
  timer = null;
}

function startPlayback() {
  stopPlayback();
  timer = setInterval(() => {
    const scrub = $("scrub");
    const next = Number(scrub.value) + 1;
    if (next > Number(scrub.max)) return stopPlayback();
    scrub.value = String(next);
    render(next);
  }, 60);
}

$("config").addEventListener("submit", (event) => {
  event.preventDefault();
  stopPlayback();
  $("error").textContent = "";
  try {
    const cfg = readConfig();
    const { path, sim } = runSimulation(cfg);
    view = { path, cfg, sim };
    const scrub = $("scrub");
    scrub.max = String(frames.length - 1);
    scrub.value = String(frames.length - 1);
    $("worst").textContent = (() => {
      const w = sim.worstCaseLoss();
      return `If price leaves the range downward and never returns, the unrealized loss is about ${fmt(w.down)} USDT. Upward, about ${fmt(w.up)} USDT. Fees and funding are not included.`;
    })();
    render(frames.length - 1);
    startPlayback();
  } catch (err) {
    $("error").textContent = err.message;
  }
});

$("scrub").addEventListener("input", (event) => {
  stopPlayback();
  render(Number(event.target.value));
});

// Initial run with the default inputs.
$("config").dispatchEvent(new Event("submit", { cancelable: true }));
