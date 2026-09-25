# Barbell website source

`index.html`, `docs.html`, `api.html`, and `about.html` are Barbell-facing static pages. They use the supplied BARBELL Design System V1 hierarchy, official vector identity, electric yellow and locally bundled Poppins. The three screenshots under `screens/` are inherited app captures without third-party exercise artwork, labeled as the pre-migration product UI. Workout and library captures containing separately licensed exercise media are excluded.

The original upstream site pages, generator and sitemap are preserved under `docs/upstream-website/` for historical reference, not deployment. Detailed engineering documentation lives in `docs/`, the HTTP contract in `api/openapi.yaml`, and legal/media terms in `LICENSE` and `NOTICE.md`. No Barbell production domain or distribution artifacts exist; `robots.txt` disallows indexing until a real Barbell URL and sitemap are configured.
