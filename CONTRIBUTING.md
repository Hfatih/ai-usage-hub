# Contributing

Thanks for helping make AI Usage Hub more useful and more accurate.

## Before opening an issue

Search existing issues, then include the app version, Windows version, the
provider or page involved, and steps to reproduce. Replace account names,
emails, local paths, tokens, and IDs in screenshots or logs with placeholders.
Never upload the local SQLite database, provider session files, or credentials.

## Local development

Follow the prerequisites and commands in [README.md](README.md). Run:

    npm test
    npm run build
    cd src-tauri
    cargo test --locked

The browser preview uses fictional `example.com` accounts. Provider behavior
must also be checked in a Tauri build where the relevant local app is available.

## Pull requests

- Target `main` for Windows changes and `macos` for the Mac port. Forks can
  propose macOS changes directly to `macos` without write access to this repo.
- Keep changes focused and explain the user-facing behavior.
- Include a short verification note and update [CHANGELOG.md](CHANGELOG.md)
  for visible changes.
- Keep account identity, usage source, reset time, and confidence distinct.
  Unsupported quotas must remain unavailable rather than guessed.
- Do not add code that reads browser cookies or provider credential values.
- Do not commit generated builds, installer binaries, local databases, logs,
  or machine-specific paths.

Security reports should follow [SECURITY.md](SECURITY.md) instead of a public
issue when they contain a vulnerability or sensitive details.
