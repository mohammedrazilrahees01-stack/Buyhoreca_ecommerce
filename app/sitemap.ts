import type { MetadataRoute } from "next";
import { buildBrandDirectory, normalizeBrandKey } from "../lib/brand-directory";
import { collectPages, connectionPageFrom } from "../lib/shopify-pagination";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://buyhoreca.com").replace(/\/$/, "");
const domain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "buyhoreca.myshopify.com";
const token = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const version = process.env.SHOPIFY_API_VERSION || process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-07";
const endpoint = `https://${domain}/api/${version}/graphql.json`;

const PRODUCTS_QUERY = `query Products($first:Int!,$after:String){products(first:$first,after:$after,sortKey:UPDATED_AT,reverse:true){pageInfo{hasNextPage endCursor}nodes{handle updatedAt vendor}}}`;
const COLLECTIONS_QUERY = `query Collections($first:Int!,$after:String){collections(first:$first,after:$after,sortKey:UPDATED_AT,reverse:true){pageInfo{hasNextPage endCursor}nodes{handle updatedAt title products(first:10){nodes{vendor}}}}}`;
const BLOGS_QUERY = `query Blogs($first:Int!,$after:String){blogs(first:$first,after:$after,sortKey:TITLE){pageInfo{hasNextPage endCursor}nodes{id handle title}}}`;
const ARTICLES_QUERY = `query Articles($blog:String!,$first:Int!,$after:String){blog(handle:$blog){articles(first:$first,after:$after,sortKey:PUBLISHED_AT,reverse:true){pageInfo{hasNextPage endCursor}nodes{handle publishedAt blog{handle}}}}}`;
const SHOP_POLICIES_QUERY = `query ShopPoliciesForSitemap{shop{privacyPolicy{handle body}refundPolicy{handle body}shippingPolicy{handle body}termsOfService{handle body}}}`;
const POLICY_HANDLES = ["privacy-policy", "refund-policy", "shipping-policy", "terms-of-service"] as const;

const BUSINESS_SLUGS = [
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
  return collectPages<any>(async (after) => {
    const data: any = await gql<any>(query, { ...baseVars, first, after });
    if (!data) return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
    // Blog articles are nested under data.blog.articles; root products,
    // collections and blogs expose their connection one level up.
    const connection = connectionPageFrom<any>(data, baseVars.blog ? "blog.articles" : undefined);
    return connection || { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
  }, 100);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/", "/shop", "/categories", "/brands", "/business", "/blog", "/about", "/contact", "/faq",
    ...BUSINESS_SLUGS.map(slug => `/business/${slug}`),
  ];

  const [products, collections, blogs, policyData] = await Promise.all([
    collectPaged(PRODUCTS_QUERY, {}),
    collectPaged(COLLECTIONS_QUERY, {}),
    collectPaged(BLOGS_QUERY, {}, 50),
    gql<any>(SHOP_POLICIES_QUERY, {}),
  ]);

  const productEntries = products.map((product: any) => ({
    url: `${base}/products/${encodeURIComponent(product.handle)}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const directoryCollections = collections.map((collection: any) => ({ ...collection, vendor: String(collection.products?.nodes?.[0]?.vendor || "") }));
  const brandDirectory = buildBrandDirectory(directoryCollections).filter((item) => item.collection);
  const brandCollections = brandDirectory.map((item) => item.collection as any);
  // Exclude every Shopify collection title represented as a brand, including duplicate handles.
  const brandKeys = new Set(brandDirectory.map((item) => normalizeBrandKey(item.name)));
  const brandHandleSet = new Set([
    ...collections.filter((collection: any) => brandKeys.has(normalizeBrandKey(String(collection.title || "")))).map((collection: any) => collection.handle),
    ...brandCollections.map((collection: any) => collection.handle),
  ]);

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

  const policyEntries: MetadataRoute.Sitemap = POLICY_HANDLES.flatMap((handle) => {
    const field = handle === "privacy-policy" ? "privacyPolicy" : handle === "refund-policy" ? "refundPolicy" : handle === "shipping-policy" ? "shippingPolicy" : "termsOfService";
    const policy = policyData?.shop?.[field];
    return policy && typeof policy.body === "string" && policy.body.trim()
      ? [{ url: `${base}/policies/${handle}`, changeFrequency: "yearly" as const, priority: 0.3 }]
      : [];
  });

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
    ...policyEntries,
  ];

  return entries.filter(entry => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
