# Things I Built

Portfolio of **Bohdan Maistrenko** — on-chain research and AI-native builder. Static Next.js site with data-driven project content.

## Live demo

After Pages is enabled on `osobennyj/warehouse-of-sites`:

**https://osobennyj.github.io/warehouse-of-sites/**

## Stack

- Next.js 16 (App Router, static export)
- TypeScript strict, Tailwind CSS 4, FSD (`src/views`, `widgets`, `features`, `entities`, `shared`)
- Content: one Markdown file per project under `content/projects/`
- Vitest + Playwright, GitHub Actions CI, GitHub Pages deploy

## Local development

```bash
cd projects/things-i-built
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command           | Purpose                |
| ----------------- | ---------------------- |
| `pnpm dev`        | Dev server             |
| `pnpm build`      | Static export → `out/` |
| `pnpm preview`    | Serve `out/` locally   |
| `pnpm test`       | Unit tests             |
| `pnpm test:e2e`   | Playwright smoke       |
| `pnpm lint`       | ESLint                 |
| `pnpm typecheck`  | `tsc --noEmit`         |

## How to add a project

1. Copy `content/projects/_template.md` to `content/projects/<slug>.md` (kebab-case filename = URL slug).
2. Fill in the YAML frontmatter (validated at build time — see `src/entities/project/model/schema.ts`).
3. Write the case study body in Markdown (`## Problem`, `## Solution`, optional Mermaid in a ` ```mermaid ` block).
4. Optional cover: add `public/projects/<slug>/cover.png` and set `cover.src` / `cover.alt` in frontmatter.
5. Run `pnpm build` — the new page appears at `/projects/<slug>/` and on the home grid when `featured: true`.

To hide a project, delete its file or set `featured: false`.

## Environment variables

| Variable                 | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `NEXT_PUBLIC_BASE_PATH`  | GitHub Pages subpath (empty locally)         |
| `NEXT_PUBLIC_SITE_URL`   | Canonical URL for SEO, sitemap, JSON-LD      |

Example for this monorepo deploy:

```bash
NEXT_PUBLIC_BASE_PATH=/warehouse-of-sites \
NEXT_PUBLIC_SITE_URL=https://osobennyj.github.io/warehouse-of-sites \
pnpm build
```

## Deploy

### GitHub Pages (default)

Workflow: `.github/workflows/things-i-built.yml` at the repo root. Builds `out/` and deploys on push to `master`.

Enable **Settings → Pages → GitHub Actions** on the repository once.

### Vercel (optional)

1. Import the repo (or monorepo root with root directory `projects/things-i-built`).
2. Leave `NEXT_PUBLIC_BASE_PATH` empty.
3. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL or custom domain.
4. Build command: `pnpm build`, output: `out` (static).

No server features are required — the site is fully static.

## Built with AI

Requirements, architecture, review, tests and deploy are mine; implementation is done with AI coding agents (Cursor) in small, reviewable steps.