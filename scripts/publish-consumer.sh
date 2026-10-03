#!/usr/bin/env bash
set -euo pipefail

# Sync creator-owned public artifacts into the consumer repo.
#
# Default target:
#   ../n8n-mpesa-course-consumer
#
# Usage:
#   bash scripts/publish-consumer.sh
#   bash scripts/publish-consumer.sh /absolute/path/to/n8n-mpesa-course-consumer
#   bash scripts/publish-consumer.sh --dry-run
#   bash scripts/publish-consumer.sh /path/to/consumer --dry-run
#
# Notes:
#   - This script intentionally syncs only a small, explicit manifest of files.
#   - Consumer-owned docs like START-HERE and platform guides stay in the consumer repo.
#   - Creator-owned shared docs like the handbook and cheat sheet are pushed from here.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CREATOR_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_TARGET="$(cd "$CREATOR_ROOT/.." && pwd)/n8n-mpesa-course-consumer"
MANIFEST="$CREATOR_ROOT/release/consumer-sync-manifest.txt"

TARGET="$DEFAULT_TARGET"
DRY_RUN="false"

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN="true" ;;
    *) TARGET="$arg" ;;
  esac
done

if [[ ! -d "$TARGET" ]]; then
  echo "Target consumer repo not found: $TARGET" >&2
  exit 1
fi

if [[ ! -f "$TARGET/README.md" ]]; then
  echo "Target does not look like the consumer repo (missing README.md): $TARGET" >&2
  exit 1
fi

if [[ ! -f "$MANIFEST" ]]; then
  echo "Manifest missing: $MANIFEST" >&2
  exit 1
fi

echo "Creator root : $CREATOR_ROOT"
echo "Consumer repo: $TARGET"
echo "Manifest     : $MANIFEST"
echo "Dry run      : $DRY_RUN"
echo

copy_count=0
while IFS='|' read -r raw_src raw_dst; do
  [[ -z "${raw_src// }" ]] && continue
  [[ "$raw_src" =~ ^# ]] && continue

  src_rel="${raw_src#/}"
  dst_rel="${raw_dst#/}"
  src="$CREATOR_ROOT/$src_rel"
  dst="$TARGET/$dst_rel"
  dst_dir="$(dirname "$dst")"

  if [[ ! -f "$src" ]]; then
    echo "Missing source file in creator repo: $src" >&2
    exit 1
  fi

  mkdir -p "$dst_dir"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[dry-run] cp '$src' '$dst'"
  else
    cp "$src" "$dst"
    echo "copied: $src_rel -> $dst_rel"
  fi
  copy_count=$((copy_count + 1))
done < "$MANIFEST"

echo
if [[ "$DRY_RUN" == "true" ]]; then
  echo "Dry run complete. $copy_count file mappings checked."
else
  echo "Publish complete. $copy_count files synced into the consumer repo."
  echo "Next suggested steps:"
  echo "  1. cd '$TARGET'"
  echo "  2. git status"
  echo "  3. git add -A && git commit -m 'chore: sync shared docs from creator repo'"
  echo "  4. git push"
fi

