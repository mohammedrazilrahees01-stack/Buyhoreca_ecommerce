# Out-of-Stock Filter Removal — 15 October 2026

## Change
Removed the customer-facing `Out of stock` filter option from all shared catalogue filtering experiences: the main shop, collection/category pages, search results, and brand pages. Shopify-provided facet values are filtered before the shared filter UI renders; the baseline Availability facet now offers `In stock` only.

The selection handlers also reject an out-of-stock facet label and any stale selected out-of-stock facet is excluded from visible chips and submitted ProductFilter inputs.

## Intentionally preserved
- Product-level availability/status information.
- Stock-aware Add to Cart validation and cart quantity checks.
- Low-stock labels.
- Request a Quote behavior for unavailable products.
- All other filters (price, brand, product type, and Shopify-provided facets).

## Verification
- Dedicated regression test: 5 pass / 0 fail.
- Comprehensive static audit: 150 pass / 0 fail / 1 warning.
- Responsive and SEO audit: pending final package verification.
- Interaction, wishlist, and inventory checks: pending final package verification.
- A fresh production build was not run because dependencies are not installed in this workspace. Run `npm ci` and `npm run build` before deploying.
