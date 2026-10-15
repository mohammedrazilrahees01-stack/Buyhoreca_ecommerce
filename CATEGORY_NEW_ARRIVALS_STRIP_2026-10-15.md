# Category page New Arrivals strip — 15 October 2026

## Change
- Removed the oversized Shopify collection-image banner from normal category collection pages. It was cropping the source artwork into a very wide sliver.
- Replaced it with a compact **New Arrivals** strip containing four latest-created products from the live Shopify catalogue.
- Uses a light GraphQL query with only product name, vendor, availability, featured image, and minimum variant price; product tiles link to the actual Shopify-backed product route.
- Mobile layout is horizontally scrollable; medium/desktop layouts use a two-column grid and four-column grid at wider breakpoints. Product images are contained in rounded square thumbnails to avoid cropping them.
- Added loading skeletons and hides the strip gracefully if Shopify does not return items.
- Corrected the all-products and category "Newest" sort direction so newest items appear first.
- Homepage Featured Categories square thumbnails and brand image behavior are unchanged.

## Verification
Run `npm run audit:responsive-seo`, `npm run audit:interaction`, `npm run test:wishlist`, `npx tsc --noEmit`, and `npm run build` in an environment with the project's dependencies and environment variables. This package's automated source checks are updated to cover the new collection strip; a live Shopify smoke test still requires the production environment.
