#!/usr/bin/env bash
# Refresh the local GitNexus wiki cache after commits.
#
# The post-commit hook calls this script in the background and writes stdout/stderr
# to .gitnexus/wiki-sync.log. Keep it non-interactive and never make commits fail.

set -u

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT" || exit 0

WIKI_CACHE="$REPO_ROOT/.gitnexus/wiki"
DOCS_WIKI="$REPO_ROOT/docs/codebase"
TIMEOUT_SECONDS="${GITNEXUS_WIKI_TIMEOUT_SECONDS:-120}"

log() {
  printf '[sync-wiki] %s\n' "$*"
}

run_with_timeout() {
  local timeout="$1"
  shift

  "$@" &
  local command_pid=$!

  (
    sleep "$timeout"
    if kill -0 "$command_pid" 2>/dev/null; then
      log "command timed out after ${timeout}s: $*"
      kill "$command_pid" 2>/dev/null || true
    fi
  ) &
  local watcher_pid=$!

  wait "$command_pid"
  local status=$?
  kill "$watcher_pid" 2>/dev/null || true
  wait "$watcher_pid" 2>/dev/null || true
  return "$status"
}

sync_cached_wiki_to_docs() {
  if [ ! -d "$WIKI_CACHE" ]; then
    log "no .gitnexus/wiki cache exists yet; skipping docs/codebase sync"
    return 0
  fi

  mkdir -p "$DOCS_WIKI"
  rsync -a --delete "$WIKI_CACHE"/ "$DOCS_WIKI"/
  log "synced cached wiki to docs/codebase"
}

log "repo: $REPO_ROOT"

if [ "${GITNEXUS_REFRESH_WIKI:-0}" = "1" ]; then
  log "GITNEXUS_REFRESH_WIKI=1; attempting npx --yes gitnexus wiki"
  if run_with_timeout "$TIMEOUT_SECONDS" npx --yes gitnexus wiki; then
    log "gitnexus wiki completed"
  else
    log "gitnexus wiki failed or timed out; keeping existing cached wiki"
  fi
else
  log "skipping live gitnexus wiki generation; set GITNEXUS_REFRESH_WIKI=1 to enable"
fi

sync_cached_wiki_to_docs

exit 0
