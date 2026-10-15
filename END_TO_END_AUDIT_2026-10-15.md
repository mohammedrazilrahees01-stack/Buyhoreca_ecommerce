# BuyHoreca — End-to-End Website Audit
**Audit date:** 15 October 2026  
**Scope:** Public domain, Vercel deployment records, current corrected audit workspace, core Next.js/Shopify integration, static quality/security checks, SEO output, and available tests.

## Executive verdict

**Not ready to call production-ready yet.** The most serious problem is not a small CSS defect: the official domain and the Next.js Vercel app are serving different storefronts, and the latest GitHub `main` deployments on Vercel are failing their build step. This means a fix packaged in a ZIP or made in a preview workspace will not change the official website until the correct source is deployed and the domain routes to it.

The corrected audit workspace passes TypeScript, build, and the project's static audit scripts. However, lint still fails with 126 errors and 70 warnings; runtime logs also record repeated Shopify connection failures. A browser-level purchase flow and live checkout have not been verified.

## Critical findings — fix these first

### P0 — The official domain is not serving the audited Next.js app
- `https://buyhoreca.com` currently serves a different page than `https://buyhoreca-rho.vercel.app`. The official domain's page contains the existing “No. 1 Horeca Shopping Site in Middle East and Africa” storefront text; the Vercel app's HTML title is “Professional HoReCa Equipment & Supplies | BuyHoreca”. The official-domain HTML source was about 1.1 MB; the Vercel app HTML was about 30 KB.
- Vercel's domain listing for this project contains `buyhoreca-rho.vercel.app`, but does not list `buyhoreca.com` as an attached project domain.
- The Vercel app sets canonical/Open Graph URLs to `https://buyhoreca.com`, and its sitemap contains 3,854 URLs, all on that host. The official host and the audited app therefore do not currently represent the same rendered storefront.
- The newest deployment on `main` (`2eb316da997527834a13d1a2913f95e6e665aaba`) is in `ERROR` state with `lint_or_type_error` / `npm run build` exited with 1. The immediately previous `v5` production attempt also failed. A successful older deployment remains in the deployment history.

**Action:** Decide which storefront is the source of truth. If this Next.js app is meant to replace the current storefront, connect `buyhoreca.com` to the correct Vercel project (including DNS/Cloudflare routing and HTTPS), fix the failing `main` build, then verify the production alias/domain. If the current Shopify storefront is meant to remain authoritative, do not assume the Next.js preview is live; keep preview canonical/noindex rules separate from the production domain.

### P1 — Storefront reliability: Shopify requests time out or reset
Vercel runtime-error aggregation reports 26 `TypeError: fetch failed` events associated with the dynamic storefront routes, with examples including `ETIMEDOUT` and `ECONNRESET` to `buyhoreca.myshopify.com:443`. This is evidence of repeated upstream request failures, although it does not by itself prove whether the root cause is Shopify, network routing, or request volume. The returned time range is not internally consistent with the requested seven-day filter, so I am not treating 26 as a precise seven-day incident rate.

**Action:** Instrument upstream status, duration, and error class; verify Shopify Storefront API availability/version/token and Vercel outbound connectivity; add safe retry/backoff only for idempotent reads; add a graceful stale-data/error fallback; and cache catalogue/metadata responses for a short, deliberate TTL. Do not blindly retry cart mutations because they may duplicate actions.

### P1 — The Shopify API proxy is too permissive
`app/api/shopify/route.ts` accepts client-supplied GraphQL text (up to 50,000 characters) and arbitrary object-shaped variables, then forwards the payload to Shopify using the Storefront token. The route validates basic input shape and has a timeout, but I did not find an operation allow-list, query complexity limit, request-body size limit beyond the query string, or rate limiting.

**Risk:** Public automation can generate avoidable Vercel function load and consume Shopify API capacity by repeatedly submitting expensive queries.

**Action:** Prefer known operation identifiers/persisted queries or a strict operation-name allow-list; validate variables per operation; cap request body size and query complexity; add per-IP/edge rate limits and monitoring. Keep public storefront queries read-only where possible and treat cart mutation operations separately.

### P1 — Product price presentation needs a data-integrity check
The currently served official homepage shows at least one product card with a sale price of **AED 111.25** while its crossed-out regular price is **AED 0.00** (a Bisetti salt-and-pepper mill listing). This is a customer-trust problem if the displayed value reflects the live product data. It could be a bad compare-at price in Shopify or a display-condition bug in the current storefront. See the live page: https://buyhoreca.com/.

**Action:** Show a compare-at/regular price only when it is a valid positive amount and strictly greater than the selling price; verify Shopify `price` and `compareAtPrice` values and test zero/null/equal/lower cases on product cards, quick view, product detail, cart, and checkout.

## Code quality and maintainability

### Lint baseline is failing
In the corrected workspace, ESLint reports **196 findings: 126 errors and 70 warnings**:
- 105 `@typescript-eslint/no-explicit-any` errors. Replace `any` with typed Shopify response interfaces, discriminated unions, or `unknown` plus validation. These currently weaken type safety around product, collection, and cart data.
- 18 `react-hooks/set-state-in-effect` errors, plus 2 `react-hooks/static-components` errors. Review these deliberately; some can cause cascading renders, stale UI, or components remounting during render. Avoid blanket disabling of these rules.
- 1 `prefer-const` error.
- Warnings include 37 raw `<img>` uses, 16 unused variables/imports, 10 effect dependency warnings, 6 relative-location assignment warnings, and one anonymous default export warning.

**Action:** Make lint a required CI gate and fix the errors by category. Do not silence the rules globally to get a green count. Use Next image optimization for high-visibility assets, while verifying that remote Shopify image domains, dimensions, and lazy-loading behavior are configured correctly.

