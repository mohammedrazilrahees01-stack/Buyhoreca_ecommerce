# ZIP review — 16 October 2026

## Outcome
This package incorporates the 16 October source fixes and extra regressions discovered during the full source review. It is a **corrected source candidate, not a production-certified release**. Earlier reviews missed a real blog-loop issue and other behaviors because static tests asserted source patterns rather than exercising the behavior. The package now includes targeted behavior tests for blog loop CSS, quote basket merging, Shopify pagination, JSON-LD escaping, customer-account URL safety and policy rendering.

## Latest source checks
- Comprehensive source/TSX audit: **184 PASS / 0 FAIL / 4 WARN**.
- Production static audit: **45 requirements PASS / 0 FAIL; 17 TS/TSX parser checks PASS**.
- Release hardening **21/21**; product/blog **14/14**; brand directory **18/18**; checkout source wiring **10/10**; availability **5/5**; inventory **10/10**; wishlist **PASS**; responsive/SEO source audit **53/53**; interaction source audit **15/15**; account/policy **14/14**; quote flow **5/5**.
- Isolated Chromium CSS fixture: 17 widths (320–3840px), expected blog spacing, no document-level horizontal overflow, hover feedback and reduced-motion behavior passed; zero fixture browser errors.

The full production build, whole-project TypeScript and lint commands were skipped due the incomplete lockfile and unavailable npm registry; the comprehensive audit intentionally exits nonzero to block release.

These tests do not render/exercise the complete Next.js app. In particular, responsive/SEO and interaction counts include static source assertions, not a real-device browser matrix.

## Confirmed release blockers
- `package-lock.json` is incomplete for direct dependencies: `eslint` and `eslint-config-next` are declared in `package.json` but absent from the lock's package entries. Regenerate using `npm install` with working registry access; do not fabricate lock data.
- Full `npm ci`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` did not complete in this environment because registry access failed and `node_modules` is absent.
- Live authenticated Shopify cart, customer account registration/login, discounts, quote handoff, checkout/payment, and test order were not performed.
- Account handoff depends on Shopify Customer Accounts being enabled and correctly configured. Published legal policy content must be approved/configured in Shopify.
- `buyhoreca.com` production mapping and Vercel project alias need confirmation; this archive has not been deployed.
- English/Arabic localization and RTL remain unfinished; B2B business accounts remain deferred; the offer rules in Shopify Admin need verification; some logo crops are low resolution. The guarded sitemap collector caps each connection at 25,000 records, so live catalogue counts and sitemap sharding needs must be confirmed.

## Package safety review
- No `.env`/`.env.local`, private-key file, or real credential is included; `.env.local.example` uses placeholders.
- `package.json` has no `preinstall`, `install`, or `postinstall` lifecycle scripts.
- No suspicious endpoint or hidden destructive command was found in the source package review. Expected Shopify, WhatsApp, and optional environment-configured analytics endpoints remain.

Read `FULL_SITE_AUDIT_AND_FIX_LOG_2026-10-16.md` and `RELEASE_STATUS_2026-10-16.md` before deploying.


## 16 October account-route correction (later update)
The account page no longer interprets the optional Storefront API `shop.customerAccountUrl` vanity-domain field as an enablement check. It now uses a merchant-configured HTTPS vanity URL when provided, otherwise the Shopify-owned `*.myshopify.com/account/login` route. The account/policy regression suite now has 19 passing checks. This fixes the false setup warning shown to shoppers; live account-enabled state still requires verification in the Shopify Admin/store.
