#!/usr/bin/env bash
# Merge portfolio static export with MVP demos under stable /demos/<slug>/ paths.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SITE_OUT="$ROOT/projects/things-i-built/out"
BASE_URL_PATH="/warehouse-of-sites"

copy_next_app() {
  local project_dir="$1"
  local slug="$2"
  local dest="$SITE_OUT/demos/$slug"
  rm -rf "$dest"
  mkdir -p "$dest"
  cp -a "$project_dir/out/." "$dest/"
}

copy_vite_app() {
  local dist_dir="$1"
  local slug="$2"
  local dest="$SITE_OUT/demos/$slug"
  rm -rf "$dest"
  mkdir -p "$dest"
  cp -a "$dist_dir/." "$dest/"
}

echo "Assembling GitHub Pages artifact at $SITE_OUT"

(
  cd "$ROOT/projects/funding-rate-radar"
  pnpm install --frozen-lockfile
  NEXT_PUBLIC_BASE_PATH="$BASE_URL_PATH/demos/funding-rate-radar" \
    NEXT_PUBLIC_SITE_URL="https://osobennyj.github.io$BASE_URL_PATH/demos/funding-rate-radar" \
    NEXT_PUBLIC_PORTFOLIO_HOME="https://osobennyj.github.io$BASE_URL_PATH/" \
    pnpm build
)
copy_next_app "$ROOT/projects/funding-rate-radar" "funding-rate-radar"

(
  cd "$ROOT/projects/ai-token-due-diligence"
  pnpm install --frozen-lockfile
  STATIC_EXPORT=true \
    NEXT_PUBLIC_BASE_PATH="$BASE_URL_PATH/demos/ai-token-due-diligence" \
    NEXT_PUBLIC_SITE_URL="https://osobennyj.github.io$BASE_URL_PATH/demos/ai-token-due-diligence" \
    NEXT_PUBLIC_PORTFOLIO_HOME="https://osobennyj.github.io$BASE_URL_PATH/" \
    pnpm build
)
copy_next_app "$ROOT/projects/ai-token-due-diligence" "ai-token-due-diligence"

(
  cd "$ROOT/projects/wallet-cluster-investigator/web"
  pnpm install --frozen-lockfile
  VITE_BASE_PATH="$BASE_URL_PATH/demos/wallet-cluster-investigator/" \
    VITE_PORTFOLIO_HOME="https://osobennyj.github.io$BASE_URL_PATH/" \
    pnpm build
)
copy_vite_app "$ROOT/projects/wallet-cluster-investigator/web/dist" "wallet-cluster-investigator"

(
  cd "$ROOT/projects/defi-strategist-mcp"
  pnpm install --frozen-lockfile
  pnpm --filter @defi-strategist/core build
  VITE_BASE="$BASE_URL_PATH/demos/defi-strategist-mcp/" \
    VITE_PORTFOLIO_HOME="https://osobennyj.github.io$BASE_URL_PATH/" \
    pnpm --filter @defi-strategist/playground build
)
copy_vite_app "$ROOT/projects/defi-strategist-mcp/apps/playground/dist" "defi-strategist-mcp"

echo "Done. Demo entrypoints:"
for slug in funding-rate-radar ai-token-due-diligence wallet-cluster-investigator defi-strategist-mcp; do
  test -f "$SITE_OUT/demos/$slug/index.html"
  echo "  $BASE_URL_PATH/demos/$slug/"
done