#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_BUNDLE="$ROOT_DIR/src-tauri/target/release/bundle/macos/AI Usage Hub.app"
APP_BINARY="$APP_BUNDLE/Contents/MacOS/ai-usage-hub"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This run script requires macOS." >&2
  exit 1
fi

case "$MODE" in
  run|--debug|--logs|--telemetry|--verify) ;;
  *) echo "usage: $0 [run|--debug|--logs|--telemetry|--verify]" >&2; exit 2 ;;
esac

pkill -x ai-usage-hub >/dev/null 2>&1 || true
cd "$ROOT_DIR"
npm run tauri -- build --bundles app --no-sign

if [[ ! -d "$APP_BUNDLE" ]]; then
  echo "Tauri did not create $APP_BUNDLE" >&2
  exit 1
fi

case "$MODE" in
  run) /usr/bin/open -n "$APP_BUNDLE" ;;
  --debug) lldb -- "$APP_BINARY" ;;
  --logs)
    /usr/bin/open -n "$APP_BUNDLE"
    /usr/bin/log stream --info --style compact --predicate 'process == "ai-usage-hub"'
    ;;
  --telemetry)
    /usr/bin/open -n "$APP_BUNDLE"
    /usr/bin/log stream --info --style compact --predicate 'subsystem == "com.aiusagehub.desktop"'
    ;;
  --verify)
    /usr/bin/open -n "$APP_BUNDLE"
    sleep 2
    pgrep -x ai-usage-hub >/dev/null
    ;;
esac
