# BuyHoreca — full-site correction candidate

Next.js + Shopify storefront source. This archive contains the 16 October 2026 source audit fixes, including the blog loop/spacing correction, cursor-safe sitemap/blog pagination, safe JSON-LD serialization, responsive reduced-motion behavior, mobile navigation/sort corrections, and direct quote-row interaction fixes.

## Current verification and release limits

This is a tested source archive, not a production deployment. The Next.js production build and TypeScript check pass; the repository's production, interaction, responsive/SEO, and regression scripts pass; and `npm audit --audit-level=high` reports zero vulnerabilities. No changes have been pushed to the production `main` branch or deployed to `buyhoreca.com` from this archive.

The `/account` page links to Shopify's hosted Customer Account portal. It does not yet implement the Customer Account API OAuth session in the Next.js storefront, so this page will remain an entry page after sign-in. To show a signed-in profile and order history in this page, configure the Shopify Headless channel's Customer Account API client ID, callback URL and OAuth flow.

## Local setup

1. Copy `.env.local.example` to `.env.local` and fill in valid Shopify Storefront API values and the canonical site URL. Never commit real tokens.
2. Use Node.js `>=20.9.0`.
3. Run `npm ci`.
4. Run `npm run dev` for local UI inspection.

## Available source/regression audits

```bash
npm run audit:production
npm run audit:final
npm run audit:responsive-seo
npm run audit:interaction
npm run test:release-hardening
npm run test:product-blog
npm run test:brand-directory
npm run test:checkout-integration
npm run test:availability-filter
npm run test:inventory
npm run test:wishlist
npm run test:account-policies
npm run test:ai-assistant
npm run test:catalog-filters
npm run test:quote-flow
npx tsc --noEmit
npm run lint
npm run build
```

The automated source audits do not replace the production build or live checkout verification. Before release, follow the explicit external checklist in `FULL_SITE_AUDIT_AND_FIX_LOG_2026-10-16.md`.

## Shopify offer configuration

The homepage displays copy actions for `WELCOME10` and `HORECA5`. Confirm that the codes are active and that their exact eligibility/threshold rules in Shopify match the advertised text before promoting them to customers.

## BuyHoreca AI assistant setup

The floating BuyHoreca AI button is placed immediately above WhatsApp. It uses the official Cloudflare Workers AI inference API plus relevant live Shopify product matches and the curated BuyHoreca knowledge file (`lib/buyhoreca-ai-knowledge.ts`). The model is not trained on the entire catalogue: the API retrieves catalogue results for each product-related question and supplies them as grounded context.

The AI provider credentials must be configured before answers are generated:

1. Create a Cloudflare API token with access to Workers AI and copy the account ID from the Cloudflare dashboard.
2. For local development, add `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_AI_API_TOKEN`, and optionally `CLOUDFLARE_AI_MODEL=@cf/zai-org/glm-4.7-flash` to `.env.local` using `.env.local.example` as a reference. Keep the token server-side; never add a `NEXT_PUBLIC_` prefix.
3. Add the same variables to the Vercel project's Production and Preview environment settings, then redeploy. Until these are supplied, the chat still provides customer-friendly common answers and searches the live Shopify catalogue when the Storefront token is configured. Novel free-form generative responses require the Cloudflare variables; customers are never shown the internal setup warning.

Cloudflare Workers AI currently documents a 10,000-Neuron-per-day free allocation; quota/model availability can change, and calls beyond the free allocation may require paid usage. See https://developers.cloudflare.com/workers-ai/platform/pricing/ and https://developers.cloudflare.com/workers-ai/models/. The API intentionally avoids order-private data and points order-status questions to `/track-order`. A basic per-process rate limiter is included; configure platform/WAF rate limits as well before exposing it to high-volume public traffic.


## Track123 localhost development

The official Track123 headless widget changes its base URL to the current origin on `localhost`/`127.0.0.1` to support local development. The Next.js configuration therefore uses `beforeFiles` rewrites for Track123's `/endApi/api/store/anonymous/` and the tracking-translation endpoint plus `/tracking-page-spa/` static bundles to `https://shp.track123.com`. Run `npm run build && npm run start` (or restart `npm run dev`) after changing `next.config.ts`; rewrites are loaded by the Next.js server and should return JSON/JavaScript, not the storefront's catch-all 404. The live Track123 store configuration must exist and carrier events still depend on synced shipment data.

The BuyHoreca AI widget responds to simple greetings such as “Hi” without needing an inference provider. If Cloudflare credentials are missing or the AI service is unavailable for product questions, it displays a customer-friendly message and a WhatsApp support link; internal setup errors are kept out of the customer chat.


The greeting path answers “hi” and similar greetings locally with a natural welcome. If AI product answers are unavailable because server-side Cloudflare credentials are missing, the widget shows only a customer-friendly temporary-unavailability message plus a WhatsApp support button; it does not expose environment-variable/setup instructions.


## Track123 branding and watermark

The storefront attribution sentence has been removed and the widget form/heading have BuyHoreca styling. The remaining `Powered by Track123` watermark is injected by Track123 itself, not by the BuyHoreca page source. Track123's published plan comparison lists **Remove Track123 branding** as an Advanced-plan feature; do not attempt to suppress this provider mark in CSS while using a plan that does not permit branding removal. To remove it, upgrade/select the eligible plan in the Track123 Shopify app and enable branding removal in its tracking-page settings. If BuyHoreca cannot use that plan, the alternative is to replace the embedded widget with a different tracking implementation/provider. Official details: https://intercom.help/track123/en/articles/5920187-track123-pricing-plan and https://intercom.help/track123/en/articles/13303463-create-a-track123-tracking-page-in-a-headless-shopify-store.


