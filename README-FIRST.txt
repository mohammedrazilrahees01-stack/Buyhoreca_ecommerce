BUYHORECA — CANONICAL SHOPIFY STOREFRONT
=========================================

This is the single canonical frontend architecture. Do not recreate legacy route files such as app/shop/page.tsx or static lib/buyhoreca-data files.

Canonical routes:
  app/[[...slug]]/page.tsx
  app/layout.tsx
  app/globals.css

Shopify source of truth:
  products, variants, pricing, media, availability, collections, search, cart, blogs/articles.

Customer experience:
  No custom login page. Customers can browse and add to cart without creating a frontend account. Shopify checkout handles any account/sign-in requirement configured by the store.
  Customer-facing errors are human-friendly; API details are logged only to the browser console for development.

Hero assets:
  public/images/hero/hero-main.jpg
  public/images/hero/hero-coffee.jpg
  public/images/hero/hero-kitchen.jpg

Optional collection image fallbacks:
  public/images/collections/<shopify-collection-handle>.jpg

Environment variables (keep your own .env.local):
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
  NEXT_PUBLIC_SHOPIFY_API_VERSION=2026-07

Install/run:
  npm install
  npm run dev

Production validation:
  npm run build

The storefront uses Shopify cursor pagination so the Shop and collection pages can continue loading until the end of the live catalogue instead of truncating the store to the first page.
