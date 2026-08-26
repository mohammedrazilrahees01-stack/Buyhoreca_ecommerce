import type { MetadataRoute } from "next";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "buyhoreca.myshopify.com";
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const version = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-07";
const apiUrl = `https://${domain}/api/${version}/graphql.json`;
const site = "https://buyhoreca.com";

async function shopify<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!token) throw new Error("Missing Shopify storefront configuration");
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || data.errors?.length) throw new Error("Shopify sitemap query failed");
  return data.data as T;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const core: MetadataRoute.Sitemap = [
    "", "shop", "categories", "business", "brands", "collections", "about", "contact", "blogs", "faq", "quote", "track-order", "policies/terms", "policies/privacy", "policies/order", "policies/returns"
  ].map(path => ({ url: `${site}/${path}`, changeFrequency: "daily", priority: path === "" ? 1 : 0.6 }));

  const products: MetadataRoute.Sitemap = [];
  const collections: MetadataRoute.Sitemap = [];
  let after: string | null = null;
  let guard = 0;
  const productQuery = `query Products($first:Int!,$after:String){products(first:$first,after:$after){pageInfo{hasNextPage endCursor}nodes{handle updatedAt}}}`;
  do {
    const result: any = await shopify<any>(productQuery, { first: 250, after });
    for (const p of result.products.nodes ?? []) products.push({ url: `${site}/products/${p.handle}`, lastModified: p.updatedAt, changeFrequency: "daily", priority: 0.8 });
    after = result.products.pageInfo.hasNextPage ? result.products.pageInfo.endCursor : null;
    guard++;
  } while (after && guard < 100);

  after = null; guard = 0;
  const collectionQuery = `query Collections($first:Int!,$after:String){collections(first:$first,after:$after){pageInfo{hasNextPage endCursor}nodes{handle updatedAt}}}`;
  do {
    const result: any = await shopify<any>(collectionQuery, { first: 250, after });
    for (const c of result.collections.nodes ?? []) collections.push({ url: `${site}/categories/${c.handle}`, lastModified: c.updatedAt, changeFrequency: "daily", priority: 0.7 });
    after = result.collections.pageInfo.hasNextPage ? result.collections.pageInfo.endCursor : null;
    guard++;
  } while (after && guard < 100);

  return [...core, ...collections, ...products];
}
