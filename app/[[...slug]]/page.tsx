 "use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Lenis from "lenis";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowRight, Building2, Check, ChevronDown, ChevronRight, Coffee, Eye, FileText,
  Heart, Layers3, Mail, MapPin, Menu, MessageCircle, Minus, Package, Phone,
  Plus, RotateCcw, Search, ShieldCheck, ShoppingBag, SlidersHorizontal,
  Smartphone, Store, Trash2, Truck, Utensils, X, ChefHat, Hotel, Globe2,
  IceCreamBowl, Wine, ExternalLink, RefreshCw
} from "lucide-react";

/*
  BUYHORECA — LIVE SHOPIFY STOREFRONT
  -------------------------------------------------
  Single application file.
  Source of truth:
    Shopify Storefront API → products / variants / prices / media /
    collections / search / cart / blogs / articles.

  Required public env vars:
    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
    NEXT_PUBLIC_SHOPIFY_API_VERSION   (recommended: 2026-07)

  The public Storefront token is safe for browser use. Never expose a
  Shopify private access token here.
*/

type Money = { amount: string; currencyCode: string };
type ImageData = { url: string; altText?: string | null; width?: number | null; height?: number | null };
type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  sku?: string | null;
  price: Money;
  compareAtPrice?: Money | null;
  selectedOptions: { name: string; value: string }[];
  image?: ImageData | null;
};
type Product = {
  id: string;
  handle: string;
  name: string;
  brand: string;
  description: string;
  descriptionHtml?: string;
  productType?: string;
  category?: string;
  price: Money;
  compareAtPrice?: Money | null;
  availableForSale: boolean;
  images: ImageData[];
  variants: Variant[];
  href: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  boughtCount?: number;
  seo?: { title?: string | null; description?: string | null };
};
type Collection = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  image?: ImageData | null;
  products: Product[];
  pageInfo?: { hasNextPage: boolean; endCursor: string | null };
};
type Article = {
  id: string;
  handle: string;
  title: string;
  excerpt?: string | null;
  image?: ImageData | null;
  publishedAt: string;
  blogTitle: string;
  blogHandle: string;
};
type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: { title: string; handle: string; featuredImage?: ImageData | null };
    price: Money;
    image?: ImageData | null;
  };
};
type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  lines: CartLine[];
};
type Toast = { id: number; text: string };

const SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "buyhoreca.myshopify.com";
const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "";
const API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || "2026-07";

const VERIFIED_CATEGORIES = [
  ["Kitchen Tools", "476", "kitchen-tools"],
  ["Preparation Supplies", "142", "preparation-supplies"],
  ["Measuring Equipments", "94", "measuring-equipments"],
  ["Kitchen Cutlery", "337", "kitchen-cutlery"],
  ["Baking", "237", "baking"],
  ["Salt & Pepper Shakers", "62", "salt-pepper-shakers"],
  ["Pizza Peels", "26", "pizza-peels"],
  ["Tabletop Disposables", "26", "tabletop-disposables"],
  ["Coffee Accessories", "175", "coffee-accessories"],
  ["Service Supplies", "131", "service-supplies"],
  ["Decorating Supplies", "31", "decorating-supplies"],
  ["Condiment Holders", "78", "condiment-holders"],
  ["Servingware", "97", "servingware"],
  ["Thermometer", "46", "thermometer"],
  ["Hotel", "179", "hotel"],
  ["Plug-in Equipments", "69", "plug-in-equipments"],
] as const;

const VERIFIED_BUSINESSES = [
  "Hotel", "Bakery", "Coffee", "Bar supplies", "Banquet supplies",
  "Ice cream shop", "Seafood", "Kitchen supplies", "Pizzeria", "Store & Transport", "Disposable",
] as const;

function slugify(v: string) {
  return v.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and").replaceAll("/", "-");
}

function titleFromSlug(v: string) {
  return v.split("-").filter(Boolean).map((x) => x[0]?.toUpperCase() + x.slice(1)).join(" ");
}

function moneyText(m?: Money | null) {
  if (!m) return "Get Quote";
  if (m.currencyCode === "AED") return `Dhs. ${Number(m.amount).toFixed(2)}`;
  return `${m.currencyCode} ${Number(m.amount).toFixed(2)}`;
}

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch("/api/shopify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  let json: any = null;
  try { json = await response.json(); } catch {}
  if (!response.ok || json?.errors?.length) {
    throw new Error("Store data is temporarily unavailable.");
  }
  return json.data as T;
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  vendor
  productType
  description
  descriptionHtml
  seo { title description }
  availableForSale
  featuredImage { url altText width height }
  images(first: 8) { nodes { url altText width height } }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 12) {
    nodes {
      id
      title
      availableForSale
      sku
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
      image { url altText width height }
    }
  }
  reviewRating: metafield(namespace: "reviews", key: "rating") { value }
  reviewRatingCount: metafield(namespace: "reviews", key: "rating_count") { value }
  boughtCount: metafield(namespace: "buyhoreca", key: "bought_count") { value }
