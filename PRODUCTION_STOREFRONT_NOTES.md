# BuyHoreca Production Storefront Notes

## Design direction
Keep the existing BuyHoreca header proportions, white header body and green category navigation. Premium is achieved through hierarchy, spacing, consistent typography, precise borders, restrained shadows and useful micro-interactions rather than oversized or heavy typography.

## Navigation
Desktop primary navigation is intentionally limited to 10 items total, including Quote. The search field's All Categories selector is separate and contains the complete Shopify collection catalogue with cursor pagination and scrolling.

## Search
Predictive search exposes products, collections and articles while typing. The All Categories selector has its own category-search input. Mobile provides the same full category access.

## Categories
The homepage Featured Categories rail displays each collection's Shopify-provided featured image inside a responsive 1:1 square frame. Images fill edge-to-edge with `object-fit: cover`; the frame has no border, rounded mask, or artificial inner padding.

## Brand assets
The package uses local logo assets where they are available. It does not fabricate manufacturer marks for vendors without an actual supplied local logo file. Missing local brand assets therefore fall back to clean vendor text instead of an invented logo.

## Company imagery
The preferred company image is `/images/company/shop_of_buyhoreca.png`. When this exact user-supplied file is not present in the packaged source, the section falls back to `/images/company/modern-buyhoreca-storefront.png` so the storefront remains complete and visually stable.

## Company profile PDFs
The BuyHoreca and Blue Mountain profile PDFs are source/reference documents only. Their pages are never placed into the storefront as screenshots. Website sections use text and suitable imagery derived from the source material.

## Interactions
Wishlist and compare use browser persistence and cross-component event synchronization. Cart operations use Shopify Storefront API mutations. Add-to-cart feedback includes button state, toast and cart pulse. Product-card actions stop link propagation where necessary.

## Blog rail
The homepage blog rail is responsive at 2 cards on mobile, 3 on tablet and 4 on desktop. It scrolls horizontally, advances automatically, pauses on hover/focus and resumes after the interaction ends. Manual arrow controls remain available.

## SEO and performance
Metadata, canonical URLs, Open Graph, JSON-LD, sitemap, robots rules, responsive images, lazy loading, reduced-motion behavior and restrained animation are included. Client storage is limited to non-sensitive wishlist/compare/cart identifiers and snapshots needed for the UI.

## Runtime validation
The final package includes static requirement audits and a wishlist regression test. A full Next.js build requires installation of the declared project dependencies in a network-capable environment.
