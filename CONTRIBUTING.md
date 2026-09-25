# Contributing to Barbell

Thanks for taking a look! Barbell builds on openGym and remains intentionally small and dependency-light, and the goal is
to keep it that way — easy to read, easy to self-host.

## Project layout

```
frontend/  React + Vite app (src/views, src/components, src/store, src/lib). Builds to static files.
           android/ + ios/ are the Capacitor shells for the standalone mobile app (docs/MOBILE.md).
api/       backend — server.js (Node, no framework), one dependency (@simplewebauthn/server).
web/       multi-stage Dockerfile (builds frontend → nginx) + nginx.conf (serves app, proxies /api).
media/     exercise img/gif (gitignored, fetched at runtime).
docs/      self-hosting guide.
mcp/       optional Model Context Protocol server — read-only stdio bridge for LLM apps
           (Claude Desktop, Cursor, …) to query a user's workouts/1RM/muscle balance. Not in
           the Docker build; only runs when an LLM client spawns it. See mcp/README.md.
```

## Running for development

```bash
cp .env.example .env
docker compose up -d --build      # api + web + media on :8080
# frontend hot reload:
cd frontend && npm install && npm run dev
# training logic (progression rules, 1RM, how a session is read back):
cd frontend && npm test
```

## Guidelines

- **Keep it dependency-light.** The frontend uses React + Router + Zustand and nothing else;
  new deps (front or back) are a hard sell. `api/` has two (`@simplewebauthn/server` for passkeys,
  `web-push` for notifications) — keep it near that.
- **Match the style.** Small components, clear names, comments only where the "why" isn't obvious.
  State lives in the Zustand store (`src/store`); pure helpers in `src/lib`.
- **Don't commit** the exercise media (`media/`) or `data/` — they're gitignored.
- **Test the flow** you touched — click through the affected screens (and the workout flow) in a
  browser before opening a pull request.
- **Training logic gets a unit test.** Anything deciding what you lift next, or reading a logged
  session back, belongs in a pure helper in `src/lib` with tests beside it (`npm test`). These
  rules are easy to get subtly wrong and nearly impossible to verify by clicking — the
  progression engine grew two real bugs that only a test pinned down.

## What CI does with your pull request

A Barbell pull request runs the frontend, MCP, and API suites through GitHub Actions and
builds both API image targets. Check the actual workflow result on your PR. Native APK
signing and Barbell image publication have not been set up for this fork; a green source
pipeline does not produce a Barbell release. The inherited GitLab pipeline and its mirror
belong to upstream and are not Barbell's distribution channel.

## Good first issues

- Additional starter plans (upper/lower, full-body, 5×5…)
- More languages for the exercise instructions (the dataset ships several)
- Percentage / training-max programming (5/3/1-style) on top of the progression engine in
  `src/lib/progression.js` — the policy interface is already there
- Accessibility passes on the workout and chart screens

## Where to ask what

| You have | Goes to |
| --- | --- |
| A question or self-hosting problem | [A Barbell issue](https://github.com/mohammedsunainali/barbell/issues) |
| An idea you're not sure about yet | [A Barbell issue](https://github.com/mohammedsunainali/barbell/issues) |
| A reproducible bug | [Barbell issues](https://github.com/mohammedsunainali/barbell/issues) |
| A change you've already built | [A Barbell pull request](https://github.com/mohammedsunainali/barbell/pulls) |

Questions and ideas are issues too (one tracker is enough) — just labelled, so nobody
mistakes a question for agreed-on work. An answered question is worth more than the same answer
in a chat log: the next person searching "passkey login fails behind my reverse proxy" finds it.
An issue keeps the answer searchable for the next person with the same problem.

## Reporting bugs

Open an issue with: what you did, what you expected, what happened, and your browser/OS. If it's
about login/passkeys, include your `RP_ID`/`ORIGIN` (not the `data/` contents) — most login
issues are an origin mismatch.

Contributions to the inherited application are made under the project's [GNU AGPL v3.0](LICENSE).

## Barbell brand and attribution

Use the supplied assets in `assets/barbell/` and the canonical tokens under `frontend/src/brand/` for new UI. Preserve the upstream Git history, AGPL license, `NOTICE.md`, and third-party media attribution. Keep compatibility-sensitive storage, API, package and platform identifiers until a reviewed migration. Open PRs against `mohammedsunainali/barbell`.
