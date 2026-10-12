# BuyHoreca — Shopify B2B Setup

## Brands

For each brand, create one Shopify Collection.

Example:

- Collection title: `Winco`
- Collection image: `WINCO.PNG`
- Product Vendor: `Winco`
- Collection type: Automated
- Condition: Vendor equals `Winco`

Repeat for every brand.

The storefront automatically discovers the matching Collection, uses the Collection image as the logo, and uses the Collection product set for the brand page.

## Product Vendor naming

Use one consistent customer-facing spelling. The storefront normalizes case, punctuation, spaces, and `&`/`and` when matching a Collection to Vendor.

## Catalogue filters

Use Shopify Search & Discovery to configure the filters that should appear for collections/catalogue views. The storefront reads those live ProductFilter definitions and sends selected filters back to Shopify.

## Discounts

Create and manage discount codes in Shopify Admin. The storefront can apply a code to the current Shopify cart and display whether Shopify marked it applicable.

Frontend code does not implement discount eligibility rules itself.

## Quote basket

The quote basket is storefront-side and persists on the shopper's browser. Quote submission currently opens WhatsApp with the basket contents and customer information. No claim of automatic CRM/ERP quote creation should be made until a real backend endpoint is connected.


## Stock display and purchase rule

The storefront now uses Shopify Storefront API `ProductVariant.quantityAvailable` when the token has the `unauthenticated_read_product_inventory` scope. Variants with zero available quantity are treated as quote-only: Add to Cart/checkout purchase controls are replaced by Request a Quote. For quantities 1–9, the storefront displays `Only X left` and caps the quantity control to the reported stock. The app retains a safe fallback to `availableForSale` when the inventory scope is not enabled yet. Shopify remains the final authority at cart mutation/checkout.
