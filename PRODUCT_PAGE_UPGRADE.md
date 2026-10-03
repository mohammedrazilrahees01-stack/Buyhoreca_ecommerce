# Product Page Upgrade

Product gallery refinement and variant-aware media behavior.

- Main product media uses a wider premium presentation while keeping product photography contained (no unwanted crop).
- Desktop hover shows a restrained zoom inspection panel; mobile/tablet keeps tap-to-zoom/lightbox behavior.
- High-resolution lightbox uses the currently selected product/variant image.
- Variant selectors render an image when Shopify provides a variant image; otherwise they render the variant text only.
- Selecting a variant updates the selected variant, price, compare-at price, SKU, availability and Add to Cart target through the existing Shopify cart flow.
- Variant media is used as the active gallery image when Shopify provides it.
- Real BuyHoreca brand logo is displayed beside the product information when a local brand asset is available; the vendor name remains the fallback.
