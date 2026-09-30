# BuyHoreca Production Storefront Build

This ZIP is a full storefront improvement pass for the BuyHoreca Shopify headless storefront.

## Included

- Real BuyHoreca logo asset extracted from the supplied 2026 BuyHoreca company profile.
- Denser B2B product catalogue with intentional 10–12px card gaps.
- Product-card wishlist + compare controls using localStorage.
- Quick view, quantity controls, rating/review display, bought count, sale badge and quote fallback.
- Desktop mega menu + mobile navigation.
- Search autocomplete for products and collections.
- Collection/catalogue filters, price range, availability, sorting and grid/list view.
- Horizontal product rails.
- Rich homepage with categories, product rails, brand portfolio, company proof, customer proof and blog rail.
- Shopify-connected Blog index and article pages using Storefront API blog/article queries.
- About, Contact, FAQ, Shipping, Track Order and Account information routes.
- Product page, cart, quote, wishlist, business and brand routes retained.
- SEO metadata, Open Graph metadata, robots and expanded sitemap routes.
- Responsive desktop/tablet/mobile layout.
- Supplied BuyHoreca and Blue Mountain company profiles copied into `docs/company-profiles/` for reference.
- Company-profile PDFs are retained in `docs/company-profiles/` for reference; no PDF page is rendered as a website section.

## Shopify

The storefront keeps Shopify as the source of truth for products, variants, collections, pricing, availability, cart and checkout. Blog content is read from Shopify's Storefront API and requires the storefront's content access scope/configuration to be available.

The storefront uses the configured Storefront API version from `NEXT_PUBLIC_SHOPIFY_API_VERSION`, defaulting to `2026-07`.

## Company profile source usage

The supplied BuyHoreca profile was used as the content source for the company/brand sections, including the stated 12+ years of experience, 30+ staff, 25,000 sq. ft. warehouse, 5,000 sq. ft. showroom, 50,000+ products, and 50+ hotels / 500+ restaurants. The supplied Blue Mountain profile was used to represent the Saudi Arabia expansion as a separate company context built on 12 years of UAE experience.

## Install

```bash
npm install
npm run dev
```

For production:

```bash
npm run build
npm run start
```

Use the environment variables documented in `.env.local.example`.

## Validation note

The source was syntax-reviewed with TypeScript tooling available in the environment. A complete Next.js production build was not executed because this environment does not have the project's npm dependencies installed and external package installation is not guaranteed.


## Final audit pass
- Exact transparent BuyHoreca culinary/cart wordmark is the only header logo source.
- Predictive Shopify search powers type-ahead suggestions for products, collections and articles.
- Shopify faceted filters are exposed on search and collection pages; applied filters are shown as removable chips.
- Blog rail displays 2/3/4 cards by breakpoint, auto-advances, and pauses on hover/focus with an optional Play/Pause control.
- State-like pages use noindex metadata to avoid indexing cart/search/account URLs.
- Sitemap is paginated across products, collections, blogs and articles.
