# Final QA results — 16 October 2026

**Release status: BLOCKED — do not deploy this candidate yet.** These are source/regression and isolated CSS-fixture results, not a complete production certification.

| QA area | Result |
|---|---:|
| Comprehensive source/TSX audit | 184 PASS / 0 FAIL / 4 WARN |
| Production static requirements | 45 PASS / 0 FAIL |
| TypeScript/TSX parser checks | 17 PASS / 0 FAIL |
| Release-hardening regression | 21/21 PASS |
| Product-page/blog regression | 14/14 PASS |
| Brand directory regression | 18/18 PASS |
| Checkout/discount source wiring | 10/10 PASS (source-only; no live checkout) |
| Availability filter | 5 PASS / 0 FAIL |
| Inventory UI checks | 10 PASS |
| Wishlist persistence | PASS |
| Responsive/SEO source audit | 53 PASS / 0 FAIL |
| Interaction source audit | 15 PASS / 0 FAIL |
| Customer-account/policy regression | 14/14 PASS |
| Quote-flow regression | 5/5 PASS |
| Isolated Chromium CSS fixture | 17 widths (320–3840px), hover and reduced-motion pass; no fixture errors |

The four comprehensive-audit warnings are release blockers:
1. `package.json` includes `eslint` and `eslint-config-next`, but `package-lock.json` has no entries for those packages. Regenerate the lockfile with working npm registry access before `npm ci`.
2. Whole-project semantic TypeScript was skipped because the local TypeScript executable is absent.
3. ESLint was skipped because the local ESLint executable is absent.
4. The complete Next.js production build was skipped because the local Next executable is absent.

Full-app browser/E2E, real Shopify customer accounts, live cart/discount/checkout, deployment/domain routing, live SEO/performance, and offer eligibility have not been verified. The guarded sitemap collector is capped at 25,000 records per connection; live catalogue counts and sitemap sharding needs must be confirmed. Arabic/RTL is not implemented yet. See `FULL_SITE_AUDIT_AND_FIX_LOG_2026-10-16.md` and `RELEASE_STATUS_2026-10-16.md` before release.


## Account page follow-up correction
The account route now falls back to the official Shopify-owned store-domain `/account/login` endpoint when no customer-account vanity domain URL is configured. This reflects Shopify's documented behavior that Storefront API `shop.customerAccountUrl` is only present for a vanity domain. Customer account/policy regression: 19/19. Live login, registration and order history remain unverified.
