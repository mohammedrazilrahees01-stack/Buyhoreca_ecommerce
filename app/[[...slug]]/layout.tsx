import type { Metadata } from "next";

type RouteParams = { slug?: string[] };
type SearchParams = Record<string, string | string[] | undefined>;

const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://buyhoreca.com").replace(/\/$/, "");
const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "buyhoreca.myshopify.com";
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const version = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-07";

const defaults = {
  title: "BuyHoreca | Professional HoReCa Equipment & Supplies",
  description: "Professional HoReCa equipment and supplies for hospitality, kitchens, coffee, bakery, hotel, service and foodservice operations in the UAE.",
  image: "/images/hero/hero-main.jpg",
};

function titleFromSlug(value: string) {
  return value.split("-").filter(Boolean).map(part => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function trimDescription(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 160);
}

async function shopify<T>(query: string, variables: Record<string, string>): Promise<T | null> {
  if (!token) return null;
  try {
    const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 900 },
    });
    if (!response.ok) return null;
    const body = await response.json();
    if (body.errors?.length) return null;
    return body.data as T;
  } catch {
    return null;
  }
}

async function getResourceMetadata(kind: "product" | "collection", handle: string) {
  const query = kind === "product"
    ? `query ProductSeo($handle:String!){product(handle:$handle){title description seo{title description} featuredImage{url}}}`
    : `query CollectionSeo($handle:String!){collection(handle:$handle){title description image{url}}}`;
  const data = await shopify<any>(query, { handle });
  const resource = kind === "product" ? data?.product : data?.collection;
  if (!resource) return null;
  return {
    title: kind === "product" ? resource.seo?.title || resource.title : resource.title,
    description: trimDescription(resource.seo?.description || resource.description || `Shop ${resource.title} at BuyHoreca.`),
    image: resource.featuredImage?.url || resource.image?.url || defaults.image,
  };
}

function coreMetadata(pathname: string) {
  const metadata: Record<string, { title: string; description: string }> = {
    "/": defaults,
    "/shop": { title: "Shop HoReCa Equipment & Supplies | BuyHoreca", description: "Shop professional kitchen, coffee, bakery, hotel and foodservice equipment and supplies from BuyHoreca in the UAE." },
    "/categories": { title: "HoReCa Equipment Categories | BuyHoreca", description: "Browse BuyHoreca categories for professional kitchen, hospitality and foodservice equipment in the UAE." },
    "/collections": { title: "HoReCa Collections | BuyHoreca", description: "Explore curated BuyHoreca collections of professional hospitality and foodservice supplies." },
    "/business": { title: "Shop by Business | HoReCa Equipment | BuyHoreca", description: "Find professional HoReCa equipment and supplies for hotels, bakeries, cafes, restaurants and foodservice businesses." },
    "/brands": { title: "Brands | Professional HoReCa Equipment | BuyHoreca", description: "Explore professional HoReCa equipment and supplies from trusted hospitality brands at BuyHoreca." },
    "/about": { title: "About BuyHoreca | Professional HoReCa Supply", description: "Learn about BuyHoreca, a UAE-focused marketplace for professional hospitality equipment and foodservice supplies." },
    "/contact": { title: "Contact BuyHoreca | Dubai, UAE", description: "Contact BuyHoreca in Dubai for professional HoReCa equipment, supplies, delivery and commercial support." },
    "/blogs": { title: "HoReCa Buying Guides & Blogs | BuyHoreca", description: "Read BuyHoreca buying guides and articles for hospitality, kitchen, coffee, bakery and foodservice operations." },
    "/faq": { title: "FAQ | BuyHoreca", description: "Find answers about BuyHoreca delivery, orders, returns, warranties, quotations and customer support." },
    "/shipping": { title: "Shipping & Delivery | BuyHoreca", description: "Learn about BuyHoreca UAE delivery, next-day options, international shipping and order updates." },
    "/information": { title: "Customer Information | BuyHoreca", description: "Find BuyHoreca policies, support information, shipping details and useful customer links." },
    "/policies/terms": { title: "Terms & Conditions | BuyHoreca", description: "Read the BuyHoreca terms and conditions for using the website and placing orders." },
    "/policies/privacy": { title: "Privacy Policy | BuyHoreca", description: "Read how BuyHoreca collects, uses, protects and retains customer information." },
    "/policies/order": { title: "Order Policy | BuyHoreca", description: "Review BuyHoreca order confirmation, payment, delivery, cancellation and tracking policies." },
    "/policies/returns": { title: "Warranty & Returns | BuyHoreca", description: "Review BuyHoreca warranty, returns, replacements, repairs and refund information." },
    "/search": { title: "Search | BuyHoreca", description: "Search the BuyHoreca catalogue for professional hospitality and foodservice products." },
    "/cart": { title: "Cart | BuyHoreca", description: "Review your BuyHoreca product selections before secure checkout." },
    "/wishlist": { title: "Wishlist | BuyHoreca", description: "Review your saved BuyHoreca products." },
    "/compare": { title: "Compare Products | BuyHoreca", description: "Compare professional HoReCa products from BuyHoreca." },
    "/quote": { title: "Request a Quote | BuyHoreca", description: "Request a commercial quote for professional HoReCa equipment and supplies." },
    "/track-order": { title: "Track Your Order | BuyHoreca", description: "Track your BuyHoreca order using your order number and email address." },
  };
  return metadata[pathname] || null;
}

export async function generateMetadata({ params, searchParams }: { params: Promise<RouteParams>; searchParams?: Promise<SearchParams> }): Promise<Metadata> {
  const [{ slug = [] }, query] = await Promise.all([params, searchParams || Promise.resolve({} as SearchParams)]);
  const pathname = `/${slug.join("/")}`.replace(/\/$/, "") || "/";
  const utility = ["/search", "/cart", "/wishlist", "/compare", "/quote", "/track-order"].includes(pathname) || Boolean(query.q);
  const productHandle = pathname.startsWith("/products/") ? slug[1] : undefined;
  const collectionHandle = pathname.startsWith("/categories/") ? slug[1] : undefined;
  const resource = productHandle
    ? await getResourceMetadata("product", productHandle)
    : collectionHandle
      ? await getResourceMetadata("collection", collectionHandle)
      : null;
  const core = coreMetadata(pathname);
  const title = resource?.title
    ? `${resource.title} | BuyHoreca`
    : core?.title || (pathname.startsWith("/business/") ? `${titleFromSlug(slug[1] || "")} Equipment & Supplies | BuyHoreca` : pathname.startsWith("/brands/") ? `${titleFromSlug(slug[1] || "")} | BuyHoreca` : defaults.title);
  const description = resource?.description || core?.description || defaults.description;
  const image = resource?.image || defaults.image;
  const canonical = `${site}${pathname === "/" ? "/" : pathname}`;

  return {
    metadataBase: new URL(site),
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: utility ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { type: productHandle ? "website" : "website", siteName: "BuyHoreca", title, description, url: canonical, images: [{ url: image }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function SlugLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}