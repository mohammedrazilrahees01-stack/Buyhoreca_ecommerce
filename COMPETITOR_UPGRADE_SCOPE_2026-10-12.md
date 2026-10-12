# BuyHoreca — Competitor Upgrade Scope

This release compares the active BuyHoreca storefront architecture with the current public shopping patterns of WebstaurantStore and HORECA Store UAE.

## Implemented in this release

### 1. Shopify Collection-driven brands
- Collection title is the canonical brand name.
- Collection image is the brand logo.
- Brand cards, brand pages and product-page brand links use the live Shopify Collection.
- Brand collections are separated from ordinary category collections by matching collection title to the first product Vendor.
- No local brand-logo folder or brand-metaobject configuration is required by active storefront code.

### 2. B2B quote basket
- Product cards expose `Add to Quote`.
- List view exposes `Add to Quote`.
- Quick View exposes `Add to Quote`.
- Product detail exposes `Add to Quote` and `View Quote Basket`.
- Quote items persist in browser storage until cleared.
- Quote basket supports line quantity changes and removal.
- A single WhatsApp request contains all quote-basket lines plus customer details.
- Quote functionality does not claim payment or automated quotation when the current stack only opens WhatsApp.

### 3. Shopify discount-code support
- Cart supports applying a discount code through the Shopify Storefront API `cartDiscountCodesUpdate` mutation.
- Cart displays whether a code is applicable.
- Cart can remove the active code.
- Discount totals are read back from the live Shopify cart rather than calculated in the frontend.

### 4. Shopify-powered catalogue filtering
- `/shop` now attempts to use the Shopify `all` collection and its live storefront filters.
- The category index and category-focused navigation exclude the special `all` collection and collection-driven brand pages.
- Filters are passed through Shopify ProductFilter inputs.
- Search mode uses the Shopify Search query with the same selected ProductFilter inputs.
- Pagination remains cursor based.
- When the default `all` collection is unavailable, the storefront falls back to the live products query.

### 5. Product discovery / procurement UX
- Dense product cards retain SKU, brand, product type where available, price, availability, ratings, quantity controls, wishlist, compare and quick view.
- Product detail retains variant imagery, variant selection, collection-linked brand logo, specification block, interactive Product Details / Shipping & Support tabs, and quote path.
- Brand detail pages now support Shopify facets, sorting, pagination and a product-type summary derived from the live brand collection.
- Cart and quote paths are clearly separated: cart for purchasable items, quote for commercial/project requirements.

## Deliberately not fabricated

The following competitor features require data or services that are not currently exposed by the BuyHoreca Shopify storefront and therefore are **not** mocked:

- delivery ETA promises
- shipping fees per product
- customer order history / authenticated account dashboards
- live order-status APIs
- product review bodies / Q&A content
- bulk price tiers when Shopify does not expose them
- product compatibility relationships
- PDF/manual/download libraries without source data
- company-specific service promises or statistics not present in approved BuyHoreca material

These are listed as the next implementation layer in `B2B_PRODUCT_DATA_ROADMAP_2026-10-12.md`.

## Shopify-side requirements

For the brand system:

1. Create a collection named exactly as the customer-facing brand name.
2. Upload the brand logo as the Collection image.
3. Prefer an automated collection using Vendor = the same brand name.
4. Set the product Vendor/Brand consistently.

For discounts:

- Configure the actual Shopify discount in Shopify Admin.
- The storefront only applies the code and reads Shopify's applicability/result.

For richer filters:

- Configure desired filters in Shopify Search & Discovery for the collection/catalogue.

## Reference comparison

The target experience follows the useful procurement patterns visible on:

- WebstaurantStore: dense product discovery, product information, commercial buying flow and resource content.
- HORECA Store UAE: deep category filtering, shipping/availability visibility, quote paths and brand/category merchandising.

BuyHoreca should use those patterns as UX references, not copy their content, branding, claims or exact visual design.
