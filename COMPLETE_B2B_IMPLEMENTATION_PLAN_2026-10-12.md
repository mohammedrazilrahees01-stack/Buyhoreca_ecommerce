# BuyHoreca — Complete B2B Implementation Plan

Date: 2026-10-12

This document is the implementation checklist for the BuyHoreca storefront after comparing the current source with WebstaurantStore and HORECA Store UAE. It distinguishes features implemented in this release from capabilities that require additional trusted Shopify/backend data.

## Implemented now

| Area | Status | Implementation |
| --- | --- | --- |
| Shopify collection-driven brands | Complete | Collection title = brand, collection image = logo, collection products = catalogue |
| Automatic brand discovery | Complete | Matching brand collections are discovered from live Shopify collections |
| Brand pages | Complete | Collection-based route, logo, product listing, filtering, sorting and pagination |
| Brand/category separation | Complete | Brand collections are kept out of category index/search/navigation surfaces |
| Product cards | Complete | SKU, brand, product type, ratings where available, price, availability, quantity, cart, quote, wishlist, compare, quick view |
| Quote basket | Complete | Browser-persistent multi-product quote basket with quantity/removal and WhatsApp submission |
| Add to Quote | Complete | Product cards, list view, quick view and product detail |
| Cart discounts | Complete | Real Shopify `cartDiscountCodesUpdate` mutation and live applicability state |
| Catalogue filters | Complete | `/shop` uses Shopify collection/search ProductFilter definitions and cursor pagination |
| Product information tabs | Complete | Interactive Product Details / Shipping & Support tabs |
| Technical SEO | Complete | Metadata, canonicals, OG/Twitter, Product/Collection/Article/Breadcrumb schemas, sitemap, robots, manifest |

## P0 next — requires trusted operational data or service integration

### Shipping and delivery
Add only when BuyHoreca has an approved source for delivery regions, dispatch windows, delivery windows and shipping charges.

Target UI:

`Availability`
`Usually ships in X–Y business days`
`Shipping: AED X`

Do not hardcode an ETA or fee in the storefront.

### Quantity / bulk pricing
Use Shopify B2B price lists, actual discount rules, or another approved pricing source. Then expose real price breaks such as `1–4`, `5–9`, `10+`.

### Customer accounts
Connect Shopify Customer Accounts (or another approved account service) before exposing order history, addresses, company information, saved quotes or reordering as real functionality.

### Order tracking
Connect a trusted order/fulfilment API. Do not present a fake tracking timeline.

## P1 next — content/data expansion

### Reviews and Q&A
Connect the approved review/Q&A source before rendering review bodies, customer photos, questions or answer counts.

### Product resources
Expose brochures, manuals, specification sheets, warranty documents and installation guides from approved Shopify metafields/files or another source.

### Compatibility and accessories
Model `Works With`, accessories, replacement parts and frequently-bought-together relationships using real Shopify relationships/metafields.

### Rich category landing pages
Add approved category introductions, subcategory navigation, buying guides and FAQs. Keep category copy unique and source-approved.

### Brand content
Brand collections already power the product set and logo. Add approved brand descriptions and resources in Shopify Collection SEO/content fields when available.

## B2B checkout improvements

When the operational backend is ready, extend the quote/cart layer with:

- company / purchase reference
- invoice / payment terms where supported
- saved quote history
- reorder
- shipping destination logic
- project/order notes
- bulk quantity validation

## Data integrity rules

1. Shopify is the catalogue source of truth.
2. Collection images are the brand-logo source of truth.
3. Product Vendor naming must match the corresponding brand collection title.
4. No fake shipping ETA, shipping fee, bulk tier, review, order status, compatibility relation or company claim.
5. SEO text should use Shopify SEO fields where available.
6. Utility pages remain noindex where appropriate.

## Release verification

Current static audit: **141 PASS / 0 FAIL / 1 WARN**.

The remaining warning is environmental: `next build` could not be executed because project dependencies could not be installed from the npm registry in the audit environment. TypeScript/TSX parsing for the audited source completed with zero parse diagnostics.

## Competitor principles

Use WebstaurantStore as the reference for information density, procurement workflow, filters, product detail depth and resources. Use HORECA Store UAE as the reference for UAE-relevant B2B merchandising, shipping visibility, quote paths, category filtering and brand discovery. Do not copy their branding, wording, claims, layout or content.
