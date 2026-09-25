# BARBELL PROJECT STATUS

Audit date: **2026-09-25**. This is an evidence-based release status for repository `mohammedsunainali/barbell`, not an announcement of an app release. Recheck GitHub and platform rules before executing the gates. The historical rebrand QA snapshot is in `BARBELL_V1_QA.md`.

## CURRENT PROJECT POSITION

| Field | Verified position |
|---|---|
| Repository | https://github.com/mohammedsunainali/barbell |
| Brand | BARBELL · YOUR WORKOUT TRACKER · AI COACH & GYM TRACKER |
| Current working branch for this audit document | `rebrand/barbell-v1` (post-merge documentation update; this file is **not on `main`** until separately integrated) |
| `main` status | `17d644188b57361e544b697fb3904440ed318aeb` merged PR #7 at 2026-09-25 06:24:34 UTC; contains the Barbell rebrand. Its tree was identical to the PR head before this documentation update. |
| Rebrand branch | PR head `b2ddf82f45d66623f9e490c45f5c96e9f2ab38dd` is an ancestor of `main`. This audit commit advances the retained branch only. |
| Original upstream | `DuarteSantos8/openGym` `main` was `f91cde15a1c7ec9af815a1c5878643105636abdf` when read; no local `upstream` remote is configured. |
| PR | [#7](https://github.com/mohammedsunainali/barbell/pull/7) **merged**, closed, eight rebrand commits, 162 changed files; no active rebrand PR. Its body still describes pre-merge release gates and must be read as historical. |
| Current release state | Merged source rebrand; web and mobile **web bundle** build; no verified iOS/Android binary, store record, device QA, Barbell release or production site. |
| Next critical action | Choose and document native signing/package and update strategy, protect release automation, repair timezone-sensitive fixtures and establish a physical-device QA matrix before submitting builds. |

**Readiness decision:** READY for a controlled iOS/Android engineering and device-testing phase. **NOT READY for TestFlight, Google Play, App Store or consumer launch.** Do not treat `cap sync` or a green web test as a signed native app.

## Git and branch comparison

`git merge-base --is-ancestor b2ddf82 origin/main` succeeds. Immediately after PR #7 merged, `main` and its head branch had the *same tree*. The table describes the merged source before this status-only update:

| Area | `main` after merge | Rebrand PR head | Result |
|---|---|---|---|
| README | BARBELL and both descriptors | Same | Merged |
| Branding, fonts, tokens | Official vector identity, bundled Poppins, canonical tokens | Same | Merged source |
| Website | Four Barbell pages, old site archived | Same | Merged; no deployment verified |
| PWA | Barbell manifest/icon/title | Same | Merged source |
| iOS/Android | Display assets/names Barbell; IDs inherited | Same | Merged source; binaries unverified |
| Docs | Rebrand and upstream attribution, historical release notes | Same | Merged; old QA report still describes a branch |

## Evidence and scope

- Source is React 19/Vite 8/Router/Zustand (`frontend/`), Node/WebAuthn/JSON API (`api/`), nginx/Compose (`web/`, `docker-compose.yml`), optional read-only MCP (`mcp/`), and two Capacitor shells. Routes in `frontend/src/App.jsx` cover Home, Plan, Workout, Library, Stats, History, Muscles, Settings, Coach, login and mobile onboarding. This establishes **implemented screens**, not device-level acceptance.
- The README Quick Start uses this repository, `cp .env.example .env` and `docker compose up -d --build`. Compose still tags local builds with upstream `ghcr.io/duartesantos8/opengym-*` image names; `docker compose pull` would fetch upstream code. Docker runtime was not available in this audit environment, so the first-start media download, passkeys, sync and backup/restore are **not end-to-end verified** here.
- The optional Coach has setup/intake, provider adapters (Anthropic, OpenAI, Gemini, compatible endpoints and optional CLI runtimes), plan proposals, review/accept/undo and error/loading handling in `frontend/src/views/Coach*.jsx` and `api/coach/`. BYOK mobile keys use the native secure-storage plugin path in `frontend/src/lib/coach-secrets.js`. A real provider account, consent path, error recovery, offline and paired-device behavior were **not exercised on devices**.
- The website has no Barbell production URL. Its existing Home/Plan/Stats screenshots are **pre-migration openGym captures**, explicitly labeled on the site, and visually retain the old title/green accent. They are not current Barbell UI evidence; replacement captures require media-safe production screenshots. `scripts/build-api-docs.mjs` still writes `website/api.html` using upstream styling, upstream analytics and links; rerunning it would overwrite the Barbell API page. Treat that generator as unmaintained until its destination and template are corrected.

## Design-system compliance and visual gaps

| Requirement | Repository evidence | Result / next action |
|---|---|---|
| `#FFED00` and dark foundation | `frontend/src/brand/tokens.{json,css}`, `frontend/src/index.css`, `website/barbell.css` | Canonical tokens match supplied V1 byte-for-byte; approved yellow is default. Optional user-selected lime remains, not the default brand. |
| Poppins UI | Local 400/500/600/700 WOFF2 under `frontend/public/fonts/` and `website/fonts/`, CSS URLs resolve | Source and assets present; browser/device font rendering still needs visual QA. |
| Graduate identity | Outlined supplied wordmark SVG (no runtime font needed) | Master wordmark, icon-only and horizontal/inside lockups match supplied V1 files. |
| Logo and launcher | `assets/barbell/`, `frontend/resources/icon.svg`, PWA icons, iOS AppIcon, Android mipmaps | Source SVG is byte-identical to official icon-only master; native icon visually matches. No blur or glow observed in master. Verify rendered adaptive masks on devices. |
| Product screens/components | Existing React views and shared CSS/components retained; dark/yellow styling | Structural integration done. Full Home→Workout→Coach visual comparison, accessibility, one-handed input, light theme and responsive device checks remain. |
| Editorial landing | 13-section `website/index.html` and bundled font; local links on four pages resolve | Source matches palette/hierarchy. The three inherited screenshots visibly conflict with the brand; API-doc generation is unsafe for the current page. No live desktop/mobile browser render verified. |
| Deprecated colors / font | Exact-word case-insensitive legacy font scan: **0** in active repository source. Deprecated `#CFFF00`, `#BFFF00`, `#D7FF24`: **0 active values**; old values appear as quoted audit examples only. | Keep semantic success colors and user accent options distinct from primary branding. |

## Fresh engineering verification (this audit)

| Check | Actual result |
|---|---|
| `TZ=UTC npm test` in `frontend/` | **1,584/1,584 passed**, 126 files. |
| `npm test` in `api/` | **193/193 passed**. |
| `TZ=UTC npm test` in `mcp/` | **58/58 passed**; `npm run check:node-loadable` passed. |
| Plain `npm test`, runner `TZ=Asia/Kuala_Lumpur` | **Frontend 1,583/1,584** (Hevy same-local-day fixture); **MCP 57/58** (demo newest-workout fixture). Each targeted file passed under UTC and Asia/Kolkata. Tests depend on host timezone; investigate boundary rules and make fixtures explicit before claiming timezone-independent CI. Do not silently set timezone everywhere as a substitute for behavior tests. |
| `npm run build` in `frontend/` | **PASS**; Vite warns about a >1.5 MB chunk and ineffective dynamic imports. |
| `npm run build:mobile` and separate `npx cap sync` | **PASS** for web bundle/copy/plugin sync; CocoaPods and Xcode steps skipped. The synced `dist` is the mobile variant until another web build. |
| Android `./gradlew --version` | **BLOCKED:** Gradle 8.11.1 distribution download at `services.gradle.org` failed: `java.net.SocketException: Network is unreachable`; Java here is 17, Android SDK paths unset. No Android APK/AAB compiled. |
| iOS toolchain | **BLOCKED:** neither `xcodebuild` nor `pod` available on this Linux runner. No iOS archive/IPA compiled. |
| Dependencies | `npm ls --depth=0` returned zero dependency problems for frontend/API/MCP. `npm outdated --json` timed out after 12 seconds, so current available versions/advisories remain unverified. No dependencies changed. |
| GitHub Actions on merge `17d6441` | Tests and Docker image publisher succeeded; mirror job skipped by its upstream-repository condition; Pages demo **failed** at `actions/configure-pages@v6` because GitHub Pages is not enabled/configured. No public demo was deployed. |

## Open-source, security and third-party boundaries

- `LICENSE` and `NOTICE.md` are unchanged from pre-rebrand upstream-derived `main`; GNU AGPL, the inherited additional app-store permission and upstream copyright notices remain. `NOTICE.md` explicitly treats exercise images/animations as separately owned, with conflicting provenance claims. Build-time/source delivery loads those media from the upstream dataset/CDN. Do not place them in new marketing/store screenshots or claim rights without review.
- Body map outlines have separate attribution in `NOTICE.md`; bundled Poppins has its OFL notice in the fonts directories. `assets/BARBELL_ASSETS.md` distinguishes supplied identity assets and calls for use-rights verification before external distribution. This is a provenance inventory, not a legal opinion.
- `.env` is absent and ignored locally; the tracked `.env.example` contains configuration examples. A redacted tracked-source pattern scan found no embedded credential value: a CI `TRIVY_PASSWORD` assignment reads a CI variable. GitHub Actions secret values and native signing inventory **cannot be verified from source**; confirm them in their administrative consoles without exposing values. The fork has no verified confidential vulnerability reporting channel (`SECURITY.md`).
- `RP_NAME=openGym` in `.env.example` and `api/server.js` is a visible passkey display default; `RP_ID` and `ORIGIN` determine WebAuthn identity and must not be changed casually. Local mobile files (`opengym-state.json`, remote/Coach state), session/cookie names, JSON schema and MCP `OPENGYM_*` variables are compatibility identifiers.

## Remaining upstream-name occurrence classification

Classify **by use**, not by spelling; a single file can contain several categories. The companion [line-level inventory](BARBELL_REFERENCE_AUDIT.tsv) classifies **632 literal matches** in tracked text plus this new status document (B historical 233, C compatibility 273, D legal 19, E stale/visible 48, F upstream URL 59). It records a row for each match and excludes generated `dist`, dependencies and binary imagery; manually reviewed image exceptions are below. Counts are *occurrences*, not numbers of affected product screens.

| Class | Remaining evidence | Decision |
|---|---|---|
| A — current product branding | README, PWA, site, release native display names use BARBELL | No old primary consumer title in these active entry points. |
| B — history | Original changelog/roadmap, archived `docs/upstream-website/`, `PROJECT_CONTEXT.md`, provenance comments | Preserve. |
| C — compatibility | Capacitor/Android/iOS package ID `ch.duartesantos.opengym`, `RP_NAME` default, Docker image/service names, SW cache, stored JSON names and `opengym_plan`, API/MCP identifiers | Review migration impacts separately; keep working data and signing identity for now. |
| D — license | `LICENSE`, `NOTICE.md`, copyright and third-party notices | Preserve text and attribution. |
| E — stale consumer/admin surface | Three JSON export filenames, passkey display default, iOS/Android print-job fallback, Android debug label `OpenGymTest`, GitHub issue template copy, GitHub contact links to upstream Discussions, unused legacy `assets/banner.{svg,png}` and `assets/social.jpg`, pre-rebrand marketing screenshots | Change with appropriate product/compatibility review; issue links can be corrected independently. The legacy social image includes exercise artwork and must not be reused without rights review. |
| F — upstream URL | Explicitly labeled updater/releases, GitLab CDN/images, upstream attribution and historical documents | Preserve where truly upstream; document that upstream binaries are **not** Barbell releases. |

## Native and store checklists

| TestFlight / iOS item | Status | Evidence / action |
|---|---|---|
| Apple Developer account, App ID, store ownership | ⚪ NOT STARTED | No account/record verified. Decide whether inherited bundle ID can be used; proposed **future ID is undecided** pending ownership/signing review. Changing it creates a different app identity and affects updates, associated credentials and distribution. |
| iOS bundle and display assets | 🟡 PARTIAL | `PRODUCT_BUNDLE_IDENTIFIER=ch.duartesantos.opengym`; display name/icon/splashes are Barbell. iOS marketing version 1.0/build 1 is not aligned with Android/frontend 1.3.8. |
| Signing/provisioning/Xcode/CocoaPods/archive | 🔴 BLOCKED | No signing identity verified; toolchain unavailable here. Build a real archive on a Mac. |
| Permission strings, privacy manifest, privacy disclosure | 🟡 PARTIAL | Camera usage string present. App/plugin required-reason API and SDK privacy manifest audit, privacy policy and App Store privacy answers remain. Apple [required-reason API guidance](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api). |
| Endpoints/local and paired mode/Coach/offline/sync | ⚪ NOT STARTED | Verify on iPhone in both modes with real HTTPS self-hosted endpoint and opted-in provider. |
| TestFlight upload/internal testers/crash monitoring | ⚪ NOT STARTED | No uploaded Barbell build or device results. |

| Google Play / Android item | Status | Evidence / action |
|---|---|---|
| Play Console ownership and application ID | 🔴 BLOCKED | No Play record verified. Current `applicationId=ch.duartesantos.opengym`; **future ID undecided** pending signing/store ownership and update-identity review. |
| Gradle/Java/SDK/release AAB | 🔴 BLOCKED | No native build here. Gradle download blocked; current Java 17, SDK unset. Need Android SDK, wrapper and signing/upload key; validate `bundleRelease` and physical installs. |
| Target SDK | 🔴 BLOCKED | Source `targetSdkVersion=35`. For a **new** Google Play app after 2026-08-31, Google's [target API policy](https://support.google.com/googleplay/android-developer/answer/11926878) says **API 36+** (unless an applicable extension/exception is confirmed). Do not bump blindly without Capacitor/plugin/device testing. |
| Updater and permissions | 🔴 BLOCKED | `frontend/src/lib/update.js` queries upstream GitLab and downloads an upstream APK; manifest declares `REQUEST_INSTALL_PACKAGES`. Choose Play-managed updates vs separate sideload build; review permission against [Play policy](https://support.google.com/googleplay/android-developer/answer/12085295). Do not ship an upstream updater in a Barbell Play build. |
| Data safety, privacy policy, rating, store art | ⚪ NOT STARTED | No completed store disclosures, verified privacy URL, media-safe screenshots, feature graphic or content rating. |
| Play App Signing / upload key / internal track | ⚪ NOT STARTED | No Barbell signed AAB or internal test evidence. |
| Notification/QR/Coach/pairing tests | ⚪ NOT STARTED | `google-services.json` is optional and absent in source; test relevant push/native flows with provisioned credentials on devices. |

Apple App Store production also needs passing TestFlight/device checks, final metadata/screenshots, privacy and rights review and a signed review build. Do not describe any of these as done based on current source.

## Chronological project chart

| Phase | Status | Completed and evidence | Remaining |
|---|---|---|---|
| PHASE 0 — SOURCE MIGRATION | ✅ DONE | Inherited history and `f91cde1` ancestor retained | Keep upstream attribution. |
| PHASE 1 — REPOSITORY SETUP | 🟡 PARTIAL | Public Barbell GitHub repo and `main` | Branch protection/rulesets absent; topics empty, no homepage; issue contact links still target upstream. |
| PHASE 2 — BARBELL BRAND SYSTEM | 🟡 PARTIAL | Approved archive; source tokens/identity exact matches | External brand-art use rights and full rendered/device comparison. |
| PHASE 3 — REPOSITORY REBRAND | 🟡 PARTIAL | PR #7 merged; source README/UI/website/PWA/native labels | Stale issue templates, print/export labels, old screenshots, passkey display; legacy API page generator can overwrite current site. |
| PHASE 4 — MAIN BRANCH INTEGRATION | ✅ DONE | Merge commit `17d6441`, PR #7 merged | This new status document must be integrated separately after automation review. |
| PHASE 5 — PRODUCT VERIFICATION | 🟡 PARTIAL | Tests/API/MCP and builds; real feature routes | Timezone tests, browser/manual flows, self-host runtime, device/Coach/sync/offline end-to-end. |
| PHASE 6 — MOBILE ENGINEERING | 🔴 BLOCKED | Capacitor shells and sync, official icon assets | Android Gradle/SDK and Mac/Xcode signing, updater/package ID decision, target API. |
| PHASE 7 — DEVICE QA | ⚪ NOT STARTED | No recorded physical-device matrix | iOS/Android flows, responsive/visual, passkeys, local/paired, notifications, accessibility, recovery. |
| PHASE 8 — TESTFLIGHT / PLAY TESTING | ⚪ NOT STARTED | No signed builds or store tracks | Accounts, identifiers, upload keys, internal build/testers. |
| PHASE 9 — RELEASE PREPARATION | 🔴 BLOCKED | AGPL/NOTICE preserved; GitHub tests build | Rights, security contact, release automation, app privacy, store materials and deployment. |
| PHASE 10 — PRODUCTION LAUNCH | ⚪ NOT STARTED | None confirmed | Complete gates below. |

## Release gates

| Gate | Status | Evidence | Blocker | Owner role | Next action |
|---|---|---|---|---|---|
| A — REBRAND COMPLETE | 🟡 PARTIAL | Source on `main` | Old screenshots and four legacy UI identifiers; physical visual QA | Product/design | Replace media-safe captures and review visible names. |
| B — MAIN BRANCH CLEAN | 🟡 PARTIAL | PR #7 merged, local `main` clean at audit | No protection; docs-only pushes publish inherited image names; Pages workflow fails | Repo maintainer/DevOps | Configure protected checks and isolate/retarget release workflows. |
| C — WEB BUILD PASS | ✅ DONE | Local and GitHub merge workflow build | Deployment and browser QA separate | Frontend | Run HTTPS/local browser QA. |
| D — MOBILE BUILD PASS | 🔴 BLOCKED | Mobile web + sync only | Native binaries not built | iOS/Android | Run Mac/iOS and SDK/Gradle Android builds. |
| E — DEVICE QA PASS | ⚪ NOT STARTED | No device evidence | Test matrix not executed | QA | Run local and paired journeys on physical devices. |
| F — SECURITY PASS | 🟡 PARTIAL | Policy, passkeys, tests, no tracked live credentials found | Private reporting route, permissions, keys and production endpoint unverified | Security/DevOps | Establish private contact and test configured release. |
| G — LEGAL/LICENSING PASS | 🔴 BLOCKED | LICENSE and NOTICE retained | Third-party exercise media and supplied artwork rights not confirmed for marketing/distribution | Product/legal | Review rights and omit unlicensed media from store assets. |
| H — APP STORE READY | ⚪ NOT STARTED | iOS shell only | Account, signing, archive, privacy, TestFlight, QA | iOS/product | Complete iOS checklist. |
| I — GOOGLE PLAY READY | 🔴 BLOCKED | Android shell and SDK 35 source | API 36 requirement for new app, updater/permission, AAB/signing/QA | Android/product | Complete Android checklist. |
| J — PRODUCTION READY | 🔴 BLOCKED | Source integrated | Gates D–I unmet; Pages demo deployment failed | Release owner | Release only after evidence recorded. |

## Updated release roadmap and risk register

1. **Now — engineering control:** fix timezone-dependent tests/validate date semantics; verify Pages decision; prevent docs-only pushes from needlessly publishing `opengym-*` GHCR images; correct GitHub issue links; configure branch protection and private security contact. No tag/release.
2. **Native build spike:** obtain Mac/Xcode/CocoaPods and Android SDK/Gradle network access; decide identifiers and signing ownership; build and install development variants. Resolve Play API 36 and separate Play updater behavior from sideload logic.
3. **Product/device QA:** test Home/Plan/Workout/History/Stats/Muscles/Coach, imports/exports, passkeys, local/offline, pairing/sync, reminders, background/restore, dark/light and responsive visuals. Replace inherited screenshots with verified Barbell captures that contain no unlicensed exercise artwork.
4. **Controlled beta:** prepare privacy/security reporting, app-store disclosures and rights; sign iOS/TestFlight and Android internal-track AAB; collect crash/performance/accessibility feedback; only then plan releases and public deployment.

| Risk | Evidence | Impact | Mitigation / gate |
|---|---|---|---|
| Upstream APK offered by Barbell Android UI | `frontend/src/lib/update.js` and Settings | Wrong publisher/signature; store policy review | Disable or replace for Play variant after release strategy; Gate I. |
| Inherited package IDs/signing | Both native projects | Existing-install/update or ownership conflicts | Verify store records and credentials before any ID changes; Gates D/H/I. |
| Play target 35 after API 36 deadline | `frontend/android/variables.gradle` + official Google policy | New-app submission blocker | Upgrade and validate supported Capacitor/plugins; Gate I. |
| Unclear third-party image rights | `NOTICE.md`, runtime media CDN | Marketing/store reuse risk | Rights review or remove from assets; Gate G. |
| Host-timezone-sensitive tests | UTC passes; Asia/Kuala_Lumpur fails | Regressions outside CI timezone | Explicit timezone fixture and behavior matrix; Gate E. |
| Docs push triggers image publication | `.github/workflows/docker-publish.yml` main push | Unexpected GHCR `opengym-*` edge artifact | Review trigger/names before integrating this audit doc into main; Gate B. |
| No verified Barbell security contact | `SECURITY.md` | Sensitive reports lack private route | Configure and test private route; Gate F. |
| Old screenshots in new marketing | `website/screens/*.png` still show old UI | Visual mismatch, inaccurate launch proof | Capture actual Barbell product, screen/media rights QA; Gate A. |
| Old API-page generator overwrites brand site | `scripts/build-api-docs.mjs` writes `website/api.html` with inherited styling/analytics | Reverts active Barbell API page if invoked | Point generator to historical archive or rebuild template deliberately before use; Gate A. |

## Next terminal sequence (local Mac/Android workstation)

These are diagnostic/build steps, **not** store uploads, signing changes, tag creation, branch deletion or release publication. Use the existing repository checkout, do not overwrite local edits:

```bash
cd "$(git rev-parse --show-toplevel)" # run from anywhere inside the existing checkout
git status --short
git fetch --all --tags
git switch main
git pull --ff-only origin main
git log -1 --oneline
cd frontend
npm ci
TZ=UTC npm test
npm run build
npm run build:mobile
npx cap sync
# macOS with Xcode and CocoaPods:
xcodebuild -version
pod --version
npx cap open ios
# Android workstation with JDK/SDK/Gradle network:
java -version
cd android
./gradlew --version
./gradlew assembleDebug
```

Run the API/MCP suites from the repository root with `cd api && npm ci && npm test` and `cd mcp && npm ci && TZ=UTC npm test`. Build/install on real devices next. Do **not** run `bundleRelease`, upload a build, or change bundle IDs before the store/signing/update strategy is decided. Configure an HTTPS self-hosted test origin and exercise pairing; no production domain is implied.

## Consistency chain

GitHub `main` → Barbell README → mixed inherited/Barbell technical docs → static Barbell website (**undeployed**, legacy screenshots) → Barbell PWA source (**builds**) → Barbell display names and native assets (**not compiled**) → App Store (**no record/build verified**) → Google Play (**no record/build verified**). Product/release copy must keep those last stages described as planned, not shipped.
