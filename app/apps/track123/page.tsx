import { redirect } from "next/navigation";

type TrackingSearchParams = Record<string, string | string[] | undefined>;

/** Compatibility route for the former Shopify Track123 app-proxy URL. */
export default async function Track123CompatibilityPage({
  searchParams,
}: {
  searchParams: Promise<TrackingSearchParams>;
}) {
  const supplied = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(supplied)) {
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
  }
  const suffix = query.toString();
  redirect(`/track-order${suffix ? `?${suffix}` : ""}`);
}
