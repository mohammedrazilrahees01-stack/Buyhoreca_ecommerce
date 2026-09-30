# BuyHoreca UI Fix Pass

This package is a complete storefront project based on the current BuyHoreca storefront architecture.

## UI fixes included
- Single application header and single footer render.
- Webstaurant-inspired category-first navigation without copying site content.
- Hover mega-menu with viewport-safe width/height and clean columns.
- Desktop search autocomplete with live Shopify product suggestions and category suggestions.
- Mobile search autocomplete instead of a desktop-only dropdown.
- Product cards with consistent media area, typography, pricing, rating spacing and CTA height.
- Dense 2/3/5/6-column catalogue grid at responsive breakpoints.
- Horizontal product rails with responsive card widths and next-arrow behavior.
- Catalogue filters for brand, product type, availability and AED price range.
- Sort controls for popularity, newest, A-Z and price order.
- Mobile filter drawer and no-results state.
- Better focus states, hover states, spacing and reduced-motion behavior.
- Local fallback SVGs so missing images do not produce broken-image UI.
- Shopify remains the source of truth for live products, variants, pricing, search and cart.

## Important
The environment used to prepare this ZIP could not install npm dependencies because outbound package-network access timed out. The source was therefore checked structurally and the existing Next.js architecture was preserved; run `npm install` and `npm run build` in your normal development environment before deployment.
