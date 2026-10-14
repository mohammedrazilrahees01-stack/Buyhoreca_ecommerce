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


## Final requested green navigation structure

1. Kitchen Utensils
   - Kitchen Tools
   - Measuring Tools
   - Kitchen Cutlery
   - Slicers
   - Bakeware Moulds
   - GN Pans
   - Pizza
   - Food Storage Containers
   - Food Decoration
   - Storage & Transport
   - Poly Pans
2. Kitchen Equipment
   - Refrigerator
   - Coffee Machines
   - Cooking Equipment
   - Plug-in Equipment
   - Food Preparation
   - Ovens
3. Tabletop
   - Crockery
   - Cutlery
   - Glassware
   - Table Accessories
   - Serving & Display
4. Buffetware
   - Chafing Dish
   - Buffet Display
   - Serving Utensils
   - Buffet Tables
   - Banqueting Equipment
5. Hotel
   - Room Accessories
   - Linen
   - Lobby
   - Amenities
6. Housekeeping
   - Empty for now; no fake submenu links are created.
7. Shop by Brand
   - Automatic from Shopify brand collections; no manual submenu.
8. Shop by Business
   - Café & Coffee Shop
   - Restaurant
   - Hotel
   - Bakery & Pastry
   - Bar & Lounge
   - Catering & Banqueting
   - Fast Food / QSR
   - School & Institution
   - Corporate / Office Catering
   - Event & Hospitality

Quote remains outside the green primary navigation.
