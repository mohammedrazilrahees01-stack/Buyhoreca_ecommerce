import { NextResponse } from "next/server";

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "buyhoreca.myshopify.com";
const token = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const version = process.env.SHOPIFY_API_VERSION || process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-07";
const endpoint = `https://${storeDomain}/api/${version}/graphql.json`;
const MAX_REQUEST_BYTES = 192 * 1024;

const publicError = () => NextResponse.json({ errors: [{ message: "Store data is temporarily unavailable." }] }, { status: 502 });

export async function POST(request: Request) {
  if (!token) return NextResponse.json({ errors: [{ message: "Store connection is not configured." }] }, { status: 503 });

  // Reject oversized requests before parsing whenever the transport provides a length.
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const declaredBytes = Number(contentLength);
    if (!Number.isFinite(declaredBytes) || declaredBytes < 0) {
      return NextResponse.json({ errors: [{ message: "Invalid store request." }] }, { status: 400 });
    }
    if (declaredBytes > MAX_REQUEST_BYTES) {
      return NextResponse.json({ errors: [{ message: "Store request is too large." }] }, { status: 413 });
    }
  }

  let rawBody: string;
  try { rawBody = await request.text(); } catch { return NextResponse.json({ errors: [{ message: "Invalid store request." }] }, { status: 400 }); }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ errors: [{ message: "Store request is too large." }] }, { status: 413 });
  }

  let body: unknown;
  try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ errors: [{ message: "Invalid store request." }] }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ errors: [{ message: "Invalid store request." }] }, { status: 400 });
  }

  const input = body as { query?: unknown; variables?: unknown; operationName?: unknown };
  if (typeof input.query !== "string" || !input.query.trim() || input.query.length > 50000) {
    return NextResponse.json({ errors: [{ message: "Invalid store query." }] }, { status: 400 });
  }
  if (input.variables !== undefined && (input.variables === null || typeof input.variables !== "object" || Array.isArray(input.variables))) {
    return NextResponse.json({ errors: [{ message: "Invalid store variables." }] }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
    const json = await response.json().catch(() => null);
    if (!response.ok || json?.errors?.length) {
      return NextResponse.json({ errors: [{ message: "Store data is temporarily unavailable." }] }, { status: response.ok ? 502 : response.status });
    }
    return NextResponse.json({ data: json.data });
  } catch {
    return publicError();
  } finally {
    clearTimeout(timeout);
  }
}