`;

const PRODUCTS_QUERY = `
query Products($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
  products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
    pageInfo { hasNextPage endCursor }
    nodes { ${PRODUCT_FIELDS} }
  }
}`;

const PRODUCT_HANDLE_QUERY = `
query ProductByHandle($handle: String!) {
  product(handle: $handle) { ${PRODUCT_FIELDS} }
}`;

const SEARCH_QUERY = `
query SearchProducts($first: Int!, $after: String, $query: String!) {
  search(first: $first, after: $after, query: $query, types: PRODUCT) {
    totalCount
    pageInfo { hasNextPage endCursor }
    nodes {
      ... on Product { ${PRODUCT_FIELDS} }
    }
  }
}`;

const COLLECTIONS_QUERY = `
query Collections($first: Int!) {
  collections(first: $first, sortKey: TITLE) {
    nodes {
      id
      handle
      title
      description
      image { url altText width height }
    }
  }
}`;

const COLLECTION_HANDLE_QUERY = `
query CollectionByHandle($handle: String!, $after: String) {
  collection(handle: $handle) {
    id
    handle
    title
    description
    image { url altText width height }
    products(first: 48, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { ${PRODUCT_FIELDS} }
    }
  }
}`;

const BLOGS_QUERY = `
query Blogs($first: Int!, $articleFirst: Int!) {
  blogs(first: $first) {
    nodes {
      id
      handle
      title
      articles(first: $articleFirst, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          id
          handle
          title
          excerpt
          publishedAt
          image { url altText width height }
        }
      }
    }
  }
}`;

const CART_QUERY = `
query CartById($id: ID!) {
  cart(id: $id) {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            image { url altText width height }
            product { title handle featuredImage { url altText width height } }
          }
        }
      }
    }
  }
}`;

const CART_CREATE_MUTATION = `
mutation CartCreate($lines: [CartLineInput!]) {
  cartCreate(input: { lines: $lines }) {
    cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } lines(first: 100) {
      nodes { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } image { url altText width height } product { title handle featuredImage { url altText width height } } } } }
    } }
    userErrors { field message }
    warnings { code message }
  }
}`;

const CART_LINES_ADD_MUTATION = `
mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } lines(first: 100) {
      nodes { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } image { url altText width height } product { title handle featuredImage { url altText width height } } } } }
    } }
    userErrors { field message }
    warnings { code message }
  }
}`;

const CART_LINES_REMOVE_MUTATION = `
mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
  cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
    cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } lines(first: 100) {
      nodes { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } image { url altText width height } product { title handle featuredImage { url altText width height } } } } }
    } }
    userErrors { field message }
  }
}`;

const CART_LINES_UPDATE_MUTATION = `
mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
  cartLinesUpdate(cartId: $cartId, lines: $lines) {
    cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } lines(first: 100) {
      nodes { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } image { url altText width height } product { title handle featuredImage { url altText width height } } } } } }
    } }
    userErrors { field message }
  }
}`;

function normalizeProduct(raw: any): Product {
  const variants: Variant[] = (raw.variants?.nodes ?? []).map((v: any) => ({
    id: v.id,
    title: v.title,
    availableForSale: Boolean(v.availableForSale),
    sku: v.sku,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    selectedOptions: v.selectedOptions ?? [],
    image: v.image,
  }));
  const images = raw.images?.nodes?.length
    ? raw.images.nodes
    : raw.featuredImage ? [raw.featuredImage] : [];
  const minPrice = raw.priceRange?.minVariantPrice ?? variants[0]?.price;
  const rating = raw.rating != null && Number.isFinite(Number(raw.rating)) ? Number(raw.rating) : undefined;
  const reviewCount = raw.reviewCount != null && Number.isFinite(Number(raw.reviewCount)) ? Number(raw.reviewCount) : undefined;
  const boughtCount = raw.boughtCount != null && Number.isFinite(Number(raw.boughtCount)) ? Number(raw.boughtCount) : undefined;
  return {
    id: raw.id,
    handle: raw.handle,
    name: raw.title,
    brand: raw.vendor || "BuyHoreca",
    description: raw.description || "",
    descriptionHtml: raw.descriptionHtml,
    productType: raw.productType,
    price: minPrice || { amount: "0", currencyCode: "AED" },
    compareAtPrice: variants[0]?.compareAtPrice,
    availableForSale: Boolean(raw.availableForSale),
    images,
    variants,
    href: `/products/${raw.handle}`,
    rating,
    reviewCount,
    boughtCount,
    seo: raw.seo,
  };
}

function normalizeCollection(raw: any): Collection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    image: raw.image,
    products: (raw.products?.nodes ?? []).map(normalizeProduct),
    pageInfo: raw.products?.pageInfo,
  };
}

async function fetchProducts(first = 24, after: string | null = null, query?: string, sortKey?: string, reverse = false) {
  const data = await shopifyFetch<any>(PRODUCTS_QUERY, {
    first, after, query: query || null, sortKey: sortKey || null, reverse,
  });
  return {
    products: data.products.nodes.map(normalizeProduct) as Product[],
    pageInfo: data.products.pageInfo as { hasNextPage: boolean; endCursor: string | null },
  };
}

async function fetchProductHandle(handle: string) {
  const data = await shopifyFetch<any>(PRODUCT_HANDLE_QUERY, { handle });
  return data.product ? normalizeProduct(data.product) : null;
}

async function fetchSearch(query: string, after: string | null = null) {
  const data = await shopifyFetch<any>(SEARCH_QUERY, { first: 48, after, query });
  return { products:(data.search.nodes ?? []).filter(Boolean).map(normalizeProduct) as Product[], pageInfo:data.search.pageInfo, totalCount:data.search.totalCount as number };
}

async function fetchCollections() {
  const data = await shopifyFetch<any>(COLLECTIONS_QUERY, { first: 250 });
  return (data.collections.nodes ?? []).map(normalizeCollection) as Collection[];
}

async function fetchCollectionHandle(handle: string, after: string | null = null) {
  const data = await shopifyFetch<any>(COLLECTION_HANDLE_QUERY, { handle, after });
  return data.collection ? normalizeCollection(data.collection) : null;
}

async function fetchBlogs() {
  const data = await shopifyFetch<any>(BLOGS_QUERY, { first: 12, articleFirst: 12 });
  const out: Article[] = [];
  for (const blog of data.blogs.nodes ?? []) {
    for (const article of blog.articles.nodes ?? []) {
      out.push({
        id: article.id,
        handle: article.handle,
        title: article.title,
        excerpt: article.excerpt,
        image: article.image,
        publishedAt: article.publishedAt,
        blogTitle: blog.title,
        blogHandle: blog.handle,
      });
    }
  }
  return out.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

async function fetchCart(id: string) {
  const data = await shopifyFetch<any>(CART_QUERY, { id });
  return normalizeCart(data.cart);
}

function normalizeCart(raw: any): Cart | null {
  if (!raw) return null;
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: raw.cost,
    lines: (raw.lines?.nodes ?? []).filter(Boolean).map((line: any) => ({
      id: line.id,
      quantity: line.quantity,
      merchandise: {
        id: line.merchandise.id,
        title: line.merchandise.title,
        price: line.merchandise.price,
        image: line.merchandise.image,
        product: line.merchandise.product,
      },
    })),
  };
}

function inferSections(collections: Collection[], allProducts: Product[]) {
  const find = (...needles: string[]) =>
    collections.find((c) => needles.some((n) => c.title.toLowerCase().includes(n)));

  const featured = VERIFIED_CATEGORIES.map(([name, count, handle]) => {
    const match = collections.find((c) => slugify(c.title) === handle || c.title.toLowerCase() === name.toLowerCase());
    return {
      name,
      count,
      handle: match?.handle ?? handle,
      image: match?.image ?? null,
      products: match?.products ?? [],
    };
  });

  const deals = find("deal", "offer", "sale")?.products ?? allProducts.slice(0, 4);
  const trending = find("trending", "popular")?.products ?? allProducts.slice(4, 8);
  const recent = find("recent", "recently added")?.products ?? allProducts.slice(8, 12);
  const fresh = find("new", "latest", "new products")?.products ?? allProducts.slice(12, 16);
  const topSelling = find("top selling", "best selling", "best-seller")?.products ?? allProducts.slice(16, 24);

  return { featured, deals: deals.slice(0, 8), trending: trending.slice(0, 8), recent: recent.slice(0, 8), fresh: fresh.slice(0, 8), topSelling: topSelling.slice(0, 8) };
}



function JsonLd({data}:{data:Record<string,unknown>}){
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data)}}/>;
}

function applySEO(pathname:string, product?:Product|null, collection?:Collection|null) {
  if (typeof document === "undefined") return;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
  const defaults = {
    title: "BuyHoreca | Professional HoReCa Equipment & Supplies",
    description: "Professional HoReCa equipment and supplies for hospitality, kitchens, coffee, bakery, hotel, service and foodservice operations in the UAE.",
  };
  let title=defaults.title;
  let description=defaults.description;
  if(product){ title=`${product.seo?.title||product.name} | BuyHoreca`; description=(product.seo?.description||product.description||defaults.description).slice(0,160); }
  else if(collection){ title=`${collection.title} | BuyHoreca`; description=(collection.description||`Shop ${collection.title} at BuyHoreca.`).slice(0,160); }
  else if(pathname==="/shop"){title="Shop HoReCa Equipment & Supplies | BuyHoreca";}
  else if(pathname==="/categories"){title="HoReCa Equipment Categories | BuyHoreca";}
  else if(pathname.startsWith("/categories/")){title=`${titleFromSlug(pathname.split("/")[2]||"")} | BuyHoreca`}
  else if(pathname==="/business"){title="Shop by Business | HoReCa Equipment | BuyHoreca";}
  else if(pathname.startsWith("/business/")){title=`${titleFromSlug(pathname.split("/")[2]||"")} Equipment & Supplies | BuyHoreca`}
  else if(pathname==="/brands"){title="Brands | Professional HoReCa Equipment | BuyHoreca";}
  else if(pathname.startsWith("/brands/")){title=`${titleFromSlug(pathname.split("/")[2]||"")} | BuyHoreca`}
  else if(pathname==="/collections"){title="Collections | BuyHoreca";}
  else if(pathname==="/blogs"){title="HoReCa Buying Guides & Blogs | BuyHoreca";}
  else if(pathname==="/about"){title="About BuyHoreca | Professional HoReCa Supply";}
  else if(pathname==="/contact"){title="Contact BuyHoreca | Dubai, UAE";}
  else if(pathname==="/faq"){title="FAQ | BuyHoreca";}
  else if(pathname==="/shipping"){title="Shipping & Delivery | BuyHoreca";}
  else if(pathname.startsWith("/policies/")){title=`${titleFromSlug(pathname.split("/")[2]||"")} | BuyHoreca`}

  document.title=title;
  const setMeta=(name:string,content:string)=>{let el=document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement|null;if(!el){el=document.createElement("meta");el.name=name;document.head.appendChild(el)}el.content=content};
  const setProperty=(property:string,content:string)=>{let el=document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement|null;if(!el){el=document.createElement("meta");el.setAttribute("property",property);document.head.appendChild(el)}el.content=content};
  const utilityNoIndex=["/search","/cart","/wishlist","/compare","/quote","/track-order"].includes(pathname) || window.location.search.length>0;
  setMeta("description",description);
  setMeta("robots",utilityNoIndex?"noindex,follow,max-image-preview:large":"index,follow,max-image-preview:large");
  setMeta("googlebot",utilityNoIndex?"noindex,follow,max-image-preview:large":"index,follow,max-image-preview:large");
  const canonical=new URL(pathname,site); canonical.search=""; canonical.hash="";
  let link=document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement|null;if(!link){link=document.createElement("link");link.rel="canonical";document.head.appendChild(link)} link.href=canonical.toString();
  setProperty("og:title",title); setProperty("og:description",description); setProperty("og:type",product?"product":"website"); setProperty("og:url",canonical.toString()); setProperty("og:site_name","BuyHoreca"); setProperty("og:image",product?.images?.[0]?.url||`${site}/images/hero/hero-main.jpg`);
  setMeta("twitter:card","summary_large_image"); setMeta("twitter:title",title); setMeta("twitter:description",description); setMeta("twitter:image",product?.images?.[0]?.url||`${site}/images/hero/hero-main.jpg`);
}

export default function BuyHorecaShopifyApp() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<"en"|"ar">(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("buyhoreca_language");
    return stored === "ar" ? "ar" : "en";
  });
  const [autoOpenCart, setAutoOpenCart] = useState(true);

  useEffect(()=>{
    const c=window.localStorage.getItem("buyhoreca_auto_open_cart");
    if(c==="false")setAutoOpenCart(false);
  },[]);
  useEffect(()=>{
    document.documentElement.lang=language;
    document.documentElement.dir=language==="ar"?"rtl":"ltr";
    window.localStorage.setItem("buyhoreca_language",language);
  },[language]);
  useEffect(()=>{window.localStorage.setItem("buyhoreca_auto_open_cart",String(autoOpenCart))},[autoOpenCart]);

  useEffect(()=>{
    const dictionary:Record<string,string>={
      "Professional HoReCa Supply":"توريد مستلزمات الضيافة والتموين الاحترافي",
      "100% Secure delivery":"توصيل آمن 100%",
      "English":"English",
      "Order Tracking":"تتبع الطلب",
      "I'm looking for...":"أبحث عن...",
      "Search":"بحث",
      "Get a Quote":"طلب عرض سعر",
      "Shop":"المتجر",
      "Shop products":"تسوق المنتجات",
      "Categories":"الفئات",
      "Business":"الأعمال",
      "Brands":"العلامات التجارية",
      "Collections":"المجموعات",
      "About":"من نحن",
      "About Us":"من نحن",
      "Browse categories":"تصفح الفئات",
      "Updated catalogue":"الكتالوج المحدث",
      "Track order":"تتبع الطلب",
      "Secure shopping":"تسوق آمن",
      "BuyHoreca / Professional supply":"BuyHoreca / التوريد الاحترافي",
      "Current catalogue":"الكتالوج الحالي",
      "Current prices & images":"الأسعار والصور الحالية",
      "Secure checkout":"دفع آمن",
      "Professional equipment for hospitality that works.":"معدات احترافية للضيافة تعمل بكفاءة.",
      "Source commercial equipment and supplies across kitchen, coffee, bakery, hotel, service, pizzeria and foodservice.":"نوفر المعدات والمستلزمات التجارية للمطابخ والقهوة والمخابز والفنادق والخدمة والبيتزا وقطاع الأغذية.",
      "Coffee accessories":"مستلزمات القهوة",
      "Kitchen tools, cutlery & preparation":"أدوات المطبخ وأدوات المائدة والتحضير",
      "Kitchen":"المطبخ",
      "Coffee":"القهوة",
      "Kitchen Tools":"أدوات المطبخ",
      "Preparation Supplies":"مستلزمات التحضير",
      "Measuring Equipments":"معدات القياس",
      "Kitchen Cutlery":"أدوات مائدة المطبخ",
      "Baking":"الخبز والحلويات",
      "Salt & Pepper Shakers":"مرشات الملح والفلفل",
      "Pizza Peels":"مجاريف البيتزا",
      "Tabletop Disposables":"مستلزمات المائدة ذات الاستخدام الواحد",
      "Coffee Accessories":"مستلزمات القهوة",
      "Service Supplies":"مستلزمات الخدمة",
      "Decorating Supplies":"مستلزمات التزيين",
      "Condiment Holders":"حاملات التوابل والصلصات",
      "Servingware":"أدوات التقديم",
      "Thermometer":"مقياس الحرارة",
      "Hotel":"الفنادق",
      "Plug-in Equipments":"معدات كهربائية",
      "Explore":"استكشف",
      "Shop by category":"التسوق حسب الفئة",
      "Featured Categories":"الفئات المميزة",
      "Daily offers":"العروض اليومية",
      "Deals Of The Day":"عروض اليوم",
      "What customers are looking at":"ما يبحث عنه العملاء",
      "Trending Products":"المنتجات الرائجة",
      "Fresh in the catalogue":"أحدث المنتجات في الكتالوج",
      "Top Selling":"الأكثر مبيعاً",
      "Recently Added":"أضيفت مؤخراً",
      "New Products":"منتجات جديدة",
      "Popular now":"الأكثر رواجاً الآن",
      "Built around your operation":"مصمم لاحتياجات نشاطك",
      "Shop by Business":"التسوق حسب النشاط",
      "Shop By Business":"التسوق حسب النشاط",
      "Bakery":"المخبز",
      "Bar supplies":"مستلزمات البار",
      "Banquet supplies":"مستلزمات الولائم",
      "Ice cream shop":"محل الآيس كريم",
      "Seafood":"المأكولات البحرية",
      "Kitchen supplies":"مستلزمات المطبخ",
      "Pizzeria":"مطعم البيتزا",
      "Store & Transport":"التخزين والنقل",
      "Disposable":"مستلزمات الاستخدام الواحد",
      "Shop by Collection":"التسوق حسب المجموعة",
      "Latest articles":"أحدث المقالات",
      "Latest Buying Guides":"أحدث أدلة الشراء",
      "Read article":"اقرأ المقال",
      "View all":"عرض الكل",
      "Product image":"صورة المنتج",
      "Collection image":"صورة المجموعة",
      "Collection":"المجموعة",
      "Filter & sort":"تصفية وترتيب",
      "Filters & sort":"التصفية والترتيب",
      "Refine catalogue":"تخصيص الكتالوج",
      "All brands":"كل العلامات التجارية",
      "All types":"كل الأنواع",
      "Availability":"التوفر",
      "All":"الكل",
      "In stock":"متوفر",
      "Quote":"عرض سعر",
      "Rating":"التقييم",
      "All ratings":"كل التقييمات",
      "Price range":"نطاق السعر",
      "Sort":"ترتيب",
      "Best selling":"الأكثر مبيعاً",
      "Newest":"الأحدث",
      "A–Z":"أ–ي",
      "Price: low to high":"السعر: من الأقل إلى الأعلى",
      "Price: high to low":"السعر: من الأعلى إلى الأقل",
      "Reset filters":"إعادة ضبط الفلاتر",
      "Search products, brands, SKUs...":"ابحث عن المنتجات أو العلامات التجارية أو رموز المنتجات...",
      "Search products, brands...":"ابحث عن المنتجات أو العلامات التجارية...",
      "Refresh":"تحديث",
      "Load more products":"تحميل المزيد من المنتجات",
      "Wishlist":"المفضلة",
      "Compare":"مقارنة",
      "Saved":"محفوظ",
      "Compared":"تمت المقارنة",
      "Added":"تمت الإضافة",
      "Quick view":"عرض سريع",
      "Quantity":"الكمية",
      "Choose variant":"اختر النوع",
      "Add to Cart":"أضف إلى السلة",
      "Add to cart":"أضف إلى السلة",
      "Adding":"جارٍ الإضافة",
      "Buy Now":"اشترِ الآن",
      "Cart":"السلة",
      "Your cart is empty.":"سلتك فارغة.",
      "Subtotal":"المجموع الفرعي",
      "Total":"الإجمالي",
      "Secure delivery":"توصيل آمن",
      "Delivery":"التوصيل",
      "Wide assortment":"تشكيلة واسعة",
      "Easy returns":"إرجاع سهل",
      "professional fulfilment":"تنفيذ احترافي للطلبات",
      "24/7 amazing services":"خدمات مميزة على مدار الساعة",
      "large HoReCa catalogue":"كتالوج HoReCa كبير",
      "see current store policy":"اطّلع على سياسة المتجر الحالية",
      "Information":"المعلومات",
      "Customer information":"معلومات العملاء",
      "Terms & Conditions":"الشروط والأحكام",
      "Privacy Policy":"سياسة الخصوصية",
      "Order Policy":"سياسة الطلبات",
      "Warranty & Returns":"الضمان والإرجاع",
      "FAQ":"الأسئلة الشائعة",
      "Shipping & Delivery":"الشحن والتوصيل",
      "Contact Us":"اتصل بنا",
      "Contact BuyHoreca":"اتصل بـ BuyHoreca",
      "Reach us here":"تواصل معنا",
      "Help":"المساعدة",
      "Resources":"المصادر",
      "About BuyHoreca":"عن BuyHoreca",
      "All Products":"كل المنتجات",
      "Browse the current BuyHoreca catalogue with live product information.":"تصفح كتالوج BuyHoreca الحالي مع معلومات المنتجات المباشرة.",
      "Brand":"العلامة التجارية",
      "Product type":"نوع المنتج",
      "Filter":"تصفية",
      "Loading products…":"جارٍ تحميل المنتجات…",
      "reviews":"مراجعات",
      "bought":"تم شراؤه",
      "Professional HoReCa product from the live BuyHoreca catalogue.":"منتج HoReCa احترافي من كتالوج BuyHoreca الحالي.",
      "SKU not provided":"رمز المنتج غير متوفر",
      "Available":"متوفر",
      "Quote available":"متاح لطلب عرض سعر",
      "Full product page":"صفحة المنتج الكاملة",
      "Description":"الوصف",
      "Additional information":"معلومات إضافية",
      "Product details are being prepared.":"يتم إعداد تفاصيل المنتج.",
      "Professional HoReCa shopping for hospitality and foodservice.":"تجربة شراء احترافية لقطاع الضيافة وخدمات الأغذية.",
      "Dubai":"دبي",
      "Page not found":"الصفحة غير موجودة",
      "Back home":"العودة للرئيسية",
      "Temporarily unavailable":"غير متاح مؤقتاً",
      "We’re refreshing the store.":"نقوم بتحديث المتجر.",
      "Try again":"حاول مرة أخرى",
      "Reviews will appear when review data is available.":"ستظهر التقييمات عند توفر بيانات المراجعات.",
      "Rating filters activate when verified review data is available.":"ستتفعّل فلاتر التقييم عند توفر بيانات مراجعات موثوقة.",
      "Don’t open cart automatically after adding":"لا تفتح السلة تلقائياً بعد الإضافة",
      "Open page":"فتح الصفحة",
      "Our focus":"تركيزنا",
      "What BuyHoreca focuses on":"ما تركز عليه BuyHoreca",
      "Policies, support information and useful links for BuyHoreca customers.":"السياسات ومعلومات الدعم والروابط المفيدة لعملاء BuyHoreca.",
      "Frequently asked questions":"الأسئلة المتكررة",
      "Shipping":"الشحن",
      "Effective date: 1 January 2026":"تاريخ السريان: 1 يناير 2026",
      "Use of the website":"استخدام الموقع",
      "Accounts":"الحسابات",
      "Products and orders":"المنتجات والطلبات",
      "Intellectual property":"الملكية الفكرية",
      "Disclaimer and liability":"إخلاء المسؤولية والمسؤولية",
      "Governing law":"القانون المعمول به",
      "Information collected":"المعلومات التي يتم جمعها",
      "How information is used":"كيفية استخدام المعلومات",
      "Protection and sharing":"الحماية والمشاركة",
      "Cookies":"ملفات تعريف الارتباط",
      "Retention and rights":"الاحتفاظ بالبيانات والحقوق",
      "Placing an order":"إجراء الطلب",
      "Confirmation":"التأكيد",
      "Pricing and payment":"الأسعار والدفع",
      "Changes and cancellations":"التعديلات والإلغاءات",
      "Delivery and tracking":"التوصيل والتتبع",
      "Delivery requirements":"متطلبات التوصيل",
      "Warranty process":"إجراءات الضمان",
      "Warranty shipping":"شحن الضمان",
      "Repair or replacement timing":"مدة الإصلاح أو الاستبدال",
      "Standard returns":"الإرجاع القياسي",
      "Promotional and clearance items":"المنتجات الترويجية والمصفّاة",
      "Refunds":"المبالغ المستردة",
      "Next-day delivery":"التوصيل في اليوم التالي",
      "International shipping":"الشحن الدولي",
      "Order updates":"تحديثات الطلب",
      "Delivery details":"تفاصيل التوصيل",
      "Blogs":"المدونة",
      "View blogs":"عرض المدونة",
      "BuyHoreca updates":"تحديثات BuyHoreca",
      "New articles and buying guides appear here as they are published.":"ستظهر المقالات الجديدة وأدلة الشراء هنا عند نشرها.",
      "Loading…":"جارٍ التحميل…",
      "Searching products…":"جارٍ البحث عن المنتجات…",
      "Your cart is empty":"سلتك فارغة",
      "Continue shopping":"متابعة التسوق",
      "Open Cart Drawer":"فتح سلة التسوق",
      "Order number":"رقم الطلب",
      "Email":"البريد الإلكتروني",
      "Send to BuyHoreca on WhatsApp":"إرسال إلى BuyHoreca عبر واتساب",
      "Message preview":"معاينة الرسالة",
      "Quantity / delivery notes supported":"يدعم ملاحظات الكمية والتوصيل",
      "Product details included":"تفاصيل المنتج مضمّنة",
      "Brand and price included":"العلامة التجارية والسعر مضمّنان",
      "Availability included":"التوفر مضمّن",
      "Product image included":"صورة المنتج مضمّنة",
    };

    const translateNode=(node:Node, arabic:boolean)=>{
      if(node.nodeType!==Node.TEXT_NODE) return;
      const el=node.parentElement;
      if(!el || ["SCRIPT","STYLE","NOSCRIPT"].includes(el.tagName)) return;
      const raw=node.nodeValue||"";
      const trimmed=raw.trim();
      if(!trimmed) return;
      if(arabic){
        const ar=dictionary[trimmed];
        if(ar){
          if(!el.dataset.bhEn) el.dataset.bhEn=raw;
          node.nodeValue=raw.replace(trimmed,ar);
        }
      }else if(el.dataset.bhEn){
        node.nodeValue=el.dataset.bhEn;
        delete el.dataset.bhEn;
      }
    };

    const translateAttributes=(root:Node,arabic:boolean)=>{
      const nodes=(root instanceof Element||root instanceof Document?root.querySelectorAll("[placeholder],[title],[aria-label]"):[]) as NodeListOf<HTMLElement>;
      nodes.forEach(el=>{
        ["placeholder","title","aria-label"].forEach(attr=>{
          const original=el.getAttribute(attr);
          if(original){
            if(arabic){
              const ar=dictionary[original];
              if(ar){
                const dataKey=`bhEn${attr.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())}`;
                if(!el.dataset[dataKey]) el.dataset[dataKey]=original;
                el.setAttribute(attr,ar);
              }
            }else{
              const key=`bhEn${attr.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())}`;
              const stored=el.dataset[key];
              if(stored){el.setAttribute(attr,stored);delete el.dataset[key];}
            }
          }
        });
      });
    };

    const walk=(root:Node)=>{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      const nodes:Node[]=[];
      while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(n=>translateNode(n,language==="ar"));
      translateAttributes(root,language==="ar");
    };

    walk(document.body);
    const observer=new MutationObserver(records=>{
      records.forEach(record=>{
        record.addedNodes.forEach(node=>walk(node));
      });
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    return()=>observer.disconnect();
  },[language]);

  const toast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((v) => [...v, { id, text }]);
    setTimeout(() => setToasts((v) => v.filter((t) => t.id !== id)), 3000);
  };

  const refreshStore = async () => {
    try {
      setSyncing(true);
      setError("");
      const [productResult, collectionResult, blogResult] = await Promise.allSettled([
        fetchProducts(48, null, undefined, "BEST_SELLING", false),
        fetchCollections(),
        fetchBlogs(),
      ]);
      if (productResult.status === "rejected") {
        throw productResult.reason;
      }
      setProducts(productResult.value.products);
      setCollections(collectionResult.status === "fulfilled" ? collectionResult.value : []);
      setArticles(blogResult.status === "fulfilled" ? blogResult.value : []);
    } catch (e) {
      setError("Products are taking a moment to load. Please try again in a few seconds.");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    void refreshStore();
    const timer = window.setInterval(() => void refreshStore(), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("buyhoreca_shopify_cart_id");
    if (stored) {
      setCartId(stored);
      void fetchCart(stored).then(setCart).catch(() => {
        window.localStorage.removeItem("buyhoreca_shopify_cart_id");
        setCartId(null);
      });
    }
    const wish = window.localStorage.getItem("buyhoreca_wishlist");
    const comp = window.localStorage.getItem("buyhoreca_compare");
    if (wish) setWishlist(JSON.parse(wish));
    if (comp) setCompare(JSON.parse(comp));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("buyhoreca_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    window.localStorage.setItem("buyhoreca_compare", JSON.stringify(compare));
  }, [compare]);

  useEffect(() => {
    if (!pathname.startsWith("/products/")) {
      setCurrentProduct(null);
      return;
    }
    const handle = pathname.split("/")[2] || "";
    const refreshProduct = () => fetchProductHandle(handle).then(setCurrentProduct).catch(() => setCurrentProduct(null));
    void refreshProduct();
    const timer = window.setInterval(() => void refreshProduct(), 60_000);
    return () => window.clearInterval(timer);
  }, [pathname]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, touchMultiplier: 1.05 });
    let rafId = 0;
    const raf = (time: number) => { lenis.raf(time); rafId = window.requestAnimationFrame(raf); };
    rafId = window.requestAnimationFrame(raf);
    return () => { window.cancelAnimationFrame(rafId); lenis.destroy(); };
  }, []);

  const addToCart = async (product: Product, variant?: Variant, quantity = 1): Promise<Cart | null> => {
    const selected = variant ?? product.variants.find((v) => v.availableForSale) ?? product.variants[0];
    if (!selected) {
      toast("This product has no purchasable variant");
      return null;
    }

    try {
      setSyncing(true);
      if (!cartId) {
        const data = await shopifyFetch<any>(CART_CREATE_MUTATION, {
          lines: [{ merchandiseId: selected.id, quantity }],
        });
        const userErrors = data.cartCreate.userErrors ?? [];
        if (userErrors.length) throw new Error(userErrors.map((x: any) => x.message).join("; "));
        const next = normalizeCart(data.cartCreate.cart);
        if (next) {
          setCart(next);
          setCartId(next.id);
          window.localStorage.setItem("buyhoreca_shopify_cart_id", next.id);
          toast(`${product.name} added to your cart`);
          if(autoOpenCart)setCartOpen(true);
          return next;
        }
      } else {
        const data = await shopifyFetch<any>(CART_LINES_ADD_MUTATION, {
          cartId,
          lines: [{ merchandiseId: selected.id, quantity }],
        });
        const userErrors = data.cartLinesAdd.userErrors ?? [];
        if (userErrors.length) throw new Error(userErrors.map((x: any) => x.message).join("; "));
        const updated = normalizeCart(data.cartLinesAdd.cart);
        setCart(updated);
        toast(`${product.name} added to your cart`);
        if(autoOpenCart)setCartOpen(true);
        return updated;
      }
      return null;
    } catch {
      toast("We couldn’t add that item right now. Please try again.");
      return null;
    } finally {
      setSyncing(false);
    }
  };

  const removeCartLine = async (lineId: string) => {
    if (!cartId) return;
    try {
      const data = await shopifyFetch<any>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] });
      const errors = data.cartLinesRemove.userErrors ?? [];
      if (errors.length) throw new Error(errors.map((x: any) => x.message).join("; "));
      setCart(normalizeCart(data.cartLinesRemove.cart));
    } catch {
      toast("We couldn’t update your cart right now. Please try again.");
    }
  };

  const updateCartLine = async (lineId: string, quantity: number) => {
    if (!cartId) return;
    if (quantity <= 0) return removeCartLine(lineId);
    try {
      const data = await shopifyFetch<any>(CART_LINES_UPDATE_MUTATION, {
        cartId,
        lines: [{ id: lineId, quantity }],
      });
      const errors = data.cartLinesUpdate.userErrors ?? [];
      if (errors.length) throw new Error(errors.map((x: any) => x.message).join("; "));
      setCart(normalizeCart(data.cartLinesUpdate.cart));
    } catch {
      toast("We couldn’t update your cart right now. Please try again.");
    }
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((v) => v.includes(product.id) ? v.filter((x) => x !== product.id) : [...v, product.id]);
  };
  const toggleCompare = (product: Product) => {
    setCompare((v) => v.includes(product.id) ? v.filter((x) => x !== product.id) : [...v, product.id]);
  };

  const sections = inferSections(collections, products);
  const filteredWishlist = products.filter((p) => wishlist.includes(p.id));
  const compared = products.filter((p) => compare.includes(p.id));

  const page = (
    loading
      ? <LoadingPage />
      : error
        ? <ErrorPage message={error} retry={refreshStore} />
        : <RenderPage
            pathname={pathname}
            query={query}
            products={products}
            collections={collections}
            articles={articles}
            currentProduct={currentProduct}
            sections={sections}
            wishlist={wishlist}
            compare={compare}
            cart={cart}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            toggleCompare={toggleCompare}
            openQuickView={setQuickView}
            openQuote={() => setQuoteOpen(true)}
            cartOpen={() => setCartOpen(true)}
            sync={refreshStore}
          />
  );

  return (
    <div className="bh-app">
      <div className="bh-codepen-bg" aria-hidden="true" />
      <JsonLd data={{
        "@context":"https://schema.org",
        "@type":"Organization",
        name:"BuyHoreca",
        url:"https://buyhoreca.com",
        logo:"https://buyhoreca.com/images/buyhoreca_logo.png",
        telephone:"+97143966692",
        email:"support@buyhoreca.com",
        address:{"@type":"PostalAddress",streetAddress:"13A St. Al Al Khabaisi Area",addressLocality:"Deira",addressRegion:"Dubai",addressCountry:"AE"}
      }} />
      <JsonLd data={{
        "@context":"https://schema.org",
        "@type":"WebSite",
        name:"BuyHoreca",
        url:"https://buyhoreca.com",
        potentialAction:{"@type":"SearchAction",target:"https://buyhoreca.com/search?q={search_term_string}","query-input":"required name=search_term_string"}
      }} />
      <JsonLd data={{
        "@context":"https://schema.org",
        "@type":"BreadcrumbList",
        itemListElement:[{ "@type":"ListItem", position:1, name:"Home", item:"https://buyhoreca.com/" }, ...pathname.split("/").filter(Boolean).map((part:string,index:number)=>({"@type":"ListItem",position:index+2,name:titleFromSlug(part),item:`https://buyhoreca.com/${pathname.split("/").filter(Boolean).slice(0,index+1).join("/")}`}))]
      }} />
      <style jsx global>{`
        :root{
          --bh-bg:#f5f7f8;--bh-surface:#ffffff;--bh-surface-soft:#f9fafb;--bh-ink:#15212b;--bh-green:#00a879;
          --bh-green-dark:#007e5c;--bh-muted:#66737d;--bh-faint:#8b969f;--bh-line:#e4e8eb;
          --bh-blue:#315eea;--bh-amber:#b86a00;--bh-container:1640px
        }
        *{box-sizing:border-box}
        html{scroll-behavior:auto;scrollbar-gutter:stable}
        html,body{margin:0;min-height:100%;background:#ffffff}
        body{color:var(--bh-ink);font-family:'Manrope','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
        button,input,select,textarea{font:inherit}button{cursor:pointer}a{color:inherit;text-decoration:none}img{display:block;max-width:100%}
        button svg,a svg{color:currentColor;flex:none}
        .bh-display,.bh-title,.bh-modal-title{font-family:'Space Grotesk','Manrope','Helvetica Neue',Arial,sans-serif}
        .bh-modal-title{font-size:clamp(2rem,3.4vw,3.65rem);line-height:.98;letter-spacing:-.045em;font-weight:750}
        .bh-editorial{font-family:'DM Serif Display','Georgia',serif;letter-spacing:-.02em}
        .bh-icon-btn{color:var(--bh-ink)}
        .bh-lang-toggle{direction:ltr}

        html[dir="rtl"] body{font-family:'Noto Sans Arabic','Tahoma','Arial',sans-serif}
        html[dir="rtl"] .bh-app{direction:rtl}
        html[dir="rtl"] input,html[dir="rtl"] textarea,html[dir="rtl"] select{text-align:right}
        html[dir="rtl"] .bh-lang-toggle{direction:ltr}
        .bh-btn{border:1px solid transparent;transition:transform .18s ease,box-shadow .18s ease,background .18s ease,color .18s ease,filter .18s ease}
        .bh-btn:hover{transform:translateY(-1px)}.bh-btn:active{transform:translateY(1px)}
        .bh-btn-green{background:var(--bh-green);color:#fff;box-shadow:0 10px 24px rgba(0,168,121,.2)}
        .bh-btn-green:hover{filter:brightness(.96);box-shadow:0 12px 28px rgba(0,168,121,.26)}
        .bh-btn-dark{background:var(--bh-ink);color:#fff;box-shadow:0 10px 24px rgba(21,33,43,.16)}
        .bh-btn-dark:hover{filter:brightness(1.08);box-shadow:0 12px 28px rgba(21,33,43,.22)}
        .bh-btn-light{background:#fff;color:var(--bh-ink);border-color:var(--bh-line);box-shadow:0 5px 16px rgba(21,33,43,.06)}
        .bh-btn-light:hover{background:#f8fafb;box-shadow:0 9px 22px rgba(21,33,43,.09)}
        .bh-qty{display:flex;height:48px;min-width:112px;align-items:center;justify-content:center;border:1px solid var(--bh-line);border-radius:999px;background:#f7f8f9;box-shadow:inset 0 2px 7px rgba(21,33,43,.06)}
        .bh-qty button{display:grid;size:36px;place-items:center;border:0;background:transparent;color:var(--bh-ink);border-radius:999px;width:36px;height:36px}
        .bh-qty span{width:32px;text-align:center;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;color:var(--bh-ink)}
        .bh-variant{border:1px solid var(--bh-line);background:#fff;color:var(--bh-ink);border-radius:999px;padding:9px 14px;font-size:12px;font-weight:800;box-shadow:0 4px 12px rgba(21,33,43,.05)}
        .bh-variant:hover{border-color:#b9c1c7}.bh-variant-active{background:var(--bh-ink);color:#fff;border-color:var(--bh-ink)}
        .bh-variant:disabled{opacity:.45;cursor:not-allowed}
        .bh-app{position:relative;isolation:isolate;min-height:100vh;overflow-x:clip;background:transparent !important}.bh-container{width:min(calc(100% - clamp(24px,5vw,96px)),var(--bh-container));margin-inline:auto}
        
        .bh-codepen-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;background:#fff;
          background-image:conic-gradient(from 180deg at 50% 70%,#0BB06D 0deg,#0BB06D 72.0000010728836deg,#0BB06D 144.0000021457672deg,#0BB06D 216.00000858306885deg,#0BB06D 288.0000042915344deg,#0BB06D 1turn);
          background-size:100% 100%;
          -webkit-mask:radial-gradient(circle at 50% 50%,white 2px,transparent 2.5px) 50% 50% / 20px 20px,
            url("https://assets.codepen.io/605876/noise-mask.png") 256px 50% / 256px 256px;
          mask:radial-gradient(circle at 50% 50%,white 2px,transparent 2.5px) 50% 50% / 20px 20px,
            url("https://assets.codepen.io/605876/noise-mask.png") 256px 50% / 256px 256px;
          -webkit-mask-composite:source-in;
          mask-composite:intersect;
          animation:bhCodepenFlicker 20s infinite linear}
        @keyframes bhCodepenFlicker{to{-webkit-mask-position:50% 50%,0 50%;mask-position:50% 50%,0 50%}}
        @media(prefers-reduced-motion:reduce){.bh-codepen-bg{animation:none}}
.bh-section{padding-block:clamp(54px,5.8vw,100px)}
        @keyframes bhRevealUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        [data-reveal]{animation:bhRevealUp .72s cubic-bezier(.22,1,.36,1) both}
        .bh-motion-sheen{position:relative;overflow:hidden}
        .bh-motion-sheen::after{content:"";position:absolute;inset:-30% auto -30% -70%;width:42%;transform:skewX(-16deg) translateX(0);background:linear-gradient(90deg,transparent,rgba(255,255,255,.42),transparent);opacity:0;pointer-events:none;transition:transform .65s cubic-bezier(.22,1,.36,1),opacity .3s ease}
        .bh-motion-sheen:hover::after{transform:skewX(-16deg) translateX(360%);opacity:1}
        @media(prefers-reduced-motion:reduce){[data-reveal]{animation:none!important}.bh-motion-sheen::after{display:none!important}}
.bh-section.bh-tight-top{padding-top:clamp(27px,2.9vw,50px)!important}.bh-section.bh-tight-bottom{padding-bottom:clamp(27px,2.9vw,50px)!important}
        .bh-raised{background:var(--bh-surface);box-shadow:0 10px 30px rgba(21,33,43,.07);border:1px solid var(--bh-line);border-radius:22px}
        .bh-raised-sm{background:var(--bh-surface);box-shadow:0 5px 16px rgba(21,33,43,.055);border:1px solid var(--bh-line);border-radius:16px}
        .bh-inset{background:var(--bh-surface-soft);box-shadow:inset 0 1px 0 rgba(255,255,255,.8);border:1px solid var(--bh-line)}
        .bh-interactive{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease}.bh-interactive:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(21,33,43,.09);border-color:#d4dade}
        .bh-interactive:active{transform:translateY(0);box-shadow:0 4px 12px rgba(21,33,43,.08)}:focus-visible{outline:3px solid rgba(0,168,121,.28);outline-offset:3px}
        .bh-display{font-size:clamp(2.55rem,4.35vw,5.3rem);line-height:.96;letter-spacing:-.055em;font-weight:850}
        .bh-title{font-size:clamp(2.15rem,3.25vw,3.8rem);line-height:1.02;letter-spacing:-.04em;font-weight:850}
        .bh-kicker{font-size:.68rem;line-height:1;letter-spacing:.15em;text-transform:uppercase;font-weight:850;color:var(--bh-muted)}
        .bh-body{font-size:clamp(1rem,1.06vw,1.12rem);line-height:1.68;color:var(--bh-muted)}
        .bh-grid-4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}.bh-grid-6{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px}
        .bh-chip{min-height:34px;display:inline-flex;align-items:center;gap:8px;padding:0 13px;border-radius:999px;font-size:11px;font-weight:800;background:#fff;border:1px solid var(--bh-line)}
        .bh-card-media{position:relative;overflow:hidden;border-radius:16px;min-height:310px;background:#fbfcfc;border:1px solid #e8ecef}.bh-dot-grid{display:none}
        .bh-media-core{width:46%;aspect-ratio:1;border-radius:18px;background:linear-gradient(180deg,#fff,#eef2f4);border:1px solid #e4e8eb;box-shadow:0 10px 24px rgba(21,33,43,.06);display:grid;place-items:center;color:var(--bh-faint);font-size:10px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}
        .bh-marquee{display:flex;width:max-content;animation:bh-marquee 34s linear infinite}.bh-marquee:hover{animation-play-state:paused}@keyframes bh-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .bh-modal-title + .bh-body{max-width:62ch}

        @media(max-width:1200px){.bh-grid-4{grid-template-columns:repeat(3,minmax(0,1fr))}.bh-grid-6{grid-template-columns:repeat(4,minmax(0,1fr))}}
        @media(max-width:800px){.bh-container{width:calc(100% - 24px)}.bh-section{padding-block:48px}.bh-grid-4{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.bh-grid-6{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.bh-display{font-size:clamp(2.35rem,11.5vw,4.1rem)}}
        @media(max-width:480px){.bh-grid-4{grid-template-columns:1fr}.bh-grid-6{grid-template-columns:1fr}.bh-card-media{min-height:260px}.bh-title{font-size:2.15rem}}
        @media(min-width:2200px){:root{--bh-container:1830px}}@media(min-width:3200px){:root{--bh-container:2150px}body{font-size:18px}}
        @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.bh-marquee{animation:none!important}*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `}</style>


      <Header
        cartCount={cart?.totalQuantity ?? 0}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        megaOpen={megaOpen}
        setMegaOpen={setMegaOpen}
        setCartOpen={setCartOpen}
        syncing={syncing}
        sync={refreshStore}
        language={language}
        setLanguage={setLanguage}
      />

      {page}

      <Footer articles={articles} />


      {quickView && (
        <QuickView
          product={quickView}
          close={() => setQuickView(null)}
          addToCart={addToCart}
          saved={wishlist.includes(quickView.id)}
          toggleWishlist={toggleWishlist}
        />
      )}

      {quoteOpen && <QuoteDialog close={() => setQuoteOpen(false)} toast={toast} />}

      {cartOpen && (
        <CartDrawer cart={cart} close={() => setCartOpen(false)} remove={removeCartLine} update={updateCartLine} autoOpenCart={autoOpenCart} setAutoOpenCart={setAutoOpenCart} />
      )}

      <div className="fixed right-4 top-4 z-[120] grid gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="bh-raised-sm rounded-full px-5 py-3 text-sm font-extrabold">
            <Check size={15} className="mr-2 inline" />{t.text}
          </div>
        ))}
      </div>

      <a
        href="https://wa.me/971565334464"
        target="_blank"
        rel="noreferrer"
        className="bh-raised fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full"
        aria-label="WhatsApp BuyHoreca"
      >
        <MessageCircle size={23} />
      </a>
    </div>
  );
}



