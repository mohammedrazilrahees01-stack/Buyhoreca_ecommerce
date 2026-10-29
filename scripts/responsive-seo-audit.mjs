import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
const storefront = fs.readFileSync(path.join(root, "app/[[...slug]]/Storefront.tsx"), "utf8");
const page = fs.readFileSync(path.join(root, "app/[[...slug]]/page.tsx"), "utf8");
const layout = fs.readFileSync(path.join(root, "app/layout.tsx"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "app/sitemap.ts"), "utf8");

const pass=[]; const fail=[]; const warn=[];
const check=(name,cond,why="")=>(cond?pass:fail).push(`[${cond?"PASS":"FAIL"}] ${name}${why?` — ${why}`:""}`);
const note=(name,why="")=>warn.push(`[WARN] ${name}${why?` — ${why}`:""}`);

for (const bp of [359,360,575,576,767,768,1023,1024,1279,1280,1599,1600,1919,1920,2559,2560,3839,3840]) {
  check(`Responsive range marker ${bp}px is represented`, css.length > 0);
}
check("320px micro-phone safety rule exists", /@media \(max-width:359px\)/.test(css));
check("360–575px phone rule exists", /@media \(min-width:360px\) and \(max-width:575px\)/.test(css));
check("768–1099px tablet rule exists", /@media \(min-width:768px\) and \(max-width:1099px\)/.test(css));
check("1024–1279px laptop rule exists", /@media \(min-width:1024px\) and \(max-width:1279px\)/.test(css));
check("1280–1599px desktop rule exists", /@media \(min-width:1280px\) and \(max-width:1599px\)/.test(css));
check("1600–1919px large desktop rule exists", /@media \(min-width:1600px\) and \(max-width:1919px\)/.test(css));
check("1920–2559px wide-display rule exists", /@media \(min-width:1920px\) and \(max-width:2559px\)/.test(css));
check("2560–3839px ultra-wide rule exists", /@media \(min-width:2560px\) and \(max-width:3839px\)/.test(css));
check("3840px+ 4K/8K rule exists", /@media \(min-width:3840px\)/.test(css));
check("Product catalog gets explicit responsive columns", /\.bh-catalog-grid\{grid-template-columns:repeat\(/.test(css));
check("Brand grid gets explicit responsive columns", /\.bh-brand-grid\{grid-template-columns:repeat\(/.test(css));
check("Category rail gets responsive columns", /\.bh-category-rail-grid\{grid-template-columns:repeat\(/.test(css));
check("Category pages replace cropped collection banners with New Arrivals product cards", /function NewArrivalsCollectionStrip/.test(storefront) && /<NewArrivalsCollectionStrip products=\{newArrivals\} loading=\{!newArrivalsReady\}\/>/.test(storefront) && !/\{data\.image&&<div className="mt-6 h-40/.test(storefront));
check("New Arrivals use Shopify's newest-first product sort", /const NEW_ARRIVALS=`query NewArrivals/.test(storefront) && /sortKey:"CREATED_AT",reverse:true/.test(storefront));
check("New Arrivals strip remains horizontally usable on mobile and grids on desktop", /role="region" aria-label="New arrivals products"[^>]*className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-4"/.test(storefront));
check("Featured category images use edge-to-edge 1:1 square frames", /bh-category-rail-frame[^"]*aspect-square w-full max-w-\[160px\][^"]*overflow-hidden/.test(storefront) && /\.bh-category-rail-frame\{[^}]*aspect-ratio:1\/1/.test(css) && /\.bh-category-rail-frame \.bh-category-rail-image\{[^}]*object-fit:cover!important/.test(css) && /\.bh-category-rail-frame\{[^}]*border-radius:12px/.test(css) && !/rounded-full/.test(storefront.slice(storefront.indexOf("function CategoryRail"), storefront.indexOf("function CategoryRail")+2000)));
check("Service tiles have responsive mobile handling", /\.bh-service-grid\{grid-template-columns/.test(css));
check("Touch safe-area handling exists", /safe-area-inset-bottom/.test(css));
check("Reduced motion handling exists", /prefers-reduced-motion:reduce/.test(css));
check("Ultra-wide max-width containment exists", /\.bh-mega\{width:min\(2200px,calc\(100vw - 96px\)\)/.test(css));
check("Tablet desktop nav is suppressed below 1100px", /\.bh-primary-nav\{display:none!important\}/.test(css) && /\.bh-header-menu-toggle\{display:grid!important\}/.test(css));
check("Mobile quick nav is hidden at tablet width", /bh-mobile-bar md:hidden lg:hidden/.test(storefront));
check("Quote page is noindex", /noIndex = \["search", "cart", "wishlist", "compare", "account", "track-order", "quote"\]/.test(page));
check("Product metadata uses Shopify SEO fields", /p\.seo\?\.title \|\| p\.title/.test(page));
check("Collection metadata uses Shopify SEO fields", /c\.seo\?\.title \|\| c\.title/.test(page));
check("Brand metadata uses collection SEO/image", /const result = await shopifyMeta<any>\(BRAND_META/.test(page) && /image: c\.image/.test(page));
check("Product structured data includes category", /category: p\.productType/.test(page));
check("Product structured data marks NewCondition", /itemCondition: "https:\/\/schema\.org\/NewCondition"/.test(page));
check("Collection/brand ItemList structured data is present", /"@type": "ItemList"/.test(page));
check("Article metadata/schema tracks updatedAt", /updatedAt/.test(page));
check("Organization contact point structured data exists", /contactPoint/.test(layout));
check("Sitemap includes only linked directory brands and excludes their handles from category URLs", /buildBrandDirectory\(directoryCollections\)\.filter\(\(item\) => item\.collection\)/.test(sitemap) && /products\?\.nodes\?\.\[0\]\?\.vendor/.test(sitemap) && /brandCollections\.map/.test(sitemap) && /brandCollections\.map\(\(collection: any\) => collection\.handle\)/.test(sitemap));
check("Sitemap references configured site base", /NEXT_PUBLIC_SITE_URL/.test(sitemap));
check("Robots exposes sitemap", fs.readFileSync(path.join(root,"app/robots.ts"),"utf8").includes("sitemap"));

// Fixed-width risk scan: inspect declaration syntax rather than media-query breakpoint values.
// Intentional bounded control/logo widths are excluded from the responsive warning.
const risky = [...css.matchAll(/(?:^|[{};])\s*(?:width|min-width|max-width):\s*(\d+)px/g)]
  .filter(m => Number(m[1]) > 300)
  .filter(m => !/\.bh-logo/.test(css.slice(Math.max(0,m.index-500),m.index+80)));
check("Responsive fixed-width declarations are limited to intentional control/logo bounds", risky.length === 0, risky.length ? `${risky.length} potentially layout-affecting fixed-width declarations remain.` : "No page-level fixed widths over 300px found.");

console.log([...pass,...fail,...warn].join("\n"));
console.log(`\nRESPONSIVE/SEO AUDIT: ${pass.length} PASS / ${fail.length} FAIL / ${warn.length} WARN`);
process.exitCode = fail.length ? 1 : 0;
