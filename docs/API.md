# HTTP API


> **Barbell source note:** This guide describes inherited openGym behavior and may include upstream release URLs or compatibility identifiers. For Barbell self-hosting, build this repository from source using [Quick Start — Self-Host Barbell](../README.md#quick-start--self-host-barbell). Existing upstream APKs and images are not Barbell releases. Preserve the [media notice](../NOTICE.md).

The complete openGym HTTP API — every route of `api/server.js`, with auth,
request/response schemas and the env-dependent behavior — is documented as a
hand-written OpenAPI 3.1 spec:

- **Spec (source of truth):** [`api/openapi.yaml`](../api/openapi.yaml)
- **Browsable (Swagger UI):** https://opengym.duarte-santos.ch/api.html

Lint it after changing routes:

```sh
npx --yes @redocly/cli lint api/openapi.yaml
```
