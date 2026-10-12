import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://buyhoreca.com").replace(/\/$/, "");
const domain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "buyhoreca.myshopify.com";
const token = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const version = process.env.SHOPIFY_API_VERSION || process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-07";
const endpoint = `https://${domain}/api/${version}/graphql.json`;

const PRODUCTS_QUERY = `query Products($first:Int!,$after:String){products(first:$first,after:$after,sortKey:UPDATED_AT,reverse:true){pageInfo{hasNextPage endCursor}nodes{handle updatedAt vendor}}}`;
const COLLECTIONS_QUERY = `query Collections($first:Int!,$after:String){collections(first:$first,after:$after,sortKey:UPDATED_AT,reverse:true){pageInfo{hasNextPage endCursor}nodes{handle updatedAt title products(first:10){nodes{vendor}}}}}`;
const BLOGS_QUERY = `query Blogs($first:Int!,$after:String){blogs(first:$first,after:$after,sortKey:TITLE){pageInfo{hasNextPage endCursor}nodes{id handle title}}}`;
const ARTICLES_QUERY = `query Articles($blog:String!,$first:Int!,$after:String){blog(handle:$blog){articles(first:$first,after:$after,sortKey:PUBLISHED_AT,reverse:true){pageInfo{hasNextPage endCursor}nodes{handle publishedAt blog{handle}}}}}`;

const BUSINESS_SLUGS = [
  "hotel", "bakery", "coffee-shop", "bar-supplies", "pizzeria", "ice-cream-shop",
  "restaurant", "catering", "banquet", "kitchen-operations", "retail-store", "food-truck",
];

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  if (!token) return null;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 900 },
    });
    if (!response.ok) return null;
    const json = await response.json();
    if (json.errors?.length || !json.data) return null;
    return json.data as T;
  } catch {
    return null;
  }
}

async function collectPaged(query: string, baseVars: Record<string, unknown>, first = 250) {
  let after: string | null = null;
  const nodes: any[] = [];
  while (true) {
    const data: any = await gql<any>(query, { ...baseVars, first, after });
    if (!data) break;
    const connection = Object.values(data).find((value: any) => value && typeof value === "object" && "pageInfo" in value) as any;
    if (!connection) break;
    nodes.push(...(connection.nodes || []));
    if (!connection.pageInfo?.hasNextPage || !connection.pageInfo?.endCursor) break;
    after = connection.pageInfo.endCursor;
  }
  return nodes;
}

function brandKey(value: string): string {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/", "/shop", "/categories", "/brands", "/business", "/blog", "/about", "/contact", "/faq", "/shipping", "/quote",
    ...BUSINESS_SLUGS.map(slug => `/business/${slug}`),
  ];

  const [products, collections, blogs] = await Promise.all([
    collectPaged(PRODUCTS_QUERY, {}),
    collectPaged(COLLECTIONS_QUERY, {}),
    collectPaged(BLOGS_QUERY, {}, 50),
  ]);

  const productEntries = products.map((product: any) => ({
    url: `${base}/products/${encodeURIComponent(product.handle)}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const brandCollections = collections.filter((collection: any) => {
    const titleKey = brandKey(String(collection.title || ""));
    const vendorKeys = (collection.products?.nodes || []).map((p: any) => brandKey(String(p?.vendor || ""))).filter(Boolean);
    return titleKey && titleKey !== brandKey("BuyHoreca") && vendorKeys.length > 0 && vendorKeys.every((key: string) => key === titleKey);
  });
  const brandHandleSet = new Set(brandCollections.map((collection: any) => collection.handle));

  const categoryEntries = collections.filter((collection: any) => !brandHandleSet.has(collection.handle)).map((collection: any) => ({
    url: `${base}/categories/${encodeURIComponent(collection.handle)}`,
    lastModified: collection.updatedAt ? new Date(collection.updatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const brandEntries = brandCollections.map((collection: any) => ({
    url: `${base}/brands/${encodeURIComponent(collection.handle)}`,
    lastModified: collection.updatedAt ? new Date(collection.updatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = [];
  for (const blog of blogs) {
    const articles = await collectPaged(ARTICLES_QUERY, { blog: blog.handle }, 250);
    for (const article of articles) {
      const blogHandle = article.blog?.handle || blog.handle;
      articleEntries.push({
        url: `${base}/blog/${encodeURIComponent(blogHandle)}/${encodeURIComponent(article.handle)}`,
        lastModified: article.publishedAt ? new Date(article.publishedAt) : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      });
    }
  }

  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.map(url => ({
      url: `${base}${url}`,
      changeFrequency: url === "/" ? "daily" as const : "weekly" as const,
      priority: url === "/" ? 1 : 0.6,
    })),
    ...productEntries,
    ...categoryEntries,
    ...brandEntries,
    ...articleEntries,
  ];

  return entries.filter(entry => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