### The storefront component is too monolithic
`app/[[...slug]]/Storefront.tsx` is about **197 KB**, with 688 lines and 88 lines exceeding 500 characters (maximum line around 6,946 characters). Shopify queries, data normalization, navigation, catalogue/product UI, cart behavior, and page-specific components are highly concentrated in this file.

**Action:** Split it into focused modules: Shopify client/query/types; navigation/header/search; product card/grid; product detail/variant selector; cart drawer; wishlist; collection filters/pagination; quote form; blog/article UI. Format JSX/TSX and CSS so code review and regression diagnosis are practical.

## Performance

- The API route sends requests to Shopify using `cache: "no-store"`; the homepage response from the Vercel app is also marked private/no-store. This prevents normal cache reuse and can make high-volume catalogue pages slower and more expensive.
- The runtime errors above can cause blank/partial catalogues or failed product metadata when the upstream request is unavailable.
- The current official-domain HTML response measured about 1.1 MB. Investigate the number of server-rendered product cards, embedded data, repeated content, and image payloads. That measurement alone does not replace a Lighthouse or real-device Core Web Vitals test.
- Use route-specific caching: short ISR/revalidation for catalogue and metadata, shorter TTL where stock/price freshness matters, and no shared caching for personalized cart/account data. Keep cart/checkout operations uncached.
- Audit largest-contentful-paint images, image dimensions, below-the-fold lazy loading, font loading, client JavaScript/hydration, and cumulative layout shift with controlled mobile/desktop Lighthouse runs.

## SEO findings

**Good results in the corrected workspace:** the sitemap fetch succeeds and contains 3,854 unique URLs with no duplicates, query strings, or fragments; all entries use `buyhoreca.com`. The responsive/SEO script reports 49 passes and no static failures/warnings. `robots.txt` and `sitemap.xml` both return HTTP 200 from the Vercel app.

**Important caveat:** those paths and canonical URLs point at `buyhoreca.com`, while the Vercel app and official domain currently serve different page content. Fix deployment/domain routing before judging production SEO. Once routed correctly, validate a representative sample of product, category, brand, business, blog, quote, and static URLs for canonical, status code, title/description, structured data, noindex policies, redirect consistency, and 404 behavior.

## Security and dependencies

- `npm audit --omit=dev` reports **0 production dependency vulnerabilities** in the corrected workspace.
- Full `npm audit` reports **5 high-severity findings in development/lint tooling** (`@next/eslint-plugin-next`, `eslint-config-next`, `braces`, `fast-glob`, `micromatch`). The suggested fix metadata includes a major-version change; review the advisories and upgrade to supported patched versions rather than blindly applying a downgrade.
- Keep the Shopify token server-only where feasible; `NEXT_PUBLIC_*` environment variables are public by convention. Storefront API public tokens are designed for storefront access, but the proxy still needs operation limits and rate limiting.
- Verify the `.env.local.example` file contains placeholders only; never include real `.env` files, access tokens, or customer data in ZIPs.

## Test coverage and release gates

### Passed in the corrected audit workspace
- Comprehensive static audit: **142 pass / 0 fail / 0 warnings reported by checks** (its final summary still advises reviewing environment-verification gaps).
- Responsive/SEO audit: **49 pass / 0 fail / 0 warnings**.
- Interaction audit: **15 pass / 0 fail**.
- Wishlist test: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed in the corrected workspace.
- `npm audit --omit=dev`: zero production dependency vulnerabilities.

### Not passed / not verified
- ESLint: failed with 126 errors and 70 warnings.
- The currently newest GitHub `main` deployment: failed at build time; the corrected workspace is not the same thing as the deployed `main` build.
- No full browser-level E2E suite was found in the package scripts. The available tests are primarily static checks plus a wishlist test.
- I did **not** complete a live authenticated Shopify cart/checkout transaction or payment flow, and did not create a real order.
- I did not run Lighthouse/axe or a physical-device screen-reader/keyboard audit, so Core Web Vitals and full accessibility conformance are not certified.

**Recommended E2E suite:** homepage → search/predictive results → category filters/sort/pagination → product detail/variant selection → cart create/update/remove/discount → checkout redirect (without placing an order) → quote validation/submission → wishlist persistence → keyboard navigation → mobile bottom-nav/WhatsApp overlap → failure/loading/empty states. Use a staging Shopify store or mocked GraphQL responses for mutation tests.

## Prioritized implementation plan

1. **P0:** Resolve official domain vs Vercel routing/source of truth; make the correct `main` build green and confirm the production domain is serving that exact deployment.
2. **P1:** Diagnose Shopify network errors and add observability, safe fallback, request caching, and controlled retries for reads.
3. **P1:** Constrain and rate-limit `/api/shopify`; validate operation-specific variables.
4. **P1:** Fix the zero compare-at-price display and test product price parity across card/detail/cart.
5. **P1:** Clear lint errors and repair the highest-risk React effect/static-component patterns.
6. **P2:** Split the monolithic storefront, format code, remove unused code, and reduce raw `<img>` warnings on high-impact assets.
7. **P2:** Add Playwright E2E tests, Lighthouse (mobile + desktop), accessibility checks, and production smoke tests as CI release gates.
8. **P2:** Re-measure HTML/JS/image payloads and set explicit performance budgets after the correct app is serving the official domain.

## Audit boundary

This is a broad repository/static audit and focused review of the deployment, Shopify proxy, metadata/sitemap, and storefront architecture. It does not prove every possible runtime branch is bug-free. Live private checkout, real payment, customer-authenticated flows, and device-level visual/accessibility testing remain unverified. Findings distinguish measured failures from risks and recommendations.
