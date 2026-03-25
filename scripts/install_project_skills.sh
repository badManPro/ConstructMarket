#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/skills"
DEST_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
FORCE=0

if [[ "${1:-}" == "--force" ]]; then
  FORCE=1
fi

SKILLS=(
  "constructmarket-domain"
  "wechat-miniapp-engineering"
  "constructmarket-qa"
)

mkdir -p "$DEST_DIR"

for skill in "${SKILLS[@]}"; do
  src="$SOURCE_DIR/$skill"
  dest="$DEST_DIR/$skill"

  if [[ ! -d "$src" ]]; then
    echo "Missing skill directory: $src" >&2
    exit 1
  fi

  if [[ -e "$dest" ]]; then
    if [[ "$FORCE" -eq 1 ]]; then
      rm -rf "$dest"
    else
      echo "Skip $skill: already exists at $dest"
      continue
    fi
  fi

  cp -R "$src" "$dest"
  echo "Installed $skill -> $dest"
done

echo "Restart Codex to pick up new skills."
