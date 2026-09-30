# BuyHoreca Final Release Checklist

This package is the final source package for the current storefront direction.

Included:
- Existing BuyHoreca header layout retained.
- Ten-item primary navigation, with regular/medium navigation text.
- Full paginated Shopify collection list in All Categories with local filtering and scrolling.
- Shopify predictive search for products, collections and articles.
- 24 approved category rail images preserved exactly through Shopify collection images.
- Product cards with gaps, wishlist persistence, compare, quick view, variants, SKU, ratings, quantity and cart/quote actions.
- Shopify cart mutations with stale-cart recovery and add-to-cart feedback animation.
- Shopify-backed blog with responsive 2/3/4-card carousel, autoplay to the right, pause on hover/focus, resume, manual arrows and play/pause.
- Real BuyHoreca logo asset used in header/footer.
- Local brand logo assets are used where supplied; no fabricated third-party logos are inserted.
- Company-profile PDFs retained only as source/reference documents under docs/company-profiles; PDF pages are not rendered as web sections.
- Company storefront image path preferred: public/images/company/shop_of_buyhoreca.png. A safe local fallback is included if that user-owned asset is absent from the package.
- Responsive behavior, reduced motion, focus states, skip link and keyboard/Escape interactions.
- Metadata, canonical URLs, Open Graph, JSON-LD, sitemap, robots and optional Google verification.
- Optional GA4 and Meta Pixel integrations controlled by environment variables.
- Security response headers and safe Shopify proxy handling.
- Loading, empty and error states.
- Product recently viewed + same-manufacturer related products and specification/Q&A support.
- Blog index search/topic filtering and keyboard-accessible nav toggles.
- Brand SEO URLs included in sitemap.

Validation performed before packaging:
- Requirement audit: 43/43 checks passed.
- TypeScript/TSX parser audit: 10/10 files passed.
- Wishlist persistence regression test passed.
- ZIP integrity test performed after packaging.

Environment limitation:
- A full `next build` was not executable in this environment because npm registry/package installation access is unavailable. Source parsing and project-level QA were completed instead.
