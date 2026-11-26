"""Generate project covers (SVG -> PNG) in the site's generated-cover style:
accent gradient, faint grid, a price line and a mono title. Needs rsvg-convert.
Usage: python3 scripts/make-covers.py
Illustrations only: lines and markers are decorative, not real market data."""
import random, subprocess, pathlib

W, H = 1280, 720
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "projects"
GREEN, RED = "#4ade80", "#f87171"

def sparkline(seed, points=24):
    state = 7
    for ch in seed:
        state = (state * 31 + ord(ch)) & 0xFFFFFFFF
    value, out = 50.0, []
    for _ in range(points):
        state = (state * 1664525 + 1013904223) & 0xFFFFFFFF
        value = min(88, max(12, value + ((state % 1000) / 1000 - 0.45) * 22))
        out.append(value)
    return out

def frame(title, c1, c2, stroke, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="{c1}" stop-opacity=".35"/><stop offset=".5" stop-color="{c2}" stop-opacity=".10"/><stop offset="1" stop-color="{c2}" stop-opacity="0"/>
  </linearGradient>
  <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".06"/></pattern>
</defs>
<rect width="{W}" height="{H}" fill="#111113"/><rect width="{W}" height="{H}" fill="url(#bg)"/><rect width="{W}" height="{H}" fill="url(#grid)"/>
<circle cx="64" cy="66" r="8" fill="{stroke}" fill-opacity=".85"/>
<text x="86" y="73" fill="#fafafa" fill-opacity=".72" font-family="DejaVu Sans Mono, monospace" font-size="24" letter-spacing="5">{title}</text>
{body}
</svg>'''

def line(vals, x0, x1, top, bot, width, color, opacity=1):
    n = len(vals)
    pts = " ".join(f"{x0+(x1-x0)*i/(n-1):.1f},{bot-(bot-top)*(v-12)/76:.1f}" for i, v in enumerate(vals))
    return f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round" stroke-opacity="{opacity}"/>', pts

def grid_bot():
    # Same look as the generated cover (amber), plus grid levels and buy/sell fills.
    x0, x1, top, bot = 0, W, 250, 640
    rnd = random.Random(8)
    vals, v = [], 50.0
    for i in range(46):
        v += rnd.gauss(0, 7) + (50 - v) * 0.1
        vals.append(min(90, max(10, v)))
    levels = [26, 38, 50, 62, 74]
    ly = lambda lv: bot - (bot - top) * (lv - 12) / 76
    out = [f'<line x1="0" x2="{W}" y1="{ly(l):.1f}" y2="{ly(l):.1f}" stroke="#fcd34d" stroke-opacity=".28" stroke-dasharray="6 9"/>' for l in levels]
    path_svg, pts = line(vals, x0, x1, top, bot, 5, "#fcd34d")
    out.append(path_svg)
    xs = lambda i: x0 + (x1 - x0) * i / (len(vals) - 1)
    for i in range(1, len(vals)):
        for lv in levels:
            a, b = vals[i - 1], vals[i]
            if (a - lv) * (b - lv) < 0:
                buy = b < a  # crossed the level downward -> buy; upward -> sell
                cx, cy, col, d = xs(i), ly(lv), (GREEN if buy else RED), (-1 if buy else 1)
                out.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="21" fill="{col}" fill-opacity=".2"/>')
                out.append(f'<polygon points="{cx:.1f},{cy+13*d:.1f} {cx-12:.1f},{cy-10*d:.1f} {cx+12:.1f},{cy-10*d:.1f}" fill="{col}"/>')
    out.append(f'<polygon points="64,664 52,682 76,682" fill="{GREEN}"/><text x="90" y="681" fill="#fafafa" fill-opacity=".7" font-family="DejaVu Sans, sans-serif" font-size="22">Buy filled</text>')
    out.append(f'<polygon points="252,682 240,664 264,664" fill="{RED}"/><text x="278" y="681" fill="#fafafa" fill-opacity=".7" font-family="DejaVu Sans, sans-serif" font-size="22">Sell filled</text>')
    return frame("PERPETUAL GRID BOT", "#fcd34d", "#f97316", "#fcd34d", "\n".join(out))

def funding_radar():
    # Same look as the generated cover (teal): funding lines on a few venues and a spread highlight.
    x0, x1, top, bot = 0, W, 250, 640
    a = sparkline("funding-rate-radar", 40)
    rnd = random.Random(3)
    b = [min(88, max(12, v + rnd.gauss(0, 7) - 6)) for v in a]
    c = [min(88, max(12, v + rnd.gauss(0, 7) + 9)) for v in a]
    out = []
    la, _ = line(c, x0, x1, top, bot, 3, "#38bdf8", .7)
    lb, _ = line(b, x0, x1, top, bot, 3, "#a78bfa", .7)
    lm, pts = line(a, x0, x1, top, bot, 5, "#5eead4")
    out += [la, lb, lm]
    # spread marker: vertical bar between the highest and lowest venue at the widest point
    gaps = [abs(c[i] - b[i]) for i in range(len(a))]
    i = gaps.index(max(gaps)); xx = (x1 - x0) * i / (len(a) - 1)
    y = lambda v: bot - (bot - top) * (v - 12) / 76
    out.append(f'<line x1="{xx:.1f}" x2="{xx:.1f}" y1="{y(c[i]):.1f}" y2="{y(b[i]):.1f}" stroke="#fafafa" stroke-opacity=".75" stroke-width="3" stroke-dasharray="4 6"/>')
    for v, col in ((c[i], "#38bdf8"), (b[i], "#a78bfa")):
        out.append(f'<circle cx="{xx:.1f}" cy="{y(v):.1f}" r="11" fill="{col}"/>')
    out.append(f'<rect x="{xx+18:.1f}" y="{(y(c[i])+y(b[i]))/2-18:.1f}" width="150" height="36" rx="18" fill="#09090b" fill-opacity=".85"/>')
    out.append(f'<text x="{xx+36:.1f}" y="{(y(c[i])+y(b[i]))/2+8:.1f}" fill="#fafafa" fill-opacity=".85" font-family="DejaVu Sans Mono, monospace" font-size="24" letter-spacing="2">SPREAD</text>')
    for k, (name, col) in enumerate((("Venue A", "#38bdf8"), ("Venue B", "#a78bfa"), ("Venue C", "#5eead4"))):
        x = 64 + k * 190
        out.append(f'<circle cx="{x}" cy="674" r="8" fill="{col}"/><text x="{x+20}" y="681" fill="#fafafa" fill-opacity=".7" font-family="DejaVu Sans, sans-serif" font-size="22">{name}</text>')
    return frame("FUNDING RATE RADAR", "#2dd4bf", "#10b981", "#5eead4", "\n".join(out))

def discipline_calendar():
    # Violet gradient with a month grid of green/red/gray days and one selected day.
    rnd = random.Random(12)
    out = []
    cols, rows = 7, 5
    cw, ch, gap = 120, 76, 12
    x0 = (W - (cols * cw + (cols - 1) * gap)) // 2
    y0 = 150
    sel = (3, 2)
    for r in range(rows):
        for c in range(cols):
            x, y = x0 + c * (cw + gap), y0 + r * (ch + gap)
            roll = rnd.random()
            if c >= 5:
                fill, stroke = "#18181b", "#2a2a2f"
            elif roll < 0.58:
                fill, stroke = "#14532d", GREEN
            elif roll < 0.8:
                fill, stroke = "#7f1d1d", RED
            else:
                fill, stroke = "#18181b", "#3a3a41"
            width = 5 if (c, r) == sel else 2
            if (c, r) == sel:
                stroke = "#fafafa"
            out.append(f'<rect x="{x}" y="{y}" width="{cw}" height="{ch}" rx="14" fill="{fill}" fill-opacity=".8" stroke="{stroke}" stroke-opacity=".7" stroke-width="{width}"/>')
    out.append(f'<rect x="64" y="{H-58}" width="18" height="18" rx="5" fill="#14532d" stroke="{GREEN}"/><text x="92" y="{H-43}" fill="#fafafa" fill-opacity=".7" font-family="DejaVu Sans, sans-serif" font-size="22">By plan</text>')
    out.append(f'<rect x="230" y="{H-58}" width="18" height="18" rx="5" fill="#7f1d1d" stroke="{RED}"/><text x="258" y="{H-43}" fill="#fafafa" fill-opacity=".7" font-family="DejaVu Sans, sans-serif" font-size="22">Off plan</text>')
    return frame("DISCIPLINE CALENDAR", "#a78bfa", "#8b5cf6", "#a78bfa", "\n".join(out))

for slug, svg in (("grid-bot", grid_bot()), ("funding-rate-radar", funding_radar()), ("discipline-calendar", discipline_calendar())):
    d = OUT / slug; d.mkdir(parents=True, exist_ok=True)
    s = d / "cover.svg"; s.write_text(svg, encoding="utf-8")
    subprocess.run(["rsvg-convert", "-w", str(W), "-h", str(H), str(s), "-o", str(d / "cover-v2.png")], check=True)
    s.unlink(); print("wrote", d / "cover-v2.png")
