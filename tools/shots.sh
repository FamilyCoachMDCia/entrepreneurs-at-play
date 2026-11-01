#!/usr/bin/env bash
# Headless screenshots of the dev server, one per section.
# Usage: tools/shots.sh <out_dir> <width> <height> [section[:dy] ...]
set -u
OUT=$1; W=$2; H=$3; shift 3
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
PROFILE="$OUT/.chrome-profile"
mkdir -p "$OUT"
for spec in "$@"; do
  id=${spec%%:*}; dy=0
  [[ $spec == *:* ]] && dy=${spec#*:}
  url="http://localhost:5173/?shot=$id&dy=$dy"
  [[ $id == top ]] && url="http://localhost:5173/?shot=top"
  "$CHROME" --headless=new --user-data-dir="$PROFILE" --hide-scrollbars \
    --use-angle=swiftshader --enable-unsafe-swiftshader \
    --window-size="$W,$H" --virtual-time-budget=12000 \
    --screenshot="$OUT/${W}-${id}-${dy}.png" "$url" >/dev/null 2>&1
  echo "$OUT/${W}-${id}-${dy}.png"
done
