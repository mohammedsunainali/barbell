# BARBELL migration audit

This file records the classification made before changing consumer branding. The starting point is upstream-derived commit `f91cde15a1c7ec9af815a1c5878643105636abdf` on `main`. The rebrand lives on `rebrand/barbell-v1` and retains ancestry.

## Architecture and scope

| Area | Existing implementation | Treatment |
|---|---|---|
| `frontend/` | React 19, Vite 8, React Router, Zustand; routes for Home, Check In, Plan, Routine Edit, Workout, Stats, History, Library, Muscles, Settings, Coach and Admin | Rebrand shared presentation; preserve routes, store and training logic. |
| `api/` | Node server, JSON state, passkeys, pairing, notifications, OpenAPI and optional AI Coach providers | Preserve endpoints, auth, data files and provider behavior. |
| `web/`, `docker-compose.yml` | nginx static serving and `/api` proxy; upstream prebuilt image references; runtime third-party media download | Preserve image identifiers and media notices. Build locally with `docker compose up -d --build` for this branch. |
| `website/` | Static marketing, docs and API site | Apply supplied Barbell visuals to marketing; audit legacy docs and distribution links separately. |
| `mcp/` | Read-only stdio bridge and tests | Preserve command identifiers and API compatibility. |
| `frontend/ios/`, `frontend/android/` | Capacitor shells, native plugins, icons, bundle/application ID `ch.duartesantos.opengym` | Change display assets/name only; preserve signing identities and update protocol. Store migration requires release review. |
| `.github/`, `.gitlab/`, scripts | Test, mirror, release and media tasks | Preserve upstream publication machinery pending ownership/secret audit. Do not claim upstream release artifacts as Barbell builds. |
| `LICENSE`, `NOTICE.md`, `CHANGELOG.md`, `ROADMAP.md` | AGPL, section 7 store permission, separate third-party media terms, history and upstream plans | Retain legal text and historical releases; label Barbell plans independently. |

## Occurrence migration table

| Kind | Examples | Decision |
|---|---|---|
| A consumer brand | App title, onboarding, navigation, website hero, PWA, display names | Replace with Barbell/BARBELL using existing UI surfaces. |
| B/M upstream attribution/reference | `DuarteSantos8/openGym`, upstream source relationship | Keep as explicit attribution. |
| C/H API and compatibility | API paths, MCP tool names, pairing/update behavior | Keep until a separate compatibility migration. |
| D package/module | npm package names, Java/Swift identifiers | Keep until downstream impact is assessed. |
| E environment | `RP_NAME`, `RP_ID`, `ORIGIN`, image-base variables | Preserve identifiers; display default may be branded separately. |
| F Docker image | `ghcr.io/duartesantos8/opengym-*`, compose service name | Keep functional upstream references; local build is recommended for modified code. |
| G domain | `opengym.duarte-santos.ch`, GitLab release URLs | Retain only as explicitly labeled upstream resources; no Barbell domain is claimed. |
| I legal/notice | `LICENSE`, `NOTICE.md` and media provenance comments | Keep text unchanged. |
| J historical changelog | Historical openGym releases | Keep unchanged below the new transition entry. |
| K test fixture | Expected strings, snapshots | Update only as behavior changes. |
| L repository URL | Issue/PR/docs/source links intended for this fork | Point at `mohammedsunainali/barbell` where the destination exists. |

## Release gates

Preserve the `LICENSE` and `NOTICE.md` bytes, including upstream attribution and the exercise media warning. Platform package IDs, update/download endpoints, self-hosted data formats, login and sync remain unchanged. A Barbell branded store release needs signing, distribution, notices and exercise-media rights checked separately. The design package contains mock product screens; they are design references, not proof of released functionality or real screenshots.
