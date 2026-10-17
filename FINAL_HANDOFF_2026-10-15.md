# BuyHoreca Final Implementation Handoff — 15 October 2026

## Confirmed user decisions
- Commerce model: normal online checkout plus quotations for bulk, custom, project-sensitive, and unavailable products.
- Languages: English and Arabic; Arabic must use right-to-left layout and localized metadata where implemented.
- Business accounts: defer until the core storefront and ordering flow are stable.
- Product page is the highest design/product priority.

## Already included in this source package
- Shopify Storefront API-backed product catalogue, collection pages, product variants, cart create/read/update/remove, Shopify cart discount mutation, and checkout links using Shopify-returned `checkoutUrl`.
- Product page quantity controls and estimated line subtotal, SKU copy, share/copy fallback, saved products, product comparison, variant availability, stock guard, and quote action for unavailable variants.
- Brand directory with 68 entries (64 individual crops from the supplied collage plus four brands that existed in the directory), automatic collection matching, duplicate suppression, and a coming-soon state for brands not yet connected to Shopify.
- Continuous blog marquee which duplicates the article sequence to fill the viewport, preserves equal spacing at the loop boundary, pauses on card hover/focus, and falls back to manual scrolling for reduced-motion preferences.
- Rounded 1:1 homepage category imagery, larger mega-menu thumbnails, category New Arrivals strip, removal of the Out of stock filter (product availability labels remain), WhatsApp mobile positioning, SEO metadata/schema/sitemap/robots, and responsive CSS rules.
- Source-level regression tests, including a checkout integration test.

## Checkout integration status
The source is connected to Shopify: it defines Storefront GraphQL cart queries and mutations, reads `checkoutUrl` from Shopify cart data, and uses that URL for checkout links. This establishes code-level integration. It does **not** establish that a real customer can complete payment: a live test using the configured Shopify store, payment setup, shipping settings, tax setup, and a safe test order is still required.

## Still required before production sign-off
1. Confirm `buyhoreca.com` is served by the intended Next.js/Vercel source. A previous inspection found the official domain serving different content from the project preview; the Vercel project-domain list did not include `buyhoreca.com`.
2. Reproduce and diagnose recorded Shopify connection timeouts/resets in production runtime logs.
3. Run `npm ci`, `npx tsc --noEmit`, `npm run build`, `npm run lint`, all audit/test scripts, and browser-based smoke tests against this exact archive.
4. Test actual cart/checkout and quote submissions end to end; test invalid and valid discount codes, quantity limits, unavailable variants, and recovery when Shopify is unreachable.
5. English/Arabic localization is a confirmed requirement for the next implementation phase; do not assume this archive contains a complete translated/RTL experience. Locale routing, a language switcher, Arabic UI copy, Shopify localized product content, canonical/hreflang policy, and RTL testing must be implemented and verified before claiming bilingual readiness.
6. Business account profiles are explicitly deferred until core checkout/quotes are stable.
7. Re-run full dependency security audit and address the lint backlog before final release.

## Validation commands
Run from project root:

```bash
npm ci
npx tsc --noEmit
npm run build
npm run lint
npm run audit:final
npm run audit:responsive-seo
npm run audit:interaction
npm run test:brand-directory
npm run test:product-blog
npm run test:availability-filter
npm run test:inventory
npm run test:wishlist
npm run test:checkout-integration
```

## Important scope note
The archive contains the implemented source changes and the implementation decisions/roadmap. The build does not configure external production domains, Vercel settings, Shopify payments/shipping/tax, or deploy itself. Those require the corresponding connected account/configuration and verified post-deployment tests.
