# Changelog

All public releases are listed here. Version numbers follow the app's package,
Rust crate, and Tauri bundle versions together.

## [0.1.16] - 2026-09-24

- Make English the default language for new installations and the Windows
  installer. Turkish remains available in Settings.
- Preserve the language selected by existing users during upgrades.
- Reserve a separate `macos` development branch for the future Mac port.

## [0.1.15] - 2026-09-24

Initial public release of AI Usage Hub for Windows.

- Local application monitoring, session history, launch shortcuts, and alerts.
- Source-aware usage cards for Codex, Claude, Antigravity, and OpenCode.
- Provider and account separation, with unavailable data clearly labeled.
- Turkish and English interface, pink star theme, custom title bar, and NSIS installer.
- Local SQLite storage without AI Usage Hub telemetry.

The Windows installer is currently unsigned. Automatic binary updates are not
enabled; install a newer release over the existing installation to update.
