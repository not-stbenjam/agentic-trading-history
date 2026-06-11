#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

python3 scripts/update_site_data.py

if git diff --quiet -- assets/trades.js; then
  echo "No site data changes to publish."
  exit 0
fi

git add assets/trades.js
git commit -m "Update public trading history data"
git push
