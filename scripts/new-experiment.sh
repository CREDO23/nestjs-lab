#!/usr/bin/env bash
set -e

NAME="$1"
if [ -z "$NAME" ]; then
  echo "Usage: ./scripts/new-experiment.sh <experiment-name>"
  exit 1
fi

TARGET_DIR="experiments/$NAME"

if [ -d "$TARGET_DIR" ]; then
  echo "Directory $TARGET_DIR already exists. Aborting."
  exit 1
fi

echo "Scaffolding new Nest experiment at $TARGET_DIR..."
# Uses Nest CLI to scaffold a new app and adjust package-manager if needed
npx -y @nestjs/cli new "$TARGET_DIR" --skip-git --package-manager pnpm --skip-install

# Update package name to a consistent convention
pkgfile="$TARGET_DIR/package.json"
tmpfile="$TARGET_DIR/tmp.package.json"
jq --arg n "experiment--$NAME" '.name = $n' "$pkgfile" > "$tmpfile" && mv "$tmpfile" "$pkgfile"

# add README
cat > "$TARGET_DIR/README.md" <<EOF
# Experiment: $NAME
EOF

echo "Done. Run 'pnpm install' from repo root, then start with:"
echo "pnpm --filter experiment--$NAME start:dev"
