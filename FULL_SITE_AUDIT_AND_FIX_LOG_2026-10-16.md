# BuyHoreca full source audit and correction log — 16 October 2026

## Scope and honesty note
This is a source-package audit plus targeted Chromium fixtures, not a claim that the deployed website has been fully certified. The exact Next.js app production build could not be run because this environment has no `node_modules`, and dependency installation could not reach the npm registry. In addition, the package lock is objectively incomplete: `eslint` and `eslint-config-next` appear in `package.json` but have no `node_modules/...` entries in `package-lock.json`. Clean `npm ci` must be restored before release. The live Shopify store, discount eligibility, cart mutations, customer quote submission, checkout/payment, deployment health, and actual domain routing were not authenticated or tested. The checked archive is source code and has not been deployed.

The previous review placed too much weight on pattern-based tests. This review corrected real defects those checks did not catch and added behavior-focused regression tests. A passing static check should never be treated as proof of a live production build.

## Verified source corrections

### Blog rail and motion/accessibility
- Made the offset convention consistent: the stored distance stays normalized within one group width, and the transform moves the track left by that positive distance. This prevents reversal/jumps and reduces risk of exposing an empty seam.
- Kept the loop/seam spacing consistent with the card gap (9px on narrow phones; 12px above 480px) and removed the conflicting ultra-wide-only spacing override.
- Preserved dynamically duplicated card groups based on viewport/cycle width, normalized offsets after resizes, and pause-on-card-hover/focus behavior.
- Reduced-motion mode disables autoplay/transforms, hides decorative duplicates, and leaves a manually scrollable carousel.
- Removed the later reduced-motion rule that re-enabled category-image zoom. Added a final sweep to suppress movement-based hover effects and drawer/shimmer animations for reduced-motion users, and suppress hover-only image zoom on touch-first devices.
- Validated the source CSS in an isolated Chromium fixture at 17 widths (320, 360, 375, 480, 500, 576, 767, 768, 800, 1024, 1199, 1200, 1280, 1440, 1920, 2560 and 3840px). Observed 9px/12px spacing as intended, no document-level horizontal overflow, a -2px hover lift with shadow/border feedback, reduced-motion transform suppression/manual scrolling, and zero fixture JavaScript errors. This fixture is not the full Next.js app.

### Shopify data pagination and SEO
- Blog index now follows Shopify cursors through the blog list and each blog's article connection instead of silently stopping at the first 20 entries. The homepage uses a smaller preview query to reduce page-load work.
- Fixed the sitemap's nested-connection resolver for `data.blog.articles`; product, collection, blog, and article connections now use guarded cursor collection. A repeated/missing cursor or page-budget exhaustion stops safely instead of looping indefinitely.
- Removed `/quote` from the sitemap because quote utility pages are `noindex`.
- Added HTML-sensitive escaping for JSON-LD script output (`<`, `>`, `&`, U+2028/U+2029), and applied it to root and dynamic structured data.
- Made the hero image fallback use a separate existing image; if the fallback also fails, the image is hidden instead of retrying the broken source forever. Product card images remain lazy-loaded/decoded.
- Added guards/tests for empty connections, nested article connections, cursor order, repeated cursors, and maximum page budgets.

