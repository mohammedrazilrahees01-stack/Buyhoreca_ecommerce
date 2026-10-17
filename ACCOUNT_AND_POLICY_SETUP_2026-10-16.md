# Shopify account login and policy pages — 16 October 2026

## Customer accounts
The `/account` page now links directly to Shopify-hosted sign-in using this resolution order:

1. If a valid HTTPS `NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_URL` is provided, the storefront uses the configured customer-account vanity URL.
2. Otherwise, it automatically uses `https://<NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN>/account/login`, defaulting to `https://buyhoreca.myshopify.com/account/login`.

This fallback is intentional. Shopify's Storefront API documents `shop.customerAccountUrl` as present only when a customer-account vanity domain exists; a `null` result does not establish that the account feature is disabled. The older page incorrectly interpreted that as a configuration failure and showed internal setup text to customers.

The merchant must still have the desired customer account mode enabled in Shopify. Shopify documents `/account/login` as the account login route, which redirects to the hosted Customer Accounts experience when that mode is enabled. The URL handoff has local regression coverage, but live sign-in, registration, account profile and order-history behavior must be validated against the merchant's Shopify store before production sign-off.

Official references: [Shopify Liquid routes object](https://shopify.dev/docs/api/liquid/objects/routes) and [Storefront API Shop object](https://shopify.dev/docs/api/storefront/latest/objects/Shop).

## Policies
The storefront has `/policies/privacy-policy`, `/policies/refund-policy`, `/policies/shipping-policy`, and `/policies/terms-of-service`. Each route pulls content from Shopify Storefront `Shop` policies, strips markup into readable text, and shows a clear unavailable state if no published policy body exists. An unpublished policy is set `noindex` and excluded from the sitemap.

Policy text must be approved by BuyHoreca's business/legal owner and published in Shopify. Code must not invent shipping rates, return rights, privacy commitments or terms.

## Build reproducibility blocker
The current lockfile is missing package entries for `eslint` and `eslint-config-next` even though `package.json` declares them. On a machine with working npm registry access, regenerate and commit the lockfile using `npm install`, then verify `npm ci`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Do not omit lint dependencies to hide the mismatch.
