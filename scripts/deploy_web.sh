#!/usr/bin/env bash
# Publishes the built web app (dist/) to the GitHub Pages repository.
# SAFE: only replaces the app's own files. Other files in that repo (hn.js etc.) are never touched.
# Usage: scripts/deploy_web.sh /path/to/clone/of/nbakhoum84.github.io "commit message"
set -euo pipefail
PAGES_DIR="${1:?path to a clone of nbakhoum84/nbakhoum84.github.io}"
MSG="${2:-Update app}"
[ -f dist/index.html ] || { echo "dist/ is missing. Run: npm run build:web"; exit 1; }
git -C "$PAGES_DIR" fetch origin main
git -C "$PAGES_DIR" checkout main
git -C "$PAGES_DIR" reset --hard origin/main
# Remove ONLY the files that belong to the app build. Never delete anything else in this repository:
# it also hosts files used by the website itself (for example hn.js), which must be left alone.
for f in app.js index.html manifest.json sw.js favicon.ico icon-192.png icon-512.png apple-touch-icon.png metadata.json; do
  rm -f "$PAGES_DIR/$f"
done
rm -f "$PAGES_DIR"/hero.*.jpg "$PAGES_DIR"/logo.*.png
rm -rf "$PAGES_DIR/_expo" "$PAGES_DIR/assets"
cp dist/* "$PAGES_DIR"/
touch "$PAGES_DIR/.nojekyll"
git -C "$PAGES_DIR" add -A
if git -C "$PAGES_DIR" diff --cached --quiet; then echo "No changes to publish."; exit 0; fi
git -C "$PAGES_DIR" commit -m "$MSG"
git -C "$PAGES_DIR" push origin main
echo "Published."
