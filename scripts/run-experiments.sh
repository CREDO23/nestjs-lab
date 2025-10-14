#!/usr/bin/env bash
set -e
NAME="$1"
if [ -z "$NAME" ]; then
  echo "Usage: ./scripts/run-experiment.sh <experiment-name>"
  echo "Example: ./scripts/run-experiment.sh circuit-breaker-pattern"
  exit 1
fi
pnpm --filter "experiment-$NAME" start:dev
