#!/usr/bin/env bash
# Publishes the built web app (dist/) to the GitHub Pages repository.
# Usage: scripts/deploy_web.sh /path/to/clone/of/nbakhoum84.github.io "commit message"
set -euo pipefail
PAGES_DIR="${1:?path to a clone of nbakhoum84/nbakhoum84.github.io}"
MSG="${2:-Update app}"
[ -f dist/index.html ] || { echo "dist/ is missing. Run: npm run build:web"; exit 1; }
git -C "$PAGES_DIR" fetch origin main
git -C "$PAGES_DIR" checkout main
git -C "$PAGES_DIR" reset --hard origin/main
# Replace everything except .git and .nojekyll with the new build.
find "$PAGES_DIR" -mindepth 1 -maxdepth 1 ! -name .git ! -name .nojekyll -exec rm -rf {} +
cp dist/* "$PAGES_DIR"/
touch "$PAGES_DIR/.nojekyll"
git -C "$PAGES_DIR" add -A
if git -C "$PAGES_DIR" diff --cached --quiet; then echo "No changes to publish."; exit 0; fi
git -C "$PAGES_DIR" commit -m "$MSG"
git -C "$PAGES_DIR" push origin main
echo "Published."
