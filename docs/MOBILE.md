# Building the mobile app (iOS / Android)


> **Barbell source note:** This guide describes inherited openGym behavior and may include upstream release URLs or compatibility identifiers. For Barbell self-hosting, build this repository from source using [Quick Start — Self-Host Barbell](../README.md#quick-start--self-host-barbell). Existing upstream APKs and images are not Barbell releases. Preserve the [media notice](../NOTICE.md).

Barbell uses two modes from the same codebase:

| | **Self-hosted** (this repo's default) | **Mobile app** (`VITE_MOBILE=1`) |
|---|---|---|
| Runs | in any browser, against your own server | natively on iPhone / Android (Capacitor shell) |
| Accounts | passkey sign-in, one profile per person | none — the phone *is* the account |
| Data | synced to your server, readable on desktop | stays on the device (file in the app's private storage) |
| Reminders | Web Push from your server | native local notifications, no server involved |
| Exercise media | served by your server (`img/`, `gif/`) | loaded from the jsDelivr CDN |

The mobile flavor never talks to a backend by default: no sign-in screen, no sync, no
telemetry. State is mirrored from `localStorage` into `opengym-state.json` in the app's
private data directory on every change (iOS is allowed to evict WebView storage under
pressure — the file mirror is the durable copy and is restored on launch). Backups go out
through the OS share sheet instead of a browser download.

### Connecting the app to your own server

On first launch the app asks how you want to use it. Alongside the fully local mode above,
you can instead **connect it to a self-hosted Barbell server** — your data then lives there,
synced the same way the browser PWA does, instead of only on the phone. This is a mode of the
same app, not a different build or download.

Passkeys can't be used for this: the app's WebView runs at its own origin, which never
matches the real hostname WebAuthn needs. Instead you *pair* the device from a browser
that's already signed in: Settings → **"Pair the mobile app"** shows a one-time code (valid
5 minutes); enter your server's address and that code in the app (same first-launch screen,
or Settings → **"Connect to my server"** later) to finish. Notes:

- Paired mode also mirrors training state into `opengym-state.json`. Previously cached
  training and active workouts remain available offline; pairing, server Coach and remote
  sync need connectivity. Failed writes remain pending and reconnect merges against the
  server revision (409 conflicts are retried without silently replacing another device).
  Boot restores the mirror before contacting the paired server. If WebView sync metadata
  was evicted, the recovered copy is conservatively treated as pending.
- The mirror, pairing file and device Coach configuration are app-private compatibility
  files, not exports. Uninstalling normally removes local training and these files. Do not
  rely on reinstall to restore data; export backups or sync before uninstalling. Keychain
  survival does not imply workout survival.
- Use an HTTPS address if at all possible: the connection carries a bearer token instead of
  a cookie, and that token would otherwise cross the network in plain text.
- "Sign out everywhere" (Settings → Account, in the browser) revokes a paired app's access
  too — it's the same signed session token either way, just delivered over a header instead
  of a cookie. See `/api/pair/create` and `/api/pair/redeem` in `api/server.js` for the
  exchange itself.
- Settings → "Disconnect" syncs one last time, then drops the device cleanly back to local
  mode.

## Prerequisites

- Node 20+
- **Android:** Android Studio (bundles the SDK). Java 21 for Gradle.
- **iOS:** a Mac with Xcode 15+ and CocoaPods (`brew install cocoapods`). A free Apple ID
  is enough to run the app on your own iPhone (see below); paid membership is only needed
  for App Store distribution, which is not configured for this Barbell branch.

## Build & run

```sh
cd frontend
npm install
npm run build:mobile        # VITE_MOBILE build + `cap sync` into android/ and ios/

npx cap open android        # opens Android Studio → run on emulator or device
npx cap open ios            # opens Xcode (Mac only) → set your signing team, then run
```

`npm run build:mobile` bakes the CDN media base into the bundle and copies the web build
into both native projects — re-run it after every web-code change before building natively.

> **Heads-up:** after `build:mobile`, `frontend/dist` contains the *mobile* bundle.
> Run a plain `npm run build` again before deploying `dist` to a server.

## App icons & splash screens

`frontend/resources/icon.svg` contains the official text-free Barbell mark. The iOS and
Android projects already contain the supplied icon and splash exports. When regenerating
platform assets for a new release, use only that source and review the native output:

```sh
cd frontend
npx @capacitor/assets generate --iconBackgroundColor '#000000' --splashBackgroundColor '#000000'
```

(If the generator requires a PNG, use the supplied 1024 px icon-only PNG in
`assets/barbell/`; do not draw a new icon.)

## Upstream distribution history (not Barbell releases)

The following download and CI instructions describe upstream openGym releases. They do not
publish a Barbell app or establish Barbell store availability.

### Android — upstream APK reference

Upstream documents a signed APK in four places, all the same file:

- **[opengym.duarte-santos.ch](https://opengym.duarte-santos.ch)** — the download page.
- **[GitLab's package registry](https://gitlab.com/DuarteSantos8/opengym/-/packages)** — every
  build under `opengym-android/<version>/`, with a `.sha256` beside it. Direct link, no login:
  `https://gitlab.com/api/v4/projects/85678327/packages/generic/opengym-android/<version>/openGym-<version>.apk`
- **[The GitHub release](https://github.com/DuarteSantos8/openGym/releases)** for that version,
  with the APK and its `.sha256` attached as release assets.
- **[The GitLab release](https://gitlab.com/DuarteSantos8/opengym/-/releases)** on the mirror,
  where the file is built; it links to the package registry above.

These packages are upstream openGym binaries. They are not Barbell builds; do not install
them as a way to validate this rebrand.

In the upstream project, these came out of CI: the `build:apk` job in
[the upstream CI configuration](../.gitlab-ci.yml) runs
`npm run build:mobile` and `./gradlew assembleRelease`, then `zipalign`s and signs the result
with the upstream release key. Its job also runs on pushes to the upstream `main`:
`https://gitlab.com/DuarteSantos8/opengym/-/jobs/artifacts/main/browse?job=build:apk`
— a 30-day job artifact, not a package, and not what the in-app updater offers. The key lives in *protected* CI variables (`ANDROID_KEYSTORE_B64`,
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`), so it only exists on `main` and on `v*`
tags — a merge request from a fork can build an APK, but gets an unsigned one and never sees
the key. On a `v*` tag the signed APK is also pushed to the generic package registry, which is
what the release links to.

To build and sign your own:

```sh
cd frontend && npm run build:mobile
cd android && ./gradlew assembleRelease            # → app/build/outputs/apk/release/app-release-unsigned.apk

# one-time: create a keystore. KEEP IT — updates must be signed with the same key,
# or Android refuses to install the new version over the old one.
keytool -genkeypair -keystore my.keystore -alias barbell -keyalg RSA -validity 10950

# align + sign (zipalign/apksigner ship with the Android SDK build-tools)
zipalign -f -p 4 app-release-unsigned.apk aligned.apk
apksigner sign --ks my.keystore --ks-key-alias barbell --out Barbell.apk aligned.apk
```

### iPhone — what's actually possible

An unsigned `.ipa` is not directly installable. Development and distribution require an
appropriate Apple signing/provisioning path. Existing upstream options include:

- **Self-host + PWA** (recommended): open your instance in Safari → Share → *Add to Home
  Screen*. Full-screen app, no expiry, plus sync and passkeys.
- **Xcode free signing:** open `ios/` in Xcode with a free Apple ID as the team and run it
  onto your own iPhone. Apple expires the signature after 7 days; re-run from Xcode to renew.
- **AltStore:** automates that 7-day re-signing over Wi-Fi via a Mac companion app.

Upstream has a `build:ios` job in [`.gitlab-ci.yml`](../.gitlab-ci.yml) for exactly that path: the
same mobile bundle, `xcodebuild archive` without a signing identity, and an *unsigned* `.ipa`
(plus `.sha256`) as job artifact — on a tag also under `opengym-ios/<version>/` in the package
registry — for AltStore/Sideloadly users to sign with their own Apple ID. It needs a Mac: Xcode
does not run on the Linux project runner, and gitlab.com's hosted macOS runners are not on the
free tier. To switch it on, register a Mac as a project runner (shell executor; Xcode, CocoaPods
and Node installed; give it a tag such as `macos`) and set the CI/CD variable `IOS_RUNNER_TAG`
to that tag — the job then appears in every `main` and tag pipeline. Until that variable exists
the job is not part of any pipeline, and it has not run yet, so expect a first round of fixes.
A signed build (TestFlight, App Store) would additionally need an Apple Developer Program
membership, the distribution certificate and profile as protected file variables, and an
`-exportArchive` step — none of that is set up.

### Release notes for maintainers

- Bump `versionName`/`versionCode` in `android/app/build.gradle` per release; keep them in
  step with `frontend/package.json`. `versionCode` must strictly increase or updates won't
  install over an existing APK. The APK is *named* from `frontend/package.json` (the CI job
  reads `version` out of it), so the two drifting apart shows up as a misnamed file.
- Upstream tagging `vX.Y.Z` is what ships everything: images, APK, release notes. Don't push a version
  tag you don't mean to release — `v*` tags are protected for that reason.
- **License:** the inherited openGym code is AGPL-3.0, which by itself sits badly with app-store terms of
  service. `NOTICE.md` carries an app-store exception (an additional permission under
  AGPL §7) granted by the copyright holder — relevant only if store distribution ever happens.
- The app requests notification permission only when the workout-day reminder is switched
  on, and (on Android) declares `SCHEDULE_EXACT_ALARM` so the reminder fires to the minute
  where the user allows it.

## Barbell iOS handoff

See [iOS V1 implementation](IOS_V1_IMPLEMENTATION.md) and [TestFlight handoff](IOS_TESTFLIGHT_HANDOFF.md) for this branch’s actual verification and open gates.
