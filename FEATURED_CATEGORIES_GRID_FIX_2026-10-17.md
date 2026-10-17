# Featured Categories — responsive three-row grid (17 October 2026)

## What changed

- The homepage is no longer hard-capped at 24 featured collections. It can now select up to 36 real, eligible Shopify collection records, preserving the 24 preferred category names first and appending the other eligible Shopify collections without duplicate IDs.
- The category rail shows up to three rows at each responsive breakpoint. At the screenshot's large-desktop range (1600–1919 CSS px), that is 9 columns × 3 rows = up to 27 cards. Wider layouts use 10, 11 or 12 columns and allow up to 30, 33 or 36 cards, respectively.
- Phone/tablet layouts also have three-row caps (6, 9, 12, 15 or 18 cards according to their column count). A 576–767px viewport now explicitly uses four columns rather than falling back to implicit single-column auto-placement.
- “View all” still routes to `/categories`, which displays all eligible Shopify collections. No fake collection cards are introduced; if Shopify has fewer eligible collections than a given breakpoint can show, only real available collections are rendered.

## Regression test

Run:

```bash
npm run test:category-grid
```

The test checks the 36-item source limit, homepage binding, View All destination, and the expected three-row cutoffs at all responsive breakpoints.

## Release verification boundary

This update was checked with `test:category-grid`, the final static source audit, the responsive/SEO source audit, and existing regression suites. It does not replace the blocked whole-project production build, ESLint or a live Shopify/deployed-browser test. The package-lock currently lacks entries for `eslint` and `eslint-config-next`; the npm registry was unreachable from the review environment, so the lockfile must still be regenerated with registry access before a clean `npm ci` release check.
