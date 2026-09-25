# BARBELL iOS V1 implementation record

Baseline: `17d644188b57361e544b697fb3904440ed318aeb` (`main`, PR #7 merged).
Working branch: `feature/ios-barbell-v1`. The supplied Downloads/barbell-main is an
archive without Git history; implementation uses a fresh authenticated GitHub clone.
The later `rebrand/barbell-v1` change was inspected: documentation only; no missing
product implementation to cherry-pick. Its old draft instruction is not authoritative.

Approved reference inspected at `/Users/mohammedsunainali/Downloads/BARBELL-DESIGN-SYSTEM-V1 3/`:
`tokens/tokens.json`, `docs/design.md`, component and logo guidelines. Existing Poppins,
yellow accent, official outlined lockup and launcher assets remain the design base.

## Implementation checklist

- [x] Reproduce and fix paired boot skipping the private state mirror (`frontend/src/store/useStore.js`).
- [x] Recover conservatively when WebView sync metadata is lost; preserve newer local state and active sessions.
- [x] Clear revoked paired identity while retaining recoverable local training.
- [x] Restrict pairing URL protocols and reject embedded credentials (`frontend/src/lib/remote.js`).
- [x] Use approved lockup on onboarding; hide navigation until mode selection (`MobileOnboarding.jsx`, `App.jsx`).
- [x] Align card geometry; label timer controls and current navigation (`index.css`, `RestTimer.jsx`, `TabBar.jsx`).
- [x] Add Filesystem required-reason privacy resource and reproducible CocoaPods workspace/lock.
- [ ] Complete real iPhone keyboard, safe-area, background, permission and plugin matrix.
- [ ] Resolve owner signing identity; create signed archive and upload to TestFlight.

## Repeatable checks

From repository root:

```sh
npm ci --prefix frontend
npm ci --prefix api
npm ci --prefix mcp
npm test --prefix frontend
npm test --prefix api
npm test --prefix mcp
npm run check:node-loadable --prefix mcp
npm run build --prefix frontend
npm run build:mobile --prefix frontend
xcodebuild -workspace frontend/ios/App/App.xcworkspace -scheme App \
  -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath /tmp/barbell-derived-data CODE_SIGNING_ALLOWED=NO build
```

Native recovery regressions first failed on baseline (mirror recovery and revoked identity),
then passed after the patch. This evidence is automated behavior, not physical-device QA.
