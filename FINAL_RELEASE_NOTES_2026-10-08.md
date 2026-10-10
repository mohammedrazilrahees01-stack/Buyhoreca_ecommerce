# BuyHoreca final production package — 2026-10-08

This package is based on the BuyHoreca repository ZIP supplied for the QA/fix pass and includes the requested final UI corrections plus the earlier production fixes.

## Requested corrections completed

### Homepage — Popular brands
- The homepage no longer derives the Popular Brands section only from the 16 Best Selling products.
- A lightweight Shopify vendor-discovery query now gathers a broader live vendor set and merges it with Shopify-managed brand metaobjects.
- The homepage brand rail no longer truncates to five/24 entries; all discovered brand entries are rendered in a horizontally scrollable rail with previous/next controls.
- Managed Shopify brand logos are used first; existing local brand-logo assets remain the fallback.
- The /brands index uses the same broader live vendor discovery rather than relying only on the initial 48 products.

### Homepage — hero category area
- The previous four category tiles on the right side of the hero have been removed.
- The first two image-backed Shopify categories are now presented together as one unified two-image visual panel, with each half remaining clickable.
- A one-image fallback remains available when Shopify returns only one image-backed category.

### Homepage — offers
- WELCOME10 and HORECA5 remain implemented as real copy-to-clipboard interactions.
- Clicking either offer copies its code and records the promo copy event in the existing analytics layer.
- The frontend does not invent Shopify discount eligibility; Shopify remains the source of truth for enforcement.

### Product detail — brand logo
- Product pages now resolve the brand logo from Shopify-managed brand metaobjects where available.
- The existing local logo map is used as a fallback.
- The logo is displayed above the product title/brand identity area.

### Earlier fixes retained
- Separate Shopify datasets for Best Selling, New in Catalogue, and Commercial Essentials.
- Brand-page pagination beyond the initial 48 products.
- True Next.js 404 handling for invalid route shapes.
- Body scroll locking for drawers/overlays.
- Dialog semantics and close labels for quick view/mobile filters.
- Accessible cart quantity/remove controls.
- Cart view/remove analytics events.
- Package-lock root metadata synchronized with package.json.
- Existing header, Shopify cart, wishlist/compare, blog rail, responsive CSS, accessibility, SEO, and security work retained.
- Footer logo reduced to a smaller production size (180px).

## Validation completed in this environment

- Final production audit: **60 requirement checks PASS**.
- TypeScript/TSX parser audit: **11/11 PASS**.
- Existing storefront audit: **PASS**.
- Wishlist persistence/toggle/snapshot/malformed-storage tests: **PASS**.
- Local image integrity scan: **42 raster images checked, 0 unreadable**.
- ZIP integrity check: **PASS**.

## Environment limitation — do not misrepresent as completed

A fresh dependency install and therefore a real Next.js build/lint could not be executed in this sandbox because npm registry DNS/network access is unavailable and the required packages are not cached locally.

The repository package-lock is also known to be incomplete for the `eslint` / `eslint-config-next` dev dependencies. This should be reconciled by running a real networked `npm install` or regenerating the lockfile, followed by:

```bash
npm ci
npm run lint
npm run build
```

Browser/device QA against the deployed website and live Shopify data was not executed in this sandbox, so those runtime checks are not claimed as verified here.
