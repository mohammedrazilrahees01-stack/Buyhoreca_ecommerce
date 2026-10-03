# BuyHoreca Production Release Audit — 2026-10-02

## Included in this release
- Existing BuyHoreca premium B2B HoReCa storefront retained; Shopify remains the live catalogue/source for products, variants, collections, blog and checkout.
- Primary navigation remains 10 items including Quote; desktop mega-menu is viewport-safe and its Shopify-backed More list is not artificially limited.
- All Categories dropdown retains search + scroll and renders the complete fetched Shopify collection set.
- Collection profile images keep edge-to-edge circular `object-cover`; product photos and brand logos remain contained.
- Product cards remain dense and include wishlist/compare/quick-view/live variant/availability/price/cart behaviour.
- Universal variant selectors, product image zoom/lens, recently viewed and related-product sections retained.
- Homepage blog rail remains Shopify-backed with responsive 2/3/4 cards and hover/focus pause.
- Shopify-managed brand metaobjects remain supported with graceful vendor/local-logo fallback.
- Cart drawer/page keeps Home navigation before hosted Shopify checkout. Shopify-hosted checkout UI itself is not modified by the storefront.
- SEO hardening: static + dynamic metadata, canonical URLs, Open Graph/Twitter, robots, sitemap, WebSite + Organization schema, product/collection/brand/business/article structured data and BreadcrumbList JSON-LD.
- `/collections` is treated as a compatibility alias and noindexed with canonical `/categories`; it is not listed in the sitemap.
- Sitemap entries include sensible change frequency/priority signals while preserving Shopify pagination.
- Manifest points to the actual `/icon.png` asset.
- Responsive hardening targets very small phones through large 4K/5K displays, with overflow guards and desktop-only smooth wheel enhancement.

## Shopify discount setup (outside the codebase)
`WELCOME10` → 10% off order → no minimum purchase/quantity requirement → **Limit to one use per customer** → no end date for an evergreen promotion.

## Verification
Run from the project root:
- `node scripts/final-production-audit.mjs`
- `node scripts/audit-storefront.mjs`
- `node scripts/test-wishlist.mjs`
- `unzip -t <release.zip>`

A full `npm install` / `next build` is not claimed as completed in this sandbox because the external npm registry was not reachable/cached. Vercel remains the authoritative dependency install + production build environment for deployment.

## Asset preservation
This package is based on the current working release package. The connected GitHub repository contains additional binary brand assets beyond those available in the sandbox package, so the safest use is to overlay the source updates onto the existing repository rather than delete unrelated `public/images/brands` assets.
