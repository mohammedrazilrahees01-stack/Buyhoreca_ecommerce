# BuyHoreca Release Status — 15 October 2026

## Current source archive
This build adds B2B product-page actions and a seamless continuous blog marquee while preserving earlier fixes: responsive rules, SEO metadata/sitemap/robots/schema, square rounded homepage category tiles, larger mega-menu category thumbnails, New Arrivals strip on category pages, removed Out of stock filter, stock validation, quote flow, mobile WhatsApp offset and Shopify API request validation.

## Automated checks
- Comprehensive source + TSX parser audit: **161 PASS / 0 FAIL / 1 environment warning**.
- Responsive/SEO audit: **53 PASS / 0 FAIL / 0 WARN**.
- Interaction audit: **15 PASS / 0 FAIL**.
- Product/blog regression test: **13 PASS / 0 FAIL**.
- Wishlist test: **PASS**.
- Inventory UI test: **PASS**.
- Removed out-of-stock filter regression: **5 PASS / 0 FAIL**.
- ZIP integrity and target-file checks are run against the final archive after packing.

## Build and runtime verification limits
Local `npm ci` timed out in this artifact-building environment. Therefore `npx tsc --noEmit` and `npm run build` were not completed against this exact ZIP; it must not be described as having a verified production build. No authenticated live Shopify cart/checkout test, Lighthouse run, or browser/device-level smoke test has been performed on this exact archive.

## Production concerns from the previous end-to-end audit
- The latest Vercel deployment on `main` previously failed at the build step.
- The official `buyhoreca.com` domain was observed serving a different storefront from the Next.js Vercel preview. Confirm which project/source is authoritative and align the domain before deployment.
- Vercel previously logged Shopify request timeouts/resets. Test upstream reliability and customer-facing fallback states.
- The API proxy still accepts browser-supplied GraphQL query text; an operation allow-list and rate limiting are recommended. Existing body size/query length/variables validation remains.
- Legacy lint backlog remains and should be resolved systematically rather than suppressed globally.
- This ZIP does not push to GitHub, change Vercel settings, or deploy to production.

## Local validation before release
From the project root, run:

```bash
npm ci
npx tsc --noEmit
npm run build
npm run audit:final
npm run audit:responsive-seo
npm run audit:interaction
node scripts/test-product-page-blog-marquee.mjs
npm run test:wishlist
node scripts/test-inventory-ui.mjs
node scripts/test-availability-filter.mjs
npm run lint
```
Then run browser tests for variant selection, out-of-stock quote path, quantity limits, SKU copy, share fallback, wishlist/compare, cart totals, discounts, quote form, Shopify checkout redirect, blog loop at 1/2/5/100 articles, reduced motion, pointer/keyboard pause, and mobile/desktop viewports.
