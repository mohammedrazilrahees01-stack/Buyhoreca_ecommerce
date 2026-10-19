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
