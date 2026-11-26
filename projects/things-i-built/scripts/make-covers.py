"""Generate the illustrated project covers (SVG -> PNG) in the site's visual style.

Usage: python3 scripts/make-covers.py   (needs rsvg-convert)
Illustrations only: shapes are decorative and carry no real market data.
"""
import math, random, subprocess, pathlib

W, H = 1280, 720
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "projects"
TEAL, GREEN, RED, MUTED = "#2dd4bf", "#4ade80", "#f87171", "#71717a"

def frame(title, tag, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
  <radialGradient id="glow" cx="50%" cy="-10%" r="75%"><stop offset="0" stop-color="{TEAL}" stop-opacity=".28"/><stop offset="1" stop-color="{TEAL}" stop-opacity="0"/></radialGradient>
  <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity=".05"/></pattern>
  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{TEAL}" stop-opacity=".25"/><stop offset="1" stop-color="{TEAL}" stop-opacity="0"/></linearGradient>
</defs>
<rect width="{W}" height="{H}" fill="#09090b"/><rect width="{W}" height="{H}" fill="url(#glow)"/><rect width="{W}" height="{H}" fill="url(#g)"/>
<text x="64" y="84" fill="{TEAL}" font-family="DejaVu Sans Mono, monospace" font-size="22" letter-spacing="5">{title}</text>
<text x="{W-64}" y="84" text-anchor="end" fill="{MUTED}" font-family="DejaVu Sans Mono, monospace" font-size="20" letter-spacing="3">{tag}</text>
{body}
</svg>'''

def grid_bot():
    random.seed(4)
    x0, x1, top, bot = 64, W - 64, 140, H - 70
    n, levels = 70, 7
    lo, hi = 0.15, 0.85
    ys = [top + (bot - top) * (hi - (hi - lo) * i / (levels - 1)) for i in range(levels)]
    p, path = 0.5, []
    for i in range(n):
        p += random.gauss(0, 0.05) + (0.5 - p) * 0.035
        p = min(0.9, max(0.1, p))
        path.append(p)
    px = lambda i: x0 + (x1 - x0) * i / (n - 1)
    py = lambda v: top + (bot - top) * (1 - v)
    out = []
    for y in ys:
        out.append(f'<line x1="{x0}" x2="{x1}" y1="{y:.1f}" y2="{y:.1f}" stroke="#3f3f46" stroke-dasharray="4 7"/>')
    pts = " ".join(f"{px(i):.1f},{py(v):.1f}" for i, v in enumerate(path))
    out.append(f'<polygon points="{px(0):.1f},{bot} {pts} {px(n-1):.1f},{bot}" fill="url(#area)"/>')
    out.append(f'<polyline points="{pts}" fill="none" stroke="{TEAL}" stroke-width="3.5" stroke-linejoin="round"/>')
    for i in range(1, n):
        a, b = py(path[i - 1]), py(path[i])
        for y in ys:
            if (a - y) * (b - y) < 0:
                buy = b > a  # price moving down on screen -> crossed level downward... screen y grows downward
                buy = b > a
                cx, cy = px(i), y
                col = GREEN if buy else RED
                out.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="15" fill="{col}" fill-opacity=".18"/>')
                d = -1 if buy else 1
                out.append(f'<polygon points="{cx:.1f},{cy + 9*d:.1f} {cx-9:.1f},{cy - 7*d:.1f} {cx+9:.1f},{cy - 7*d:.1f}" fill="{col}"/>')
    lx = 64
    out.append(f'<polygon points="{lx+9},{H-34} {lx},{H-22} {lx+18},{H-22}" fill="{GREEN}"/><text x="{lx+28}" y="{H-21}" fill="#a1a1aa" font-family="DejaVu Sans, sans-serif" font-size="20">Buy filled</text>')
    lx = 220
    out.append(f'<polygon points="{lx+9},{H-22} {lx},{H-34} {lx+18},{H-34}" fill="{RED}"/><text x="{lx+28}" y="{H-21}" fill="#a1a1aa" font-family="DejaVu Sans, sans-serif" font-size="20">Sell filled</text>')
    return frame("PERPETUAL GRID BOT", "SIMULATED DATA", "\n".join(out))

def funding_radar():
    random.seed(5)
    out = []
    venues = ["Binance", "Bybit", "OKX", "Hyperliquid"]
    cols = ["#facc15", "#fb923c", "#a1a1aa", TEAL]
    x0, rowh, y0 = 64, 78, 150
    out.append(f'<text x="{x0}" y="{y0-14}" fill="{MUTED}" font-family="DejaVu Sans Mono, monospace" font-size="18" letter-spacing="3">SPREAD APR, RANKED</text>')
    spreads = [0.92, 0.78, 0.63, 0.51, 0.38, 0.27]
    for r, s in enumerate(spreads):
        y = y0 + r * rowh
        out.append(f'<rect x="{x0}" y="{y}" width="700" height="58" rx="14" fill="#111113" stroke="#27272a"/>')
        out.append(f'<rect x="{x0+16}" y="{y+20}" width="{int(520*s)}" height="18" rx="9" fill="{TEAL}" fill-opacity="{0.35+0.6*s:.2f}"/>')
        a, b = random.sample(range(4), 2)
        for k, v in enumerate((a, b)):
            out.append(f'<circle cx="{x0+640+k*26}" cy="{y+29}" r="9" fill="{cols[v]}"/>')
    # venue legend + mini lines on the right
    rx = 860
    out.append(f'<text x="{rx}" y="{y0-14}" fill="{MUTED}" font-family="DejaVu Sans Mono, monospace" font-size="18" letter-spacing="3">7-DAY FUNDING</text>')
    out.append(f'<rect x="{rx}" y="{y0}" width="356" height="300" rx="14" fill="#111113" stroke="#27272a"/>')
    for k, c in enumerate(cols):
        base = random.uniform(0.3, 0.7); pts = []
        for i in range(28):
            base += random.gauss(0, 0.05) + (0.5 - base) * 0.1
            pts.append(f"{rx+18+i*(320/27):.1f},{y0+20+ (1-min(0.95,max(0.05,base)))*260:.1f}")
        out.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{c}" stroke-width="3" stroke-linejoin="round" stroke-opacity=".9"/>')
    for k, (v, c) in enumerate(zip(venues, cols)):
        yy = y0 + 336 + k * 34
        out.append(f'<circle cx="{rx+10}" cy="{yy}" r="8" fill="{c}"/><text x="{rx+30}" y="{yy+7}" fill="#a1a1aa" font-family="DejaVu Sans, sans-serif" font-size="21">{v}</text>')
    return frame("FUNDING RATE RADAR", "ILLUSTRATION", "\n".join(out))

for slug, svg in (("grid-bot", grid_bot()), ("funding-rate-radar", funding_radar())):
    d = OUT / slug; d.mkdir(parents=True, exist_ok=True)
    (d / "cover.svg").write_text(svg, encoding="utf-8")
    subprocess.run(["rsvg-convert", "-w", str(W), "-h", str(H), str(d / "cover.svg"), "-o", str(d / "cover.png")], check=True)
    (d / "cover.svg").unlink()
    print("wrote", d / "cover.png")
