# BuyHoreca final production audit

This package is a production-oriented Shopify headless storefront build. The company-profile PDFs are retained under `docs/company-profiles/` as source/reference material only; their pages are not rendered as website sections.

## Critical fixes in this revision
- Fixed the runtime `ReferenceError: cartPulse is not defined` by passing the state explicitly into `StoreHeader`.
- Replaced the PDF-style header logo with the supplied transparent BuyHoreca culinary-cart wordmark in `public/images/buyhoreca-logo-header.png`.
- Corrected header logo intrinsic dimensions and responsive sizing to avoid the undersized/cropped appearance seen in the prior screenshot.
- Standardized the mobile cart pulse to the same `bh-cart-pulse` animation class.
- Preserved the 2 / 3 / 4-card blog rail behavior with automatic horizontal movement and hover/focus pause.
- Retained the full Shopify collection selector, premium typography restraint, responsive navigation, actual local brand logos where available, recently viewed products, same-manufacturer related products and product specification/Q&A support.

## Storefront scope
- Shopify Storefront API for products, variants, collections, predictive search, search filters, cart, checkout and Shopify blog/articles.
- Dense B2B product cards with small consistent gaps, quick actions, variants, quantity controls, ratings/metafields, availability states and add-to-cart feedback.
- Collection/category filtering, sorting, load-more pagination and mobile filter drawer.
- Search autocomplete for products, collections and articles.
- Responsive header/mega menu, mobile navigation, mobile quick actions and touch-safe controls.
- Product detail, cart drawer/page, quote flow, wishlist, compare, brands, business-type discovery and support routes.
- SEO metadata, canonicals, Open Graph/Twitter images, product/blog JSON-LD, sitemap and robots configuration.
- Reduced-motion handling and focus-visible states.

## Verification
Run `npm run audit` after dependencies are installed. This performs a repository-level smoke audit for the known runtime/UI regressions and asset/reference mistakes.

A full `next build` requires installing the project's npm dependencies. This working environment does not have those dependencies installed locally and cannot reach the public npm registry, so runtime build execution was not possible here.
