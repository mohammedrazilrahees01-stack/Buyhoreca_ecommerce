# BuyHoreca — B2B Product Data Roadmap

## P0 data to expose before implementing competitor-level procurement features

### Delivery
Recommended source fields:
- fulfilment status
- delivery region
- estimated dispatch window
- estimated delivery window
- shipping fee / rule

Do not display an ETA or shipping fee until the value comes from a trusted BuyHoreca source.

### Quantity / bulk pricing
Recommended source options:
- Shopify price lists / B2B pricing
- Shopify discounts
- approved quantity price breaks

The storefront should display actual tiers such as `1–4`, `5–9`, `10+` only when those values are returned by the backend.

### Product specifications
Recommended Shopify metafields or structured source data:
- material
- capacity
- dimensions
- colour
- pack size
- country of origin
- warranty
- compatibility
- care / dishwasher information

### Resources
Recommended file/link fields:
- brochure
- specification sheet
- manual
- warranty document
- installation guide

### Reviews / Q&A
Recommended source:
- Shopify-compatible review platform or approved review API
- moderated Q&A source

Do not fabricate review counts or review text.

## P1 experience layer

Once real data is available, add:

1. Shipping/ETA block on product cards and product pages.
2. Quantity price-break table on product pages.
3. Product `Specifications`, `Shipping`, `Reviews`, `Q&A`, and `Resources` sections.
4. `Works with`, `Accessories`, `Replacement Parts`, and `Frequently bought together` relationships.
5. Rich category landing content and category FAQs.
6. Brand-page subcategory navigation derived from actual Shopify collection membership.

## P0/P1 account and order services

A real customer-account experience requires authenticated Shopify Customer Accounts or another approved account service. A real tracking timeline requires a trusted order/fulfilment status source. The current storefront intentionally avoids presenting a fake live status system.
