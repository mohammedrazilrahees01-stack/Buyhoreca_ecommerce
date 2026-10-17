# BuyHoreca B2B Product Page + Seamless Blog Loop Upgrade — 15 October 2026

## Product page enhancements
- Direct keyboard entry for quantity with increment/decrement buttons. Purchasable variants are capped at reported stock; unavailable variants support quotation quantities.
- Estimated line subtotal for the selected variant and quantity, clearly labelled before delivery, applicable taxes and discounts. Shopify cart/checkout remains authoritative.
- Copy SKU, native share with clipboard fallback, save-for-later and compare actions, using existing wishlist/compare storage conventions and the four-product compare limit.
- Savings percentage appears only when Shopify provides a valid compare-at price higher than the selected variant price.
- Unavailable variants remain selectable so buyers can request a quote for the exact SKU/options.
- Request a Quote on an unavailable variant persists product, selected variant and quantity in the quote basket before opening it.
- Existing product image gallery/zoom, product option cards, stock messaging, specs, product-information tabs, related products and recently viewed products are retained.

## Hospitality insights marquee
- Removed the fixed eight-article cap in the homepage carousel path; the carousel renders every supplied preview article.
- Dynamically repeats the group enough times to cover the viewport plus additional loop cycles, including when the source contains only one or two articles.
- The track has no gap between groups, while each group has a trailing spacer equal to the normal card gap. Reset distance uses that group’s exact rendered width, maintaining consistent spacing over the seam instead of exposing a blank viewport.
- Homepage requests lightweight article previews rather than full article HTML to reduce payload.
- Repeated visual copies are hidden from assistive technology and keyboard tab order. Hover/focus pauses movement. Reduced-motion users get one static, manually scrollable group.

## Validation performed on the project source
- Product page/blog regression test: **13/13 passed**.
- Responsive and SEO audit: **53 passed / 0 failed / 0 warnings**.
- Interaction audit: **15 passed / 0 failed**.
- Wishlist persistence test: passed.
- Inventory UI tests: passed.
- Removed out-of-stock filter regression: **5 passed / 0 failed**; customer-facing filter is removed, while stock status and quote actions remain.
- Comprehensive static/parser audit: **161 passed / 0 failed / 1 environment warning**.

## Verification limits and deployment status
- A clean `npm ci` could not be completed in the local artifact-building environment (it timed out), so a production build and semantic TypeScript check were not independently completed against this exact archive. Static/TSX parser audits are not a substitute for a clean dependency install and production build.
- Live Shopify-authenticated add-to-cart, discounts, quote submission and checkout were not run against this exact source.
- This is a source ZIP, not a deployment. The previously audited Vercel project had a failed recent production build and `buyhoreca.com` was observed serving a different storefront from the Next.js preview. Align the live domain/source of truth, fix upstream Shopify timeout/reset errors, deploy, then run browser/device smoke tests before treating it as production-released.
- The earlier lint audit showed a backlog of `any` usage and React Hooks warnings/errors. Those are not represented as fixed by this upgrade.
