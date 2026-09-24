<div align="center">
  <img src="app-icon.svg" alt="AI Usage Hub star logo" width="76" height="76">
  <h1>AI Usage Hub</h1>
  <p>Your AI tools, usage, and app activity in one private Windows dashboard.</p>
  <p>
    <a href="README.tr.md">Türkçe</a> ·
    <a href="../../releases/latest">Download</a> ·
    <a href="CHANGELOG.md">Changelog</a> ·
    <a href="CONTRIBUTING.md">Contribute</a>
  </p>
</div>

AI Usage Hub brings supported provider quotas, local token and cost totals, app status, sessions, and alerts into one desktop app. It runs on your PC, uses your existing sign-ins where a supported local source exists, and labels missing data as unavailable.

> **What it measures:** An app's open time means its process was running. It is separate from provider usage and token consumption. Values marked *Official*, *Local*, or *Calculated* retain their source; the app does not invent a remaining quota.

## Download and install

1. Download the Windows setup EXE from the [latest release](../../releases/latest).
2. Run the installer. It installs for the current Windows user and does not need an administrator account.
3. Open AI Usage Hub and complete the short setup. Use **Integrations** to see what each provider can supply and **Apps** to select a local executable if detection needs help.

Windows 10/11 and Microsoft Edge WebView2 are required. The installer is currently **unsigned**; Windows may show a publisher warning. Download only from this repository's Releases page and verify the published SHA-256 checksum. There is no automatic updater yet: install a newer release over the current one to update.

## Provider coverage

| Source | What the app can show | What is needed | Limits |
| --- | --- | --- | --- |
| **ChatGPT / Codex** | Shared 5-hour and weekly remaining percentages, reset times, plan, plus a separate device-wide local token total | Codex installed and signed in | Local token logs cannot reliably be assigned to a signed-in account |
| **Claude Desktop / Claude Code** | Shared subscription usage from Claude Desktop's local plan history, distinct app status, plus a separate device-wide local token total | A Claude Desktop plan-history sample | Exact reset time is absent from that local history |
| **Google Antigravity** | Gemini and other model quota windows, remaining percentages, reset times, account and plan | Antigravity running and signed in | Its local source does not provide token or cost totals |
| **OpenCode** | Saved provider IDs, local session/token/cost totals, and the public free-model catalog | OpenCode local data for totals | A public catalog does not reveal your personal remaining quota |
| **Kimi / GitHub Copilot** | Local app or editor detection where supported | Matching process | Verified subscription quota is unavailable |

Provider connection, account identity, app detection, and usage are separate signals. For example, a saved OpenCode provider entry alone does not prove that its service is currently connected. The interface uses *Unavailable* where the source cannot substantiate a number.

## Privacy

- AI Usage Hub has **no app telemetry**. Account labels, settings, app sessions, alerts, and usage snapshots stay in its local SQLite database.
- It does **not** ask for provider passwords or save API keys, OAuth tokens, or browser cookies. The Codex and Antigravity adapters use their installed apps' local interfaces; Claude and OpenCode use relevant local data.
- Local Codex and Claude transcript counters are read to calculate token totals. Message text is not displayed or stored by AI Usage Hub.
- The OpenCode adapter reads provider IDs but ignores credential values. Its public model catalog request is unauthenticated.
- Account labels are shown in the app to help you distinguish your own accounts. Do not post unredacted screenshots or your database in a public issue.

The database is `%APPDATA%\com.aiusagehub.desktop\ai-usage-hub.sqlite3`. Close the app fully before moving or deleting it. See [SECURITY.md](SECURITY.md) for the security policy.

## Build from source

**Prerequisites:** Windows 10/11, Node.js 20+, a stable Rust MSVC toolchain, Microsoft C++ Build Tools with **Desktop development with C++**, and WebView2.

```powershell
git clone https://github.com/Hfatih/ai-usage-hub.git
cd ai-usage-hub
npm ci
npm run tauri dev
```

For a production NSIS installer:

```powershell
npm run tauri build
```

The installer is written under `src-tauri/target/release/bundle/nsis/`. Building from source requires no provider credentials. The browser-only Vite preview uses fictional sample data; run the Tauri app to check live local integrations.

## Verify a change

```powershell
npm test
npm run build
cd src-tauri
cargo test --locked
```

The desktop shell uses Tauri 2 and Rust; the interface uses React, TypeScript, and Vite. Local history uses SQLite. Source code is under `src/` and `src-tauri/src/`. Contributions and release steps are in [CONTRIBUTING.md](CONTRIBUTING.md) and [RELEASING.md](RELEASING.md).

## Scope and limitations

The default interface language is Turkish; choose English in **Settings → Language**. Process monitoring samples running apps periodically, so very short launches can be missed. Antigravity must be open for fresh quota data, and Claude Desktop must have written a usage-history sample. Some CLI launch actions stay disabled when they require an interactive terminal. Data from a provider can change independently of this app; the card's source and refresh state tell you what was actually retrieved.

## License

MIT — see [LICENSE](LICENSE). AI Usage Hub is an independent community project; provider names belong to their respective owners.
