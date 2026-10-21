# BuyHoreca storefront release audit — 19 October 2026

## Baseline and delivery

Audited the repository at `main` commit `12fbaafc87d3734b3c5a863f10baff57abcc2312` (`v7`) in an isolated Vercel sandbox. Production `main` was not changed and no deployment was made. The complete source archive is delivered separately for review.

## What changed

- Embedded Track123's official headless storefront widget in `/track-order` using its HTTPS script and the Shopify store domain `buyhoreca.myshopify.com`.
- Preserved `/apps/track123?nums=...` through a redirect to `/track-order`, retaining tracking query parameters.
- Added loading and service-failure states with retry and WhatsApp support fallback for Track123.
- Made `/track-order` and `/account` independent of the main Shopify catalogue loading/error state so both pages remain usable during catalogue/API outages.
- Added a `Track Shipment` link in desktop header actions and in the account-page shortcuts.
- Updated the account CTA to “Open account and orders” while retaining Shopify-hosted secure sign-in. This page is still a gateway, not a session-aware local account dashboard.
- Added the floating `BuyHoreca AI` widget directly above WhatsApp, with starter prompts, chat panel, live Shopify product/collection retrieval, related product cards, and a clear provider-not-configured state.
- Added curated BuyHoreca assistant knowledge and safety rules: answers should use live catalogue data, avoid fabricating product facts, never request passwords or payment details, and send private shipment-status requests to Track Shipment.
- Added a server-side Cloudflare Workers AI endpoint using `@cf/zai-org/glm-4.7-flash`, bounded message/history size, basic per-process throttling, a same-origin/proxy-aware guard, and no public AI API token.
- Added `.env.local.example` entries and README instructions for `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_AI_API_TOKEN`, and `CLOUDFLARE_AI_MODEL`.
- Fixed mobile floating-control spacing so the AI button and chat panel clear WhatsApp and the bottom quick-navigation bar.
- Updated the production, interaction, account/policy, and AI-specific source assertions.

## Verification results

After a clean `npm ci`:

- `npm run build`: PASS (Next.js 16.4.2 production build and TypeScript semantic check).
- `npm run test:ai-assistant`: 19/19 PASS.
- `npm run test:catalog-filters`: 10/10 PASS.
- `npm run audit:production`: 62/62 requirement checks PASS plus 22 TS/TSX parser checks.
- `npm run audit:interaction`: 31/31 PASS.
- `npm run audit:responsive-seo`: 53 PASS, 0 FAIL, 0 warnings.
- `npm run lint`: 22 TS/TSX source files parsed without syntax errors (this repository script is a source parser, not ESLint).
- Existing regression suites: quote flow 5/5; checkout wiring 10/10; product/blog 14/14; inventory PASS; category rail 12/12; release hardening 21/21; account/policies 19/19; brand directory 18/18; availability filter 5/5; wishlist PASS.
- Track123 Chromium test: 7/7 PASS, including the official script, configuration, and anonymous order-query endpoints returning HTTP 200 on a production-like hostname, the legacy query redirect, no client exceptions, a 320–3840px overflow sweep, and touchscreen/mouse mega-menu checks.
- Account + AI Chromium test: 10/10 PASS, including catalogue-outage resilience for `/account`, hosted-account CTA, header tracking shortcut, accurate missing-credential response, mobile/desktop launcher placement, chat panel open, and same-origin API returning explicit `AI_NOT_CONFIGURED` status.
- `npm audit --audit-level=high`: PASS, zero vulnerabilities.
- `git diff --check`: PASS.

## Configuration required before enabling answers on the published site

The UI and backend are wired, but this sandbox had no Cloudflare AI account ID or API token. Until `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_AI_API_TOKEN` are added as server-side variables in local `.env.local` and the Vercel project's Production environment, the assistant intentionally tells users it is not configured. Do not put the token under a `NEXT_PUBLIC_` variable name. Cloudflare's Workers AI documents 10,000 Neurons/day in its free allocation; usage/limits may change. Model information: https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/ and https://developers.cloudflare.com/workers-ai/platform/pricing/.

The assistant retrieves relevant Shopify product matches for questions; it is not a separately trained model containing every catalogue field or every company document. Adding more internal documents, policy details, full-catalogue indexing, or semantic retrieval would require additional curated source material and possibly an embeddings/vector-store setup.