/* ----------------------------- header ----------------------------- */

function Header({
  cartCount, mobileOpen, setMobileOpen, megaOpen, setMegaOpen, setCartOpen, syncing, sync, language, setLanguage,
}: {
  cartCount: number; mobileOpen: boolean; setMobileOpen: (v: boolean) => void;
  megaOpen: boolean; setMegaOpen: (v: boolean) => void; setCartOpen: (v: boolean) => void;
  syncing: boolean; sync: () => void; language: "en"|"ar"; setLanguage: (v: "en"|"ar") => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[var(--bh-line)] shadow-[0_8px_24px_rgba(21,33,43,0.06)]">
      <div className="border-b border-black/[.045]">
        <div className="bh-container flex min-h-9 items-center justify-between gap-4 text-[10px] font-extrabold uppercase tracking-[.08em] text-[var(--bh-muted)]">
          <div className="hidden sm:flex items-center gap-5">
            <span>Professional HoReCa Supply</span>
            <span>100% Secure delivery</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            
            <Link href="/track-order" className="hidden sm:block">Order Tracking</Link>
            <a href="tel:+97143966692" className="flex items-center gap-1"><Phone size={12}/> +(971) 43966692</a>
          </div>
        </div>
      </div>

      <div className="bh-container py-3 md:py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0"><img src="/images/buyhoreca_logo.png" alt="BuyHoreca" className="h-auto w-[165px] sm:w-[195px] md:w-[235px] lg:w-[250px]" /></Link>

          <form action="/search" className="bh-inset mx-auto hidden h-12 max-w-3xl flex-1 items-center gap-3 rounded-full px-4 md:flex">
            <Search size={18} className="text-[var(--bh-muted)]"/>
            <input name="q" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--bh-faint)]" placeholder="I'm looking for..."/>
            <button className="bh-raised-sm rounded-full px-5 py-2 text-xs font-extrabold" type="submit">Search</button>
          </form>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            
            <Link href="/wishlist" aria-label="Wishlist" className="bh-raised-sm bh-interactive grid size-11 place-items-center rounded-full"><Heart size={18}/></Link><button onClick={()=>setLanguage(language==="en"?"ar":"en")} aria-label="Change language" title={language==="en"?"العربية":"English"} aria-pressed={language==="ar"} className="bh-lang-toggle bh-raised-sm bh-interactive inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold"><Globe2 size={17}/><span>{language==="en"?"العربية":"English"}</span></button>
            <Link href="/quote" className="bh-raised-sm bh-interactive hidden h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold xl:flex"><FileText size={16}/> Get a Quote</Link>
            <button onClick={()=>setCartOpen(true)} aria-label="Cart" className="bh-raised-sm bh-interactive relative grid size-11 place-items-center rounded-full">
              <ShoppingBag size={18}/>{cartCount>0&&<span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[var(--bh-green)] text-[10px] font-extrabold text-white">{cartCount}</span>}
            </button>
            <button onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Menu" className="bh-raised-sm bh-interactive grid size-11 place-items-center rounded-full lg:hidden">{mobileOpen?<X size={19}/>:<Menu size={19}/>}</button>
          </div>
        </div>

        <form action="/search" className="bh-inset mt-3 flex h-11 items-center gap-3 rounded-full px-4 md:hidden">
          <Search size={17}/><input name="q" className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search products, brands..."/>
        </form>

        <nav className="mt-4 hidden items-center gap-1 lg:flex">
          {[
            ["Shop","/shop"],["Categories","/categories"],["Business","/business"],["Brands","/brands"],["Collections","/collections"],["About","/about"]
          ].map(([label,href])=><Link key={href} href={href} className="rounded-full px-5 py-2.5 text-[15px] font-extrabold hover:bg-white/40">{label}</Link>)}
          <button onClick={()=>setMegaOpen(!megaOpen)} className="rounded-full px-5 py-2.5 text-[15px] font-extrabold hover:bg-white/40">Browse categories <ChevronDown size={14} className={`ml-1 inline ${megaOpen?"rotate-180":""}`}/></button>
          <button onClick={sync} className="ml-auto rounded-full px-4 py-2.5 text-xs font-extrabold text-[var(--bh-muted)]" aria-label="Refresh catalogue"><span className="mr-1 inline-block size-2 rounded-full bg-[var(--bh-green)] align-middle"></span><RefreshCw size={14} className={`mr-1 inline ${syncing?"animate-spin":""}`}/> Updated catalogue</button>
          <Link href="/track-order" className="rounded-full px-4 py-2.5 text-sm font-extrabold text-[var(--bh-muted)]">Track order</Link>
        </nav>

        {megaOpen&&<div className="bh-raised mt-4 rounded-[28px] p-5"><div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{VERIFIED_CATEGORIES.slice(0,12).map(([name,count,handle])=><Link key={name} href={`/categories/${handle}`} onClick={()=>setMegaOpen(false)} className="bh-raised-sm bh-interactive rounded-2xl p-4"><div className="font-extrabold">{name}</div></Link>)}</div></div>}
        {mobileOpen&&<div className="bh-raised mt-4 rounded-[24px] p-3 lg:hidden"><nav className="grid">{[["Shop","/shop"],["Categories","/categories"],["Business","/business"],["Brands","/brands"],["Collections","/collections"],["About","/about"],["Track order","/track-order"],["Get a Quote","/quote"]].map(([l,h])=><Link key={h} href={h} onClick={()=>setMobileOpen(false)} className="rounded-2xl px-4 py-3.5 font-extrabold">{l}</Link>)}</nav></div>}
      </div>
    </header>
  );
}


