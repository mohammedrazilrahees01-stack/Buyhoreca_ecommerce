# BuyHoreca Final UI / Interaction Audit — 2026-10-14

## Scope

This audit covers the current working storefront after the nested-scroll, keyboard/touch interaction, blog auto-scroll, Quick View, and navigation hardening pass.

The review specifically targeted the reported issue where the All Categories panel only moved when the scrollbar thumb was dragged, plus similar internal-scroll failures elsewhere, and the blog carousel becoming stuck instead of moving slowly and continuously.

## Interaction result

**19 PASS / 0 FAIL** in the dedicated interaction audit.

Verified:

- Vertical nested panels use Lenis isolation plus native wheel forwarding.
- Vertical panels respond to ArrowUp/ArrowDown, PageUp/PageDown, Home and End.
- Horizontal rails respond to mouse wheel/trackpad deltas and ArrowLeft/ArrowRight, PageUp/PageDown, Home and End.
- Touch/pointer axis hints are applied to horizontal and vertical scrollers.
- Lenis is configured with nested-scroll support and anchor support.
- Lenis CSS scroll-behavior conflict is neutralized.
- Category picker can scroll with the mouse wheel without dragging the scrollbar.
- Search suggestion/category panels can scroll with the mouse wheel and keyboard.
- Mobile navigation can scroll with wheel/touch/keyboard input.
- Filter drawers can scroll with wheel/touch/keyboard input.
- Quick View has an internally scrollable native panel.
- Cart drawer line list is internally scrollable with wheel/keyboard input.
- Product galleries, product rails, related/recent rails and comparison tables have horizontal interaction support.
- Blog rail uses requestAnimationFrame for continuous slow motion.
- Blog rail no longer pauses merely because the pointer is hovering over it.
- Blog manual controls temporarily pause motion and then resume.
- Blog motion respects prefers-reduced-motion.
- Mobile navigation React keys were hardened to avoid the duplicate Quote/Get a Quote key collision.
- Modal surfaces retain focus trapping and Escape close behavior.
- All rendered buttons declare an explicit `type`.

## Blog carousel implementation

The automatic blog rail now advances continuously at a deliberately slow speed and loops by the exact first-set cycle distance rather than using `scrollWidth / 2`, avoiding a gap-induced jump between duplicated sets.

Pointer, touch, wheel and keyboard interaction temporarily pauses motion and then resumes. Hover alone does not pause the rail.

## Responsive / SEO result

The existing responsive/SEO audit was rerun:

**48 PASS / 0 FAIL / 1 advisory warning**

The warning is not a responsive defect. The audit reports 71 fixed-pixel declarations, reviewed as bounded control, logo, menu, thumbnail and component dimensions rather than page-level fixed widths.

SEO checks remain passing for:

- metadataBase and canonical URLs
- Shopify SEO metadata for products/collections/brands/articles
- Open Graph / Twitter metadata
- Product structured data
- CollectionPage / ItemList structured data
- Article structured data with `updatedAt`-based modification data
- Breadcrumb structured data
- Organization / WebSite / SearchAction structured data
- noindex utility routes
- brand/category sitemap separation
- sitemap and robots linkage
- manifest/icons

## Inventory result

**10/10 PASS**

- zero-stock products cannot be purchased
- out-of-stock products expose Request a Quote
- products with fewer than 10 sellable units show `Only X left`
- quantity controls respect reported `quantityAvailable`
- cart checkout is blocked for unavailable/over-limit lines

## Full source parsing

**11 TS/TSX files parsed with 0 TypeScript/TSX parse diagnostics.**

**CSS parsing: 0 errors.**

During this pass, one malformed JSX section in the working package was found around the product-image zoom area; the stray duplicate zoom markup was removed. The final parser result is now clean.

## Production build verification

The current user's Windows terminal log proves that the previous local commit completed `npm run build` successfully through compilation, TypeScript, static generation and final optimization.

This working environment does not contain the project's installed dependencies, so the newly modified source was validated by TypeScript/TSX parsing and the static audit suite rather than by claiming a fresh `next build` here.

The npm lockfile/ESLint synchronization issue remains intentionally postponed for the separate terminal-fix task.

## Release conclusion

No interaction-audit failures remain. The reported nested-scroll issue has a dedicated wheel/keyboard/native-scroll path, horizontal rails have equivalent input handling, and the blog carousel is configured for slow continuous motion with accessible manual controls and reduced-motion support.
