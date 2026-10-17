# BuyHoreca Brand Directory — Setup and Auto-Linking

## What's included

- 68 curated brand entries: 64 brands from the supplied reference collage plus Hamilton Beach, JB Products, Jiwins and Manitowoc from the existing storefront directory.
- 64 individual cropped PNG logo assets from the supplied collage in `public/images/brands/`.
- Responsive Shop by Brand grid, accessible name search, matching brand cards in the header mega-menu, stable URL slugs, and a clear “Collection coming soon” state.
- Brand collections already present in Shopify are merged into the curated directory. Matching uses normalized brand names and stable handles; local reference logos are used until a Shopify collection image is present.
- Additional Shopify brand collections are discovered automatically when their collection title matches their first product's Vendor value. Duplicates are normalized and suppressed.
- Unlinked planned brand pages are `noindex` and are not included in the sitemap until a Shopify collection is connected.

## How to connect a brand later

1. In Shopify Admin, open **Products → Collections** and create a collection for the brand (for example, `Pavoni Italia`).
2. Give the collection the same brand title as the directory. Matching a curated title is the most reliable approach. Alternatively, use the planned directory slug as the collection handle where practical.
3. Add the products for that brand and set their Shopify **Vendor** consistently to the same brand name. This is required for automatically discovering new brands that are not in the curated list.
4. Upload a high-resolution individual logo to the collection's image field and save it. The storefront prefers that Shopify image over the cropped reference logo.
5. Once the collection is available from Shopify, the brand card automatically points to its actual collection handle. No manual logo map or per-brand frontend edit is required. Brand pages will show the real products, and eligible pages will enter the sitemap.

## Important notes

- Brand names and logos are curated directory content; product inventory, product information and collection links remain Shopify-driven.
- Brands without a collection are displayed as “Collection coming soon”; the site does not invent product listings for them.
- The 64 supplied logos are crops made from the single collage image. Replacing them with original, high-resolution logo files in Shopify Collection images is recommended as those collections are created.
- The exact production build was not confirmed during this packaging run because `npm ci --no-audit --no-fund` timed out in this environment. Run `npm ci`, `npx tsc --noEmit`, and `npm run build` in a network-enabled environment before deploying.
- The previously identified custom-domain/Vercel source mismatch remains an external release prerequisite; this ZIP alone does not change the live website.
