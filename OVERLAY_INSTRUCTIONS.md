# BuyHoreca production overlay

This release contains the current source/configuration updates, SEO hardening, responsive fixes and QA scripts.

## Apply
1. Keep your existing `Buyhoreca_ecommerce` repository as the base.
2. Extract/copy the contents of this package over that repository.
3. **Do not delete existing `public/images/brands` files**. The connected GitHub repository contains additional binary brand logos that are not present in this sandbox copy.
4. Make sure the Shopify environment variables are present in Vercel.
5. In Shopify, configure `WELCOME10` with **Limit to one use per customer** as documented in `SHOPIFY_WELCOME10_SETUP.md`.
6. Run the listed audits, then let Vercel perform the dependency install and production build.

The release is intentionally an overlay so existing Shopify/catalogue media and other repository assets are preserved.
