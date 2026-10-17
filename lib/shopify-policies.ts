export type StorePolicy = { title?: string | null; body?: string | null; url?: string | null };
export type PolicyField = "privacyPolicy" | "refundPolicy" | "shippingPolicy" | "termsOfService";
export type PolicyRoute = { key: PolicyField; title: string; description: string };

export const POLICY_ROUTES: Record<string, PolicyRoute> = {
  "privacy-policy": { key: "privacyPolicy", title: "Privacy Policy", description: "How BuyHoreca handles personal information and privacy." },
  "refund-policy": { key: "refundPolicy", title: "Returns & Refunds", description: "BuyHoreca returns, refunds and cancellation policy." },
  "shipping-policy": { key: "shippingPolicy", title: "Shipping & Delivery", description: "BuyHoreca shipping and delivery policy." },
  "terms-of-service": { key: "termsOfService", title: "Terms of Service", description: "Terms and conditions for using BuyHoreca." },
};

/** Convert Shopify's merchant-authored policy HTML to display-safe plain text. */
export function policyHtmlToText(html: string): string {
  return String(html || "")
    .replace(/<(script|style|iframe|object|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/(?:p|div|li|h[1-6]|tr|section|article|ul|ol|blockquote)>/gi, "\n\n")
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, value: string) => safeCodePoint(Number(value)))
    .replace(/&#x([0-9a-f]+);/gi, (_, value: string) => safeCodePoint(parseInt(value, 16)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function safeCodePoint(value: number): string {
  return Number.isInteger(value) && value >= 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff)
    ? String.fromCodePoint(value)
    : "";
}
