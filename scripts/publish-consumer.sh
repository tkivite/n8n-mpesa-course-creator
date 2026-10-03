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
#   bash scripts/publish-consumer.sh --commit
#   bash scripts/publish-consumer.sh --commit --push
#   bash scripts/publish-consumer.sh --commit --message "chore: sync shared docs"
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
AUTO_COMMIT="false"
AUTO_PUSH="false"
COMMIT_MESSAGE="chore: sync shared docs from creator repo"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --commit)
      AUTO_COMMIT="true"
      shift
      ;;
    --push)
      AUTO_PUSH="true"
      shift
      ;;
    --message)
      COMMIT_MESSAGE="$2"
      shift 2
      ;;
    *)
      TARGET="$1"
      shift
      ;;
  esac
done

if [[ "$AUTO_PUSH" == "true" && "$AUTO_COMMIT" != "true" ]]; then
  echo "--push requires --commit" >&2
  exit 1
fi

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
echo "Auto commit  : $AUTO_COMMIT"
echo "Auto push    : $AUTO_PUSH"
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

  if [[ "$AUTO_COMMIT" == "true" ]]; then
    if [[ ! -d "$TARGET/.git" ]]; then
      echo "Cannot auto-commit: target is not a git repo: $TARGET" >&2
      exit 1
    fi

    pushd "$TARGET" >/dev/null
    if [[ -n "$(git status --porcelain)" ]]; then
      git add -A
      git commit -m "$COMMIT_MESSAGE"
      echo "Auto-commit complete."

      if [[ "$AUTO_PUSH" == "true" ]]; then
        git push
        echo "Auto-push complete."
      fi
    else
      echo "No consumer changes detected after sync; nothing to commit."
    fi
    popd >/dev/null
  else
    echo "Next suggested steps:"
    echo "  1. cd '$TARGET'"
    echo "  2. git status"
    echo "  3. git add -A && git commit -m '$COMMIT_MESSAGE'"
    echo "  4. git push"
  fi
fi

