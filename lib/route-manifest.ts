/**
 * Canonical route-shape validation for the catch-all storefront route.
 * Keep this list as the source of truth for route families, so route/index URLs
 * such as /blog are not accidentally treated as missing detail pages.
 */
export type StorefrontRouteDecision =
  | { kind: "render" }
  | { kind: "redirect"; destination: string }
  | { kind: "not-found" };

export const BUSINESS_SLUGS = new Set([
  "cafe-coffee-shop",
  "restaurant",
  "hotel",
  "bakery-pastry",
  "bar-lounge",
  "catering-banqueting",
  "fast-food-qsr",
  "school-institution",
  "corporate-office-catering",
  "event-hospitality",
]);

const SINGLETON_ROUTES = new Set([
  "shop",
  "collections",
  "search",
  "cart",
  "wishlist",
  "compare",
  "quote",
  "about",
  "contact",
  "faq",
  "shipping",
  "account",
  "track-order",
]);

const ROOT_ROUTES = new Set([
  ...SINGLETON_ROUTES,
  "categories",
  "products",
  "brands",
  "business",
  "blog",
  "policies",
]);

function isNonEmptySegment(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Validate route shape only; Shopify resource existence is validated separately. */
export function classifyStorefrontRoute(
  slug: readonly string[],
  policyHandles: readonly string[],
): StorefrontRouteDecision {
  if (slug.length === 0) return { kind: "render" };

  const [root, second, third, fourth] = slug;
  if (!ROOT_ROUTES.has(root)) return { kind: "not-found" };

  if (root === "shipping") {
    return slug.length === 1
      ? { kind: "redirect", destination: "/policies/shipping-policy" }
      : { kind: "not-found" };
  }

  if (SINGLETON_ROUTES.has(root)) {
    return slug.length === 1 ? { kind: "render" } : { kind: "not-found" };
  }

  if (root === "products") {
    return slug.length === 2 && isNonEmptySegment(second)
      ? { kind: "render" }
      : { kind: "not-found" };
  }

  if (root === "categories" || root === "brands") {
    return (slug.length === 1 || (slug.length === 2 && isNonEmptySegment(second)))
      ? { kind: "render" }
      : { kind: "not-found" };
  }

  if (root === "business") {
    if (slug.length === 1) return { kind: "render" };
    return slug.length === 2 && isNonEmptySegment(second) && BUSINESS_SLUGS.has(second)
      ? { kind: "render" }
      : { kind: "not-found" };
  }

  if (root === "blog") {
    // /blog is the index. Article detail pages use /blog/{blogHandle}/{articleHandle}.
    if (slug.length === 1) return { kind: "render" };
    return slug.length === 3 && isNonEmptySegment(second) && isNonEmptySegment(third) && !fourth
      ? { kind: "render" }
      : { kind: "not-found" };
  }

  if (root === "policies") {
    return slug.length === 2 && isNonEmptySegment(second) && policyHandles.includes(second)
      ? { kind: "render" }
      : { kind: "not-found" };
  }

  return { kind: "not-found" };
}
