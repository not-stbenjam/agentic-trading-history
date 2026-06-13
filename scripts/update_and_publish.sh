#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

python3 scripts/update_site_data.py

PUBLISH_PATHS=(
  .gitignore
  index.html
  assets/app.js
  assets/styles.css
  assets/trades.js
  scripts/update_and_publish.sh
  scripts/update_site_data.py
)

if git diff --quiet -- "${PUBLISH_PATHS[@]}"; then
  echo "No site data changes to publish."
  exit 0
fi

git add "${PUBLISH_PATHS[@]}"
git commit -m "Update public trading history data"
git push
