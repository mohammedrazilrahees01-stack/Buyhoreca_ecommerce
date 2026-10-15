BUYHORECA — FULL PROJECT SOURCE ZIP
Release update: 15 October 2026

This is a full Next.js + Shopify storefront project archive, not a minimal overlay.

LATEST CATEGORY-PAGE CHANGE
- The oversized/cropped collection image banner on category pages has been replaced with a compact New Arrivals product collection strip.
- Four latest-created products are fetched from the live Shopify Storefront API with a lightweight query.
- Product cards are horizontally swipeable on small screens and use responsive grids at larger breakpoints.
- The homepage Featured Categories 1:1 rounded thumbnails are preserved.
- Product listing “Newest” sort order is set newest-first.

CHECKS RUN ON THIS SOURCE
- Comprehensive source/TSX audit: 143 PASS / 0 FAIL / 1 environment warning.
- Responsive/SEO audit: 53 PASS / 0 FAIL / 0 WARN.
- Interaction audit: 15 PASS / 0 FAIL.
- Wishlist persistence test: PASS.
- TypeScript/TSX syntax diagnostics: no parser errors.

REMAINING RELEASE VERIFICATION
- A clean production build and full dependency install were not independently run on this exact local archive.
- The official buyhoreca.com domain and the Vercel Next.js project must be aligned before expecting source changes to appear on the official domain.
- Shopify upstream timeouts from prior production runtime logs need investigation.
- Run npm ci, npx tsc --noEmit, npm run build, npm run lint, the included audits, and live browser/cart/checkout smoke tests before production rollout.

CONFIGURATION
1. Extract the full ZIP.
2. Copy values from .env.local.example into your deployment environment; do not commit real secrets.
3. Install dependencies with npm ci.
4. Run the audit scripts and production build.
5. Deploy only after the official domain is connected to the intended project and a production smoke test passes.
