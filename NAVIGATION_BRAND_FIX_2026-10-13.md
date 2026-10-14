# Shop by Brand Fix — 2026-10-13

## Change

The Shop by Brand mega-menu now uses the live Shopify brand-collection set (`brandCollectionsFor`) rather than category collections.

Each brand item uses:
- Shopify collection title as the brand name.
- Shopify collection image as the brand logo.
- `/brands/<collection-handle>` as the destination.

All detected brand collections are rendered in a scrollable responsive grid inside the mega-menu; the list is not limited to the first eight brands.

The side "More brands" category-like panel is removed for Shop by Brand so only actual brands appear there.

## Brand requirement

A brand collection is recognized when its collection title matches the vendor of its first product (case/format-normalized by `brandKey`). The collection image is the brand logo.
