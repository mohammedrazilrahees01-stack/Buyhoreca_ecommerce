# BuyHoreca launch candidate — 19 October 2026

This archive contains the full storefront source tree at the archive root, intended to be extracted into the existing project directory. `.env.local`, `node_modules`, `.next`, `.git`, and TypeScript build caches are intentionally excluded.

## Fixes included in this candidate

- Correct TypeScript narrowing for the brand-directory collection union (the reported `brandEntry.collection` build error).
- Customer account page uses the Shopify-hosted account-login route fallback rather than showing a customer-facing setup warning when the vanity account domain is null.
- Featured Categories now takes up to 36 real Shopify collections and displays at most three responsive rows: 2 columns on 320–359px; 3 on 360–575px; 4 on 576–767px; 5 on 768–1023px; 6 on 1024–1279px; 8 on 1280–1599px; 9 on 1600–1919px; 10 on 1920–2559px; 11 on 2560–3839px; 12 at 3840px and above. It does not invent fake category data; if Shopify has fewer collections eligible for this rail, fewer cards will display.
- Package manifest and lockfile root dependency declarations are aligned. Removed ESLint dependencies that had no lockfile package entries; `npm run lint` now runs the bundled TypeScript/TSX syntax parser check. `npm run build` remains the semantic TypeScript and production-build gate.
- Route guard and 404 source checks retained; unknown root paths and invalid nested paths are passed to Next.js `notFound()` when resolvable.

## Available verification in this environment

- Responsive/SEO source audit: 53 PASS / 0 FAIL / 0 WARN.
- Static production audit: 45 PASS / 0 FAIL, plus 17 TS/TSX parser checks.
- Category rail layout regression: 12 checks passed.
- Brand directory regression: 18/18.
- Product/blog regression: 14/14.
- Shopify checkout source regression: 10/10 (source wiring only, not live payment).
- Availability filter: 5/5.
- Inventory UI: 10/10.
- Wishlist: passed.
- Interaction regression: 15/15.
- Release-hardening regression: 21/21.
- Account/policy regression: 19/19.
- Quote-flow regression: 5/5.
- Manifest/lockfile root parity and direct dependency lock-entry check: passed.
- `npm ci --dry-run --offline` recognized the dependency tree and completed its dry run.

## Explicit verification limitation

A real clean install and full Next.js production build could not be completed here: `npm ci --offline` reports an uncached tarball, and attempts to reach `registry.npmjs.org` fail with `EAI_AGAIN`. Therefore this archive is a launch candidate with static/regression verification, **not a claim that a fresh production build or live Shopify checkout has passed**. Before declaring deployment certified, run a clean dependency install and `npm run build` on a machine with npm registry access, and complete a real Shopify test checkout/account flow. Do not put real `.env.local` secrets in an archive.
