# BuyHoreca — Full project source

Full Next.js + Shopify storefront source, updated 15 October 2026.

## Latest UI change

Collection pages now replace the oversized/cropped collection-image banner with a compact **New Arrivals** strip using the live Shopify catalogue. It retrieves the four newest-created products through a lightweight query, keeps the product grid visible sooner than the old banner, and uses swipe scrolling on small screens with responsive grids on larger screens. Homepage Featured Categories keeps the existing 1:1 rounded image treatment.

## Verification performed

- Comprehensive source/TSX audit: 143 PASS / 0 FAIL / 1 environment warning.
- Responsive/SEO audit: 53 PASS / 0 FAIL / 0 WARN.
- Interaction audit: 15 PASS / 0 FAIL.
- Wishlist test: PASS.
- No TypeScript/TSX parser diagnostics in the checked app files.

A clean production build and a live authenticated Shopify checkout smoke test have not been completed on this exact archive. The deployment/domain mismatch and Shopify upstream timeout errors noted in the release docs must be resolved before production rollout.

## Run locally

1. Copy `.env.local.example` to `.env.local` and provide valid Shopify Storefront API values. Never commit real credentials.
2. Run `npm ci`.
3. Run `npm run audit:responsive-seo`, `npm run audit:interaction`, `npm run test:wishlist`, and `npm run audit:final`.
4. Run `npx tsc --noEmit` and `npm run build`.
5. Complete visual checks on a phone, tablet, laptop, and desktop, including search, filters, cart, discounts, quote submission, and checkout.

See `CATEGORY_NEW_ARRIVALS_STRIP_2026-10-15.md` and the release status files for details.
