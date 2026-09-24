# Barbell V1 rebrand QA — 2026-09-24

This report covers the source branch `rebrand/barbell-v1`. It is a PR readiness report, not a claim that signed apps, a hosted website, or store listings are live.

| Area | Result |
|---|---|
| Repository audit | Existing Git history retained; React/Vite/Zustand frontend, Node/WebAuthn JSON API, nginx Docker web, optional Coach and MCP, Capacitor shells, upstream CI and static website identified. See `BARBELL_MIGRATION.md`. |
| Files/branding | README, Contributing, Roadmap, Changelog, UI copy, translations, static website, web metadata and native display assets changed on logical commits. Compatibility identifiers and upstream attribution retained. |
| Design system | Official icon-only SVG/PNG, horizontal and outlined wordmark, `tokens.json` and `tokens.css` copied from the supplied V1 archive. Product CSS uses yellow `#FFED00` as default accent, dark surfaces and Poppins. Existing user-selected accent choices and semantic colors remain. |
| Typography | Local Poppins WOFF2 weights 400/500/600/700 included under the font's OFL license. Graduate identity is outlined in the supplied SVG; no runtime brand-font binary required. An exact case-insensitive `Inter` font/reference scan returns zero files. |
| Brand scan | `#CFFF00` and `#BFFF00` return zero tracked source matches. `#FFED00` is in tokens and consumer styles. Supplied icon-only asset is used for launcher/PWA and splash; no new logo geometry, glow or blur added. |
| README | Keeps verified features, self-hosting Quick Start (`git clone`, `.env`, `docker compose up -d --build`), How It Works, architecture and upstream/third-party attribution. `docker compose pull` still targets upstream images and must not be described as a Barbell build. |
| Contributing, Changelog, Roadmap | Contribution guide updated; historical changelog unchanged below new unreleased Barbell entry; upstream roadmap labeled historical and Barbell plans labeled unshipped. |
| LICENSE and NOTICE | Unchanged compared with `main`; AGPL, additional store permission and exercise-media warning retained. No third-party exercise images were copied into new brand assets. |
| Website | Supplied 13-section landing hierarchy with official identity, Poppins and real inherited app screenshots. Older docs/API/About retain upstream material with an explicit notice. Local landing references checked. No Barbell production domain claimed. |
| PWA | Manifest name/description/theme and title/favicon/apple title updated; assets generated from supplied icon-only master. Service worker cache key kept for offline compatibility. |
| iOS | Display name, 1024 icon and splash images updated. Bundle ID unchanged. Capacitor sync succeeded; Xcode/CocoaPods unavailable, so no iOS binary or device validation. |
| Android | Display name, mipmap/adaptive foreground/background and splash assets updated. Application ID and plugin package names unchanged. Gradle wrapper could not download a distribution in this environment, so no Android binary or device validation. |
| AI Coach, API, MCP | Provider logic, contracts, auth and data left intact. OpenAPI/MCP documentation labeled; MCP identifiers and environment variables preserved. |
| Frontend test/build | 126 test files and 1,584 tests passed; production Vite build passed; mobile Vite build and Capacitor sync passed. No lint script configured. |
| API/MCP tests | 193 API tests passed; 58 MCP tests passed. |
| Native/release blockers | No signed Barbell builds, store records, verified private vulnerability-report channel, commercial exercise-media rights or production deployment confirmed. Existing Android update checker still targets upstream signed releases; a new release strategy must be agreed before distributing a Barbell APK. Native device, passkey, sync and visual QA remain required. GitHub repository metadata/social preview need separate configuration if the connector does not expose those settings. |

## Final safeguards

- `LICENSE` and `NOTICE.md`: no diffs from `main`.
- `frontend/capacitor.config.json` `appId`, Android `applicationId`, and iOS `PRODUCT_BUNDLE_IDENTIFIER`: unchanged.
- `api/server.js`, `frontend/src/lib/mobile.js` and `frontend/src/lib/update.js`: unchanged.
- Existing source screenshots on the website are labeled as current inherited product UI, not an already released Barbell interface.
- Assets in `assets/barbell/` are supplied independently; `assets/BARBELL_ASSETS.md` distinguishes them from inherited code and third-party exercise media.
