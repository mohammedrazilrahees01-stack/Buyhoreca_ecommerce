# BuyHoreca Implementation Plan

**Prepared:** 15 October 2026  
**Purpose:** Stabilize the existing Shopify + Next.js storefront, improve product pages for B2B HoReCa buyers, and upgrade the full ordering journey without introducing unnecessary features.

## Decisions confirmed

- **Selling model:** Support both standard online checkout at listed prices and quotation requests for bulk, custom, or otherwise quote-required purchases.
- **Languages:** English and Arabic. Arabic requires true RTL layout and translated UI—not merely an Arabic switch label.
- **Business accounts:** Defer company accounts, approvals, and business-specific dashboards until the core store is reliable.
- **Primary product priority:** Product detail pages and the information/actions that help buyers make a confident purchasing decision.
- **Shopify is the source of truth:** Do not invent prices, stock, specifications, discount tiers, delivery estimates, or brand/product details. Use real Shopify fields and show graceful fallbacks when data is missing.

## Current known risks to address first

1. **Domain/source alignment:** Previous checks found `buyhoreca.com` serving different page content from the Next.js app on `buyhoreca-rho.vercel.app`. The Vercel project domain list returned `buyhoreca-rho.vercel.app`, not `buyhoreca.com`. Confirm the intended production application and attach/route the official domain to the correct deployment before calling the work live.
2. **Shopify connectivity:** Runtime errors have included `ECONNRESET`, connection timeouts, and `fetch failed` on storefront routes. Diagnose upstream connectivity and add monitoring, suitable read-query caching/retry, and robust user-facing error states. Do not blindly retry cart mutations.
3. **Price accuracy:** A previous live check found a displayed selling price of AED 111.25 paired with a crossed-out regular price of AED 0.00. Validate selling and compare-at price values everywhere; never display invalid savings.
4. **Code quality:** The previous corrected workspace lint report contained a large backlog (126 errors, 70 warnings) and full dependency audit found five high-severity issues in development tooling, while the production-only audit returned zero at that time. Re-check the current lockfile before releases, fix lint problems, and keep audit/build/test results attached to the final release.
5. **API proxy controls:** Review the Shopify proxy for supported-operation restrictions, request-size limits, rate limiting, timeouts, secret handling, and safe error responses.
6. **End-to-end evidence:** Static checks are not enough. The product → cart → checkout and product/cart → quote paths need browser testing against a safe test configuration.

## Phased implementation order

### Phase 0 — Production baseline and release safety (blocker)

- Confirm the authoritative repository, production branch, Vercel project, environment variables, and official domain.
- Compare the public official domain and intended deployment; verify redirects/canonical URLs and remove competing/stale storefront routing.
- Re-run a clean dependency install, type check, lint, production build, static audits, and dependency audit on the exact release commit.
- Add a repeatable release smoke-test checklist and keep rollback to the last known-good deployment available.
- Diagnose Shopify connectivity failures from runtime logs; add timeouts, safe failure states and useful monitoring. Cache read-only catalogue requests appropriately; avoid unsafe retries for cart mutations.
- Secure the API proxy with supported-operation/validation controls, rate limiting, request limits and server-side secrets.

**Acceptance criteria:** Correct official domain points to intended build; clean install/build/type check succeed; lint backlog is resolved or explicitly gated; production Shopify connectivity is stable under repeated requests; core flows work on a preview using test configuration.

### Phase 1 — Product page (main feature priority)

- **Product identity:** Title, brand/vendor, SKU, selected variant, valid price and comparison price, availability, and pack-size/minimum-order quantity when real data exists.
- **Gallery:** Responsive image gallery, thumbnail selection, accessible zoom/lightbox where practical, proper alt text and image-loading strategy.
- **Variants:** Clear option selection, disabled/unavailable variants, quantity bounds, and stock validation using the selected variant—not only the parent product.
- **Purchase actions:** Prominent Add to Cart for eligible products; clear quote action for bulk/custom/quote-required items; avoid showing both as equal primary actions when business rules say otherwise.
- **Quantity and totals:** Stepper plus direct numeric entry, validation and an estimated line subtotal using the selected variant price. Label estimates clearly and treat Shopify checkout as authoritative for final totals, discounts, tax and shipping.
- **B2B information:** A structured specifications area for dimensions, capacity, materials, pack quantity, warranty, certifications and downloadable datasheets only when these details are available in the source data.
- **Availability and delivery:** Distinguish in stock, low stock, unavailable and request-on-order. Show delivery/lead-time information only when managed and reliable; otherwise link to shipping information or contact/quote.
- **Confidence and utility:** Copy SKU, share product, wishlist/save, comparison (limit to a useful small set), related products, recently viewed where performance allows, and support contact carrying product/variant/SKU context.
- **Mobile conversion:** Sticky bottom Add to Cart/Quote action that respects the mobile quick-navigation bar; no overlapping fixed UI; keyboard and screen-reader support.
- **SEO:** Product metadata, canonical URL, product JSON-LD that matches visible data, useful alt text, stable variant/canonical strategy and appropriate indexability.

**Acceptance criteria:** Variant/price/stock state remains consistent from product page through cart; invalid comparison prices are hidden; quantity validation works; keyboard access works; mobile layout has no overlap; no made-up product facts; schema matches visible product data.

### Phase 2 — Standard checkout + bulk quotations