## Header and catalogue filter fix — 19 October 2026

- Kept the top-strip “Request a Quote” link and increased it to 14px semibold with more padding. Removed the duplicate “Quote” link from the desktop action row beside Wishlist.
- Fixed the all-products page lifecycle so filter changes no longer do nothing when the `all` collection query returns null or fails. Once the initial collection lookup has completed, each filter/sort/search change triggers a reload. If Shopify provides the collection, native `ProductFilter` inputs are used. If not, a fallback `products(query:)` query is constructed for availability, vendor/brand, product type, tags, and price bounds, with sort and pagination retained. A customer-visible message is shown if the product request itself fails.
- `npm run test:catalog-filters` checks the header change and fallback query wiring. The current test environment ran a browser test with a mocked Shopify response: brand, price and in-stock filters each changed the query and narrowed the visible products; Clear all restored all products. This validates the client/query path, not credentials or live production Shopify results.


## Click-away behavior and first-visit welcome poster — 21 October 2026

The header's outside-click handler runs in the capture phase for both `pointerdown` and `click`, so embedded menus or widget handlers cannot prevent it from closing. The click counts as inside only when it is on a real menu trigger or within the visible `.bh-mega-inner` panel; the full-width transparent menu wrapper is not treated as inside. Clicking the page outside the open panel closes the mega menu. The all-category panel, predictive-search panel, and mobile navigation also close on outside click, and Escape closes open header menus.

The `FirstVisitPromoPopup` welcome poster is mounted above storefront content on all routes. It uses `public/images/promo/welcome-offer.webp`, appears after a short 500ms delay on first visit, and records `buyhoreca_welcome_offer_seen_v1` in browser localStorage so repeat visits do not show it again. To preview it again during local testing, run `localStorage.removeItem("buyhoreca_welcome_offer_seen_v1")` in the browser console and reload. The close button, backdrop dismissal and Escape dismissal are enabled after three seconds. The popup includes the existing WELCOME10/HORECA5 copy-code actions.

Run `npm run test:first-visit-popup` for the overlay source-regression checks. The final production build was also tested in Chromium against a clean profile: **13/13 browser checks passed**, covering first-visit display, 3-second close delay, close button, click-away, once-only behavior, hover-open navigation, click-outside closure, category dropdown closure, mobile backdrop closure, and absence of uncaught client errors.


## Brand-menu, performance, and SEO follow-up — 29 October 2026

- Shop by Brand mega-menu cards now show a larger centered logo only; the visible adjacent name has been removed. Each card retains a meaningful accessible link label (`Shop {brand} products`) and the logo has descriptive alt text. The logo frame is 68px tall on desktop and 62px on narrow screens; keyboard focus, touch behavior, and reduced-motion preferences are retained. Brand logos continue to prefer Shopify collection images and fall back to supplied brand assets/initials.
- The large dynamic brand menu disables speculative prefetching to avoid background requests for dozens of brand destinations. Product-card image links also disable speculative prefetching because product detail routes require live Shopify requests. Catalogue images retain lazy loading and async decoding; intrinsic dimensions are supplied where available to help prevent layout shift.
- Converted three large hero photos to responsive-size WebP versions (quality 84, no upscaling) and updated active storefront URLs to `hero-main.webp` and `hero-kitchen.webp`. The active home hero remains eager/high-priority; below-hero promo photos are lazy-loaded. The original JPG-named files are retained for rollback. The active main and kitchen hero assets are approximately 90% smaller combined than their original files.
- Product/collection/brand/article metadata, canonicals, social metadata, structured data, sitemap, and robots were already implemented; these have been regression-checked rather than stuffing keywords into buttons. Buttons are not individually SEO targets. Icon-only controls and the newly logo-only links retain accessible names, while product images retain product-specific alt text.
- Run `npm run test:brand-menu-performance-seo` for the focused logo-only menu, responsive, accessibility, image-weight, product metadata/schema, and sitemap checks.

Run `npm run test:featured-category-grid` for the logo-only brand menu, image performance, and responsive category-grid regression checks.


## Homepage Clearance collection section — 29 October 2026

The homepage now reads the Shopify collection whose title or handle is `Clearance`, loads its products using the existing Storefront API query in parallel with the best-selling/newest homepage requests, and renders the `Clearance` product rail directly after Featured Categories. It reuses the existing product cards, cart/quick-view behavior, and horizontal rail controls. The heading has a subtle rose accent, eyebrow `Limited-time savings`, and a “Shop all clearance” link to the actual discovered collection handle at `/categories/{handle}`. If the collection is missing or has no published products, the section is not rendered; the rest of the homepage is unchanged. Use `npm run test:home-clearance` to check the integration.


## Clearance navigation item — 29 October 2026

Added Clearance as the ninth item in the green desktop primary navigation, after Shop by Business. It is a direct link (no empty mega-menu or dropdown chevron), targeting the live Shopify collection handle resolved by matching either the collection handle or title to clearance. The mobile navigation also includes Clearance. The other eight top-level navigation items and their dropdown behavior are preserved.

Verify with npm run test:clearance-navigation.
