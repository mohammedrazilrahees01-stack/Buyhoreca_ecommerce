# Vercel build fix

Fixed the TypeScript errors reported by Vercel on deployment commit dd79fe2:
- Explicit Product typing for the related-products filter callback.
- Stable explicit return type for getProducts() so products are Product[].
- Explicit typing for BrandShowcase logo map entries.
- brandLogoFor() now returns string | undefined instead of string | null, matching the logo map contract.

The storefront source, public assets, Shopify integration, wishlist/compare logic, company image, and existing UI were otherwise left unchanged from the Vercel build package.
