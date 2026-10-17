import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Storefront from "./Storefront";
import { getCuratedBrandByName, getCuratedBrandBySlug } from "../../lib/brand-directory";
import { serializeJsonLd } from "../../lib/json-ld";
import { POLICY_ROUTES, policyHtmlToText } from "../../lib/shopify-policies";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://buyhoreca.com").replace(/\/$/, "");
const storeDomain = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "buyhoreca.myshopify.com";
const token = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const version = process.env.SHOPIFY_API_VERSION || process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-07";
const endpoint = `https://${storeDomain}/api/${version}/graphql.json`;

const DEFAULT_OG_IMAGE = `${baseUrl}/og-image.png`;
const DEFAULT_SITE_DESCRIPTION = "Professional HoReCa equipment and supplies for hospitality, kitchens, coffee, bakery, hotel, service and foodservice operations.";

function fitText(value: string, max: number): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const boundary = cut.lastIndexOf(" ");
  return `${(boundary > Math.max(20, max - 18) ? cut.slice(0, boundary) : cut.slice(0, max)).trim()}…`;
}

function fitTitle(value: string): string {
  // Leave room for the root title template: " | BuyHoreca".
  return fitText(value, 48);
}

function fitDescription(value: string): string {
  return fitText(value, 155);
}

function absoluteUrl(pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl, `${baseUrl}/`).toString();
  } catch {
    return DEFAULT_OG_IMAGE;
  }
}

type ShopifyResult<T> = { ok: true; data: T } | { ok: false };

async function shopifyMeta<T>(query: string, variables: Record<string, unknown>): Promise<ShopifyResult<T>> {
  if (!token) return { ok: false };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return { ok: false };
    const json = await res.json();
    if (json.errors?.length || !json.data) return { ok: false };
    return { ok: true, data: json.data as T };
  } catch {
    return { ok: false };
  }
}

const PRODUCT_META = `query ProductMeta($handle:String!){product(handle:$handle){handle title description seo{title description}featuredImage{url width height altText}vendor}}`;
const COLLECTION_META = `query CollectionMeta($handle:String!){collection(handle:$handle){handle title description seo{title description}image{url width height altText}products(first:10){nodes{vendor handle title}}}}`;
const BRAND_META = `query BrandMeta($handle:String!){collection(handle:$handle){handle title description seo{title description}image{url width height altText}products(first:10){nodes{vendor handle title}}}}`;
const ARTICLE_META = `query ArticleMeta($blog:String!,$handle:String!){blog(handle:$blog){articleByHandle(handle:$handle){handle title excerpt seo{title description}image{url width height altText}publishedAt updatedAt}}}`;

const PRODUCT_EXISTS = `query ProductExists($handle:String!){product(handle:$handle){id}}`;
const COLLECTION_EXISTS = `query CollectionExists($handle:String!){collection(handle:$handle){id title products(first:10){nodes{vendor}}}}`;
const BRAND_EXISTS = `query BrandExists($handle:String!){collection(handle:$handle){id title products(first:10){nodes{vendor}}}}`;
const ARTICLE_EXISTS = `query ArticleExists($blog:String!,$handle:String!){blog(handle:$blog){articleByHandle(handle:$handle){id}}}`;

const PRODUCT_SCHEMA = `query ProductSchema($handle:String!){product(handle:$handle){handle title description vendor productType seo{title description}featuredImage{url width height altText}images(first:10){nodes{url width height altText}}variants(first:100){nodes{id sku availableForSale price{amount currencyCode} compareAtPrice{amount currencyCode}}}reviewRating:metafield(namespace:"reviews",key:"rating"){value}reviewRatingCount:metafield(namespace:"reviews",key:"rating_count"){value}}}`;
const COLLECTION_SCHEMA = `query CollectionSchema($handle:String!){collection(handle:$handle){handle title description seo{title description}image{url width height altText}products(first:10){nodes{vendor handle title}}}}`;
const ARTICLE_SCHEMA = `query ArticleSchema($blog:String!,$handle:String!){blog(handle:$blog){articleByHandle(handle:$handle){handle title excerpt contentHtml seo{title description}image{url width height altText}publishedAt updatedAt blog{handle title}}}}`;
const SHOP_POLICIES_META = `query ShopPoliciesMeta{shop{privacyPolicy{title body url}refundPolicy{title body url}shippingPolicy{title body url}termsOfService{title body url}}}`;