function ShippingPage(){
  const rows=[
    ["UAE delivery","Most orders: 1–2 working days"],
    ["Next-day delivery","Available for selected products and locations"],
    ["International shipping","Available; timing depends on destination"],
    ["Order updates","WhatsApp, email and direct support communication"],
    ["Delivery details","Provide complete and accurate delivery information and make sure someone is available to receive the order"]
  ];
  return <Shell>
    <div className="bh-raised rounded-[34px] p-7 md:p-12">
      <p className="bh-kicker">Delivery</p>
      <h1 className="bh-title mt-2">Shipping & Delivery</h1>
      <p className="bh-body mt-5 max-w-3xl">BuyHoreca’s published FAQ and Order Policy describe UAE-wide delivery, selected next-day options and international shipping.</p>
      <div className="mt-10 grid gap-3">{rows.map(([h,b])=><div key={h} className="bh-raised-sm grid gap-2 rounded-[22px] p-5 md:grid-cols-[220px_1fr]"><div className="font-extrabold">{h}</div><div className="text-sm leading-6 text-[var(--bh-muted)]">{b}</div></div>)}</div>
      <Link href="/contact" className="bh-btn bh-btn-green mt-8 inline-flex rounded-full px-6 py-3 text-sm font-extrabold">Contact BuyHoreca <ArrowRight size={16}/></Link>
    </div>
  </Shell>
}

function BlogsPage({articles}:{articles:Article[]}){
  return <Shell>
    <p className="bh-kicker">Resources</p>
    <h1 className="bh-title mt-2">Blogs</h1>
    <p className="bh-body mt-4 max-w-3xl">Latest articles and buying guides from BuyHoreca.</p>
    {!articles.length ? <div className="bh-inset mt-10 rounded-[24px] p-7"><p className="bh-body">No articles are available right now.</p></div> :
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {articles.map(a=><a key={a.id} href={`https://${SHOP_DOMAIN}/blogs/${a.blogHandle}/${a.handle}`} target="_blank" rel="noreferrer" className="bh-raised-sm overflow-hidden rounded-[28px]">
          <div className="aspect-[16/10] bg-[#f4f6f7]">{a.image?<img src={a.image.url} alt={a.image.altText||a.title} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-xs font-extrabold text-[var(--bh-faint)]">Blog image</div>}</div>
          <div className="p-6"><div className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--bh-faint)]">{new Date(a.publishedAt).toLocaleDateString()}</div><h2 className="mt-3 text-xl font-extrabold leading-7">{a.title}</h2>{a.excerpt&&<p className="bh-body mt-3 line-clamp-3 text-sm">{a.excerpt}</p>}<div className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold">Read article <ExternalLink size={15}/></div></div>
        </a>)}
      </div>}
  </Shell>
}

/* ----------------------------- routing ---------------------------- */

function RenderPage(props: any) {
  const { pathname, query, products, collections, articles, currentProduct, sections, wishlist, compare, cart, addToCart, toggleWishlist, toggleCompare, openQuickView, openQuote, cartOpen, sync } = props;
  if (pathname === "/") return <HomePage sections={sections} products={products} articles={articles} addToCart={addToCart} openQuickView={openQuickView}/>;
  if (pathname === "/shop") return <ShopPage addToCart={addToCart} openQuickView={openQuickView} wishlist={wishlist} compare={compare} toggleWishlist={toggleWishlist} toggleCompare={toggleCompare}/>;
  if (pathname === "/categories") return <CategoriesPage collections={collections}/>;
  if (pathname.startsWith("/categories/")) return <CategoryPage slug={pathname.split("/")[2]||""} collections={collections} addToCart={addToCart} openQuickView={openQuickView}/>;
  if (pathname === "/business") return <BusinessPage/>;
  if (pathname.startsWith("/business/")) return <BusinessDetail slug={pathname.split("/")[2]||""} products={products} addToCart={addToCart} openQuickView={openQuickView}/>;
  if (pathname === "/brands") return <BrandPage products={products}/>;
  if (pathname.startsWith("/brands/")) return <BrandDetail slug={pathname.split("/")[2]||""} products={products} addToCart={addToCart} openQuickView={openQuickView}/>;
  if (pathname === "/collections") return <CollectionsPage collections={collections}/>;
  if (pathname.startsWith("/products/") && currentProduct) return <ProductPage product={currentProduct} products={products} addToCart={addToCart} openQuote={openQuote} wishlist={wishlist} toggleWishlist={toggleWishlist} openQuickView={openQuickView}/>;
  if (pathname.startsWith("/products/")) return <LoadingPage label="Loading product…"/>;
  if (pathname === "/search") return <SearchPage query={query} addToCart={addToCart} openQuickView={openQuickView}/>;
  if (pathname === "/cart") return <CartPage cart={cart} cartOpen={cartOpen}/>;
  if (pathname === "/wishlist") return <WishlistPage ids={wishlist} products={products} addToCart={addToCart} openQuickView={openQuickView}/>;
  if (pathname === "/compare") return <ComparePage ids={compare} products={products}/>;
  if (pathname === "/quote") return <QuotePage/>;
  if (pathname === "/track-order") return <TrackPage/>;
  if (pathname === "/about") return <AboutPage/>;
  if (pathname === "/information") return <InformationPage/>;
  if (pathname === "/shipping") return <ShippingPage/>;
  if (pathname === "/contact") return <ContactPage/>;
  if (pathname === "/blogs") return <BlogsPage articles={articles}/>;
  if (pathname === "/faq") return <FAQPage/>;
  if (pathname.startsWith("/policies/")) return <PolicyPage slug={pathname.split("/")[2]||""}/>;
  return <NotFoundPage/>;
}

/* ----------------------------- homepage --------------------------- */

function HomePage({ sections, products, articles, addToCart, openQuickView }: any) {
  return <>
    <section className="pt-5 md:pt-7" data-reveal>
      <div className="bh-container">
        <div className="grid gap-4 lg:grid-cols-[1.22fr_.78fr]">
          <div className="relative min-h-[620px] overflow-hidden rounded-[34px] border border-[var(--bh-line)] bg-white shadow-[0_14px_36px_rgba(21,33,43,.08)] lg:min-h-[640px]">
            <img src="/images/hero/hero-main.jpg" alt="Professional commercial kitchen equipment" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 via-45% to-white/15 lg:to-transparent" />
                        <div className="relative z-10 flex min-h-[620px] max-w-[78%] flex-col justify-center p-6 sm:p-10 lg:min-h-[640px] lg:max-w-[67%] lg:p-14">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="bh-chip"><ShieldCheck size={14}/> Secure shopping</span>
                <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[var(--bh-muted)]">Dubai, U.A.E.</span>
              </div>
              <p className="bh-kicker mt-12 text-[var(--bh-green-dark)]">BuyHoreca / Professional supply</p>
              <h1 className="bh-display mt-5 max-w-3xl">Professional equipment for hospitality that works.</h1>
              <p className="bh-body mt-6 max-w-2xl">Source commercial equipment and supplies across kitchen, coffee, bakery, hotel, service, pizzeria and foodservice.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop" className="bh-btn bh-btn-green inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-extrabold">Shop products <ArrowRight size={17}/></Link>
                <Link href="/quote" className="bh-btn bh-btn-light inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-extrabold">Get a Quote <FileText size={16}/></Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-2">
                <span className="bh-chip">Current catalogue</span>
                <span className="bh-chip">Current prices & images</span>
                <span className="bh-chip">Secure checkout</span>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <HeroCollection title="Coffee accessories" kicker="Coffee" href="/categories/coffee-accessories" localSrc="/images/hero/hero-coffee.jpg" />
            <HeroCollection title="Kitchen tools, cutlery & preparation" kicker="Kitchen" href="/categories/kitchen-tools" localSrc="/images/hero/hero-kitchen.jpg" />
          </div>
        </div>
      </div>
    </section>


    <section className="bh-section pb-0 bh-tight-bottom"><div className="bh-container"><SectionHeading kicker="Shop by category" title="Featured Categories" href="/categories"/><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">{sections.featured.map((c:any)=><Link key={c.name} href={`/categories/${c.handle}`} className="bh-raised-sm bh-interactive rounded-[20px] p-4"><div className="text-sm font-extrabold leading-5">{c.name}</div></Link>)}</div></div></section>

    <LiveProductSection kicker="Daily offers" title="Deals Of The Day" products={sections.deals.length ? sections.deals : products.slice(0,8)} addToCart={addToCart} openQuickView={openQuickView}/>
    <section className="bh-section pt-0 pb-0 bh-tight-top bh-tight-bottom"><div className="bh-container"><div className="bh-raised rounded-[30px] p-4 md:p-5"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[[ShieldCheck,"Secure delivery","professional fulfilment"],[Truck,"Delivery","24/7 amazing services"],[Layers3,"Wide assortment","large HoReCa catalogue"],[RotateCcw,"Easy returns","see current store policy"]].map(([I,t,s])=>{const C=I as any;return <div key={t as string} className="flex gap-4"><div className="bh-inset grid size-12 shrink-0 place-items-center rounded-2xl"><C size={21}/></div><div><div className="text-sm font-extrabold">{t as string}</div><div className="mt-1 text-xs leading-5 text-[var(--bh-muted)]">{s as string}</div></div></div>})}</div></div></div></section>
    <div className="bh-tight-top"><LiveProductSection kicker="What customers are looking at" title="Trending Products" products={sections.trending.length ? sections.trending : products.slice(4,12)} addToCart={addToCart} openQuickView={openQuickView}/></div>
    <LiveProductSection kicker="Fresh in the catalogue" title="Recently Added" products={sections.recent.length ? sections.recent : products.slice(8,16)} addToCart={addToCart} openQuickView={openQuickView}/>
    <LiveProductSection kicker="Latest products" title="New Products" products={sections.fresh.length ? sections.fresh : products.slice(12,20)} addToCart={addToCart} openQuickView={openQuickView}/>
    <LiveProductSection kicker="Popular now" title="Top Selling" products={sections.topSelling.length ? sections.topSelling : products.slice(16,24)} addToCart={addToCart} openQuickView={openQuickView}/>

    <section className="bh-section pt-0"><div className="bh-container"><SectionHeading kicker="Built around your operation" title="Shop By Business" href="/business"/><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{["Hotel","Bakery","Coffee","Bar supplies","Banquet supplies","Ice cream shop","Seafood","Kitchen supplies","Pizzeria","Store & Transport","Disposable"].map((n)=><Link key={n} href={`/business/${slugify(n)}`} className="bh-raised bh-interactive rounded-[24px] p-5"><div className="bh-inset grid size-12 place-items-center rounded-2xl"><BusinessIcon name={n}/></div><h3 className="mt-5 text-sm font-extrabold">{n}</h3><div className="mt-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-[var(--bh-faint)]">Explore <ChevronRight size={13} className="inline"/></div></Link>)}</div></div></section>

    <section className="bh-section pt-0"><div className="bh-container"><SectionHeading kicker="Shop by collection" title="Collections" href="/collections"/><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{sections.featured.slice(0,8).map((c:any)=><CollectionCard key={c.handle} collection={c}/>)}</div></div></section>

    <BlogMarquee articles={articles}/>

    <section className="pb-16"><div className="bh-container"><div className="bh-inset rounded-[30px] p-7 md:p-10"><div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="bh-kicker">Stay connected</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight">BuyHoreca updates</h2><p className="bh-body mt-2 max-w-2xl">New articles and buying guides appear here as they are published.</p></div><Link href="/blogs" className="bh-raised-sm inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-extrabold">View blogs <ArrowRight size={17}/></Link></div></div></div></section>
  </>;
}
function HeroCollection({kicker,title,href,localSrc}:{kicker:string;title:string;href:string;localSrc:string}) {
  return <Link href={href} className="group relative min-h-[310px] overflow-hidden rounded-[24px] border border-[var(--bh-line)] bg-[var(--bh-ink)] p-6 shadow-[0_10px_30px_rgba(21,33,43,.08)] md:min-h-[315px]">
    <img src={localSrc} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
    <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,18,24,.84)] via-[rgba(10,18,24,.45)] to-transparent" />
    <div className="relative z-10 flex h-full max-w-[78%] flex-col justify-between text-white"><div className="grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">{kicker==="Coffee"?<Coffee size={23}/>:<Utensils size={23}/>}</div><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-white/70">{kicker}</p><h2 className="mt-2 text-[clamp(1.6rem,2.3vw,2.25rem)] font-extrabold leading-[1.05] tracking-tight">{title}</h2><span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold">Explore <ArrowRight size={15}/></span></div></div>
  </Link>;
}