## Customer account caveat

The account page links to Shopify-hosted customer accounts and provides `Track Shipment` and quote shortcuts. It does not keep a local signed-in session or render the customer's order list within the page. That requires implementing Shopify Customer Account API OAuth (client ID, callback URL, state/PKCE/session/token handling) through the Shopify Headless channel. Official setup: https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/getting-started.

## Release boundary

The archive was built and tested in an isolated sandbox. These changes have not been pushed to GitHub `main` and have not been deployed to `buyhoreca.com`. Live shipment events depend on Track123 and carrier data synced to Shopify. Live AI answers depend on setting the Cloudflare credentials and redeploying. Before release, validate those external service settings in the real production environment.


## Follow-up fix: mega-menu pointer path — 19 October 2026

The recording showed that the visible mega-menu panel is centered and starts to the right of the first navigation item. When the pointer moved straight down from **Kitchen Utensils**, it left the centered panel's horizontal bounds and caused the hover state to collapse before the pointer could reach the options.

- Kept the visible dropdown panel centered at its existing responsive widths.
- Made the menu wrapper a transparent, full-width hover corridor directly beneath the entire top navigation. The pointer now stays inside the navigation/menu subtree while crossing the blank space from any tab to the centered panel.
- Moved the visible panel border, background, shadow, max-height, and native scrolling to the centered inner panel, so the wider hit area does not create a full-width visual panel.
- Retained mouse hover, keyboard focus, touch/pen tap-to-toggle, Escape close, scroll isolation, and the original eight navigation groups.

Follow-up verification: clean production build and TypeScript PASS; production audit 62/62 PASS; interaction audit 31/31 PASS; responsive/SEO audit 53 PASS / 0 FAIL / 0 warnings; `npm audit --audit-level=high` reports zero vulnerabilities. Chromium pointer-path tests: desktop mouse 6/6 PASS (including straight-down travel under the first tab, then horizontal movement into a menu card); touch-enabled 1200px display 4/4 PASS (tap opens, second tap closes). Full existing regression suite also passed.


## Follow-up fix: Track123 localhost widget and AI customer messages — 19 October 2026

The user's screenshot showed `[Track123 embed] config HTTP 404` on `/track-order` and a non-customer-facing Cloudflare setup warning after sending `hi`. The issues have been corrected in source:

- Track123 intentionally points its `baseUrl` at the current origin on localhost. Added Next.js `beforeFiles` rewrites for `/endApi/api/store/anonymous/:path*`, the tracking-translation endpoint, and `/tracking-page-spa/:path*` to the official `https://shp.track123.com` host, ensuring the rewrites run before the dynamic storefront catch-all. The API proxy returns JSON rather than the local 404, and the widget JS/CSS chunk routes return the provider assets.
- Simple customer greetings (`hi`, `hello`, `hey`, greetings by time of day, and common Arabic greetings) receive a natural welcome without making an AI model request.
- The AI API itself now returns only a customer-safe service-unavailable message when `AI_NOT_CONFIGURED`; the UI also hides backend details and offers a WhatsApp support action. If AI credentials/provider are unavailable for a product question, it replies politely and offers a “Chat with BuyHoreca support” WhatsApp action.

Final follow-up verification:

- Clean production build + TypeScript semantic checking: PASS.
- Production static audit: 62/62 requirements PASS plus 22 TypeScript/TSX parser checks.
- Interaction audit: 31/31 PASS.
- AI/tracking static test: 19/19 PASS.
- Live Chromium customer-facing test: 7/7 PASS. Both Track123 config and translation endpoints returned HTTP 200 through localhost; the Track123 widget rendered the order lookup/detail UI for the supplied `?nums=BH1130` query with no configuration error; no uncaught browser exceptions. “Hi” received a natural local greeting with no API call, and a product query produced the customer-friendly unavailable response with a WhatsApp CTA and no Cloudflare setup details.
- Earlier mega-menu browser checks remain: mouse pointer path 6/6 PASS and touch toggle 4/4 PASS. Responsive/SEO audit remains 53 PASS / 0 FAIL / 0 warnings.
- `npm audit --audit-level=high`: zero vulnerabilities; existing feature regression suites PASS.

These source changes are not deployed to `buyhoreca.com` or pushed to GitHub `main`. The Cloudflare account/token setup is still required for full AI answers about products. Track123 shipment updates require the app and synced carrier scans to remain active.


