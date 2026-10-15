# BuyHoreca Release Status — 15 October 2026

## Automated source checks

- Comprehensive audit: 143 PASS / 0 FAIL / 1 environment warning (local `node_modules` unavailable).
- Responsive/SEO audit: 53 PASS / 0 FAIL / 0 WARN.
- Featured category image check: 1:1 square frame, edge-to-edge `object-fit: cover`, no border, 12px rounded corners; covered by responsive/SEO audit.
- Interaction audit: 15 PASS / 0 FAIL.
- Wishlist test: PASS.
- The API proxy now rejects request bodies larger than 192 KiB and still validates GraphQL query length and variables shape.

## Do not confuse ZIP validation with production release

The ZIP contains source code; it is not proof that the official domain is running this source. Vercel's latest production deployment on `main` previously failed, and the official domain was observed serving a different storefront from the Next.js Vercel app. Those hosting/domain settings must be corrected separately.

The final static/parser, responsive/SEO, interaction, wishlist, and inventory source tests pass for this updated source. A production build, live authenticated Shopify checkout, Lighthouse, and device-level browser smoke tests have not been performed against this exact archive. Run `npm ci`, `npx tsc --noEmit`, `npm run build`, `npm run lint`, the included audits, and browser smoke tests before promoting to production.


## Follow-up UI update — 15 October 2026

- Category pages now show a compact, live-Shopify New Arrivals strip instead of the stretched collection-image banner.
- New arrivals are fetched with a lightweight newest-first query; mobile is swipe-scrollable and desktop uses responsive grids.
- Automated source checks were expanded. Deployment/domain alignment and live Shopify reliability remain separate production tasks.
