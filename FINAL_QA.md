# BuyHoreca Final Production QA

## Scope
Full storefront UI/UX and ecommerce logic pass based on the live Shopify Storefront API architecture, current ecommerce UX research, the BuyHoreca company profile and the Blue Mountain company profile.

## Brand
- Header/footer use the supplied BuyHoreca Culinary Cart logo at `public/images/buyhoreca-logo-header.png`.
- PDF cover/page images are not rendered as website sections. The company PDFs remain reference material under `docs/company-profiles/`.

## UI/UX
- Dense B2B product cards with 10–14px grid spacing, consistent heights, wishlist/compare/quick view, SKU, rating, price, availability, quantity and add-to-cart.
- Header search with autocomplete, category suggestions and responsive mobile search.
- Hover mega menu.
- Responsive catalogue grid and list mode.
- Mobile filter drawer.
- Animated add-to-cart state, cart pulse and toast.
- Animated cart drawer with backdrop and ESC handling.
- Product image gallery + zoom.
- Product and blog JSON-LD.
- Blog homepage rail: 2 mobile / 3 tablet / 4 desktop, auto-slides right, pauses on hover/focus, manual arrows.
- Compare page.
- Mobile quick navigation.
- Reduced-motion and focus-visible support.

## Shopify
- Shopify remains the source of truth for product, collection, variant, pricing, search, cart, blog and article data.
- Storefront API default version is 2026-07.
- Expired/invalid cart recovery attempts a fresh cart before failing.
- User errors are surfaced as UI toasts instead of browser alerts.

## SEO
- Root metadata, page metadata and dynamic product/collection/article metadata.
- Product, WebSite and article-ready structured data.
- Canonical URLs for dynamic pages.
- Dynamic sitemap query for products/collections/blog articles (bounded to current Shopify query limits in one sitemap file).
- Robots sitemap reference.

## Static QA performed
- No references to `raw.githubusercontent.com`, `placehold.co`, `unsplash.com`, or missing local hero paths remain in application source.
- PDF file names only occur under `docs/company-profiles/` and are not used by JSX as web images.
- Header is rendered once and footer is rendered once from `App`.
- Clean exact logo asset exists and is referenced via `LOGO_SRC`.
- ZIP integrity must be verified after packaging.

## Environment validation
A networked `npm ci` / production build could not be completed in this sandbox because registry access is unavailable. Source-level TypeScript/JSX transpilation and static reference checks are still performed before packaging.

## Wishlist QA — 2026-09-30
- Fixed the initial-load localStorage race that could overwrite an existing wishlist with an empty React state before hydration completed.
- Wishlist IDs and product snapshots are persisted together.
- Product-card wishlist buttons explicitly prevent default/propagation.
- Wishlist state synchronizes through the custom BuyHoreca event and browser `storage` event.
- Wishlist page can remove products through the same heart action and provides Clear Wishlist.
- Node storage regression test passed: persistence, add/remove toggle, snapshot cleanup, and malformed-storage handling.
