# BuyHoreca Listing Filter System — 2026-10-13

## Problem fixed
The all-products sidebar previously rendered “No additional filters are configured for this catalogue view.” when Shopify returned no configured storefront facets. This was not acceptable for a production catalogue.

## New behavior
Every listing page now renders baseline, functional filters even when Shopify returns no custom facet configuration:

- Availability — In stock / Out of stock
- Price — minimum and maximum AED range
- Brand — derived from the existing Shopify brand-collection architecture where brand collections are available on the listing surface
- Dynamic Shopify facets — any real facets returned by Shopify are rendered in addition to the baseline filters, including product type, vendor, category, variant options such as color/size, tags, taxonomy/metafields, and other Search & Discovery filters.

Lists with more than ten values use a Show all / Show less control rather than silently hiding the remaining options.

## Category behavior
The all-products sidebar also provides a real “Browse by category” section using existing Shopify category collections. This is navigation, not a fabricated product-filter facet.

True category/color/material/size facets should be enabled in Shopify Search & Discovery so the Storefront API returns the actual values and filter inputs. Shopify documents that the Storefront API exposes collection/search filters and that Search & Discovery controls which filters are available. See:
https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/products-collections/filter-products

## Price filtering
The storefront sends the native Storefront API `ProductFilter.price` input with `min` and/or `max` values. This is server-side filtering; it does not attempt to filter only the currently loaded 48 products in the browser.

## Verification
- Comprehensive static audit: 141 PASS / 0 FAIL / 1 WARN
- Responsive/SEO audit: 48 PASS / 0 FAIL / 1 WARN
- TypeScript/TSX syntax: no parse diagnostics from the project audit
- Real `next build` remains environment-blocked when project dependencies cannot be installed.
