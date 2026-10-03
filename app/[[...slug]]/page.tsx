import type { Metadata } from "next";
import { Suspense } from "react";
import Storefront from "./Storefront";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://buyhoreca.com";
const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "buyhoreca.myshopify.com";
const token = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const version = process.env.SHOPIFY_API_VERSION || process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-07";
const endpoint = `https://${storeDomain}/api/${version}/graphql.json`;

async function shopifyMeta<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  if (!token) return null;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

const PRODUCT_META = `query ProductMeta($handle:String!){product(handle:$handle){title description seo{title description}featuredImage{url width height altText}vendor}}`;
const COLLECTION_META = `query CollectionMeta($handle:String!){collection(handle:$handle){title description seo{title description}image{url width height altText}}}`;
const ARTICLE_META = `query ArticleMeta($blog:String!,$handle:String!){blog(handle:$blog){articleByHandle(handle:$handle){title excerpt seo{title description}image{url width height altText}publishedAt}}}`;

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug = [] } = await params;
  const route = slug.join("/");
  const staticMeta: Record<string, { title: string; description: string }> = {
    "": {
      title: "Professional HoReCa Equipment & Supplies",
      description: "Buy professional hospitality equipment and supplies for hotels, restaurants, cafés, catering, bakery, coffee and foodservice operations.",
    },
    shop: { title: "Shop HoReCa Equipment & Supplies", description: "Browse the live BuyHoreca Shopify catalogue of commercial hospitality products, equipment and supplies." },
    categories: { title: "HoReCa Categories", description: "Explore BuyHoreca categories for kitchen, bakery, coffee, tabletop, hotel, service and foodservice operations." },
    brands: { title: "HoReCa Brands", description: "Explore professional hospitality brands available through the BuyHoreca catalogue." },
    business: { title: "Shop by Business Type", description: "Find professional hospitality supplies for hotels, restaurants, cafés, bakeries, pizzerias, catering and more." },
    blog: { title: "BuyHoreca Hospitality Insights", description: "Hospitality, kitchen, foodservice and product guidance published through the BuyHoreca Shopify blog." },
    about: { title: "About BuyHoreca", description: "Learn about BuyHoreca Trading Co. LLC, its hospitality focus, experience and regional customer support." },
    contact: { title: "Contact BuyHoreca", description: "Contact BuyHoreca for products, quotations, hospitality supply requirements and commercial support." },
    faq: { title: "BuyHoreca FAQ", description: "Frequently asked questions about products, pricing, checkout, quotations and the BuyHoreca catalogue." },
    quote: { title: "Request a HoReCa Quote", description: "Request a quotation for bulk, project, specification-sensitive or unavailable hospitality products." },
    compare: { title: "Compare HoReCa Products", description: "Compare BuyHoreca products by brand, type, availability, SKU and live pricing." },
    account: { title: "BuyHoreca Customer Account", description: "Customer account and order support for BuyHoreca shoppers." },
    "track-order": { title: "Track Your BuyHoreca Order", description: "Get order and delivery support from the BuyHoreca team." },
    shipping: { title: "Shipping & Delivery", description: "Shipping and delivery information for BuyHoreca orders and commercial requirements." },
  };

  if (slug[0] === "products" && slug[1]) {
    const data = await shopifyMeta<any>(PRODUCT_META, { handle: decodeURIComponent(slug[1]) });
    const p = data?.product;
    if (p) {
      const title = p.seo?.title || p.title;
      const description = p.seo?.description || p.description || `Shop ${p.title} from BuyHoreca.`;
      return {
        title,
        description,
        alternates: { canonical: `${baseUrl}/products/${p.handle || slug[1]}` },
        robots: { index: true, follow: true }, keywords: [p.title, p.vendor, "HoReCa", "hospitality supplies", "BuyHoreca"].filter(Boolean), openGraph: { title, description, type: "website", url: `${baseUrl}/products/${p.handle || slug[1]}`, images: p.featuredImage ? [{ url: p.featuredImage.url, width: p.featuredImage.width || 1200, height: p.featuredImage.height || 1200, alt: p.featuredImage.altText || p.title }] : undefined },
      };
    }
  }

  if (slug[0] === "categories" && slug[1]) {
    const data = await shopifyMeta<any>(COLLECTION_META, { handle: decodeURIComponent(slug[1]) });
    const c = data?.collection;
    if (c) {
      const title = c.seo?.title || c.title;
      const description = c.seo?.description || c.description || `Browse ${c.title} products at BuyHoreca.`;
      return { title, description, robots: { index: true, follow: true }, keywords: [c.title, "HoReCa", "hospitality", "BuyHoreca"], alternates: { canonical: `${baseUrl}/categories/${slug[1]}` }, openGraph: { title, description, type: "website", url: `${baseUrl}/categories/${slug[1]}`, images: c.image ? [{ url: c.image.url, width: c.image.width || 1200, height: c.image.height || 800, alt: c.image.altText || c.title }] : undefined } };
    }
  }

  if (slug[0] === "brands" && slug[1]) {
    const name = decodeURIComponent(slug[1]);
    const title = `${name} HoReCa Products`;
    const description = `Browse ${name} products available through the live BuyHoreca catalogue.`;
    return { title, description, robots: { index: true, follow: true }, keywords: [name, "HoReCa", "hospitality equipment", "BuyHoreca"], alternates: { canonical: `${baseUrl}/brands/${encodeURIComponent(name)}` }, openGraph: { title, description, type: "website", url: `${baseUrl}/brands/${encodeURIComponent(name)}` } };
  }

  if (slug[0] === "business" && slug[1]) {
    const name = slug[1].split("-").filter(Boolean).map(x => x[0]?.toUpperCase()+x.slice(1)).join(" ");
    const title = `${name} Hospitality Supplies`;
    const description = `Shop products selected for ${name.toLowerCase()} operations from the BuyHoreca catalogue.`;
    return { title, description, robots: { index: true, follow: true }, keywords: [name, "hospitality supplies", "HoReCa", "BuyHoreca"], alternates: { canonical: `${baseUrl}/business/${slug[1]}` }, openGraph: { title, description, type: "website", url: `${baseUrl}/business/${slug[1]}` } };
  }

  if (slug[0] === "blog" && slug[1] && slug[2]) {
    const data = await shopifyMeta<any>(ARTICLE_META, { blog: decodeURIComponent(slug[1]), handle: decodeURIComponent(slug[2]) });
    const a = data?.blog?.articleByHandle;
    if (a) {
      const title = a.seo?.title || a.title;
      const description = a.seo?.description || a.excerpt || `Read ${a.title} from the BuyHoreca Hospitality Insights journal.`;
      return { title, description, robots: { index: true, follow: true }, keywords: [a.title, "hospitality", "foodservice", "BuyHoreca"], alternates: { canonical: `${baseUrl}/blog/${slug[1]}/${slug[2]}` }, openGraph: { title, description, type: "article", url: `${baseUrl}/blog/${slug[1]}/${slug[2]}`, images: a.image ? [{ url: a.image.url, width: a.image.width || 1200, height: a.image.height || 800, alt: a.image.altText || a.title }] : undefined } };
    }
  }

  if (route === "collections") {
    return { title: "Categories", description: "Explore the live BuyHoreca collections.", robots: { index: false, follow: true }, alternates: { canonical: `${baseUrl}/categories` } };
  }

  const m = staticMeta[route] || { title: "BuyHoreca", description: "Professional HoReCa equipment and supplies for hospitality businesses." };
  const noIndex = ["search","cart","wishlist","compare","account","track-order"].includes(route);
  return { title: m.title, description: m.description, robots: noIndex ? { index: false, follow: true } : undefined, alternates: { canonical: `${baseUrl}/${route}`.replace(/\/$/, "") || baseUrl } };
}

export default function Page() {
  return <Suspense fallback={<div className="min-h-screen bg-white" aria-label="Loading BuyHoreca" />}><Storefront /></Suspense>;
}
