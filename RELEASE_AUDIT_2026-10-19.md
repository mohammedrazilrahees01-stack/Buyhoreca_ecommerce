# BuyHoreca storefront release audit — 19 October 2026

## Baseline and delivery

Audited the repository at `main` commit `12fbaafc87d3734b3c5a863f10baff57abcc2312` (`v7`) in an isolated Vercel sandbox. The production `main` branch was not changed and no deployment was made. The connected GitHub integration does not grant repository write access, so the tested changes are delivered in this complete source archive for review rather than through a branch/PR.

## Fixes

- Integrated Track123's official headless React/Next.js tracking widget into `/track-order`. It loads the provider script over HTTPS and identifies the Shopify store as `buyhoreca.myshopify.com`. Shipment status and carrier events come from Track123 rather than mock frontend data.
- Preserved the legacy `/apps/track123?nums=...` URL with a compatibility redirect to `/track-order`, keeping query values so existing tracking-number links open the widget.
- Made `/track-order` independent of the global Shopify catalogue loading/error state.
- Added widget-loading and provider-failure states, retry, and WhatsApp support fallback.
- Updated the desktop mega-menu to distinguish mouse hover from touch/pen taps. Mouse hover remains enabled; touchscreen taps toggle it, keyboard focus can open it, and outside pointer interaction closes it.
- Pinned Next.js to `16.4.2` and updated the lockfile to resolve the prior high/critical dependency advisories.
- Updated production and interaction assertions for the live widget and touch-aware navigation.

## Verification

A fresh `npm ci` succeeded and reported zero vulnerabilities. After the fixes:

- Production build and TypeScript: PASS; `/apps/track123` appears in the build route manifest.
- `npm audit --audit-level=high`: PASS, zero vulnerabilities.
- `npm run audit:production`: 49 requirement checks PASS, 0 FAIL, plus 20 TypeScript/TSX parser checks.
- `npm run audit:interaction`: 19 PASS, 0 FAIL.
- `npm run audit:responsive-seo`: 53 PASS, 0 FAIL, 0 WARN.
- `npm run lint`: 20 TypeScript/TSX files parse without syntax errors.
- Quote flow: 5/5; Shopify checkout wiring: 10/10; product/blog: 14/14; category rail: 12/12; release hardening: 21/21; account/policies: 19/19; brand directory: 18/18; availability filter: 5/5; inventory and wishlist checks: PASS.
- Chromium browser suite: 7/7 PASS. The Track123 HTTPS widget, configuration endpoint and order-query endpoint returned HTTP 200 on a production-like hostname. `/apps/track123?nums=BH1130` redirected to `/track-order?nums=BH1130`; the widget rendered without uncaught client errors. No horizontal overflow was found across 320–3840px. Touch emulation successfully opened/closed the desktop mega-menu; mouse hover still works.
- HTTP route checks and `git diff --check`: PASS.

## Live-tracking caveat

The old Shopify page confirmed that Track123 is the intended provider. The new Next.js page embeds Track123's documented headless widget, and the widget successfully loaded its live configuration and order-query endpoints in testing. Actual shipment progress still depends on Track123 remaining active and having the order/fulfillment tracking number synced from Shopify; orders without carrier scans cannot show scans that do not exist. The integration must be included in the deployed Next.js build for customers to see it there.

## Audit boundary

The production build, dependency and source audits, existing regression suites, Chromium integration checks and responsive overflow matrix passed. A payment transaction and physical touch-TV hardware testing were not available in this sandbox. The production site was not deployed or changed during this work.
