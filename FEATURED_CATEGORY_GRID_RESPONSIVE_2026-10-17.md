# Featured Categories Responsive Grid — 17 October 2026

## What changed

- Removed the hard `slice(0, 24)` cap from the homepage featured-category list. The previous cap meant the 9-column desktop layout could only render 9 + 9 + 6 items even when Shopify had more eligible category collections.
- Kept the preferred category sequence first, then appended the remaining eligible Shopify collections without duplicates.
- The grid changes columns with viewport width and displays up to exactly three rows. It only hides category cards beyond the three-row limit; it does not duplicate categories or invent placeholders.
- Added an explicit 4-column band for 576–767px widths, which previously had no dedicated grid-column rule.
- Added the `npm run test:featured-categories` regression test.

## Three-row display targets

| Viewport width | Columns | Maximum visible cards |
|---|---:|---:|
| 320–359px | 2 | 6 |
| 360–575px | 3 | 9 |
| 576–767px | 4 | 12 |
| 768–1023px | 5 | 15 |
| 1024–1279px | 6 | 18 |
| 1280–1599px | 8 | 24 |
| 1600–1919px | 9 | 27 |
| 1920–2559px | 10 | 30 |
| 2560–3839px | 11 | 33 |
| 3840px and wider | 12 | 36 |

The actual number rendered is `min(eligible Shopify category count, target count)`. If the Shopify catalogue contains fewer eligible categories than a breakpoint can display, there will be fewer cards rather than fake/duplicate links.

## Verification

- `node scripts/test-featured-category-grid.mjs`: 37 passed, 0 failed.
- `node scripts/final-production-audit.mjs`: 45 requirements passed and 17 TypeScript/TSX parser checks passed.
- Responsive/SEO audit: 53 passed, 0 failed, 0 warnings.
- Interaction audit: 15 passed, 0 failed.
- Brand directory regression: 18/18 passed.
- Product/blog regression: 14/14 passed.
- Shopify checkout source wiring: 10/10 passed (source wiring only, not a live payment).
- Availability filter: 5/5 passed.
- Inventory UI: passed.
- Wishlist regression: passed.
- Release hardening: 21/21 passed.
- Account/policy regression: 19/19 passed.
- Quote flow: 5/5 passed.

## Release limitation

The whole-project semantic TypeScript check, ESLint, and Next.js production build remain unverified in this environment because dependencies are not installed and the npm registry request failed with `EAI_AGAIN`. This responsive-grid change does not claim those release gates have passed.