## Final customer-facing Chromium check

A fresh browser run against the built Next.js production server passed 7/7 checks: Track123 configuration and translation endpoints both returned HTTP 200 through the local rewrites; the live widget rendered order details for `?nums=BH1130` without the `config HTTP 404` panel; and no uncaught tracking exceptions were seen. The BuyHoreca AI launcher opened correctly; entering `hi` returned a warm customer reply without calling the AI endpoint; product questions with missing Cloudflare credentials showed a polite fallback and a WhatsApp support button; no internal provider setup message appeared in the customer chat.

The local proxy is restricted to Track123's anonymous tracking configuration, tracking-page translation, and static `/tracking-page-spa/` assets. A request to an unrelated `/endApi/api/admin/...` path remains a local 404 rather than being forwarded. The production build and all listed source/regression audits pass after these changes.


## Final tracking UI regression — 19 October 2026

The user's screenshot showed an unnecessary caption reading “Live order and shipment updates provided by Track123.” and two Track actions rendered as unstyled text because storefront-wide Tailwind Preflight overrides the provider buttons in the widget's light DOM. The caption has been removed. Scoped, high-specificity CSS restores the heading size/weight and green, white-text primary Track buttons with 44px minimum touch height, focus-visible rings, hover treatment, and mobile padding. The heading and buttons stay styled without changing other storefront buttons.

Final browser verification on the clean production build: **7/7 tracking UI checks PASS**; an additional responsive pass at **8 viewport widths (320, 360, 390, 576, 768, 1024, 1440, 1920px) passed 8/8**. Verified the caption is absent; both Track buttons have computed background `rgb(0, 143, 104)`, white text, visible border/padding, and minimum 44px height; heading computes to 30px/700; empty submission activates order-number validation; Track123 config and translation endpoints both return HTTP 200; `?nums=BH1130` renders its tracking details; no uncaught browser exceptions. Local proxy is limited to Track123 anonymous config, translation configuration, and widget assets.

Final static verification after the change: production audit **62/62 PASS**, interaction audit **31/31 PASS**, responsive/SEO audit **53 PASS / 0 FAIL / 0 WARN**, AI-specific test **19/19 PASS**, production build/TypeScript PASS, dependency audit zero vulnerabilities, and `git diff --check` PASS. All existing quote, checkout-wiring, product/blog, inventory, category-rail, release-hardening, account/policy, brand-directory, availability-filter and wishlist regression suites also pass.

No public production deploy or push to GitHub `main` was made. The changes are in the downloadable source archive only.


## Customer-first AI fallback and watermark clarification — 19 October 2026

The screenshot showed a customer asking “scoop” but receiving a generic service-down apology. The backend now performs Shopify product search for arbitrary names (including short words such as `scoop`, without requiring the question to contain “product”, “find”, or “recommend”). If Cloudflare Workers AI is unavailable/not configured, the assistant still returns real matched Shopify products when the Storefront token is configured, and handles tracking, bulk quote, category browsing, returns, delivery-question, and human-support intents with customer-appropriate answers and relevant links. The frontend renders the returned product cards and action/support links. No provider account IDs, token setup text, or implementation instructions are shown to customers. Greetings continue to receive an instant natural welcome.

The LLM is **not a fully enabled generative AI** until the owner configures `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_AI_API_TOKEN`; without them, the working fallback is a catalogue-search + curated FAQ assistant, not open-ended model generation. This limitation is documented honestly.

The ordinary storefront caption “Live order and shipment updates provided by Track123.” is removed and the embedded widget uses scoped BuyHoreca-green styling for the Track actions and heading. The small provider watermark still originates from the Track123 widget. Track123's published plan comparison lists “Remove Track123 branding” as an Advanced-plan feature. The source does not use CSS to circumvent a provider plan limitation. To remove that watermark, use the eligible branding-removal setting in the Track123 app or replace the widget with a different licensed tracking solution. Official plan page: https://intercom.help/track123/en/articles/5920187-track123-pricing-plan.

Additional verification: live AI fallback API 5/5 PASS (tracking action, quote action, categories/browse action, returns/support, unknown product fallback); previous rendered tracking page 7/7 PASS and responsive Track-button matrix 8/8 PASS.


## Header and product-filter follow-up — 19 October 2026