function CollectionCard({collection}:{collection:any}) {
  const [failed,setFailed]=useState(false);
  const local=`/images/collections/${collection.handle}.jpg`;
  const image=collection.image?.url || (!failed ? local : "");
  return <Link href={`/categories/${collection.handle}`} className="group bh-raised-sm bh-interactive flex h-full flex-col rounded-[22px] p-2.5 sm:p-3">
    <div className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-[16px] bg-[#f7f9fa]">
      {image ? <img src={image} alt={collection.title} onError={()=>{if(!collection.image?.url&&!failed)setFailed(true)}} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"/> : <div className="grid h-full place-items-center px-4 text-center text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--bh-faint)]">Collection image</div>}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 via-black/20 to-transparent"/>
      <div className="absolute inset-x-4 bottom-3">
        <div className="text-base font-extrabold leading-5 text-white drop-shadow-sm sm:text-lg">{collection.title}</div>
      </div>
    </div>
    <div className="flex min-h-[64px] items-center justify-between gap-3 px-2 py-3">
      <div className="min-w-0"><div className="text-[11px] font-bold uppercase tracking-[.10em] text-[var(--bh-faint)]">Collection</div></div>
      <div className="shrink-0 text-[11px] font-extrabold text-[var(--bh-ink)]">Explore <ChevronRight size={12} className="ml-0.5 inline"/></div>
    </div>
  </Link>;
}
function LiveProductSection({kicker,title,products,addToCart,openQuickView}:{kicker:string;title:string;products:Product[];addToCart:(p:Product)=>any;openQuickView:(p:Product)=>void}) {
 if(!products.length) return null;
 return <section className="bh-section pt-0"><div className="bh-container"><SectionHeading kicker={kicker} title={title} href="/shop"/><div className="bh-grid-4">{products.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} openQuickView={openQuickView}/>)}</div></div></section>;
}

function ProductCard({product,addToCart,openQuickView}:{product:Product;addToCart:(p:Product,v?:Variant,q?:number)=>any;openQuickView:(p:Product)=>void}) {
  const [saved,setSaved]=useState(false);
  const [quantity,setQuantity]=useState(1);
  const [added,setAdded]=useState(false);
  const [adding,setAdding]=useState(false);
  const image=product.images[0];
  const selected=product.variants.find(v=>v.availableForSale)||product.variants[0];

  const addSelected=async()=>{
    if(!product.availableForSale || !selected || adding)return;
    setAdding(true);
    try{
      const result=await addToCart(product,selected,quantity);
      if(result){setAdded(true);window.setTimeout(()=>setAdded(false),1900);}
    } finally {setAdding(false);}
  };

  return <article className="group bh-motion-sheen flex h-full min-w-0 flex-col rounded-[22px] border border-[#dfe4e7] bg-white p-3 shadow-[0_8px_24px_rgba(31,42,48,.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(31,42,48,.11)] sm:p-4">
    <div className="relative overflow-hidden rounded-[18px] border border-[#e5e9eb] bg-[#fafbfb]">
      <div className="aspect-[1/0.93]">
        {image ? <Link href={product.href} className="flex h-full w-full items-center justify-center"><img src={image.url} alt={image.altText||product.name} className="h-full w-full object-contain p-6 transition duration-300 group-hover:scale-[1.025] sm:p-8"/></Link> : <Link href={product.href} className="flex h-full w-full items-center justify-center"><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[var(--bh-faint)]">Product image</div></Link>}
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[.1em] text-[var(--bh-ink)] shadow-[0_3px_10px_rgba(31,42,48,.10)]">{product.badge||product.brand}</span>
      <div className="absolute right-3 top-3 flex gap-2">
        <button onClick={()=>setSaved(!saved)} className="grid size-9 place-items-center rounded-full bg-white shadow-[0_3px_10px_rgba(31,42,48,.10)]" aria-label="Wishlist"><Heart size={15} fill={saved?"currentColor":"none"}/></button>
        <button onClick={()=>openQuickView(product)} className="hidden size-9 place-items-center rounded-full bg-white shadow-[0_3px_10px_rgba(31,42,48,.10)] sm:grid" aria-label="Quick view"><Eye size={15}/></button>
      </div>
    </div>

    <div className="flex flex-1 flex-col px-1 pt-4">
      <div className="text-[10px] font-extrabold uppercase tracking-[.11em] text-[var(--bh-faint)]">{product.brand}</div>
      {(typeof product.rating==="number" || typeof product.reviewCount==="number" || typeof product.boughtCount==="number") && <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-extrabold text-[var(--bh-muted)]">
        {typeof product.rating==="number" && <span>★ {product.rating.toFixed(1)}</span>}
        {typeof product.reviewCount==="number" && <span>{product.reviewCount} reviews</span>}
        {typeof product.boughtCount==="number" && <span>{product.boughtCount.toLocaleString()} bought</span>}
      </div>}
      <Link href={product.href} className="mt-1 line-clamp-2 min-h-[50px] text-[15px] font-extrabold leading-[1.45] hover:underline">{product.name}</Link>
      <p className="mt-2 min-h-[52px] line-clamp-3 max-w-[96%] text-[11px] font-medium leading-[1.55] text-[#7b8790]">
        {product.description?.trim() || "Professional HoReCa product from the live BuyHoreca catalogue."}
      </p>

      <div className="mt-3 min-h-[54px] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[18px] font-extrabold tracking-tight">{moneyText(product.price)}</div>
          {product.compareAtPrice&&Number(product.compareAtPrice.amount)>Number(product.price.amount)&&<div className="text-[10px] text-[var(--bh-faint)] line-through">{moneyText(product.compareAtPrice)}</div>}
          
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[112px_1fr] gap-2">
        {product.availableForSale && selected?.availableForSale ? <>
          <div className="bh-qty"><button onClick={()=>setQuantity(q=>Math.max(1,q-1))} aria-label="Decrease quantity"><Minus size={15}/></button><span>{quantity}</span><button onClick={()=>setQuantity(q=>Math.min(99,q+1))} aria-label="Increase quantity"><Plus size={15}/></button></div>
          <button onClick={addSelected} aria-live="polite" disabled={adding} className={`${added?"bh-btn bh-btn-dark":"bh-btn bh-btn-green"} flex h-12 min-w-0 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-extrabold transition-all duration-300`}>{added?<><Check size={15}/> Added</>:adding?<><RefreshCw size={15} className="animate-spin"/> Adding</>:<><ShoppingBag size={15}/> Add to cart</>}</button>
        </> : <Link href={`/quote?handle=${encodeURIComponent(product.handle)}&status=unavailable`} className="bh-btn bh-btn-dark col-span-2 flex h-12 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-extrabold"><FileText size={15}/> Get a Quote</Link>}
      </div>
    </div>
  </article>
}

function SectionHeading({kicker,title,href}:{kicker:string;title:string;href?:string}){return <div className="mb-8 flex items-end justify-between gap-4"><div><p className="bh-kicker">{kicker}</p><h2 className="bh-title mt-2">{title}</h2></div>{href&&<Link href={href} className="hidden items-center gap-2 text-sm font-extrabold sm:flex">View all <ArrowRight size={16}/></Link>}</div>}

/* ------------------------------- shop ----------------------------- */

function ShopPage({addToCart,openQuickView,wishlist,compare,toggleWishlist,toggleCompare}:{addToCart:(p:Product)=>any;openQuickView:(p:Product)=>void;wishlist:string[];compare:string[];toggleWishlist:(p:Product)=>void;toggleCompare:(p:Product)=>void}) {
 const [brand,setBrand]=useState("All brands"); const [productType,setProductType]=useState("All types"); const [availability,setAvailability]=useState("ALL"); const [minPrice,setMinPrice]=useState(""); const [maxPrice,setMaxPrice]=useState(""); const [sort,setSort]=useState("BEST_SELLING"); const [query,setQuery]=useState(""); const [ratingMin,setRatingMin]=useState("ALL"); const [items,setItems]=useState<Product[]>([]); const [cursor,setCursor]=useState<string|null>(null); const [hasMore,setHasMore]=useState(false); const [loading,setLoading]=useState(true); const [loadError,setLoadError]=useState(false); const [filterOpen,setFilterOpen]=useState(false);
 const brands=Array.from(new Set(items.map(p=>p.brand).filter(Boolean))).sort(); const ratedItems=items.filter(p=>typeof p.rating==="number"); const visibleItems=ratingMin==="ALL"?items:items.filter(p=>typeof p.rating==="number" && p.rating>=Number(ratingMin)); const types=Array.from(new Set(items.map(p=>p.productType).filter(Boolean) as string[])).sort();
 const buildQuery=()=>{const parts:string[]=[]; const q=query.trim(); if(q) parts.push(q); if(brand!=="All brands") parts.push(`vendor:${JSON.stringify(brand)}`); if(productType!=="All types") parts.push(`product_type:${JSON.stringify(productType)}`); if(availability==="IN_STOCK") parts.push("available_for_sale:true"); if(availability==="OUT_OF_STOCK") parts.push("available_for_sale:false"); if(minPrice.trim()) parts.push(`variants.price:>=${Number(minPrice).toFixed(2)}`); if(maxPrice.trim()) parts.push(`variants.price:<=${Number(maxPrice).toFixed(2)}`); return parts.join(" AND ");};
 const load=async(reset=false)=>{setLoading(true);setLoadError(false);try{const sm=sort==="NEWEST"?{key:"CREATED_AT",reverse:true}:sort==="A_Z"?{key:"TITLE",reverse:false}:sort==="PRICE_LOW"?{key:"PRICE",reverse:false}:sort==="PRICE_HIGH"?{key:"PRICE",reverse:true}:{key:"BEST_SELLING",reverse:false}; const r=await fetchProducts(48,reset?null:cursor,buildQuery()||undefined,sm.key,sm.reverse); setItems(prev=>reset?r.products:[...prev,...r.products]); setCursor(r.pageInfo.endCursor); setHasMore(r.pageInfo.hasNextPage);}catch{setLoadError(true)}finally{setLoading(false)}};
 useEffect(()=>{void load(true)},[brand,productType,availability,minPrice,maxPrice,sort]);
 const resetFilters=()=>{setBrand("All brands");setProductType("All types");setAvailability("ALL");setMinPrice("");setMaxPrice("");setSort("BEST_SELLING");setQuery("");setRatingMin("ALL")};
 return <Shell><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="bh-kicker">Current catalogue</p><h1 className="bh-title mt-2">All Products</h1><p className="bh-body mt-3">Browse the current BuyHoreca catalogue with live product information.</p></div><button onClick={()=>void load(true)} className="bh-btn bh-btn-light inline-flex items-center rounded-full px-4 py-2.5 text-xs font-extrabold"><RefreshCw size={14} className="mr-1.5 inline"/>Refresh</button></div>
  <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]"><aside className={`${filterOpen?"block":"hidden"} bh-raised rounded-[26px] p-5 lg:block`}><div className="flex items-center justify-between"><div><div className="bh-kicker">Refine catalogue</div><h2 className="mt-1 text-lg font-extrabold">Filters & sort</h2></div><button onClick={()=>setFilterOpen(false)} className="bh-btn bh-btn-light grid size-9 place-items-center rounded-full lg:hidden" aria-label="Close filters"><X size={17}/></button></div>
   <label className="mt-6 block text-sm font-extrabold">Brand<select value={brand} onChange={e=>setBrand(e.target.value)} className="bh-inset mt-2 w-full rounded-2xl bg-transparent p-3 outline-none"><option>All brands</option>{brands.map(b=><option key={b}>{b}</option>)}</select></label>
   <label className="mt-4 block text-sm font-extrabold">Product type<select value={productType} onChange={e=>setProductType(e.target.value)} className="bh-inset mt-2 w-full rounded-2xl bg-transparent p-3 outline-none"><option>All types</option>{types.map(t=><option key={t}>{t}</option>)}</select></label>
   <div className="mt-4"><div className="text-sm font-extrabold">Availability</div><div className="mt-2 grid grid-cols-3 gap-2">{[["ALL","All"],["IN_STOCK","In stock"],["OUT_OF_STOCK","Quote"]].map(([v,l])=><button key={v} onClick={()=>setAvailability(v)} className={`rounded-xl px-2 py-2 text-[11px] font-extrabold ${availability===v?"bh-btn bh-btn-dark":"bh-btn bh-btn-light"}`}>{l}</button>)}</div></div>
    <label className="mt-4 block text-sm font-extrabold">Rating<select value={ratingMin} onChange={e=>setRatingMin(e.target.value)} disabled={!ratedItems.length} className="bh-inset mt-2 w-full rounded-2xl bg-transparent p-3 outline-none"><option value="ALL">All ratings</option><option value="4">4+ ★</option><option value="3">3+ ★</option><option value="5">5 ★</option></select>{!ratedItems.length&&<span className="mt-2 block text-[10px] leading-4 text-[var(--bh-faint)]">Rating filters activate when verified review data is available.</span>}</label>
   <label className="mt-5 block text-sm font-extrabold">Sort<select value={sort} onChange={e=>setSort(e.target.value)} className="bh-inset mt-2 w-full rounded-2xl bg-transparent p-3 outline-none"><option value="BEST_SELLING">Best selling</option><option value="NEWEST">Newest</option><option value="A_Z">A–Z</option><option value="PRICE_LOW">Price: low to high</option><option value="PRICE_HIGH">Price: high to low</option></select></label>
   <button onClick={resetFilters} className="bh-btn bh-btn-light mt-5 w-full rounded-full px-4 py-3 text-sm font-extrabold"><RotateCcw size={15} className="mr-2 inline"/>Reset filters</button>
  </aside><div><div className="mb-5 flex items-center justify-between gap-3"><button onClick={()=>setFilterOpen(true)} className="bh-btn bh-btn-light rounded-full px-4 py-2.5 text-sm font-extrabold lg:hidden"><SlidersHorizontal size={15} className="mr-2 inline"/>Filters</button><form className="bh-inset flex h-11 min-w-0 max-w-2xl flex-1 items-center gap-2 rounded-full px-4" onSubmit={e=>{e.preventDefault();void load(true)}}><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search products, brands, SKUs..."/><button className="bh-btn bh-btn-dark rounded-full px-4 py-2 text-xs font-extrabold">Search</button></form><div className="hidden text-xs font-extrabold text-[var(--bh-muted)] sm:block">{items.length}{hasMore?"+":""} loaded</div></div>{loadError&&<div className="bh-inset mb-5 rounded-2xl p-4 text-sm text-[var(--bh-muted)]">We couldn’t refresh the catalogue right now. Please try again.</div>}<div className="bh-grid-4">{visibleItems.map(p=><div key={p.id}><ProductCard product={p} addToCart={addToCart} openQuickView={openQuickView}/><div className="mt-2 flex gap-3 px-2 text-[10px] font-extrabold text-[var(--bh-muted)]"><button onClick={()=>toggleWishlist(p)}>{wishlist.includes(p.id)?"Saved":"Wishlist"}</button><button onClick={()=>toggleCompare(p)}>{compare.includes(p.id)?"Compared":"Compare"}</button></div></div>)}</div>{loading&&<div className="py-10 text-center text-sm text-[var(--bh-muted)]">Loading products…</div>}{!loading&&hasMore&&<div className="mt-8 text-center"><button onClick={()=>void load(false)} className="bh-btn bh-btn-dark rounded-full px-7 py-3 text-sm font-extrabold">Load more products</button></div>}</div></div>
 </Shell>;
}

/* --------------------------- collections -------------------------- */

function CategoriesPage({collections}:{collections:Collection[]}) {
 return <Shell>
   <p className="bh-kicker">Shop by Category</p>
   <div className="flex items-end justify-between gap-4">
     <div><h1 className="bh-title mt-2">Browse collections</h1><p className="bh-body mt-4 max-w-3xl">Browse the latest BuyHoreca collections.</p></div>
     <span className="hidden text-xs font-extrabold text-[var(--bh-muted)] sm:block">{collections.length} collections</span>
   </div>
   {collections.length ? <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{collections.map(c=><CollectionCard key={c.id} collection={c}/>)}</div> : <div className="bh-inset mt-10 rounded-[24px] p-7"><p className="bh-body">We are refreshing our collections. Please check back shortly.</p></div>}
 </Shell>;
}
function CategoryPage({slug,collections,addToCart,openQuickView}:{slug:string;collections:Collection[];addToCart:(p:Product)=>any;openQuickView:(p:Product)=>void}) {
 const seed=collections.find(c=>c.handle===slug)||collections.find(c=>slugify(c.title)===slug)||null;
 const [collection,setCollection]=useState<Collection|null>(seed);
 const [loading,setLoading]=useState(true);
 const [loadingMore,setLoadingMore]=useState(false);
 const load=async(reset=true)=>{
   try{
     if(reset)setLoading(true); else setLoadingMore(true);
     const handle=seed?.handle||slug;
     const next=await fetchCollectionHandle(handle,reset?null:collection?.pageInfo?.endCursor||null);
     if(!next){ if(reset)setCollection(null); return; }
     setCollection(prev=>{
       if(reset) return next;
       if(!prev) return next;
       return {...next, products:[...prev.products,...next.products], pageInfo:next.pageInfo};
     });
   }catch{ if(reset)setCollection(null); }
   finally{setLoading(false);setLoadingMore(false);}
 };
 useEffect(()=>{void load(true)},[slug]);
 return <Shell>
   <div className="bh-inset rounded-[28px] p-7"><p className="bh-kicker">Collection</p><h1 className="bh-title mt-2">{collection?.title||titleFromSlug(slug)}</h1><p className="bh-body mt-4 max-w-3xl">{collection?.description||"Explore professional products from this BuyHoreca collection."}</p></div>
   {loading?<div className="py-12 text-center text-sm text-[var(--bh-muted)]">Loading collection…</div>:collection?<><div className="mt-8 flex items-center justify-between text-xs font-extrabold text-[var(--bh-muted)]"><span>{collection.products.length} products shown</span><span>More products load automatically on request</span></div><div className="mt-5 bh-grid-4">{collection.products.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} openQuickView={openQuickView}/>)}</div>{!collection.products.length&&<div className="bh-inset mt-6 rounded-[24px] p-7"><p className="bh-body">We’re updating this collection. Please check back shortly or browse all products.</p></div>}{collection.pageInfo?.hasNextPage&&<div className="mt-8 text-center"><button onClick={()=>void load(false)} disabled={loadingMore} className="bh-btn bh-btn-dark rounded-full px-7 py-3 text-sm font-extrabold">{loadingMore?"Loading…":"Load more products"}</button></div>}</>:<div className="bh-inset mt-8 rounded-[28px] p-8"><p className="bh-body">We are updating this collection. Please check back shortly or browse all products.</p><Link href="/shop" className="bh-btn bh-btn-dark mt-6 inline-flex rounded-full px-6 py-3 text-sm font-extrabold">Browse all products</Link></div>}
 </Shell>;
}
function CollectionsPage({collections}:{collections:Collection[]}){return <CategoriesPage collections={collections}/>}

