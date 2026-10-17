# BuyHoreca release status — 16 October 2026

## Status: RELEASE BLOCKED

This archive is a **corrected source candidate**, not a production-certified or deployed release. Static source assertions pass, but the build/lint/install reproducibility gates remain unresolved, live commerce is not verified, and English/Arabic is not complete.

## Corrections made after the earlier review
- Blog rail: consistent offset direction, dynamic loop copy, normalized offset on resize, equal seam spacing, pause-on-hover/focus, and reduced-motion manual-scroll fallback. Removed a later CSS override that re-enabled image zoom under reduced motion.
- SEO/pagination: nested blog article cursors handled by sitemap, repeated cursor/page-budget guards, escaped JSON-LD output, quote utility pages excluded from sitemap, and Shopify policy pages only listed when published.
- Navigation: mobile New Items applies newest-first sorting; mobile navigation has stable unique keys and no duplicate quote destination. The desktop primary label now matches the requested “Hotel specials” name.
- Quote basket: product-page direct quote links now merge the requested product into a non-empty basket, avoid duplicate product/variant entries, persist/broadcast the basket and clean the query URL to prevent a removed item reappearing through fallback UI.
- Customer accounts: removed the false setup panel caused by treating `shop.customerAccountUrl: null` as disabled. The account page now defaults to Shopify-owned `https://buyhoreca.myshopify.com/account/login` (derived from the configured `*.myshopify.com` store domain) or a configured HTTPS account vanity URL. Shopify still must have the intended account mode enabled; live sign-in/registration/order-history tests remain required.
- Policies: Privacy, Returns/Refunds, Shipping and Terms routes now read the actual published Shopify policies and render safe readable text. Unpublished policies are noindex and excluded from sitemap instead of publishing fabricated legal text.
- Reliability: separate homepage hero fallback, query/body limits and timeout on the Shopify proxy, and guarded pagination.

## Source and targeted regression checks
- Comprehensive audit: **184 PASS / 0 FAIL / 4 WARN**. Warnings: incomplete `package-lock.json` entries for `eslint` and `eslint-config-next`; whole-project TypeScript, ESLint and production build skipped because dependencies could not be installed in this environment.
- Production static audit: **45 requirement checks PASS / 0 FAIL**, plus **17 TypeScript/TSX parser checks**.
- Release-hardening regression: **21/21**.
- Product/blog regression: **14/14**.
- Brand-directory regression: **18/18**.
- Checkout/discount source-wiring regression: **10/10** (source checks only, not a live checkout).
- Availability filter: **5/5**; inventory UI: **10/10**; wishlist persistence: **PASS**.
- Responsive/SEO source audit: **53/53**; interaction source audit: **15/15**.
- Customer-account/policy regression: **19/19**; quote-flow regression: **5/5**.
- Isolated Chromium CSS fixture: **17 viewport widths, 320–3840px**, seam spacing, hover feedback and reduced-motion behavior pass. It is not the full Next.js app.

These results are source tests and a targeted CSS fixture. They are not a full browser/E2E certification.

## Release blockers and business verification
1. **Regenerate `package-lock.json` with working npm registry access.** Direct dev dependencies `eslint` and `eslint-config-next` are listed in `package.json` but missing from `package-lock.json`; clean `npm ci` is not reproducible until the lockfile is repaired. Do not manufacture lockfile package entries.
2. **Run whole-project validation:** `npm ci`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` on this exact archive. These did not complete here.
3. **Verify Shopify customer accounts live.** The app now automatically hands off to the Shopify account login route without requiring a vanity domain. Ensure the intended customer-account mode is enabled in Shopify and test sign-in, first-time registration, profile, order history, sign-out and return behavior against the live store.
4. **Publish/approve policy content in Shopify.** Ensure privacy, returns/refund, shipping and terms policies are real and reviewed. Routes show explicit setup states if a policy is absent.
5. **Verify offer rules in Shopify Admin.** `WELCOME10` promises 10% off a first order; `HORECA5` promises 5% off over AED 500. Check status, channels, eligibility, threshold, stacking rules and dates, then run real checkout tests.
6. **Complete authenticated live Shopify checks:** catalogue, stock, cart mutations, discount application, checkout handoff, quote WhatsApp handoff and a safe test order. Previous runtime evidence included upstream Shopify resets/timeouts.
7. **Confirm production deployment and domain routing.** This archive has not been deployed; verify that `buyhoreca.com`, Vercel production alias and the intended Git commit all point to the same release.
8. **English/Arabic remains unimplemented:** translation catalogues, locale routing, RTL layout, Shopify-localized content, alternate-language canonicals/hreflang and Arabic SEO remain outstanding.
9. **B2B business accounts remain deferred** until the core storefront is stable, per the earlier scope decision.
10. **Production SEO/performance not measured:** after deployment, validate canonical and indexed URLs, sitemap/robots retrieval, Search Console, Lighthouse/Core Web Vitals, structured data, social previews and analytics/consent behavior.
11. **Brand assets:** all 64 supplied logo crops are present, but some are low resolution. Replace with official high-resolution Shopify collection imagery before a polished launch.
12. **Sitemap scale limit:** each guarded Shopify connection currently has a 100-page safety budget at up to 250 nodes per page (25,000 records). Confirm live catalogue/collection/blog/article counts; if a connection exceeds 25,000 records or the combined sitemap exceeds Google’s 50,000-URL-per-file limit, split the sitemap before release. The store counts were not available here.
13. **Business claims need owner verification:** About-page statements such as 12+ years, 30+ staff, 50,000+ products in stock, warehouse/showroom area, and hotel/restaurant relationships must be confirmed by the business owner before publication.
14. **Security hardening:** the public Storefront API proxy bounds body/query size and times out, but has no strict GraphQL operation allow-list or distributed rate limiting. Restrict access to trusted Shopify content editors and review use of Shopify CMS HTML before launch.

## Run checks

```bash
npm run audit:production
npm run audit:final
npm run audit:responsive-seo
npm run audit:interaction
npm run test:release-hardening
npm run test:product-blog
npm run test:brand-directory
npm run test:checkout-integration
npm run test:availability-filter
npm run test:inventory
npm run test:wishlist
npm run test:account-policies
npm run test:quote-flow
```

Do not treat a passing static audit as a production sign-off.