- Removed the redundant desktop “Quote” header link beside Wishlist; kept and enlarged the top-strip “Request a Quote” CTA (14px semibold, with added padding).
- Root cause: `/shop` could stop reloading selected facets when `getCollection("all")` returned `null` or failed. The previous effect returned early without a collection or search term, and the fallback root `getProducts` query ignored selected facets. Added explicit collection-load readiness, a fallback query builder for availability/vendor/product type/tags/price ranges, sort/pagination preservation, and a visible customer-safe error state. Native collection filters still use Shopify `ProductFilter` inputs when the collection is present.
- Browser regression test with mocked Shopify responses: **7/7 PASS**: header duplicate removal/top CTA size; initial product list; brand selection narrows list; clear restores products; price selection narrows list; in-stock selection excludes unavailable item; zero uncaught client errors.
- Static catalogue-filter test: **10/10 PASS**. Updated production static audit: **62/62 PASS**; interaction audit **31/31 PASS**; responsive/SEO audit **53 PASS / 0 FAIL / 0 WARN**; AI test **19/19 PASS**; clean Next.js production build + TypeScript PASS. Existing checkout, quote, product/blog, inventory, category rail, account/policy, brand, availability and wishlist test suites also passed; dependency audit reports zero vulnerabilities.
- Live Shopify credentials/data were not available in the isolated test server, so the browser filter test used representative mocked Shopify responses; the deployed site's actual facet results still require confirming in Preview/Production after setting its normal Shopify environment. These changes have not been pushed to GitHub `main` or deployed to `buyhoreca.com`.


## Customer-facing browser test for header and filter changes

On the production Next.js build, using representative mocked Shopify API responses (the sandbox does not contain the production storefront token), Chromium passed **7/7** checks: the header keeps the enlarged top “Request a Quote” CTA and has no duplicate desktop “Quote” item; the initial list shows all fixture items; selecting Brand sends `vendor:"Winco"` and removes other-brand products; Clear all sends an unfiltered product query and restores items; selecting Price sends `variants.price:<=100` and narrows the list; selecting In stock sends `available_for_sale:true` and excludes the unavailable item; no uncaught frontend exceptions occur.

Static tests for the fallback mapping pass **10/10**. This is a functional query-path test using mock product data, not a claim that the live Shopify production credentials or catalog were queried from this isolated test host. The real site must be retested in Vercel Preview/Production with the configured Shopify environment.


## Click-away and first-visit promo regression — 21 October 2026

The click-away handler is registered in the document capture phase for `pointerdown` and `click`. The inside test is limited to the actual `.bh-mega-inner` panel and real `.bh-primary-nav-item` triggers. This is important because `#bh-primary-mega-menu` is a full-width transparent overlay: treating that wrapper as inside prevented clicks to the side of the visible menu from dismissing it. The all-category dropdown, predictive search and mobile nav retain their independent outside-click closure behavior.

First-visit poster asset `public/images/promo/welcome-offer.webp` is included in the archive. `FirstVisitPromoPopup` appears 500ms after first visit, shows no close button for three seconds, then allows close-button/backdrop/Escape dismissal. A localStorage key prevents repeat displays after the poster has appeared. Users testing again in the same browser can clear `buyhoreca_welcome_offer_seen_v1` and reload.

- `npm run test:first-visit-popup`: **13/13 PASS**.
- `npm run test:catalog-filters`: **10/10 PASS**.
- Chromium interaction tests on a fresh build: **13/13 PASS** — popup first display; 3-second close delay; dismiss; once-only behavior; mega menu hover/open; outside-click close; switching tabs; all-categories outside click; mobile backdrop close; no uncaught frontend exceptions.
- `npm run audit:production`: **62/62 PASS** plus 22 TS/TSX parser checks.
- `npm run audit:interaction`: **31 PASS / 0 FAIL**.
- `npm run audit:responsive-seo`: **53 PASS / 0 FAIL / 0 WARN**.
- `npm run lint` and `npm run build`: PASS.
- Existing AI, quote, checkout, product/blog, inventory, category rail, release-hardening, account/policies, brand-directory, availability and wishlist regression checks all passed; `npm audit --audit-level=high` reported **zero vulnerabilities**; `git diff --check` passed.

This is a source archive, not a deployed release. No push to GitHub `main` or deploy to `buyhoreca.com` was performed.