function BusinessPage(){return <Shell><p className="bh-kicker">Shop by Business</p><h1 className="bh-title mt-2">Solutions for your operation</h1><p className="bh-body mt-4 max-w-3xl">Business routes are kept stable while product data is sourced live from collections.</p><div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{VERIFIED_BUSINESSES.map(n=><Link key={n} href={`/business/${slugify(n)}`} className="bh-raised bh-interactive rounded-[26px] p-7"><div className="bh-inset grid size-12 place-items-center rounded-2xl"><BusinessIcon name={n}/></div><h2 className="mt-5 text-xl font-extrabold">{n}</h2><p className="mt-3 text-sm text-[var(--bh-muted)]">Explore products for {n.toLowerCase()} operations.</p></Link>)}</div></Shell>}
function BusinessDetail({slug,products,addToCart,openQuickView}:{slug:string;products:Product[];addToCart:(p:Product)=>any;openQuickView:(p:Product)=>void}){return <Shell><p className="bh-kicker">Business</p><h1 className="bh-title mt-2">{titleFromSlug(slug)}</h1><p className="bh-body mt-4">Browse products selected for this business category.</p><div className="mt-10 bh-grid-4">{products.slice(0,16).map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} openQuickView={openQuickView}/>)}</div></Shell>}

const BRAND_LOGOS: Record<string, string> = {
  "buyhoreca": "/images/buyhoreca_logo.png",
  "bisetti": "/images/brands/Logo_Bisetti.jpg",
  "borgonova": "/images/brands/Logo_Borgonova.jpg",
  "brewing-edge": "/images/brands/Logo_Brewing_Edge.jpg",
  "bunn": "/images/brands/Bunn_Logo.avif",
  "cambro": "/images/brands/Logo_Cambro.avif",
  "carlisle": "/images/brands/Logo_Carlisle.jpg",
  "cooper-atkins": "/images/brands/Logo_Cooper_Atkins.jpg",
  "cutlery-pro": "/images/brands/Logo_Cutlery_Pro.jpg",
  "cutlerypro": "/images/brands/Logo_Cutlery_Pro.jpg",
  "eco-botanics": "/images/brands/eco-botanics.svg",
  "edhard": "/images/brands/Logo_Edhard.jpg",
  "eros": "/images/brands/eros.svg",
  "gi-metal": "/images/brands/Logo_Gimetal.avif",
  "isi": "/images/brands/isi.svg",
  "kalando": "/images/brands/Logo_Kalando.avif",
  "knicer": "/images/brands/Logo_Knicer.jpg",
  "mercer-culinary": "/images/brands/Logo_Mercer_Culinary.jpg",
  "san-jamer": "/images/brands/Logo_San_Jamer.jpg",
  "sonoco": "/images/brands/Logo_Sonoco.jpg",
  "thermo-hauser": "/images/brands/Logo_Thermo_Hauser.avif",
  "tight-vac": "/images/brands/Logo_Tight_Vac.jpg",
  "winco": "/images/brands/Logo_Winco.jpg",
  "vollrath": "/images/brands/vollrath.svg",
  "ziora": "/images/brands/Logo_Ziora.avif",
};

function brandLogoPath(name: string) {
  return BRAND_LOGOS[slugify(name)] || "";
}

function BrandPage({products}:{products:Product[]}){
  const brands=Array.from(new Set(products.map(p=>p.brand))).filter(Boolean).sort();
  return <Shell>
    <p className="bh-kicker">Shop by Brands</p>
    <h1 className="bh-title mt-2">Brands</h1>
    <p className="bh-body mt-4 max-w-3xl">Explore the brands currently represented in the live BuyHoreca catalogue.</p>
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {brands.map(b=>{
        const src=brandLogoPath(b);
        return <Link key={b} href={`/brands/${slugify(b)}`} className="bh-raised bh-interactive rounded-[24px] p-5 sm:p-6">
          <div className={`bh-brand-logo-box ${src ? "" : "bh-brand-logo-missing"}`}>
            {src ? <img src={src} alt={`${b} logo`} className="bh-brand-logo" /> : <span className="bh-brand-logo-placeholder">Add logo</span>}
          </div>
          <h2 className="mt-5 font-extrabold">{b}</h2>
          <p className="mt-2 text-xs text-[var(--bh-faint)]">Live products →</p>
        </Link>
      })}
    </div>
  </Shell>
}
function BrandDetail({slug,products,addToCart,openQuickView}:{slug:string;products:Product[];addToCart:(p:Product)=>any;openQuickView:(p:Product)=>void}){
  const name=titleFromSlug(slug); const list=products.filter(p=>slugify(p.brand)===slug); const src=brandLogoPath(name);
  return <Shell>
    <div className="bh-raised rounded-[30px] p-6 md:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className={`bh-brand-logo-box w-full shrink-0 sm:w-56 ${src ? "" : "bh-brand-logo-missing"}`}>
          {src ? <img src={src} alt={`${name} logo`} className="bh-brand-logo" /> : <span className="bh-brand-logo-placeholder">Add logo</span>}
        </div>
        <div><p className="bh-kicker">Brand</p><h1 className="bh-title mt-2">{name}</h1><p className="bh-body mt-3">Products currently available from {name} in the live BuyHoreca catalogue.</p></div>
      </div>
    </div>
    <div className="mt-10 bh-grid-4">{(list.length?list:products).map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} openQuickView={openQuickView}/>)}</div>
  </Shell>
}

/* ------------------------------- product -------------------------- */

function ProductPage({product,products,addToCart,openQuote,wishlist,toggleWishlist,openQuickView}:{product:Product;products:Product[];addToCart:(p:Product,v?:Variant,q?:number)=>any;openQuote:()=>void;wishlist:string[];toggleWishlist:(p:Product)=>void;openQuickView:(p:Product)=>void}) {
 const [selected,setSelected]=useState(product.variants.find(v=>v.availableForSale)||product.variants[0]); const [tab,setTab]=useState<"desc"|"info">("desc"); const [qty,setQty]=useState(1);
 const canBuy=Boolean(product.availableForSale && selected?.availableForSale);
 const buyNow=async()=>{if(!canBuy||!selected)return;const next=await addToCart(product,selected,qty);if(next?.checkoutUrl)window.location.href=next.checkoutUrl;};
 return <Shell>
  <JsonLd data={{
    "@context":"https://schema.org",
    "@type":"Product",
    name:product.name,
    description:(product.description||"").slice(0,500),
    sku:selected?.sku||undefined,
    brand:{"@type":"Brand",name:product.brand},
    image:product.images.map(i=>i.url),
    offers:{"@type":"Offer",price:selected?.price?.amount||product.price.amount,priceCurrency:selected?.price?.currencyCode||product.price.currencyCode,availability:canBuy?"https://schema.org/InStock":"https://schema.org/OutOfStock",url:`https://buyhoreca.com${product.href}`},
    ...(product.rating && product.reviewCount ? {aggregateRating:{"@type":"AggregateRating",ratingValue:product.rating,reviewCount:product.reviewCount}} : {})
  }} />
   <div className="text-xs font-bold text-[var(--bh-muted)]"><Link href="/">Home</Link> / <Link href="/brands">Brands</Link> / {product.brand} / {product.name}</div>
   <div className="mt-7 grid gap-8 lg:grid-cols-[1.06fr_.94fr]">
     <div className="bh-inset rounded-[30px] p-4 md:p-6"><div className="grid min-h-[460px] place-items-center rounded-[24px] border border-[var(--bh-line)] md:min-h-[620px]"><ProductGallery product={product}/></div></div>
     <div className="bh-raised rounded-[30px] p-7 md:p-10">
       <div className="flex flex-wrap gap-2"><span className="bh-chip bh-inset">{product.brand}</span>{!canBuy&&<span className="bh-chip bh-raised-sm">Quote available</span>}</div>
       <h1 className="bh-modal-title mt-4 text-[clamp(2.2rem,4.3vw,4.1rem)]">{product.name}</h1>
       <div className="mt-7 text-3xl font-extrabold tracking-tight">{moneyText(selected?.price||product.price)}</div>
       <p className="bh-body mt-5">{product.description||"Product details are being prepared."}</p>
       {product.variants.length>1&&<div className="mt-7"><div className="text-sm font-extrabold">Choose variant</div><div className="mt-3 flex max-h-28 flex-wrap gap-2 overflow-auto">{product.variants.map(v=><button key={v.id} onClick={()=>setSelected(v)} disabled={!v.availableForSale} className={`bh-variant ${selected?.id===v.id?"bh-variant-active":""}`}>{v.title}</button>)}</div></div>}
       <div className="mt-7 grid gap-2 text-sm text-[var(--bh-muted)]"><div>SKU: <b className="text-[var(--bh-ink)]">{selected?.sku||"SKU not provided"}</b></div>{canBuy&&<div>Availability: <b className="text-[var(--bh-ink)]">Available</b></div>}</div>
       {canBuy ? <div className="mt-7 flex flex-wrap items-center gap-3">
         <div className="bh-qty"><button onClick={()=>setQty(q=>Math.max(1,q-1))} aria-label="Decrease quantity"><Minus size={15}/></button><span>{qty}</span><button onClick={()=>setQty(q=>Math.min(99,q+1))} aria-label="Increase quantity"><Plus size={15}/></button></div>
         <button onClick={()=>selected&&addToCart(product,selected,qty)} className="bh-btn bh-btn-dark inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-extrabold"><ShoppingBag size={17}/> Add to Cart</button>
         <button onClick={buyNow} className="bh-btn bh-btn-green inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-extrabold"><Check size={17}/> Buy Now</button>
         <button onClick={()=>toggleWishlist(product)} className="bh-btn bh-btn-light inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-extrabold"><Heart size={17} fill={wishlist.includes(product.id)?"currentColor":"none"}/>{wishlist.includes(product.id)?"Saved":"Wishlist"}</button>
       </div> : <div className="mt-7"><Link href={`/quote?handle=${encodeURIComponent(product.handle)}&status=unavailable`} className="bh-btn bh-btn-dark inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-sm font-extrabold"><FileText size={17}/> Get a Quote</Link></div>}
       <div className="mt-7 border-t border-[var(--bh-line)] pt-5 text-xs leading-6 text-[var(--bh-muted)]">Purchase options update automatically when an item becomes available again.</div>
     </div>
   </div>
   <div className="mt-10 bh-raised rounded-[28px] p-3"><div className="flex flex-wrap gap-2"><button onClick={()=>setTab("desc")} className={`rounded-full px-5 py-3 text-sm font-extrabold ${tab==="desc"?"bh-inset":""}`}>Description</button><button onClick={()=>setTab("info")} className={`rounded-full px-5 py-3 text-sm font-extrabold ${tab==="info"?"bh-inset":""}`}>Additional information</button></div><div className="p-6 md:p-8">{tab==="desc"?<div className="max-w-4xl text-sm leading-7 text-[var(--bh-muted)]" dangerouslySetInnerHTML={{__html:product.descriptionHtml||product.description||"<p>Product details are being prepared.</p>"}}/>:<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Brand",product.brand],["Product type",product.productType||"—"],["SKU",selected?.sku||"—"],["Variants",String(product.variants.length)]].map(([k,v])=><div key={k} className="bh-inset rounded-2xl p-4"><div className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[var(--bh-faint)]">{k}</div><div className="mt-1 font-extrabold">{v}</div></div>)}</div>}</div></div>
   <section className="bh-section px-0"><SectionHeading kicker="Related" title="You may also like"/><div className="bh-grid-4">{products.filter(p=>p.id!==product.id&&(p.brand===product.brand||p.category===product.category)).slice(0,4).map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} openQuickView={openQuickView}/>)}</div></section>
 </Shell>
}
function ProductGallery({product}:{product:Product}) {
 const [active,setActive]=useState(0); const image=product.images[active];
 return <div className="w-full"><div className="flex min-h-[340px] items-center justify-center md:min-h-[500px]">{image?<img src={image.url} alt={image.altText||product.name} className="max-h-[500px] w-full object-contain p-8"/>:<div className="bh-media-core">Product image</div>}</div>{product.images.length>1&&<div className="flex gap-2 overflow-x-auto p-3">{product.images.map((im,i)=><button key={im.url+i} onClick={()=>setActive(i)} className={`bh-raised-sm size-20 shrink-0 overflow-hidden rounded-2xl p-1 ${i===active?"translate-y-[1px]":""}`}><img src={im.url} alt="" className="h-full w-full object-contain"/></button>)}</div>}</div>;
}

/* ------------------------------- search ---------------------------- */

function SearchPage({query,addToCart,openQuickView}:{query:string;addToCart:(p:Product)=>any;openQuickView:(p:Product)=>void}) {
 const [results,setResults]=useState<Product[]>([]); const [loading,setLoading]=useState(false); const [loadingMore,setLoadingMore]=useState(false); const [cursor,setCursor]=useState<string|null>(null); const [hasMore,setHasMore]=useState(false); const [total,setTotal]=useState(0);
 const load=async(reset=true)=>{if(!query)return; if(reset)setLoading(true);else setLoadingMore(true); try{const r=await fetchSearch(query,reset?null:cursor);setResults(prev=>reset?r.products:[...prev,...r.products]);setCursor(r.pageInfo?.endCursor||null);setHasMore(Boolean(r.pageInfo?.hasNextPage));setTotal(r.totalCount||0)}catch{if(reset){setResults([]);setTotal(0)}}finally{setLoading(false);setLoadingMore(false)}};
 useEffect(()=>{void load(true)},[query]);
 return <Shell><p className="bh-kicker">Product search</p><h1 className="bh-title mt-2">{query?`Results for “${query}”`:"Search BuyHoreca"}</h1><form action="/search" className="bh-inset mt-8 flex h-14 max-w-3xl rounded-full p-1"><Search size={19} className="m-4"/><input name="q" defaultValue={query} placeholder="I'm looking for..." className="min-w-0 flex-1 bg-transparent outline-none"/><button className="bh-raised-sm rounded-full px-6 text-sm font-extrabold">Search</button></form>{loading?<div className="py-12 text-center text-sm text-[var(--bh-muted)]">Searching products…</div>:<><div className="mt-7 text-xs font-extrabold text-[var(--bh-muted)]">{total?`${total} results`:`${results.length} results`}</div><div className="mt-6 bh-grid-4">{results.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} openQuickView={openQuickView}/>)}</div>{hasMore&&<div className="mt-9 text-center"><button onClick={()=>void load(false)} disabled={loadingMore} className="bh-btn bh-btn-dark rounded-full px-7 py-3 text-sm font-extrabold">{loadingMore?"Loading…":"Load more results"}</button></div>}</>}</Shell>;
}

/* ------------------------------ cart ------------------------------- */