- Keep standard Shopify online checkout for normal purchases.
- Create a multi-product quote flow accessible from product pages and cart, preserving the exact product, variant, SKU and quantity.
- Make the quote form collect only necessary fields: company/contact, email/phone, delivery location and optional note, with validation and spam/rate protections.
- Generate a quote reference and confirmation message; route submissions to a confirmed sales inbox/system; add failure recovery and avoid losing the request on network errors.
- Provide a clear quote process/status to staff (initially can be a tracked email/admin workflow; do not claim automated CRM status if not implemented).
- Keep unavailable products quoteable where business policy permits, but never imply a quote is a completed order.
- Validate discount behavior and checkout URL handling without assuming discount application or shipping/tax is correct until verified in Shopify.

**Acceptance criteria:** One product quote and multi-line quote submitted successfully in a test; staff receives it; customer receives confirmation/reference; selected variants and quantities survive correctly; standard checkout still works.

### Phase 3 — English + Arabic localization

- Add a persistent language switcher and separate locale-aware routes (prefer a clear `/ar/...` route structure, subject to existing routing constraints).
- Translate storefront UI strings, navigation, filters, button labels, form validation, empty/error states, checkout hand-off labels and system messages.
- Implement Arabic RTL layouts, logical CSS properties, mirrored directional controls where appropriate, and layout QA on mobile/tablet/desktop.
- Localize metadata, canonical/hreflang relationships, sitemap URLs and structured data by locale.
- Use genuine translations for commercial/product copy when available; otherwise provide a clear English fallback instead of inaccurate machine-generated specifications.
- Decide and document language preference persistence, default locale, and currency/tax display policy. Keep currency/tax/checkout rules controlled by Shopify, not presentation-only UI.

**Acceptance criteria:** English and Arabic routes work; RTL has no clipped or overlapping controls; navigation/cart/quote forms remain usable; locale metadata is correct; language choice persists; no missing-key tokens show in public UI.

### Phase 4 — Catalogue, brand directory and discovery

- Keep the requested removal of the “Out of stock” filter; retain honest availability messaging on product cards/details and safe cart validation.
- Improve search with SKU, brand/vendor and title matching, helpful autocomplete, and a meaningful no-results state.
- Keep filter options limited to useful, reliable attributes; don't show filters that return inaccurate results.
- Treat Shopify as the source of truth for connected brand collections. For planned/unconnected brands, show a non-misleading “Coming soon” state; do not create broken brand product URLs or index empty brand pages.
- Suppress duplicate brand cards using normalized names/explicit IDs; use individual logo files or collection images, not a collage asset.
- Keep category imagery square with rounded corners and `object-fit: cover`; use appropriate product-image containment where complete equipment visibility matters.
- Keep the New Arrivals category strip concise and backed by the real Shopify catalogue.
- Make the blog marquee continuously loop with consistent spacing; test article counts of 1, 2, 5 and many, plus keyboard focus and reduced-motion mode.

**Acceptance criteria:** No duplicate brands; missing collections do not create broken links/indexable empty pages; filters agree with actual data; search returns relevant results; carousel has no visible seam/gap and has an accessible reduced-motion alternative.

### Phase 5 — Shipping, trust, accessibility, performance and analytics

- Confirm delivery regions, shipping rates, estimated lead times, VAT/tax presentation, returns/refund terms, warranty wording and business contact details.
- Test on current mobile widths, tablets, desktop and wide screens; check keyboard navigation, focus states, form labels/errors, contrast and screen-reader semantics.
- Optimize product/brand/blog imagery, use stable aspect ratios, avoid excessive client JS and check actual Core Web Vitals/Lighthouse on production pages.
- Verify robots/sitemap, canonical URLs, product/collection structured data, redirect behavior and localized SEO on the official domain.
- Track searches, product views, variant selection, add-to-cart, quote submission, checkout start, purchase completion and relevant errors; respect consent/privacy requirements.

**Acceptance criteria:** Real-device/browser smoke tests pass; analytics events are verified rather than merely installed; privacy and business-policy pages are accessible; product pages and cart are monitored for errors.

### Phase 6 — Business accounts (deliberately later)

Do this only after the core storefront and order flow are stable:

- Company profiles and billing/delivery addresses.
- Order history and fast reorder.
- Saved procurement lists.
- Optional buyer roles/approval workflows when customer demand supports them.
- Contract pricing/credit terms only when Shopify configuration and business policy support them.

## Feature decisions / non-goals for now

- No autoplay video on every collection page; use only selectively if a product needs demonstration.
- No loyalty system, broad AI features or decorative animation work ahead of reliability and conversion features.
- No invented inventory counts, specifications, delivery dates, discounts or brand data.
- No customer-account/RBAC implementation in the first stabilization phase.
- No claim of production readiness until correct domain deployment and test checkout/quote journeys are verified.

## Release gate checklist

- [ ] Official domain serves the intended Next.js release.
- [ ] Clean install, lint, type check and production build pass on the exact commit/archive.
- [ ] Full and production-only dependency audits reviewed.
- [ ] Shopify product/collection data fetches succeed reliably; errors are monitored.
- [ ] Product option, price, stock, quantity, cart and checkout tested end-to-end.
- [ ] Quote requests (single and multi-product) reach the responsible sales destination with reference/confirmation.
- [ ] Price/compare-at/VAT/shipping display verified against Shopify checkout.
- [ ] English and Arabic routes, RTL, metadata and form validation tested.
- [ ] Mobile, tablet, desktop, keyboard and reduced-motion testing complete.
- [ ] Sitemap, canonicals, redirects and structured data checked on the official domain.
- [ ] Rollback path and smoke tests documented.

## Success measures after release

Track baseline and weekly changes in product-to-cart conversion, cart-to-checkout completion, quote submissions per product/category, search-with-no-results rate, failed Shopify requests, checkout errors, mobile conversion and repeat orders. Set numeric targets only after a trustworthy baseline is collected.
