#!/usr/bin/env bash
# git-commit-safe - Add all and commit with a message (no push)
set -euo pipefail

msg="${1:-}"
if [[ -z "$msg" ]]; then
  echo "Usage: $0 \"commit message\""
  exit 2
fi

git add -A
if git diff --cached --quiet; then
  echo "No staged changes to commit."
  exit 0
fi

git commit -m "$msg"
echo "Committed with message: $msg"
