# BuyHoreca — Production QA Fixes — 2026-10-08

This package is based on the uploaded repository and includes the second deep QA pass.

## Fixed in this pass

1. Homepage `New in Catalogue` now uses Shopify Storefront `ProductSortKeys.CREATED_AT` instead of the invalid `CREATED` value.
2. Search sorting now uses only valid Storefront `SearchSortKeys`: `RELEVANCE` and `PRICE`.
3. Business pages no longer depend on the first 48 global products. They query Shopify using business-relevant title/product-type terms and paginate.
4. Product, category, brand, and blog-article dynamic routes are validated server-side against Shopify when Shopify credentials are available; invalid resources return a real Next.js 404.
5. Business slugs are validated against the site's defined business-type routes.
6. Promo copy now accurately describes `HORECA5` as 5% off orders above AED 500. Actual discount eligibility/enforcement remains Shopify-side.
7. The production audit was updated to validate the corrected Shopify sort behavior and the new route/business protections.

## Validation completed

- Final production audit: 54 requirement checks PASS.
- TSX parser audit: 11 files PASS.
- Storefront audit: PASS.
- Wishlist persistence/toggle/snapshot/malformed-storage regression: PASS.

## Important verification boundary

A fresh `npm ci` / full Next.js production build was not run in the local container because the npm registry was unavailable and the dependency cache was incomplete. The project therefore must still be built in Vercel/CI with the production environment variables.

The public `https://buyhoreca.com/` domain currently does not serve the Vercel `buyhoreca` project inspected during this QA pass; it currently resolves to a different storefront. Connecting the custom domain to the intended Vercel production deployment is a deployment/DNS task and is not silently changed by this source package.

No claim of 100% browser/device verification is made without executing the site in real browser sessions across the requested viewport matrix.