function CartPage({cart,cartOpen}:{cart:Cart|null;cartOpen:()=>void}) {return <Shell><p className="bh-kicker">Cart</p><h1 className="bh-title mt-2">Cart</h1>{!cart||cart.lines.length===0?<div className="bh-raised mt-10 rounded-[30px] p-8 md:p-12"><h2 className="text-2xl font-extrabold">Your cart is empty</h2><p className="bh-body mt-3">Add products from the BuyHoreca catalogue.</p><Link href="/shop" className="bh-raised-sm mt-7 inline-flex rounded-full px-6 py-3 text-sm font-extrabold">Continue shopping</Link></div>:<div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]"><div className="grid gap-3">{cart.lines.map(l=><div key={l.id} className="bh-raised-sm rounded-[24px] p-5 flex items-center gap-4"><div className="bh-inset grid size-20 shrink-0 place-items-center rounded-2xl overflow-hidden">{l.merchandise.image?<img src={l.merchandise.image.url} alt="" className="h-full w-full object-contain p-2"/>:<Package size={18}/>}</div><div className="min-w-0 flex-1"><div className="text-sm font-extrabold">{l.merchandise.product.title}</div><div className="mt-1 text-xs text-[var(--bh-muted)]">{l.merchandise.title}</div><div className="mt-2 text-sm font-extrabold">{moneyText(l.merchandise.price)}</div></div><div className="text-sm font-extrabold">×{l.quantity}</div></div>)}</div><div className="bh-inset rounded-[28px] p-7"><h2 className="text-xl font-extrabold">Summary</h2><div className="mt-6 flex justify-between text-sm"><span>Subtotal</span><span>{moneyText(cart.cost.subtotalAmount)}</span></div><div className="mt-3 flex justify-between text-xl font-extrabold"><span>Total</span><span>{moneyText(cart.cost.totalAmount)}</span></div><a href={cart.checkoutUrl} className="mt-7 flex min-h-12 items-center justify-center rounded-full bg-[var(--bh-green)] px-6 text-sm font-extrabold text-white">Secure checkout</a><button onClick={cartOpen} className="bh-raised-sm mt-3 w-full rounded-full py-3 text-sm font-extrabold">Open Cart Drawer</button></div></div>}</Shell>}

/* ---------------------------- wishlist/compare -------------------- */

function WishlistPage({ids,products,addToCart,openQuickView}:{ids:string[];products:Product[];addToCart:(p:Product)=>any;openQuickView:(p:Product)=>void}){const list=products.filter(p=>ids.includes(p.id));return <Shell><p className="bh-kicker">Saved products</p><h1 className="bh-title mt-2">Wishlist</h1>{list.length?<div className="mt-10 bh-grid-4">{list.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} openQuickView={openQuickView}/>)}</div>:<div className="bh-inset mt-10 rounded-[28px] p-8"><p className="bh-body">Save products with the heart control.</p></div>}</Shell>}
function ComparePage({ids,products}:{ids:string[];products:Product[]}){const list=products.filter(p=>ids.includes(p.id));return <Shell><p className="bh-kicker">Product tools</p><h1 className="bh-title mt-2">Compare</h1>{list.length?<div className="mt-10 overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead><tr className="bh-raised-sm"><th className="p-5">Field</th>{list.map(p=><th key={p.id} className="p-5">{p.name}</th>)}</tr></thead><tbody>{[["Brand",(p:Product)=>p.brand],["Price",(p:Product)=>moneyText(p.price)],["Product type",(p:Product)=>p.productType||"—"],["Variants",(p:Product)=>String(p.variants.length)]].map(([l,g])=><tr key={l as string}><td className="bh-inset p-5 font-extrabold">{l as string}</td>{list.map(p=><td key={p.id} className="bh-inset p-5">{(g as any)(p)}</td>)}</tr>)}</tbody></table></div>:<div className="bh-inset mt-10 rounded-[28px] p-8"><p className="bh-body">Use Compare under a product to build a comparison set.</p></div>}</Shell>}

/* ------------------------------- content -------------------------- */

function QuotePage(){
 const params=useSearchParams(); const handle=params.get("handle")||""; const status=params.get("status")==="unavailable";
 const [product,setProduct]=useState<Product|null>(null); const [loading,setLoading]=useState(Boolean(handle));
 const [name,setName]=useState(""); const [company,setCompany]=useState(""); const [phone,setPhone]=useState(""); const [email,setEmail]=useState(""); const [notes,setNotes]=useState("");
 useEffect(()=>{if(!handle){setLoading(false);return;}fetchProductHandle(handle).then(setProduct).catch(()=>setProduct(null)).finally(()=>setLoading(false))},[handle]);
 const liveStatus=product?(product.availableForSale?"currently available":"currently unavailable"):(status?"currently unavailable":"availability to be confirmed");
 const imageUrl=product?.images?.[0]?.url||"";
 const message=[
  "Hello BuyHoreca, I would like a quotation.",
  product?`Product: ${product.name}`:handle?`Product handle: ${handle}`:"Product: General enquiry",
  product?`Brand: ${product.brand}`:"",
  product?`Price shown: ${moneyText(product.price)}`:"",
  `Availability: ${liveStatus}.`,
  product?.variants?.length?`Variants: ${product.variants.map(v=>v.title).join(", ")}`:"",
  imageUrl?`Product image: ${imageUrl}`:"",
  name?`Name: ${name}`:"", company?`Company: ${company}`:"", phone?`Phone: ${phone}`:"", email?`Email: ${email}`:"", notes?`Notes: ${notes}`:""
 ].filter(Boolean).join("\n");
 const whatsapp=`https://wa.me/971565334464?text=${encodeURIComponent(message)}`;
 return <Shell>
  <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
   <div className="bh-raised rounded-[30px] p-7 md:p-10">
    <p className="bh-kicker">Commercial enquiry</p><h1 className="bh-modal-title mt-2">Get a Quote</h1>
    <p className="bh-body mt-4">The quotation message is assembled from the current product information so the BuyHoreca team gets the right product context.</p>
    {loading&&<div className="bh-inset mt-7 rounded-2xl p-5 text-sm text-[var(--bh-muted)]">Loading product details…</div>}
    {product&&<div className="bh-inset mt-7 rounded-[24px] p-4"><div className="flex gap-4"><div className="size-28 shrink-0 overflow-hidden rounded-2xl border border-[var(--bh-line)] bg-white">{imageUrl&&<img src={imageUrl} alt={product.name} className="h-full w-full object-contain p-2"/>}</div><div className="min-w-0"><div className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[var(--bh-faint)]">{product.brand}</div><div className="mt-1 text-base font-extrabold leading-5">{product.name}</div><div className="mt-2 text-sm font-extrabold">{moneyText(product.price)}</div><div className="mt-1 text-xs font-bold text-[var(--bh-muted)]">Availability: {liveStatus}</div></div></div></div>}
    <form className="mt-7 grid gap-4" onSubmit={e=>e.preventDefault()}>
      <div className="grid gap-4 sm:grid-cols-2">
        <input value={name} onChange={e=>setName(e.target.value)} className="bh-inset rounded-2xl bg-transparent p-4 outline-none" placeholder="Full name"/>
        <input value={company} onChange={e=>setCompany(e.target.value)} className="bh-inset rounded-2xl bg-transparent p-4 outline-none" placeholder="Company"/>
        <input value={phone} onChange={e=>setPhone(e.target.value)} className="bh-inset rounded-2xl bg-transparent p-4 outline-none" placeholder="Phone / WhatsApp"/>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="bh-inset rounded-2xl bg-transparent p-4 outline-none" placeholder="Email"/>
      </div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="bh-inset min-h-32 rounded-2xl bg-transparent p-4 outline-none" placeholder="Quantity, delivery date, specifications or other notes"/>
      <div className="bh-inset rounded-[20px] p-5"><div className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--bh-faint)]">Message preview</div><pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-[var(--bh-muted)]">{message}</pre></div>
      <a href={whatsapp} target="_blank" rel="noreferrer" className="bh-btn bh-btn-green inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-extrabold"><MessageCircle size={17}/> Send to BuyHoreca on WhatsApp</a>
      <div className="text-[11px] leading-5 text-[var(--bh-muted)]">The message includes the product image link when an image is available.</div>
    </form>
   </div>
   <div className="bh-inset rounded-[30px] p-7 md:p-10"><p className="bh-kicker">Quote state</p><h2 className="mt-2 text-2xl font-extrabold">{product?(product.availableForSale?"Product is currently available":"Product is currently out of stock"):(status?"Product is currently unavailable":"Availability to be confirmed")}</h2><p className="bh-body mt-4">When an item is available, normal purchase controls appear. When it is unavailable, the storefront offers a quotation instead.</p><div className="mt-7 grid gap-3">{["Product details included","Brand and price included","Availability included","Product image included","Quantity / delivery notes supported"].map(x=><div key={x} className="bh-raised-sm flex items-center gap-3 rounded-2xl p-4 text-sm font-extrabold"><Check size={16}/>{x}</div>)}</div></div>
  </div>
 </Shell>;
}
function TrackPage(){return <Shell><p className="bh-kicker">Order Tracking</p><h1 className="bh-title mt-2">Track your order</h1><div className="bh-raised mt-10 max-w-2xl rounded-[30px] p-7 md:p-10"><label className="text-sm font-extrabold">Order number<input className="bh-inset mt-2 w-full rounded-2xl bg-transparent p-4 outline-none" placeholder="Enter order number"/></label><label className="mt-5 block text-sm font-extrabold">Email<input className="bh-inset mt-2 w-full rounded-2xl bg-transparent p-4 outline-none" placeholder="Email used for the order"/></label><button className="bh-raised-sm mt-5 rounded-full bg-[var(--bh-green)] px-7 py-3 text-sm font-extrabold text-white">Track order</button></div></Shell>}
function AboutPage(){return <Shell>
  <section className="bh-raised overflow-hidden rounded-[34px] p-7 md:p-12 lg:p-16">
    <p className="bh-kicker">About BuyHoreca</p>
    <h1 className="bh-title mt-3 max-w-5xl">Professional HoReCa shopping, built around the needs of hospitality.</h1>
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
      <div>
        <p className="bh-body">BuyHoreca is a UAE-focused HoReCa marketplace for professional equipment, supplies and operational essentials across restaurants, hotels, cafés, bakeries, catering and foodservice.</p>
        <p className="bh-body mt-5">The storefront connects customers directly to a live Shopify catalogue, so product availability, variants, pricing and purchasing stay connected to the underlying commerce system.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link href="/shop" className="bh-btn bh-btn-green inline-flex rounded-full px-6 py-3 text-sm font-extrabold">Explore products <ArrowRight size={16}/></Link><Link href="/quote" className="bh-btn bh-btn-light inline-flex rounded-full px-6 py-3 text-sm font-extrabold">Request a quote <FileText size={16}/></Link></div>
      </div>
      <div className="bh-inset rounded-[28px] p-7">
        <p className="bh-kicker">What we serve</p>
        <ul className="mt-5 grid gap-4 text-sm font-bold text-[var(--bh-muted)]"><li className="flex gap-3"><Hotel size={18}/> Hotels & hospitality</li><li className="flex gap-3"><Utensils size={18}/> Restaurants & catering</li><li className="flex gap-3"><Coffee size={18}/> Coffee & beverage operations</li><li className="flex gap-3"><ChefHat size={18}/> Professional kitchens & bakery</li></ul>
      </div>
    </div>
  </section>
  <section className="mt-5 grid gap-5 lg:grid-cols-3">
    {[['Company story','/images/collections/1.png'],['Brands & partnerships','/images/collections/2.png'],['Facilities / showroom','/images/collections/3.png']].map(([title,image])=><div key={title} className="bh-raised-sm overflow-hidden rounded-[28px]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef2f3]"><img src={image} alt={`${title} image`} className="absolute inset-0 !h-full !w-full object-cover" /></div>
      <div className="p-6"><h2 className="text-xl font-extrabold">{title}</h2></div>
    </div>)}
  </section>
  <section className="bh-raised mt-5 rounded-[30px] p-7 md:p-10"><p className="bh-kicker">The BuyHoreca promise</p><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[['Live catalogue','Products, variants and availability stay connected to Shopify.'],['Professional range','Equipment and supplies selected for hospitality and foodservice.'],['Commercial support','Bulk requirements and quotation requests are supported.'],['UAE-based service','Local contact, delivery and customer support from Dubai.']].map(([t,c])=><div key={t} className="bh-inset rounded-[22px] p-5"><h3 className="font-extrabold">{t}</h3><p className="mt-2 text-sm leading-6 text-[var(--bh-muted)]">{c}</p></div>)}</div></section>
</Shell>}

function InformationPage(){const links=[["About Us","/about"],["Terms & Conditions","/policies/terms"],["Privacy Policy","/policies/privacy"],["Order Policy","/policies/order"],["Warranty & Returns","/policies/returns"],["FAQ","/faq"],["Shipping & Delivery","/shipping"],["Contact Us","/contact"]];return <Shell><p className="bh-kicker">Information</p><h1 className="bh-title mt-2">Customer information</h1><p className="bh-body mt-4 max-w-3xl">Policies, support information and useful links for BuyHoreca customers.</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{links.map(([label,href])=><Link key={href} href={href} className="bh-raised-sm bh-interactive rounded-[24px] p-6"><div className="text-lg font-extrabold">{label}</div><div className="mt-3 text-xs font-bold text-[var(--bh-faint)]">Open page <ArrowRight size={13} className="ml-1 inline"/></div></Link>)}</div></Shell>}

