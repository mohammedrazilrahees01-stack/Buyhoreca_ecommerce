# BuyHoreca UI QA — V6 — 2026-10-08

This package is based on the BuyHoreca storefront repository supplied for this work.

## UI corrections in V6

- Reworked the homepage hero right-hand category area into one unified image panel instead of the previous four separate category tiles.
- The first two live Shopify categories remain the two category destinations over the unified hero image.
- The homepage Popular Brands area is driven by broad live Shopify vendor discovery and managed brand metaobjects rather than a five-brand/initial-product subset.
- Brand logos use managed Shopify media first and local verified logo assets as fallback.
- Product detail pages display the manufacturer/brand logo where available, with local logo fallback.
- Product and gallery image frames use consistent aspect ratios, object-contain/object-cover behavior, and centered image positioning.
- Category images, list-product images, compare images, cart images, gallery images, company imagery, and brand imagery use explicit positioning to prevent cropping/misalignment drift.
- Promo cards remain separate and keep real copy-to-clipboard interactions for WELCOME10 and HORECA5.
- Responsive spacing and image frames were hardened across phone, tablet, desktop, and ultra-wide layouts.

## Validation completed

- `scripts/final-production-audit.mjs`: **60/60 requirement checks + 11/11 TypeScript/TSX parser checks PASS**.
- `scripts/audit-storefront.mjs`: PASS.
- `scripts/test-wishlist.mjs`: PASS.
- Local asset reference scan: **30 referenced local image/video paths, 0 missing**.
- Raster asset verification: **0 unreadable raster assets**.
- ZIP integrity: PASS.

## Important runtime note

A fresh local dependency installation / Next.js production build was not performed in this environment because the normal npm registry network was unavailable during the earlier verification attempts. This V6 package should therefore be treated as source-level/UI-audit validated rather than falsely claiming complete runtime verification here.

The Vercel production deployment inspected during this work was still serving the older GitHub `main` commit `1db1f121751db11c2c1e7e9a11884993278e50b3`, which explains why the supplied production screenshots still showed the older four-tile hero and limited brand set. The V6 ZIP contains the corrected local source.