const BUSINESS_SLUGS = new Set([
  "cafe-coffee-shop", "restaurant", "hotel", "bakery-pastry", "bar-lounge",
  "catering-banqueting", "fast-food-qsr", "school-institution", "corporate-office-catering", "event-hospitality",
]);

const NO_INDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};

function ogImages(image: any, alt: string) {
  return [{
    url: absoluteUrl(image?.url || DEFAULT_OG_IMAGE),
    width: image?.width || 1200,
    height: image?.height || 630,
    alt: image?.altText || alt,
  }];
}

function metadataFor({
  title,
  description,
  url,
  type = "website",
  image,
  robots,
  keywords = [],
}: {
  title: string;
  description: string;
  url: string;
  type?: "website" | "article";
  image?: any;
  robots?: Metadata["robots"];
  keywords?: string[];
}): Metadata {
  const safeTitle = fitTitle(title);
  const safeDescription = fitDescription(description);
  return {
    title: safeTitle,
    description: safeDescription,
    robots,
    keywords: keywords.filter(Boolean).slice(0, 12),
    alternates: { canonical: url },
    openGraph: {
      title: safeTitle,
      description: safeDescription,
      type,
      url,
      siteName: "BuyHoreca",
      images: ogImages(image, safeTitle),
    },
    twitter: {
      card: "summary_large_image",
      title: safeTitle,
      description: safeDescription,
      images: [absoluteUrl(image?.url || DEFAULT_OG_IMAGE)],
    },
  };
}

