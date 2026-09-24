#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_BUNDLE="$ROOT_DIR/src-tauri/target/release/bundle/macos/AI Usage Hub.app"
DMG_DIR="$ROOT_DIR/src-tauri/target/release/bundle/dmg"
VERSION="$(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).version' "$ROOT_DIR/src-tauri/tauri.conf.json")"
DMG_PATH="$DMG_DIR/AI Usage Hub_${VERSION}_$(uname -m).dmg"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This packaging script requires macOS." >&2
  exit 1
fi

if [[ "${1:-}" != "--skip-build" ]]; then
  cd "$ROOT_DIR"
  npm run tauri -- build --ci --no-sign --bundles app
fi

if [[ ! -d "$APP_BUNDLE" ]]; then
  echo "Tauri did not create $APP_BUNDLE" >&2
  exit 1
fi

mkdir -p "$DMG_DIR"
STAGING_DIR="$(mktemp -d "$DMG_DIR/.staging.XXXXXX")"
trap 'rm -rf "$STAGING_DIR"' EXIT
cp -R "$APP_BUNDLE" "$STAGING_DIR/"
ln -s /Applications "$STAGING_DIR/Applications"
hdiutil create -volname "AI Usage Hub" -srcfolder "$STAGING_DIR" -format UDZO -ov "$DMG_PATH"
echo "Created $DMG_PATH"