### Navigation and quote interactions
- The mobile navigation previously had duplicate React keys for two `/quote` links and included hard-coded category paths that were not verified against the live collection taxonomy. It now uses unique keys, removes duplicate destinations, and drops unverified category slugs.
- The desktop primary navigation label now reads **Hotel specials**, matching the requested eight-item navigation taxonomy. The mobile **New Items** link now derives catalog sort from `?sort=NEWEST`, validates supported values, and synchronizes the state when the query parameter changes. Previously it could open the catalogue without applying the requested newest-first sort.
- Direct product links to `/quote?handle=...` now merge the requested product and variant into an existing quote basket, avoid duplicates on repeat loads, persist/broadcast the result, and clear the query URL. A regression was added for non-empty baskets, repeated product variants, and empty variant IDs.
- The direct quote route no longer depends on a temporary “legacy” item rendered outside the persisted basket, so removing an item cannot leave it visually present or include it in the WhatsApp message.
- Customer account route no longer shows the old static placeholder. It validates an HTTPS Shopify-hosted account URL (or fetches Shopify's configured `shop.customerAccountUrl`) and presents setup/error states when unavailable. This is a handoff only; Shopify account enablement and live login remain a blocker.
- Footer policy routes now load the real Shopify privacy, refund/returns, shipping and terms content when published. HTML is converted to safe readable text rather than injected. Unpublished policies show an explicit setup state and are excluded from sitemap/noindexed; legal content still needs merchant approval.
- Removed unused blog query/function code.

## Current verification results

| Check | Result |
|---|---:|
| Comprehensive source + TS/TSX parse audit | 184 PASS / 0 FAIL / 4 WARN |
| Production static audit | 45 requirement checks PASS / 0 FAIL; 17 TS/TSX parser checks PASS |
| Release-hardening regressions | 21/21 PASS |
| Product-page/blog regressions | 14/14 PASS |
| Brand-directory regressions | 18/18 PASS |
| Shopify checkout/discount source-wiring checks | 10/10 PASS (not a live checkout test) |
| Availability-filter regression | 5 PASS / 0 FAIL |
| Inventory UI source checks | 10 PASS |
| Wishlist persistence regression | PASS |
| Responsive/SEO source audit | 53 PASS / 0 FAIL / 0 WARN |
| Interaction audit | 15 PASS / 0 FAIL |
| Strict TypeScript for dependency-free JSON-LD/pagination helpers | PASS |
| Customer-account/policy regression | 14/14 PASS |
| Quote-flow regression | 5/5 PASS |
| CSS-backed Chromium fixture | 17 viewport widths plus hover/reduced-motion checks PASS; 0 fixture browser errors |
| ZIP integrity | Checked again after packaging (see final response) |

The source/TSX parser audit did catch a malformed template literal while the mobile navigation was being edited; it was corrected and the full parser audit then passed. This is one reason the first static result is not presented as a substitute for the actual build.

## Release blockers and limitations that remain

1. **Package lock/install, Next.js production build, whole-project semantic TypeScript, and ESLint remain unverified for this exact archive.** `package.json` declares `eslint` and `eslint-config-next` but the lockfile is missing their package entries. `npm ci` could not install dependencies because the local environment could not reliably reach `registry.npmjs.org`. Regenerate the lockfile with working npm registry access; do not manually invent lock entries. No claim of a clean build or clean lint is made.
2. **The production domain/deployment is not confirmed.** Prior checks indicated `buyhoreca.com` and the Vercel-hosted storefront were not aligned. This archive has not been deployed, and no Vercel alias/settings have been changed.
3. **Live Shopify flows are not validated.** Source checks confirm expected wiring for Shopify cart/discount mutations and checkout URL, but real catalogue availability, cart changes, discounts, quote submission, and a test order/payment still need authenticated smoke tests. Runtime logs from previous checks showed Shopify upstream timeouts/resets.
4. **Offer eligibility is not confirmed in Shopify admin.** The promo cards advertise `WELCOME10` (“10% OFF FIRST ORDER”) and `HORECA5` (“5% OFF ABOVE AED 500”) and copy the codes. Their creation, active status, channel, customer eligibility, minimum purchase conditions, stacking rules, and dates must be verified in Shopify before they are advertised as valid.
5. **English/Arabic is not complete.** The current document language is English. Arabic translations, locale routes, correct RTL layout, localized Shopify text, canonical/hreflang handling, and Arabic SEO have not been implemented. This is an outstanding requirement, not a completed feature.
6. **Policy content must be configured and approved in Shopify.** The footer now links to Privacy, Returns/Refunds, Shipping and Terms routes that read live Shopify policy data. If a policy is unpublished, the route intentionally shows a setup notice, is noindex, and is omitted from the sitemap. Merchant-approved legal content and live rendering must be confirmed.
7. **Business accounts remain deferred**, as previously requested, until the core storefront is stable.
8. **API/CMS hardening remains.** The Shopify proxy limits body/query size, validates variables, uses a timeout and sanitizes public errors, but it does not have a strict GraphQL operation allow-list or distributed rate limiting. Product/article HTML is rendered from Shopify CMS via `dangerouslySetInnerHTML`; restrict editing to trusted admins and consider a vetted sanitizer after dependency-enabled build/test.
9. **Brand assets need higher resolution.** All 64 supplied logo crops are present and file-valid, but some are only tens of pixels high/wide. Replace these with official high-resolution logo images, preferably as Shopify collection images.
10. **SEO outcomes are not measured.** Metadata, canonical URLs, robots, JSON-LD, sitemap code, and route-level index rules are statically checked; Search Console indexing, sitemap fetch, duplicate-content signals, Core Web Vitals, Lighthouse, real crawls, analytics consent, and actual social previews have not been validated against the deployed domain.

11. **Sitemap scale limit:** Shopify connections stop after a guarded 100-page budget, up to 25,000 records each. Confirm actual product/collection/blog/article counts and split the sitemap if a connection exceeds that amount or combined URLs approach Google’s 50,000-URL-per-file limit. Counts were not available in this source-only review.
12. **Marketing claims require owner confirmation:** verify About-page facts including years of experience, staff count, inventory count, warehouse/showroom dimensions, and customer relationship figures.

## Required release verification outside this environment

After restoring dependency access and valid environment values:

```bash
npm ci
npx tsc --noEmit
npm run lint
npm run build
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

Then run browser/device tests against the actual running app with a real Shopify preview store: blog loop across 1/2/5/20+ articles, all carousel controls and reduced motion, all product variants and stock states, cart line add/update/remove, valid/invalid/expired discounts, quote form including direct-handle flow, checkout redirect, mobile navigation, search, filters, wishlist/compare, and image fallback. Finally validate the correct Vercel project/domain, verify sitemap and robots responses, run Lighthouse/mobile performance, and confirm offers plus legal-policy URLs with the business owner.


## Follow-up defect fix: customer account setup warning (16 October 2026)
The screenshot showed the page displaying a configuration warning despite a working Storefront API connection. The original implementation incorrectly assumed that a null `shop.customerAccountUrl` meant accounts were not configured; Shopify documents this field as only present when a customer-account vanity domain exists. The new page always provides a Shopify-hosted account entry point: a validated explicit account vanity URL if present, otherwise `https://<store>.myshopify.com/account/login`. Focused account/policy regression coverage increased to 19/19. This avoids exposing internal configuration advice to shoppers; the store's account mode must still be enabled for Shopify's intended hosted login/registration behavior, which requires a live test.
