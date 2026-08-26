# BuyHoreca production package

This is a complete project package based on the uploaded current project.

Changes in this package:
- Removed the startup/loading video and its startup state/component/styles.
- Kept the Shopify Storefront API, cart, variant, pricing, availability and checkout logic intact.
- Added viewport/safe-area metadata and strengthened global SEO metadata.
- Added client-side canonical/robots handling for utility/search/filter URLs.
- Strengthened robots rules for non-indexable utility routes.
- Refined the About page with structured company content and clearly marked placeholders for future approved imagery/logos.
- Preserved the existing BuyHoreca logo asset.

Secrets:
- `.env.local` is intentionally excluded from this distribution package. Keep your existing local environment file or copy values from `.env.local.example`.
- `node_modules` and `.git` are excluded; run `npm install` after extraction.

Next step after stability verification:
- Add a lightweight responsive SVG logo entrance animation as a separate change. Do not reintroduce the MP4 splash.

- Added brand logo slots with a safe placeholder when an approved logo is not supplied.
- Added responsive safe-area/large-screen hardening, production error boundaries, manifest and security headers.
- Updated robots/sitemap so utility pages are not submitted for indexing and the canonical host is environment-configurable.
