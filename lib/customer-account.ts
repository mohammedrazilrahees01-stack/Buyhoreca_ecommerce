/**
 * Customer account URL resolution for a headless Shopify storefront.
 *
 * Shopify's Storefront API `shop.customerAccountUrl` is only populated when a
 * customer-account vanity domain exists. A null value is normal for stores
 * using Shopify's default hosted account domain, so it must not be treated as
 * proof that customer accounts are disabled.
 */
export function safeCustomerAccountUrl(value: string | null | undefined, storefrontUrl?: string | null): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const target = new URL(value.trim());
    if (target.protocol !== "https:" || target.username || target.password) return null;
    if (target.port && target.port !== "443") return null;
    if (storefrontUrl) {
      try {
        const storefront = new URL(storefrontUrl);
        if (target.origin === storefront.origin && (target.pathname === "/" || target.pathname.startsWith("/account"))) return null;
      } catch {
        // An invalid optional storefront URL should not invalidate a valid HTTPS account URL.
      }
    }
    return target.toString();
  } catch {
    return null;
  }
}

/**
 * Resolve the Shopify-hosted account entry point without requiring a vanity
 * domain. If the merchant configured a valid account-domain URL, prefer it;
 * otherwise use Shopify's standard /account/login endpoint on the store's
 * canonical *.myshopify.com domain. Shopify handles the configured account
 * mode and redirects to the hosted authentication experience when enabled.
 */
export function shopifyCustomerLoginUrl(
  storeDomain: string | null | undefined,
  configuredAccountUrl?: string | null,
  storefrontUrl?: string | null,
): string {
  const configured = safeCustomerAccountUrl(configuredAccountUrl, storefrontUrl);
  if (configured) return configured;

  const rawDomain = (storeDomain || "buyhoreca.myshopify.com").trim();
  try {
    const candidate = new URL(/^https?:\/\//i.test(rawDomain) ? rawDomain : `https://${rawDomain}`);
    const hostname = candidate.hostname.toLowerCase();
    // Restrict fallback construction to a Shopify-owned store domain. Never
    // derive an external redirect from arbitrary request data.
    if (
      candidate.protocol !== "https:" || candidate.username || candidate.password ||
      (candidate.port && candidate.port !== "443") ||
      !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(hostname)
    ) {
      return "https://buyhoreca.myshopify.com/account/login";
    }
    return `https://${hostname}/account/login`;
  } catch {
    return "https://buyhoreca.myshopify.com/account/login";
  }
}
