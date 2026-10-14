# BuyHoreca Pre-deployment Checklist — 2026-10-13

1. Run `npm install` once to reconcile the package lock with `package.json`, then `npm ci` in CI.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Run `npm run audit:final`.
5. Verify Shopify Search & Discovery facets for the important categories.
6. Verify each brand collection has a matching title/vendor and collection image/logo.
7. Visually check the live app at 320, 390, 768, 1024, 1280, 1536, 1920, 2560 and 3840 CSS pixels.
8. Confirm out-of-stock products are quote-only and low stock shows the real quantity.