const STATIC_META: Record<string, { title: string; description: string }> = {
  "": { title: "Professional HoReCa Equipment & Supplies", description: "Buy professional hospitality equipment and supplies for hotels, restaurants, cafés, catering, bakery, coffee and foodservice operations." },
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

const ROOT_ROUTES = new Set(["", "shop", "categories", "collections", "products", "brands", "business", "search", "cart", "wishlist", "compare", "quote", "about", "contact", "faq", "shipping", "account", "track-order", "blog", "policies"]);

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug = [] } = await params;
  const route = slug.join("/");

  if (slug[0] === "products" && slug[1]) {
    const handle = decodeURIComponent(slug[1]);
    const result = await shopifyMeta<any>(PRODUCT_META, { handle });
    if (result.ok && result.data?.product) {
      const p = result.data.product;
      const title = p.seo?.title || p.title;
      const description = p.seo?.description || p.description || `Shop ${p.title} from BuyHoreca.`;
      const canonical = `${baseUrl}/products/${encodeURIComponent(p.handle || handle)}`;
      return metadataFor({ title, description, url: canonical, image: p.featuredImage, keywords: [p.title, p.vendor, "HoReCa", "hospitality supplies", "BuyHoreca"] });
    }
  }

  if (slug[0] === "categories" && slug[1]) {
    const handle = decodeURIComponent(slug[1]);
    const result = await shopifyMeta<any>(COLLECTION_META, { handle });
    if (result.ok && result.data?.collection) {
      const c = result.data.collection;
      const title = c.seo?.title || c.title;
      const description = c.seo?.description || c.description || `Browse ${c.title} products at BuyHoreca.`;
      const categoryBrandKey = String(c.title || "").trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
      const vendorKey = String(c.products?.nodes?.[0]?.vendor || "").trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
      const isBrandCollection = Boolean(categoryBrandKey && vendorKey && categoryBrandKey === vendorKey && vendorKey !== "buyhoreca");
      const canonical = `${baseUrl}/${isBrandCollection ? "brands" : "categories"}/${encodeURIComponent(c.handle || handle)}`;
      return metadataFor({ title, description, url: canonical, image: c.image, robots: isBrandCollection ? NO_INDEX_ROBOTS : undefined, keywords: [c.title, "HoReCa", "hospitality", "BuyHoreca"] });
    }
  }

  if (slug[0] === "brands" && slug[1]) {
    const handle = decodeURIComponent(slug[1]);
    const result = await shopifyMeta<any>(BRAND_META, { handle });
    if (result.ok && result.data?.collection) {
      const c = result.data.collection;
      const title = c.seo?.title || `${c.title} HoReCa Products`;
      const description = c.seo?.description || c.description || `Browse ${c.title} products available through the live BuyHoreca catalogue.`;
      const canonical = `${baseUrl}/brands/${encodeURIComponent(c.handle || handle)}`;
      return metadataFor({ title, description, url: canonical, image: c.image, keywords: [c.title, "HoReCa", "hospitality equipment", "BuyHoreca"] });
    }
    const plannedBrand = getCuratedBrandBySlug(handle);
    if (plannedBrand) {
      return metadataFor({
        title: `${plannedBrand.name} HoReCa Products`,
        description: `Explore ${plannedBrand.name} through the BuyHoreca brand directory. Its dedicated product collection is being prepared; contact BuyHoreca for availability and bulk quotations.`,
        url: `${baseUrl}/brands/${encodeURIComponent(plannedBrand.slug)}`,
        robots: NO_INDEX_ROBOTS,
        keywords: [plannedBrand.name, "HoReCa", "hospitality equipment", "BuyHoreca"],
      });
    }
  }

  if (slug[0] === "business" && slug[1]) {
    const name = slug[1].split("-").filter(Boolean).map(x => x[0]?.toUpperCase() + x.slice(1)).join(" ");
    const title = `${name} Hospitality Supplies`;
    const description = `Shop products selected for ${name.toLowerCase()} operations from the BuyHoreca catalogue.`;
    return metadataFor({ title, description, url: `${baseUrl}/business/${encodeURIComponent(slug[1])}`, keywords: [name, "hospitality supplies", "HoReCa", "BuyHoreca"] });
  }

  if (slug[0] === "blog" && slug[1] && slug[2]) {
    const blog = decodeURIComponent(slug[1]);
    const handle = decodeURIComponent(slug[2]);
    const result = await shopifyMeta<any>(ARTICLE_META, { blog, handle });
    if (result.ok && result.data?.blog?.articleByHandle) {
      const a = result.data.blog.articleByHandle;
      const title = a.seo?.title || a.title;
      const description = a.seo?.description || a.excerpt || `Read ${a.title} from the BuyHoreca Hospitality Insights journal.`;
      const canonical = `${baseUrl}/blog/${encodeURIComponent(blog)}/${encodeURIComponent(a.handle || handle)}`;
      return metadataFor({ title, description, url: canonical, type: "article", image: a.image, keywords: [a.title, "hospitality", "foodservice", "BuyHoreca"] });
    }
  }

  if (route === "collections") {
    return metadataFor({ title: "Categories", description: "Explore the live BuyHoreca collections.", url: `${baseUrl}/categories`, robots: NO_INDEX_ROBOTS });
  }

  if (slug.length === 2 && slug[0] === "policies") {
    const handle = decodeURIComponent(slug[1]);
    const config = POLICY_ROUTES[handle];
    if (!config) return metadataFor({ title: "Policy not found", description: "This BuyHoreca policy page is not available.", url: `${baseUrl}/policies/${encodeURIComponent(handle)}`, robots: NO_INDEX_ROBOTS });
    const result = await shopifyMeta<any>(SHOP_POLICIES_META, {});
    const policy = result.ok ? result.data?.shop?.[config.key] : null;
    const bodyText = policyHtmlToText(String(policy?.body || ""));
    return metadataFor({
      title: String(policy?.title || config.title),
      description: bodyText ? bodyText.slice(0, 155) : config.description,
      url: `${baseUrl}/policies/${handle}`,
      robots: bodyText ? undefined : NO_INDEX_ROBOTS,
      keywords: [config.title, "BuyHoreca", "HoReCa"],
    });
  }

  const meta = STATIC_META[route] || { title: "BuyHoreca", description: DEFAULT_SITE_DESCRIPTION };
  const noIndex = ["search", "cart", "wishlist", "compare", "account", "track-order", "quote"].includes(route);
  const canonical = route ? `${baseUrl}/${route}` : baseUrl;
  return metadataFor({ title: meta.title, description: meta.description, url: canonical, robots: noIndex ? NO_INDEX_ROBOTS : undefined });
}

function businessNameFromSlug(slug: string): string {
  return slug.split("-").filter(Boolean).map(x => x[0]?.toUpperCase() + x.slice(1)).join(" ");
}

function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })),
  };
}

