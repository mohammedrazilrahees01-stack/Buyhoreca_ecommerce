# BuyHoreca — Consolidated Release Audit

**Audit date:** 17 October 2026  
**Artifact:** Full Next.js/Shopify project source ZIP  
**Status:** **Release candidate; not production-certified until the build and live-store gates below pass.**

## Corrections included in this source candidate

- Fixed the server route guard so `/blog` renders the index and `/blog/{blogHandle}/{articleHandle}` handles article pages. Malformed paths use the branded 404 route; `/shipping` redirects to `/policies/shipping-policy`.
- Centralized route-shape rules and the 10 business slugs in `lib/route-manifest.ts`; server routing and sitemap use the same manifest.
- Added a branded not-found page with browse, search, category, home and contact options.
- Fixed the reported Storefront TypeScript narrowing defect for brand directory entries.
- Added explicit loading, empty-result, error, retry, and pagination-deduplication states to Shop by Business pages; a Shopify timeout or empty collection no longer renders as a silent blank grid.
- Fixed the blog carousel's movement direction, loop seam spacing, and reduced-motion behavior; kept its home preview query separate from the paginated blog index.
- Hardened cursor pagination against repeated cursors and bounded runaway paging; fixed nested Shopify blog article connection handling in metadata/sitemap flows.
- Escaped HTML-sensitive JSON-LD values before script insertion, updated product/collection/brand/article metadata and sitemap handling, and retained safe noindex rules for quote and not-yet-connected brand/policy pages.
- Fixed quote-basket behavior when a product is requested from a product page while the quote basket already contains another product.
- Replaced the customer-account setup warning with a Shopify-hosted sign-in/create-account handoff. This still depends on Shopify customer-account configuration and requires live testing.
- Added published-Shopify-policy routes for privacy, refund, shipping and terms without inventing missing legal text.
- Retained responsive product/category/brand layouts, stock-aware purchase/quote decisions, product card interactions, cart discount wiring, reduced-motion rules, and the eight requested primary navigation groups.

## Automated checks completed

| Check | Latest result |
|---|---:|
| Consolidated source audit | 45/45 requirement checks passed; 20 TypeScript/TSX parser checks passed |
| Route, internal-link, renderer, sitemap, controls and asset-shape audit | 233 pass / 0 fail; 50 route cases, all 10 business slugs and all 4 policy routes included |
| Comprehensive source assertions | 192 pass / 0 fail / 3 blocked warnings |
| Release-hardening regression | 22/22 |
| Product-page and blog regression | 14/14 |
| Account and policy regression | 19/19 |
| Quote-flow regression | 5/5 |
| Brand directory regression | 18/18 |
| Shopify checkout source wiring | 10/10 (source assertions only; no real order/payment) |
| Availability filters | 5/5 |
| Inventory UI checks | all checks passed |
| Wishlist storage tests | passed |
| Responsive and SEO source audit | 53/53 |
| Interaction source audit | 15/15 |
| Pure helper modules under strict TypeScript | passed |

`npm run audit:release` completed successfully. The route suite checks route shapes and all recognized internal URLs, client renderer mappings for 21 route families, sitemap path shapes, 112+ JSX button instances for handler/submit/intentional-disabled wiring, forms for submission wiring, and local assets referenced from JSX. These are automated source checks; they do not prove every runtime customer journey or every dynamically generated Shopify URL exists.

## Hard production-release gates not verified here

1. **Full install, whole-app TypeScript, and Next.js build:** `npm ci` was attempted but could not complete because this environment could not download all npm packages (`EAI_AGAIN` / unavailable registry response; offline retry reported an uncached package). The project-level `tsc` and `next` executables therefore were unavailable. The complete production build has **not** been verified. Package manifest and lockfile direct-dependency ranges match.
2. **Live Shopify flows:** no authenticated end-to-end test was performed for customer login/registration, order history, cart, inventory, discounts, checkout or payment. Test those in the merchant store before go-live.
3. **Offers:** confirm `WELCOME10` and `HORECA5` are active in Shopify and their eligibility matches the offer text shown in the UI.
4. **Legal:** publish and approve privacy, refunds/returns, shipping/delivery and terms content in Shopify Admin; this source intentionally does not fabricate policy text.
5. **Arabic/RTL:** complete Arabic translations, language switching, RTL layout, locale URLs and localized SEO are not implemented in this candidate. If bilingual English/Arabic is a release requirement, this candidate does not satisfy that requirement yet.
6. **Deployment/domain:** this ZIP was not deployed. Verify production Vercel environment variables, intended project, canonical domain and deployment commit.
7. **Live QA/performance:** run browser tests on deployed pages, real cart/discount/account journeys, broken-link check, Lighthouse/Core Web Vitals, sitemap/robots/Search Console validation, and verify the blog marquee visually at real breakpoints.
8. **Merchandising:** Shop by Business results are Shopify text-query-based, not a manually curated assortment. Some brand entries may stay “collection coming soon” until real Shopify collections and official high-resolution collection logos are set up.
9. **Sitemap scale:** guarded collector has a 25,000-record-per-connection budget; check actual catalogue counts and shard large sitemaps if needed.
10. **Quote workflow:** quotation submission currently hands off to WhatsApp; it is not a server-side saved quotation/CRM record. Confirm this is acceptable for launch, or implement and test persistence before claiming a complete quote-management workflow.

## Correct interpretation

There are **no failed assertions in the latest source/regression suite**, and the known source defects above were corrected. That is not the same as a successful Next.js production build or proof of live Shopify operation. Do not describe this ZIP as production-certified until the build/typecheck and the merchant-side checks above pass.
