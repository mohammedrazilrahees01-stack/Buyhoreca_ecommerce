# Customer Account Login Fallback Fix — 16 October 2026

## Defect
The account page treated a null `shop.customerAccountUrl` value as proof that Shopify customer accounts were not configured. Shopify documents this field as present only when a customer-account vanity domain exists, so null is normal for stores using the default Shopify-hosted account domain. The previous logic incorrectly showed an administrator setup warning to shoppers.

## Change
- The Account page now resolves a safe Shopify-hosted login URL automatically.
- A valid `NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_URL` remains an optional override for a customer-account vanity domain.
- If there is no override, it uses `https://<configured-store>.myshopify.com/account/login` (restricted to a valid `*.myshopify.com` domain).
- Removed the customer-facing setup warning and the brittle dependency on the optional `shop.customerAccountUrl` field.
- Added URL-resolution regressions to `scripts/test-account-policy-pages.mjs`.

## Important limitation
This change supplies the correct Shopify entry point without requiring a vanity domain. Shopify still must have customer accounts enabled in the store settings for its hosted sign-in/registration and order-history experience to work. A live sign-in and registration test against the merchant's Shopify admin is required before production certification.
