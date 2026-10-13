# BuyHoreca Navigation Update — 2026-10-13

## Primary green navigation

The desktop green navigation now has exactly 8 top-level items, in this order:

1. Kitchen Equipment
2. Kitchen Utensils
3. Tabletop
4. Buffetware
5. Hotel Specials
6. Housekeeping
7. Business Type
8. Shop by Brand

The Quote item was removed from the green navigation because Quote already exists in the upper header utility area.

## Mega-menu placeholders

Each top-level item keeps a small set of editable related links for now. These are centralized in the `primary` array inside `app/[[...slug]]/Storefront.tsx` so they can be changed later in one place.

Shop by Brand is collection-driven and shows real brand collections, using their Shopify collection images as the logo.
