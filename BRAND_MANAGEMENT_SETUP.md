# BuyHoreca — Brand Management (Shopify Collections)

## Source of truth
Brands are managed entirely from Shopify Collections. The storefront does **not** require a local logo file, hardcoded brand map, brand metaobject, or one-off brand page component.

A brand is eligible for the storefront brand index when:

1. A live product has **Vendor/Brand** set to the brand name.
2. A Shopify Collection exists with the **same brand name** (case/punctuation differences are normalized).
3. The Collection has the **brand logo uploaded as its Collection image**.

## Recommended Shopify setup

For each brand:

- Collection title: `Winco`
- Collection image: the Winco logo (`WINCO.PNG`, or any image format Shopify accepts)
- Collection type: preferably **Automated**
- Condition: **Product vendor is equal to Winco**

Then, on every product:

- Vendor/Brand: `Winco`

When a new Winco product is added, Shopify's automated collection can place it into the Winco collection automatically.

## What the storefront does automatically

The storefront reads all Shopify collections and uses each collection’s first product Vendor as the brand identity check. Matching brand collections become:

- Home → **Our Brands** cards
- `/brands` → **Shop by Brand**
- `/brands/<collection-handle>` → brand page
- Product detail → brand logo beside the product title when the matching collection has an image
- `sitemap.xml` → brand URLs
- SEO metadata → collection title, description, image and canonical brand URL

Brand pages use the **actual Shopify Collection products**, including Shopify collection pagination and filters.

## Adding a completely new brand

Example: `Hoshizaki`

1. Create a product and set Vendor/Brand to `Hoshizaki`.
2. Create a Shopify Collection named `Hoshizaki`.
3. Make it automated using Vendor = `Hoshizaki` when appropriate.
4. Upload the Hoshizaki logo as the Collection image.
5. Save.

No website code change is required. The `/brands/<collection-handle>` route is already dynamic.

## Naming rule

Use the exact brand spelling you want customers to see in Shopify. The website normalizes case, spaces, punctuation and `&`/`and` differences when matching a collection to a vendor.

## Important

Do **not** put brand logos into the old `public/images/brands` folder for production brand management. The current storefront uses Shopify Collection images as the single logo source. Any legacy local brand assets may remain in the repository temporarily but are not used by the active brand system.
