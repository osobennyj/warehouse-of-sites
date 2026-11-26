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

  ctx.strokeStyle = "#27272a";
  ctx.fillStyle = "#71717a";
  ctx.font = "11px system-ui";
  ctx.lineWidth = 1;

  // Grid levels
  sim.levels.forEach((level) => {
    ctx.beginPath();
    ctx.moveTo(padX, y(level));
    ctx.lineTo(width - 12, y(level));
    ctx.strokeStyle = "#3f3f46";
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  });
  // Range bounds
  [cfg.lower, cfg.upper].forEach((bound) => {
    ctx.beginPath();
    ctx.moveTo(padX, y(bound));
    ctx.lineTo(width - 12, y(bound));
    ctx.strokeStyle = "#a1a1aa";
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
  ctx.strokeStyle = "#e4e4e7";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.lineWidth = 1;

  // Fills so far
  fillMarks
    .filter((m) => m.frame <= index)
    .forEach((m) => {
      ctx.beginPath();
      ctx.arc(x(m.frame), y(m.price), 4, 0, Math.PI * 2);
      ctx.fillStyle = m.side === "buy" ? "#4ade80" : "#f87171";
      ctx.fill();
    });

  // Axis labels
  ctx.fillStyle = "#71717a";
  ctx.fillText(fmt(max, 2), 4, 12);
  ctx.fillText(fmt(min, 2), 4, height - 4);
}

function liqLabel(s) {
  if (!s.liquidationPrice) return "—";
  if (Math.abs(s.liquidationPrice / s.price - 1) >= 0.5) return "далеко";
  return fmt(s.liquidationPrice);
}

function renderStats(index) {
  const s = frames[index].snap;
  const { cfg } = view;
  const cards = [
    ["Цена", fmt(s.price)],
    ["Позиция, BTC", fmt(s.pos, 4)],
    ["Средняя цена входа", s.pos === 0 ? "—" : fmt(s.entry)],
    ["Реализованный PnL", fmt(s.realized), cls(s.realized)],
    ["Нереализованный PnL", fmt(s.unrealized), cls(s.unrealized)],
    ["Комиссии", fmt(s.fees)],
    ["Финансирование", fmt(s.funding), cls(s.funding)],
    ["Капитал + PnL", fmt(s.equity), cls(s.equity - cfg.capital)],
    ["Исполнено ордеров", String(s.fillCount)],
    ["Открытых ордеров", String(s.openOrders)],
    ["Цена ликвидации (оценка)", liqLabel(s), s.liquidationPrice && Math.abs(s.liquidationPrice / s.price - 1) < 0.5 ? "warn" : ""],
    ["Статус", s.status === "running" ? "работает" : s.status === "stopped" ? "стоп сработал" : "ликвидация"],
  ];
  $("stats").innerHTML = cards
    .map(([label, value, c]) => `<div class="stat"><span>${label}</span><b class="${c ?? ""}">${value}</b></div>`)
    .join("");
  $("stepLabel").textContent = `шаг ${index} из ${frames.length - 1}`;
}

function renderLog(index) {
  const items = [];
  for (let i = 1; i <= index; i += 1) {
    for (const e of frames[i].events) {
      const t = `#${i}`;
      if (e.type === "fill") items.push(`${t} ${e.side === "buy" ? "покупка" : "продажа"} ${fmt(e.qty, 4)} BTC по ${fmt(e.price)}`);
      if (e.type === "funding") items.push(`${t} финансирование ${fmt(e.amount, 4)} USDT`);
      if (e.type === "stop") items.push(`${t} стоп: позиция закрыта по ${fmt(e.price)}`);
      if (e.type === "liquidated") items.push(`${t} ликвидация по ${fmt(e.price)}`);
    }
  }
  $("log").innerHTML = items.slice(-20).reverse().map((t) => `<li>${t}</li>`).join("") || "<li>Событий пока нет</li>";
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
      return `Если цена уйдёт ниже диапазона и не вернётся, нереализованный убыток около ${fmt(w.down)} USDT. Если выше, около ${fmt(w.up)} USDT. Комиссии и финансирование здесь не учтены.`;
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