function ContactPage(){return <Shell><p className="bh-kicker">Reach us here</p><h1 className="bh-title mt-2">Contact BuyHoreca</h1><div className="mt-10 grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="bh-raised rounded-[30px] p-7 md:p-10"><h2 className="text-2xl font-extrabold">Dubai</h2><div className="mt-7 grid gap-5 text-sm text-[var(--bh-muted)]"><div className="flex gap-3"><MapPin className="shrink-0"/><span>13A St. Al Al Khabaisi Area - Deira - Dubai - U.A.E</span></div><a href="tel:+97143966692" className="flex gap-3"><Phone className="shrink-0"/>+(971) 43966692</a><a href="tel:+971565334464" className="flex gap-3"><Smartphone className="shrink-0"/>+(971)565334464</a><a href="mailto:support@buyhoreca.com" className="flex gap-3"><Mail className="shrink-0"/>support@buyhoreca.com</a></div></div><div className="bh-raised overflow-hidden rounded-[30px] min-h-[360px]"><iframe title="BuyHoreca Dubai map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.0090150257433!2d55.33058681078185!3d25.270282177570852!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5dc25ec78d1f%3A0xbc7c4918c491220d!2sBUYHORECA%20TRADING%20CO.%20L.L.C!5e0!3m2!1sen!2sae!4v1787664621989!5m2!1sen!2sae" className="h-full min-h-[360px] w-full border-0"/></div></div></Shell>}


function FAQPage(){const items=[["Do you deliver across the UAE?","BuyHoreca’s published FAQ states that delivery is available across all Emirates in the UAE."],["Do you offer international delivery?","The published FAQ says international delivery is available, with timing depending on destination."],["How long does delivery take?","The published FAQ states that most orders are delivered within 1–2 working days and that next-day delivery is available for selected products and locations."],["Can I place bulk or wholesale orders?","Yes. BuyHoreca’s published FAQ states that bulk and wholesale orders are available."],["Can I modify or cancel an order?","The published FAQ says customers can contact support to modify or cancel an order; the Order Policy notes that this may not be possible after processing for delivery."],["What if I receive a damaged or incorrect product?","The published FAQ asks customers to report damaged or incorrect products on the same day and share photos with support."],["Do products have warranties?","Warranty coverage is available on selected products; customers should check the product information or contact support."],["Can I request a quotation?","Yes. BuyHoreca provides a quotation route for product and bulk enquiries."],["How can I contact support?","Use the published Dubai phone, mobile number or support email shown on the Contact page."]];return <Shell><p className="bh-kicker">Help</p><h1 className="bh-title mt-2">Frequently asked questions</h1><div className="mt-10 grid gap-4">{items.map(([q,a])=><details key={q} className="bh-raised-sm rounded-[24px] p-6"><summary className="cursor-pointer text-base font-extrabold">{q}</summary><p className="bh-body mt-4">{a}</p></details>)}</div></Shell>}

function PolicyPage({slug}:{slug:string}){const data:any={
terms:{title:"Terms & Conditions",intro:"Effective date: 1 January 2026",sections:[["Use of the website","Use the website lawfully and do not interfere with its operation or attempt unauthorized access."],["Accounts","Where customer accounts are used, customers are responsible for keeping credentials secure and for activity under their account."],["Products and orders","BuyHoreca aims to keep product information accurate, but pricing, availability and specifications can change. The published terms allow corrections, order limits or suitable alternatives where necessary."],["Intellectual property","Website text, images, branding and design are protected content belonging to BuyHoreca or its licensors."],["Disclaimer and liability","The published terms describe the service on an as-is/as-available basis and limit liability to the extent permitted by applicable law."],["Governing law","The published terms state that UAE law governs and that UAE courts have jurisdiction."]]},
privacy:{title:"Privacy Policy",intro:"Effective date: 1 January 2026",sections:[["Information collected","The published policy identifies contact details, company information, delivery and billing addresses, payment details handled by authorized providers, order history and communications with the team."],["How information is used","Information may be used to process orders, coordinate deliveries, respond to enquiries, improve service and provide relevant service or promotional communications where applicable."],["Protection and sharing","BuyHoreca states that it uses appropriate security measures and may share information when necessary with delivery, payment and operational service providers."],["Cookies","The published policy says cookies or similar technologies may be used for functionality, analysis and performance."],["Retention and rights","Information is retained as needed for orders, legal obligations and service quality. The policy describes rights to request access, correction and, where applicable, deletion."],["Contact","Privacy questions can be directed to the BuyHoreca support team."]]},
order:{title:"Order Policy",intro:"Effective date: 1 January 2026",sections:[["Placing an order","Orders may be placed through the website or customer support, including individual, bulk and commercial requirements."],["Confirmation","The published policy says confirmations and updates may be provided through WhatsApp, email or phone and larger orders may require verification."],["Pricing and payment","The published policy lists cash on delivery and card payments and states that prices are shown in AED; applicable delivery charges or fees are communicated at checkout or during confirmation."],["Changes and cancellations","Orders may be changed or cancelled before dispatch by contacting the team. Once an order has been processed for delivery, changes may no longer be possible."],["Delivery and tracking","The published policy states standard UAE delivery is generally 1–2 working days, next-day delivery is available for most orders, and international shipping is available with destination-dependent timing. Updates may be sent via WhatsApp, email or direct communication."],["Delivery requirements","Customers should provide accurate delivery information and make sure someone is available to receive the order."]]},
returns:{title:"Warranty & Returns",intro:"Published warranty and return information from BuyHoreca",sections:[["Warranty process","The published policy uses an RMA process for defective items and asks customers to return the product with the RMA reference and invoice information."],["Warranty shipping","The published policy states that BuyHoreca does not generally cover shipping charges for warranty service and that pickup/drop-off can carry a charge."],["Repair or replacement timing","The published policy notes that manufacturer or supplier repair/replacement can take an estimated 2–6 weeks for defective products."],["Standard returns","The published policy states a standard 14-day return/refund window for covered products and a 14-day replacement window, with restocking fees starting from 15%."],["Promotional and clearance items","The published policy gives different treatment to promotional, deal, discount and clearance products, including no refund in the stated standard return policy and a replacement window."],["Refunds","The published policy states that refunds are made through the original payment method where applicable."]]}
};const d=data[slug]||data.terms;return <Shell><div className="bh-raised rounded-[34px] p-7 md:p-12 lg:p-14"><p className="bh-kicker">Information</p><h1 className="bh-title mt-2">{d.title}</h1><p className="mt-4 text-sm font-extrabold text-[var(--bh-muted)]">{d.intro}</p><div className="mt-10 grid gap-7">{d.sections.map(([h,b]:[string,string])=><section key={h}><h2 className="text-xl font-extrabold">{h}</h2><p className="bh-body mt-3 max-w-4xl">{b}</p></section>)}</div><div className="bh-inset mt-10 rounded-[24px] p-5 text-sm text-[var(--bh-muted)]">This page presents the policy information currently published by BuyHoreca. The business-approved source policy remains authoritative.</div></div></Shell>}

/* ----------------------------- blog marquee ----------------------- */

function BlogMarquee({articles}:{articles:Article[]}) {
 if(!articles.length) return null;
 const items=[...articles.slice(0,8),...articles.slice(0,8)];
 return <section className="bh-section pt-0"><div className="bh-container"><SectionHeading kicker="Latest articles" title="Latest Buying Guides" href="/blogs"/><div className="relative overflow-hidden pb-2 [mask-image:linear-gradient(to_bottom,black_0%,black_86%,transparent_100%)]"><div className="bh-marquee gap-5">{items.map((a,i)=><a key={`${a.id}-${i}`} href={`https://${SHOP_DOMAIN}/blogs/${a.blogHandle}/${a.handle}`} target="_blank" rel="noreferrer" className="group w-[430px] shrink-0 overflow-hidden rounded-[24px] border border-[var(--bh-line)] bg-white shadow-[0_10px_26px_rgba(21,33,43,.07)] md:w-[520px]"><div className="aspect-[16/10] overflow-hidden bg-[#f5f7f8]">{a.image?<img src={a.image.url} alt={a.image.altText||a.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"/>:<div className="grid h-full place-items-center text-xs font-extrabold text-[var(--bh-faint)]">Blog image</div>}</div><div className="p-6 md:p-7"><div className="text-[10px] font-extrabold uppercase tracking-[.13em] text-[var(--bh-faint)]">{new Date(a.publishedAt).toLocaleDateString()} • {a.blogTitle}</div><h3 className="mt-4 line-clamp-2 text-[20px] font-extrabold leading-[1.25] md:text-[24px]">{a.title}</h3>{a.excerpt&&<p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--bh-muted)]">{a.excerpt}</p>}<div className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold">Read article <ArrowRight size={15}/></div></div></a>)}</div></div></div></section>;
}

/* ----------------------------- overlays --------------------------- */

function QuickView({product,close,addToCart,saved,toggleWishlist}:{product:Product;close:()=>void;addToCart:(p:Product,v?:Variant,q?:number)=>any;saved:boolean;toggleWishlist:(p:Product)=>void}) {
  const [quantity,setQuantity]=useState(1);
  const [selected,setSelected]=useState(product.variants.find(v=>v.availableForSale)||product.variants[0]);
  const canBuy=Boolean(product.availableForSale && selected?.availableForSale);
  const addSelected=()=>{ if(!canBuy || !selected) return; addToCart(product,selected,quantity); };
  const buyNow=async()=>{ if(!canBuy || !selected) return; const next=await addToCart(product,selected,quantity); if(next?.checkoutUrl) window.location.href=next.checkoutUrl; };

  return <div className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(15,24,31,.38)] p-4 backdrop-blur-[10px]" onMouseDown={close}>
    <div className="bh-raised max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[30px] border border-white/70 bg-white p-5 md:p-7 lg:p-8" onMouseDown={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <div className="bh-chip bh-inset text-[var(--bh-ink)]">Quick view</div>
        <button onClick={close} className="bh-icon-btn bh-raised-sm grid size-11 place-items-center rounded-full" aria-label="Close quick view"><X size={19}/></button>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[.95fr_1.05fr]">
        <div className="bh-inset overflow-hidden rounded-[24px] border border-[var(--bh-line)]">
          <div className="flex min-h-[340px] items-center justify-center md:min-h-[500px]">
            {product.images[0]
              ? <img src={product.images[0].url} alt={product.images[0].altText||product.name} className="max-h-[480px] w-full object-contain p-8 md:p-12"/>
              : <div className="bh-media-core">Product image</div>}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="bh-kicker">{product.brand}</p>
          <h2 className="bh-modal-title mt-3">{product.name}</h2>
          <div className="mt-6 text-3xl font-extrabold tracking-tight">{moneyText(selected?.price||product.price)}</div>

          <div className="bh-body mt-4 max-h-44 overflow-auto pr-2">
            {product.description||"Product details are being prepared."}
          </div>

          {product.variants.length>1&&<div className="mt-6">
            <div className="text-sm font-extrabold">Choose variant</div>
            <div className="mt-3 flex max-h-24 flex-wrap gap-2 overflow-auto pr-1">
              {product.variants.map(v=><button key={v.id} onClick={()=>setSelected(v)} className={`bh-variant ${selected?.id===v.id?"bh-variant-active":""}`} disabled={!v.availableForSale}>{v.title}</button>)}
            </div>
          </div>}

          {canBuy ? <div className="mt-7">
            <div className="text-sm font-extrabold">Quantity</div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="bh-qty">
                <button onClick={()=>setQuantity(q=>Math.max(1,q-1))} aria-label="Decrease quantity"><Minus size={15}/></button>
                <span>{quantity}</span>
                <button onClick={()=>setQuantity(q=>Math.min(99,q+1))} aria-label="Increase quantity"><Plus size={15}/></button>
              </div>
              <button onClick={addSelected} className="bh-btn bh-btn-dark inline-flex min-h-12 min-w-[156px] items-center justify-center gap-2 rounded-full px-5 text-sm font-extrabold"><ShoppingBag size={16}/> Add to Cart</button>
              <button onClick={buyNow} className="bh-btn bh-btn-green inline-flex min-h-12 min-w-[140px] items-center justify-center gap-2 rounded-full px-5 text-sm font-extrabold"><Check size={16}/> Buy Now</button>
            </div>
          </div> : <div className="mt-7">
            <Link href={`/quote?handle=${encodeURIComponent(product.handle)}&status=unavailable`} onClick={close} className="bh-btn bh-btn-dark inline-flex min-h-12 min-w-[180px] items-center justify-center gap-2 rounded-full px-6 text-sm font-extrabold"><FileText size={16}/> Get a Quote</Link>
          </div>}

          <div className="mt-7 flex flex-wrap gap-3 border-t border-[var(--bh-line)] pt-5">
            <button onClick={()=>toggleWishlist(product)} className="bh-btn bh-btn-light inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-extrabold"><Heart size={16} fill={saved?"currentColor":"none"}/> {saved?"Saved":"Wishlist"}</button>
            <Link href={product.href} onClick={close} className="bh-btn bh-btn-light inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-extrabold">Full product page <ArrowRight size={15}/></Link>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function QuoteDialog({close,toast}:{close:()=>void;toast:(x:string)=>void}){return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/10 p-4 backdrop-blur-sm" onMouseDown={close}><div className="bh-raised max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[34px] p-6 md:p-8" onMouseDown={e=>e.stopPropagation()}><div className="flex items-center justify-between"><div><p className="bh-kicker">Commercial enquiry</p><h2 className="mt-2 text-2xl font-extrabold">Get a Quote</h2></div><button onClick={close} className="bh-raised-sm grid size-10 place-items-center rounded-full"><X size={18}/></button></div><form className="mt-7 grid gap-4" onSubmit={e=>{e.preventDefault();close();toast("Quote form ready for the business workflow")}}><div className="grid gap-4 sm:grid-cols-2">{["Full name","Company","Email","Phone"].map(x=><input key={x} className="bh-inset rounded-2xl bg-transparent p-4 outline-none" placeholder={x}/>)}</div><textarea className="bh-inset min-h-32 rounded-2xl bg-transparent p-4 outline-none" placeholder="What do you need?"/><button className="bh-raised-sm rounded-full bg-[var(--bh-green)] px-6 py-3 text-sm font-extrabold text-white">Submit enquiry</button></form></div></div>}
function CartDrawer({cart,close,remove,update,autoOpenCart,setAutoOpenCart}:{cart:Cart|null;close:()=>void;remove:(id:string)=>void;update:(id:string,q:number)=>void;autoOpenCart:boolean;setAutoOpenCart:(v:boolean)=>void}){return <div className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-sm" onMouseDown={close}><aside className="bh-raised absolute right-0 top-0 h-full w-full max-w-[470px] overflow-auto rounded-l-[30px] p-5 md:p-7" onMouseDown={e=>e.stopPropagation()}><div className="flex items-center justify-between"><div><p className="bh-kicker">Cart</p><h2 className="mt-2 text-2xl font-extrabold">Cart</h2></div><button onClick={close} className="bh-raised-sm grid size-10 place-items-center rounded-full"><X size={18}/></button></div><label className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--bh-line)] bg-[#fafbfb] px-3 py-2 text-[11px] font-bold text-[var(--bh-muted)]"><input type="checkbox" checked={!autoOpenCart} onChange={e=>setAutoOpenCart(!e.target.checked)} className="size-4 accent-[var(--bh-green)]"/><span>Don’t open cart automatically after adding</span></label><div className="mt-5 grid gap-3">{!cart||!cart.lines.length?<div className="bh-inset rounded-2xl p-5 text-sm text-[var(--bh-muted)]">Your cart is empty.</div>:cart.lines.map(l=><div key={l.id} className="bh-raised-sm rounded-[22px] p-4"><div className="flex items-start gap-3"><div className="bh-inset grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl">{l.merchandise.image?<img src={l.merchandise.image.url} alt="" className="h-full w-full object-contain p-2"/>:<Package size={17}/>}</div><div className="min-w-0 flex-1"><div className="text-sm font-extrabold leading-5">{l.merchandise.product.title}</div><div className="mt-1 text-xs text-[var(--bh-muted)]">{l.merchandise.title}</div><div className="mt-3 flex items-center gap-2"><button onClick={()=>update(l.id,l.quantity-1)} className="bh-raised-sm grid size-8 place-items-center rounded-full"><Minus size={13}/></button><span className="text-xs font-extrabold">{l.quantity}</span><button onClick={()=>update(l.id,l.quantity+1)} className="bh-raised-sm grid size-8 place-items-center rounded-full"><Plus size={13}/></button></div></div><button onClick={()=>remove(l.id)} aria-label="Remove"><Trash2 size={16}/></button></div></div>)}</div>{cart&&<div className="bh-inset mt-7 rounded-[24px] p-5"><div className="flex justify-between text-sm"><span>Subtotal</span><span>{moneyText(cart.cost.subtotalAmount)}</span></div><div className="mt-3 flex justify-between text-xl font-extrabold"><span>Total</span><span>{moneyText(cart.cost.totalAmount)}</span></div><a href={cart.checkoutUrl} className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-[var(--bh-green)] px-6 text-sm font-extrabold text-white">Secure checkout</a></div>}</aside></div>}

function Footer({articles}:{articles:Article[]}) {
 return <footer className="pt-6 pb-3"><div className="bh-container"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[ShieldCheck,"Secure shopping","current catalogue"],[Truck,"Delivery","professional fulfilment"],[Layers3,"Wide assortment","HoReCa range"],[RotateCcw,"Easy returns","see current policy"]].map(([I,t,s])=>{const C=I as any;return <div key={t as string} className="bh-raised-sm rounded-[22px] p-5"><C size={20}/><div className="mt-4 text-sm font-extrabold">{t as string}</div><div className="mt-1 text-xs text-[var(--bh-muted)]">{s as string}</div></div>})}</div><div className="bh-raised mt-4 overflow-hidden rounded-[30px] p-5 md:p-6"><div className="grid gap-6 lg:grid-cols-[1.3fr_.8fr_.8fr_1.25fr]"><div><img src="/images/buyhoreca_logo.png" alt="BuyHoreca" className="mb-5 h-auto w-[175px]"/><p className="max-w-md text-sm leading-7 text-[var(--bh-muted)]">Professional HoReCa equipment and supplies for hospitality, foodservice, kitchen, coffee, bakery, service and related businesses.</p></div><div><h2 className="mb-4 text-sm font-extrabold">Shop</h2><div className="grid gap-3 text-sm text-[var(--bh-muted)]"><Link href="/shop">All products</Link><Link href="/categories">Categories</Link><Link href="/business">Business</Link><Link href="/brands">Brands</Link><Link href="/collections">Collections</Link></div></div><div><h2 className="mb-4 text-sm font-extrabold">Information</h2><div className="grid gap-3 text-sm text-[var(--bh-muted)]"><Link href="/information">Information</Link><Link href="/about">About Us</Link><Link href="/blogs">Blogs</Link><Link href="/faq">FAQ</Link><Link href="/shipping">Shipping & Delivery</Link><Link href="/contact">Contact Us</Link><Link href="/track-order">Order Tracking</Link><Link href="/policies/terms">Terms & Conditions</Link><Link href="/policies/privacy">Privacy Policy</Link><Link href="/policies/order">Order Policy</Link><Link href="/policies/returns">Warranty & Returns</Link></div></div><div><h2 className="mb-4 text-sm font-extrabold">Reach us here</h2><div className="grid gap-3 text-sm leading-6 text-[var(--bh-muted)]"><div className="flex gap-3"><MapPin size={17}/><span>13A St. Al Al Khabaisi Area - Deira - Dubai - U.A.E</span></div><a href="tel:+97143966692" className="flex gap-3"><Phone size={17}/>+(971) 43966692</a><a href="tel:+971565334464" className="flex gap-3"><Smartphone size={17}/>+(971)565334464</a><a href="mailto:support@buyhoreca.com" className="flex gap-3"><Mail size={17}/>support@buyhoreca.com</a></div><div className="mt-3 overflow-hidden rounded-2xl border border-[var(--bh-line)]"><iframe title="BuyHoreca Trading Co. L.L.C. Dubai location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.0090150257433!2d55.33058681078185!3d25.270282177570852!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5dc25ec78d1f%3A0xbc7c4918c491220d!2sBUYHORECA%20TRADING%20CO.%20L.L.C!5e0!3m2!1sen!2sae!4v1787664621989!5m2!1sen!2sae" className="h-52 w-full border-0"/></div></div></div><div className="mt-5 flex flex-col gap-3 border-t border-black/5 pt-5 lg:flex-row lg:items-center lg:justify-between"><span className="text-xs text-[var(--bh-faint)]">© {new Date().getFullYear()} BuyHoreca. All rights reserved.</span></div></div></div></footer>;
}

function Shell({ children }: { children: ReactNode }) {
  return <section className="bh-section"><div className="bh-container">{children}</div></section>;
}

function BusinessIcon({name}:{name:string}){if(name==="Coffee")return <Coffee size={21}/>;if(name==="Hotel")return <Hotel size={21}/>;if(name==="Bakery")return <ChefHat size={21}/>;if(name==="Kitchen supplies")return <Utensils size={21}/>;if(name==="Ice cream shop")return <IceCreamBowl size={21}/>;if(name==="Bar supplies")return <Wine size={21}/>;if(name==="Store & Transport")return <Store size={21}/>;if(name==="Disposable")return <Package size={21}/>;return <Building2 size={21}/>}

function LoadingPage({label="Loading…"}:{label?:string}){return <Shell><div className="bh-inset rounded-[30px] p-10 text-center"><RefreshCw className="mx-auto animate-spin" size={24}/><p className="mt-4 text-sm font-extrabold text-[var(--bh-muted)]">{label}</p></div></Shell>}
function ErrorPage({retry}:{message:string;retry:()=>void}){return <Shell><div className="bh-inset rounded-[30px] p-8 md:p-12"><p className="bh-kicker">Temporarily unavailable</p><h1 className="bh-title mt-2">We’re refreshing the store.</h1><p className="bh-body mt-4 max-w-3xl">Some products or content are taking a moment to load. Please try again in a few seconds.</p><button onClick={retry} className="bh-btn bh-btn-dark mt-7 rounded-full px-6 py-3 text-sm font-extrabold">Try again</button></div></Shell>}
function NotFoundPage(){return <Shell><p className="bh-kicker">404</p><h1 className="bh-title mt-2">Page not found</h1><Link href="/" className="bh-raised-sm mt-7 inline-flex rounded-full px-6 py-3 text-sm font-extrabold">Back home</Link></Shell>}
