#!/usr/bin/env bash
# Regenerate the GitNexus wiki and copy it into docs/codebase/ for Obsidian/Git visibility.
#
# Usage: ./scripts/sync-wiki.sh [--force]
#
# By default, only regenerates if the underlying graph has changed since the last wiki run.
# Pass --force to regenerate everything.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [ ! -f .env.local ]; then
  echo "error: .env.local not found at repo root" >&2
  exit 1
fi

OPENAI_API_KEY="$(grep '^OPENAI_API_KEY=' .env.local | cut -d= -f2- | tr -d '"' | tr -d "'")"
if [ -z "$OPENAI_API_KEY" ]; then
  echo "error: OPENAI_API_KEY not found in .env.local" >&2
  exit 1
fi
export OPENAI_API_KEY

FORCE_FLAG=""
if [ "${1:-}" = "--force" ]; then
  FORCE_FLAG="--force"
fi

echo "→ Refreshing GitNexus index..."
npx -y gitnexus@1.6.1 analyze >/dev/null

echo "→ Generating wiki (gpt-4o-mini)..."
npx -y gitnexus@1.6.1 wiki \
  --provider openai \
  --model gpt-4o-mini \
  --base-url https://api.openai.com/v1 \
  --api-key "$OPENAI_API_KEY" \
  --concurrency 5 \
  $FORCE_FLAG

WIKI_SRC="$REPO_ROOT/.gitnexus/wiki"
WIKI_DEST="$REPO_ROOT/docs/codebase"

if [ ! -d "$WIKI_SRC" ]; then
  echo "error: wiki output not found at $WIKI_SRC" >&2
  exit 1
fi

mkdir -p "$WIKI_DEST"
echo "→ Syncing $WIKI_SRC → $WIKI_DEST"
rsync -a --delete \
  --include='*.md' \
  --include='*/' \
  --exclude='*' \
  "$WIKI_SRC/" "$WIKI_DEST/"

PAGE_COUNT="$(find "$WIKI_DEST" -name '*.md' | wc -l | tr -d ' ')"
echo "✓ Done. $PAGE_COUNT wiki pages in docs/codebase/"
