# BuyHoreca — Inventory / Stock Display Setup

## Storefront behavior

The storefront treats Shopify inventory as the source of truth for purchasability.

- `quantityAvailable = 0` or below: the product/variant is quote-only. The storefront hides purchase controls and shows **Out of stock · Request a quote**.
- `quantityAvailable = 1..9`: the storefront shows **Only X left** and caps the quantity selector at the reported quantity.
- `quantityAvailable >= 10`: the storefront shows the normal in-stock purchase flow.
- Cart lines are checked again before checkout. If a known line is out of stock or exceeds the reported quantity, checkout is disabled until the line is removed or reduced.
- The same rules are applied to product cards, list views, Quick View, Compare and Product pages.

## Shopify setup required

1. Turn on **Track quantity** for variants where inventory is actually managed.
2. Keep **Continue selling when out of stock** disabled for normal stock-controlled products. Shopify says this is the default behavior and it prevents customers from purchasing after inventory reaches zero.
3. Make sure the inventory is assigned to locations that fulfill online orders.
4. Grant the Storefront API token the unauthenticated scope `unauthenticated_read_product_inventory`. Shopify maps this scope to `ProductVariant.quantityAvailable` and `Product.totalAvailable`.

The storefront also reads `ProductVariant.currentlyNotInStock` so a variant configured for backorders/overselling is treated as quote-only by this storefront policy even when Shopify reports it as available for sale.

## Important

The exact **Only X left** count requires the inventory scope above. If the scope is not granted, the storefront safely falls back to Shopify's availability flags and does **not** invent a stock number.

Shopify remains the final authority for inventory at cart/checkout. The storefront guards are an additional UX and safety layer.
