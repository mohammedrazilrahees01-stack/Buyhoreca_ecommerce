import { NextResponse } from "next/server";

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "buyhoreca.myshopify.com";
const token = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const version = process.env.SHOPIFY_API_VERSION || process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-07";
const endpoint = `https://${storeDomain}/api/${version}/graphql.json`;

export async function POST(request: Request) {
  if (!token) return NextResponse.json({ errors: [{ message: "Store connection is not configured." }] }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ errors: [{ message: "Invalid store request." }] }, { status: 400 }); }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token }, body: JSON.stringify(body), cache: "no-store", signal: controller.signal });
    clearTimeout(timeout);
    const json = await response.json();
    if (!response.ok || json?.errors?.length) return NextResponse.json({ errors: [{ message: "Store data is temporarily unavailable." }] }, { status: response.ok ? 502 : response.status });
    return NextResponse.json({ data: json.data });
  } catch { return NextResponse.json({ errors: [{ message: "Store data is temporarily unavailable." }] }, { status: 502 }); }
}
