# BuyHoreca — full-site correction candidate

Next.js + Shopify storefront source. This archive contains the 16 October 2026 source audit fixes, including the blog loop/spacing correction, cursor-safe sitemap/blog pagination, safe JSON-LD serialization, responsive reduced-motion behavior, mobile navigation/sort corrections, and direct quote-row interaction fixes.

## Read this before release

This is a **corrected source candidate, not a production-certified/deployed release**. The full Next.js build, whole-project semantic TypeScript, ESLint, authenticated Shopify cart/discount/quote/checkout, production domain routing, and real deployed-site performance/SEO have not been verified here. The environment could not install project dependencies from npm. The lockfile also lacks direct package entries for `eslint` and `eslint-config-next` and must be regenerated with working registry access. English/Arabic routes and RTL are also not implemented yet. The account page now hands off to Shopify’s standard `/account/login` endpoint by default; live account authentication still depends on Shopify’s customer-account mode being enabled.

Start with `FULL_SITE_AUDIT_AND_FIX_LOG_2026-10-16.md` for exact findings, fix details, test results, and outstanding production gates. `ZIP_REVIEW_2026-10-16.md` records the archive and integrity review. Older dated audit files are historical snapshots; use the 16 October report for the current source state.

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
npm run test:quote-flow
npx tsc --noEmit
npm run lint
npm run build
```

The automated source audits do not replace the production build or live checkout verification. Before release, follow the explicit external checklist in `FULL_SITE_AUDIT_AND_FIX_LOG_2026-10-16.md`.

## Shopify offer configuration

The homepage displays copy actions for `WELCOME10` and `HORECA5`. Confirm that the codes are active and that their exact eligibility/threshold rules in Shopify match the advertised text before promoting them to customers.
