# Shopify-managed brand catalogue

The storefront now supports optional Shopify Metaobjects for brand merchandising. The storefront still works from Shopify product vendor data when the metaobject feature is not configured.

## Shopify setup

Create a Metaobject definition in Shopify with type:

`brand`

Recommended fields:

- `name` — Single line text (required)
- `vendor` — Single line text (required; exact Shopify Product.vendor value)
- `logo` — File reference (image)
- `description` — Multi-line text
- `featured` — True/false
- `sort_order` — Integer

Set the Storefront API access for the `brand` metaobjects so the public storefront can read them. The Storefront API metaobjects query requires the `unauthenticated_read_metaobjects` access scope. See Shopify's current Storefront API documentation for `metaobjects` and `MetaobjectField`. 

## Environment variable

Optional:

`NEXT_PUBLIC_SHOPIFY_BRAND_METAOBJECT_TYPE=brand`

The default is already `brand`, so this environment variable is only needed if the definition uses another type name.

## Behavior

1. Managed brand records are read from Shopify Metaobjects.
2. A managed record's `logo` is preferred over any local fallback logo.
3. Managed records can control featured ordering with `featured` and `sort_order`.
4. Product vendor names not yet managed remain discoverable from live Shopify product data.
5. No fake brand records are created by the storefront.
6. If the Storefront token does not have Metaobject access, the storefront gracefully falls back to vendor discovery and any existing local logo assets.

This keeps Shopify as the source of truth while allowing brand merchandising to be maintained without editing storefront code for every new manufacturer.