async function buildStructuredData(slug: string[]): Promise<Record<string, unknown>[]> {
  try {
    if (slug.length === 2 && slug[0] === "products") {
      const handle = decodeURIComponent(slug[1]);
      const result = await shopifyMeta<any>(PRODUCT_SCHEMA, { handle });
      const p = result.ok ? result.data?.product : null;
      if (!p) return [];
      const variants = Array.isArray(p.variants?.nodes) ? p.variants.nodes : [];
      const prices = variants.map((v: any) => Number(v.price?.amount)).filter((v: number) => Number.isFinite(v) && v > 0);
      const available = variants.some((v: any) => !!v.availableForSale);
      const rating = Number(p.reviewRating?.value);
      const ratingCount = Number(p.reviewRatingCount?.value);
      const productSchema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.title,
        description: p.description || undefined,
        ...(p.productType ? { category: p.productType } : {}),
        sku: variants[0]?.sku || undefined,
        brand: p.vendor ? { "@type": "Brand", name: p.vendor } : undefined,
        image: (p.images?.nodes?.length ? p.images.nodes : p.featuredImage ? [p.featuredImage] : []).map((x: any) => absoluteUrl(x.url)),
        url: `${baseUrl}/products/${encodeURIComponent(p.handle || handle)}`,
        offers: prices.length ? {
          "@type": prices.length > 1 ? "AggregateOffer" : "Offer",
          priceCurrency: variants[0]?.price?.currencyCode || "AED",
          ...(prices.length > 1 ? { lowPrice: Math.min(...prices).toFixed(2), highPrice: Math.max(...prices).toFixed(2), offerCount: prices.length } : { price: prices[0].toFixed(2) }),
          availability: `https://schema.org/${available ? "InStock" : "OutOfStock"}`,
          itemCondition: "https://schema.org/NewCondition",
          url: `${baseUrl}/products/${encodeURIComponent(p.handle || handle)}`,
        } : undefined,
        ...(Number.isFinite(rating) && rating > 0 && Number.isFinite(ratingCount) && ratingCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating, ratingCount } } : {}),
      };
      return [productSchema, breadcrumbSchema([
        { name: "Home", url: `${baseUrl}/` },
        { name: "Products", url: `${baseUrl}/shop` },
        { name: p.title, url: `${baseUrl}/products/${encodeURIComponent(p.handle || handle)}` },
      ])];
    }

    if ((slug.length === 2 && slug[0] === "categories") || (slug.length === 2 && slug[0] === "brands")) {
      const handle = decodeURIComponent(slug[1]);
      const result = await shopifyMeta<any>(COLLECTION_SCHEMA, { handle });
      const c = result.ok ? result.data?.collection : null;
      if (!c) return [];
      const prefix = slug[0] === "brands" ? "brands" : "categories";
      const pageUrl = `${baseUrl}/${prefix}/${encodeURIComponent(c.handle || handle)}`;
      const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: c.title,
        description: c.description || `Browse ${c.title} products at BuyHoreca.`,
        url: pageUrl,
        ...(c.image?.url ? { image: absoluteUrl(c.image.url) } : {}),
      };
      const itemNodes = Array.isArray(c.products?.nodes) ? c.products.nodes.filter((p: any) => p?.handle && p?.title) : [];
      const itemList = itemNodes.length ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${c.title} products`,
        itemListElement: itemNodes.slice(0, 10).map((p: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${baseUrl}/products/${encodeURIComponent(p.handle)}`,
          name: p.title,
        })),
      } : null;
      return [schema, ...(itemList ? [itemList] : []), breadcrumbSchema([
        { name: "Home", url: `${baseUrl}/` },
        { name: prefix === "brands" ? "Brands" : "Categories", url: `${baseUrl}/${prefix}` },
        { name: c.title, url: `${baseUrl}/${prefix}/${encodeURIComponent(c.handle || handle)}` },
      ])];
    }

    if (slug.length === 3 && slug[0] === "blog") {
      const blog = decodeURIComponent(slug[1]);
      const handle = decodeURIComponent(slug[2]);
      const result = await shopifyMeta<any>(ARTICLE_SCHEMA, { blog, handle });
      const a = result.ok ? result.data?.blog?.articleByHandle : null;
      if (!a) return [];
      const articleSchema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: a.title,
        description: a.excerpt || undefined,
        datePublished: a.publishedAt || undefined,
        dateModified: a.updatedAt || a.publishedAt || undefined,
        mainEntityOfPage: `${baseUrl}/blog/${encodeURIComponent(a.blog?.handle || blog)}/${encodeURIComponent(a.handle || handle)}`,
        ...(a.image?.url ? { image: [absoluteUrl(a.image.url)] } : {}),
        publisher: { "@type": "Organization", name: "BuyHoreca", url: `${baseUrl}/`, logo: { "@type": "ImageObject", url: `${baseUrl}/images/buyhoreca-logo-header.png` } },
      };
      return [articleSchema, breadcrumbSchema([
        { name: "Home", url: `${baseUrl}/` },
        { name: "Blog", url: `${baseUrl}/blog` },
        { name: a.title, url: `${baseUrl}/blog/${encodeURIComponent(a.blog?.handle || blog)}/${encodeURIComponent(a.handle || handle)}` },
      ])];
    }

    if (slug.length === 2 && slug[0] === "business") {
      const name = businessNameFromSlug(slug[1]);
      const url = `${baseUrl}/business/${encodeURIComponent(slug[1])}`;
      return [{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${name} Hospitality Supplies`,
        description: `Shop products selected for ${name.toLowerCase()} operations from the BuyHoreca catalogue.`,
        url,
      }, breadcrumbSchema([
        { name: "Home", url: `${baseUrl}/` },
        { name: "Shop by Business", url: `${baseUrl}/business` },
        { name, url },
      ])];
    }
  } catch {
    return [];
  }
  return [];
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  if (slug.length === 1 && slug[0] === "shipping") redirect("/policies/shipping-policy");
  if (slug.length > 0 && !ROOT_ROUTES.has(slug[0])) notFound();
  if (slug[0] === "policies" && (slug.length !== 2 || !POLICY_ROUTES[decodeURIComponent(slug[1] || "")])) notFound();

  if (slug[0] === "products") {
    if (slug.length !== 2) notFound();
    const result = await shopifyMeta<any>(PRODUCT_EXISTS, { handle: decodeURIComponent(slug[1]) });
    if (result.ok && !result.data?.product) notFound();
  }

  if (slug[0] === "categories") {
    if (slug.length > 2) notFound();
    if (slug[1]) {
      const result = await shopifyMeta<any>(COLLECTION_EXISTS, { handle: decodeURIComponent(slug[1]) });
      if (result.ok && !result.data?.collection) notFound();
    }
  }

  if (slug[0] === "brands") {
    if (slug.length > 2) notFound();
    if (slug[1]) {
      const result = await shopifyMeta<any>(BRAND_EXISTS, { handle: decodeURIComponent(slug[1]) });
      const collection = result.ok ? result.data?.collection : null;
      const titleKey = String(collection?.title || "").trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
      const vendorKey = String(collection?.products?.nodes?.[0]?.vendor || "").trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
      const validBrand = Boolean(collection && titleKey && vendorKey && titleKey === vendorKey && vendorKey !== "buyhoreca");
      const knownBrand = getCuratedBrandBySlug(decodeURIComponent(slug[1])) || (collection ? getCuratedBrandByName(String(collection.title || "")) : undefined);
      if (result.ok && !validBrand && !knownBrand) notFound();
    }
  }

  if (slug[0] === "business") {
    if (slug.length > 2 || (slug[1] && !BUSINESS_SLUGS.has(slug[1]))) notFound();
  }

  if (slug[0] === "blog") {
    if (slug.length !== 3) notFound();
    const result = await shopifyMeta<any>(ARTICLE_EXISTS, { blog: decodeURIComponent(slug[1]), handle: decodeURIComponent(slug[2]) });
    if (result.ok && !result.data?.blog?.articleByHandle) notFound();
  }

  if (["shop", "collections", "search", "cart", "wishlist", "compare", "quote", "about", "contact", "faq", "shipping", "account", "track-order"].includes(slug[0] || "") && slug.length !== 1) notFound();

  const structuredData = await buildStructuredData(slug);
  return (
    <>
      {structuredData.map((schema, index) => (
        <script key={`schema-${index}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      ))}
      <Suspense fallback={<div className="min-h-screen bg-white" aria-label="Loading BuyHoreca" />}>
        <Storefront />
      </Suspense>
    </>
  );
}
