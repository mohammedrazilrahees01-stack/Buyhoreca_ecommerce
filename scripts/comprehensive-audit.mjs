import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const storefront = fs.readFileSync(path.join(ROOT, 'app/[[...slug]]/Storefront.tsx'), 'utf8');
const page = fs.readFileSync(path.join(ROOT, 'app/[[...slug]]/page.tsx'), 'utf8');
const layout = fs.readFileSync(path.join(ROOT, 'app/layout.tsx'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'app/globals.css'), 'utf8');
const sitemap = fs.readFileSync(path.join(ROOT, 'app/sitemap.ts'), 'utf8');
const robots = fs.readFileSync(path.join(ROOT, 'app/robots.ts'), 'utf8');
const manifest = fs.readFileSync(path.join(ROOT, 'app/manifest.ts'), 'utf8');
const api = fs.readFileSync(path.join(ROOT, 'app/api/shopify/route.ts'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const envExample = fs.readFileSync(path.join(ROOT, '.env.local.example'), 'utf8');
const errors = fs.readFileSync(path.join(ROOT, 'app/error.tsx'), 'utf8');
const notFound = fs.readFileSync(path.join(ROOT, 'app/not-found.tsx'), 'utf8');

const results = [];
const pass = (name, detail='') => results.push({status:'PASS',name,detail});
const fail = (name, detail='') => results.push({status:'FAIL',name,detail});
const warn = (name, detail='') => results.push({status:'WARN',name,detail});
const test = (name, condition, detail='') => condition ? pass(name,detail) : fail(name,detail);

function parseTsx(file, source) {
  let ts;
  try { ts = require('typescript'); }
  catch {
    try { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }
    catch (e) { return [`parser unavailable: ${e.message}`]; }
  }
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  return sf.parseDiagnostics.length === 0 ? null : sf.parseDiagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, ' '));
}

for (const [rel, src] of Object.entries({
  'app/[[...slug]]/Storefront.tsx': storefront,
  'app/[[...slug]]/page.tsx': page,
  'app/layout.tsx': layout,
  'app/sitemap.ts': sitemap,
  'app/robots.ts': robots,
  'app/manifest.ts': manifest,
  'app/api/shopify/route.ts': api,
  'app/error.tsx': errors,
  'app/not-found.tsx': notFound,
  'lib/brand-directory.ts': fs.readFileSync(path.join(ROOT, 'lib/brand-directory.ts'), 'utf8'),
  'lib/json-ld.ts': fs.readFileSync(path.join(ROOT, 'lib/json-ld.ts'), 'utf8'),
  'lib/shopify-pagination.ts': fs.readFileSync(path.join(ROOT, 'lib/shopify-pagination.ts'), 'utf8'),
  'lib/customer-account.ts': fs.readFileSync(path.join(ROOT, 'lib/customer-account.ts'), 'utf8'),
  'lib/shopify-policies.ts': fs.readFileSync(path.join(ROOT, 'lib/shopify-policies.ts'), 'utf8'),
  'lib/quote-items.ts': fs.readFileSync(path.join(ROOT, 'lib/quote-items.ts'), 'utf8'),
})) {
  const diags = parseTsx(path.join(ROOT, rel), src);
  test(`Syntax parse: ${rel}`, !diags, diags ? diags.join('; ') : 'No TypeScript/TSX parse diagnostics');
}

// Required files
for (const rel of ['app/layout.tsx','app/globals.css','app/sitemap.ts','app/robots.ts','app/manifest.ts','app/api/shopify/route.ts','app/[[...slug]]/Storefront.tsx','app/[[...slug]]/page.tsx','lib/brand-directory.ts','lib/json-ld.ts','lib/shopify-pagination.ts','lib/customer-account.ts','lib/shopify-policies.ts','public/og-image.png','public/apple-touch-icon.png','app/icon.png']) {
  test(`Required file exists: ${rel}`, fs.existsSync(path.join(ROOT, rel)));
}

// Shopify collection-driven brand architecture
const activeBrandRefs = ['BRAND_LOGOS','BrandRecord','getBrandMetaobjects','BRAND_METAOBJECTS','brandLogoFor','NEXT_PUBLIC_SHOPIFY_BRAND_METAOBJECT_TYPE'];
for (const ref of activeBrandRefs) test(`No legacy brand-${ref} reference in active source`, ![storefront,page,layout,api,envExample].some(s => s.includes(ref)), 'Collection images are the sole logo source in active app code');
test('Collection query includes collection image and vendor seed', /const COLLECTIONS=.*image\{url/.test(storefront) && /products\(first:1\)\{nodes\{vendor\}\}/.test(storefront));
const brandDirectorySource = fs.readFileSync(path.join(ROOT, 'lib/brand-directory.ts'), 'utf8');
const brandLogoFiles = fs.readdirSync(path.join(ROOT, 'public/images/brands')).filter(name => name.endsWith('.png'));
test('Curated directory covers 64 logo references plus four existing brands', /CURATED_BRANDS/.test(brandDirectorySource) && (brandDirectorySource.match(/logoPath: brandAsset\(/g)||[]).length === 64 && /name: \"Hamilton Beach\"/.test(brandDirectorySource) && /name: \"JB Products\"/.test(brandDirectorySource) && /name: \"Jiwins\"/.test(brandDirectorySource) && /name: \"Manitowoc\"/.test(brandDirectorySource));
test('All supplied individual brand logo crops are included', brandLogoFiles.length >= 64 && brandLogoFiles.every(name => fs.statSync(path.join(ROOT, 'public/images/brands', name)).size > 0), `${brandLogoFiles.length} assets found (64 reference logos required)`);
test('Planned brands are visible without fake product collections and stay noindex', /status: collection \? \"available\" : \"coming-soon\"/.test(brandDirectorySource) && /robots: NO_INDEX_ROBOTS/.test(page));
test('Single collection query includes collection image', /const COLLECTION=.*image\{url/.test(storefront));
test('Brand matching uses normalized Shopify collection title or planned handle', /buildBrandDirectory\(collections\)/.test(storefront) && /function bestCollectionMatch/.test(fs.readFileSync(path.join(ROOT,'lib/brand-directory.ts'),'utf8')) && /collection\.handle === brand\.slug/.test(fs.readFileSync(path.join(ROOT,'lib/brand-directory.ts'),'utf8')));
test('Home brand cards prefer Shopify collection images and fall back to curated logos', /function BrandLogoVisual[\s\S]*item\.collection\?\.image\?\.url\|\|item\.logoPath/.test(storefront) && /function BrandShowcase[\s\S]*buildBrandDirectory\(collections\)/.test(storefront));
test('Brand cards link to real collection handles or stable planned slugs', /function BrandLogoCard[\s\S]*item\.collection\?\.handle\|\|item\.slug/.test(storefront));
test('Brand page resolves live collection handles and safely narrows curated entries', /const brandEntry=brandDirectory\.find\(item=>item\.slug===handle\|\|item\.collection\?\.handle===handle\)\|\|getCuratedBrandBySlug\(handle\)/.test(storefront) && /const resolvedHandle\s*=\s*brandEntry\s*&&\s*"collection"\s+in\s+brandEntry\s*\?\s*\(brandEntry\.collection\?\.handle\s*\|\|\s*handle\)\s*:\s*handle/.test(storefront) && /getCollection\(resolvedHandle/.test(storefront));
test('Brand page paginates collection products', /function BrandPage[\s\S]*loadMore=async/.test(storefront));
test('Product detail uses matching collection image for brand logo', /const brandCollection=useMemo\(\(\)=>collections\.find\(c=>brandKey\(c\.title\)===brandKey\(product\.brand\)\)/.test(storefront) && /const brandLogo=brandCollection\?\.image\?\.url/.test(storefront));
test('Brand discovery is collection-driven without a full product-vendor scan', !/getProductVendors|PRODUCT_VENDORS|homeBrandVendors|brandVendors/.test(storefront));
test('Brand route passes collection handle', /pathname\.startsWith\("\/brands\/"\).*BrandPage handle=/.test(storefront));
test('Brand routes validate title/vendor match server-side', /const BRAND_EXISTS =/.test(page) && /const validBrand = Boolean/.test(page));
test('Brand route metadata uses collection image', /const BRAND_META = .*products\(first:10\)\{nodes\{vendor handle title\}\}/.test(page) && /image: c\.image/.test(page));

// B2B / commerce upgrade checks

test('Quote basket persists product + variant + quantity', /const QUOTE_KEY="buyhoreca_quote_items"/.test(storefront) && /function addToQuote\(product:Product,variant\?:Variant,quantity=1\)/.test(storefront) && /function updateQuoteItem\(id:string,quantity:number\)/.test(storefront) && /function removeQuoteItem\(id:string\)/.test(storefront));
test('Quote basket sync event exists', /buyhoreca:quote/.test(storefront) && /addEventListener\("buyhoreca:quote"/.test(storefront));
test('Product card exposes Add to Quote', /function ProductCard[\s\S]*?Add to Quote/.test(storefront));
test('Unavailable product surfaces route to quote flow', /Request a Quote/.test(storefront) && /location\.href="\/quote"/.test(storefront));
test('Quote page supports multiple products and quantities', /function QuotePage[\s\S]*activeItems\.map/.test(storefront) && /updateQuoteItem/.test(storefront) && /clearQuote/.test(storefront));
test('Cart uses Shopify discount-code mutation', /const UPDATE_DISCOUNTS=/.test(storefront) && /cartDiscountCodesUpdate\(/.test(storefront));
test('Cart exposes live discount applicability', /discountCodes\{code applicable\}/.test(storefront) && /applicable\?"Applied":"Not applicable"/.test(storefront));
test('Main shop catalogue loads Shopify all-collection filters', /function Catalog[\s\S]*getCollection\("all"/.test(storefront) && /function Catalog[\s\S]*<FacetFilters/.test(storefront));
test('Main shop catalogue sends active ProductFilter inputs', /function Catalog[\s\S]*activeFacetInputs\(selected\)/.test(storefront) && /getCollection\(allCollection\.handle,reset\?null:cursor,inputs/.test(storefront) && /getSearch\(term\.trim\(\),reset\?null:cursor,inputs/.test(storefront));
test('Out-of-stock values are stripped from every shared filter panel', storefront.includes('values:f.values.filter(v=>!isOutOfStockFilterLabel(v.label))') && storefront.includes('.filter(f=>f.values.length>0)'));
test('Baseline availability filter offers In stock only', /baseline-availability[^;]+label:\"In stock\"/.test(storefront) && !storefront.includes('id:"unavailable",label:"Out of stock"'));
test('Out-of-stock selections are hidden, rejected, and excluded from Shopify requests', /const activeFacetSelections=\(selected:Record<string,AppliedFacet>\)=>Object\.values\(selected\)\.filter\(item=>!isOutOfStockFilterLabel\(item\.label\)\)/.test(storefront) && /const activeFacetInputs=\(selected:Record<string,AppliedFacet>\)=>activeFacetSelections\(selected\)\.map\(item=>item\.input\)/.test(storefront) && (storefront.match(/if\(isOutOfStockFilterLabel\(value\.label\)\)return;/g)||[]).length===4);
test('Product stock states and quote flows remain intact', /const variantOutOfStock=/.test(storefront) && /Out of stock · Request a quote/.test(storefront) && /Request a Quote/.test(storefront));
test('Brand pages support Shopify facet filtering', /function BrandPage[\s\S]*FacetFilters/.test(storefront) && /function BrandPage[\s\S]*getCollection\(resolvedHandle/.test(storefront));
test('Brand pages support sorting and pagination', /function BrandPage[\s\S]*Sort brand products/.test(storefront) && /function BrandPage[\s\S]*loadMore=async/.test(storefront));
test('Category index excludes brand collections', /function CategoryIndex[\s\S]*const items=categoryCollectionsFor\(collections\)/.test(storefront));
test('Header category search excludes brand collections', /const categoryCollections=useMemo\(\(\)=>categoryCollectionsFor\(collections\)/.test(storefront));
test('Product information uses real interactive tabs', /function ProductInfoTabs/.test(storefront) && /role="tablist"/.test(storefront) && /role="tabpanel"/.test(storefront));
test('Product page supports copy SKU, share, save and compare actions', /const copySku=async/.test(storefront) && /const shareProduct=async/.test(storefront) && /const toggleSaved=/.test(storefront) && /const toggleCompared=/.test(storefront));
test('Product page supports direct quantity entry and estimated subtotal', /aria-label="Product quantity"/.test(storefront) && /Estimated subtotal/.test(storefront) && /lineSubtotal:Money/.test(storefront));
test('Unavailable product variants can be selected for precise quote requests', /onClick=\{\(\)=>selectVariant\(v\)\}/.test(storefront) && /if\(addToQuote\(product,variant,q\)\)window.location.href=\"\/quote\"/.test(storefront));
test('Blog marquee uses dynamic copies and all supplied article cards', /const items=articles;/.test(storefront) && /const needed=Math.max\(2,Math.ceil\(viewport\/cycle\)\+1\)/.test(storefront) && /Array.from\(\{length:copyCount\}/.test(storefront));
test('Blog marquee seam uses exact group width without an external gap', /const cycle=cycleWidth\(\);/.test(storefront) && /offsetRef.current=\(offsetRef.current\+18\*\(dt\/1000\)\)%cycle/.test(storefront) && /offsetRef.current=\(\(offsetRef.current%cycle\)\+cycle\)%cycle/.test(storefront));
test('Blog marquee has dynamic copies and reduced-motion fallback', /bh-blog-group-duplicate\{display:none!important\}/.test(css) && /bh-blog-carousel\{overflow-x:auto;scroll-behavior:auto!important/.test(css));
test('Blog index pagination has cursor guards and a separate lightweight home query', /query Blogs\(\$first:Int!,\$after:String\)/.test(storefront) && /query BlogArticles\(\$handle:String!,\$first:Int!,\$after:String\)/.test(storefront) && /query HomeBlogs\(\$first:Int!\)/.test(storefront) && /collectPages/.test(storefront) && /seenCursors/.test(fs.readFileSync(path.join(ROOT, 'lib/shopify-pagination.ts'), 'utf8')) && /nextCursor\s*===\s*after/.test(fs.readFileSync(path.join(ROOT, 'lib/shopify-pagination.ts'), 'utf8')));

// Routing / content
for (const route of ['', 'shop','categories','brands','business','search','cart','wishlist','compare','quote','about','contact','faq','shipping','account','track-order','blog']) test(`Root route allowed: ${route || '/'}`, new RegExp(`"${route}"`).test(page) || (route === '' && /new Set\(\[/.test(page)));
test('Business index component present', /function BusinessIndex\(\)/.test(storefront) && /pathname==="\/business"/.test(storefront));
test('Business index cards link to business routes', /function BusinessIndex[\s\S]*href=\{`\/business\/\$\{businessSlugFor\(x\)\}`\}/.test(storefront));
test('Business detail supports load more', /function BusinessPage[\s\S]*loadMore=async/.test(storefront));

// UI hardening / responsive checks
test('No oversized standard page h1 at 5xl in active storefront', !/<h1[^>]*\b(?:text-5xl|md:text-5xl|lg:text-5xl)\b/.test(storefront), 'Home hero uses clamp and is intentionally larger');
test('About heading is restrained', /<h2 className="mt-2 max-w-2xl text-3xl font-bold leading-tight md:text-4xl"><T text=\{"More Than a Supplier. A Partner in Hospitality."\} \/><\/h2>/.test(storefront));
test('Contact h1 is restrained', /<h1 className="mt-2 text-3xl font-semibold md:text-4xl"><T text=\{"How can we help\?"\} \/><\/h1>/.test(storefront));
test('FAQ h1 is restrained', /<h1 className="mt-2 text-3xl font-semibold md:text-4xl"><T text=\{"Frequently Asked Questions"\} \/><\/h1>/.test(storefront));
test('Track order fallback has a restrained, accessible heading', /<h1 className="text-lg font-semibold text-slate-900"><T text=\{"Live tracking is temporarily unavailable"\} \/><\/h1>/.test(storefront) && /aria-label="Live order tracking"/.test(storefront));
test('Cart drawer action buttons stack on mobile', /className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"/.test(storefront));
test('All form submit buttons have explicit type', !/<button\b(?![^>]*\btype\s*=)[^>]*>/.test(storefront));
test('Mobile floating controls clear bottom navigation', /\.bh-whatsapp\{bottom:calc\(82px \+ env\(safe-area-inset-bottom, 0px\)\)!important;right:12px!important;z-index:100!important/.test(css) && /\.bh-toast\{bottom:78px/.test(css));
test('WhatsApp uses the CSS positioning rule without conflicting utility positions', /className=\"bh-whatsapp grid size-14/.test(storefront) && !/className=\"bh-whatsapp[^\"]*\b(?:fixed|bottom-5|right-5|z-40)\b/.test(storefront) && /\.bh-whatsapp\{position:fixed;/.test(css));
test('Touch devices keep product thumbnails available', /@media\(pointer:coarse\)\{\.bh-product-thumbs\{opacity:1\}\}/.test(css));
test('Catalog paint containment does not clip overflow/shadows', !/\.bh-catalog-grid,\.bh-blog-carousel\{contain:layout paint\}/.test(css));
test('Blog rail is 2/3/4 responsive', /\.bh-blog-card\{flex:0 0 calc\(\(100cqw - 12px\)\/2\);width:calc\(\(100cqw - 12px\)\/2\);min-width:0\}/.test(css) && /@container \(min-width:768px\)\{\.bh-blog-card\{flex-basis:calc\(\(100cqw - 24px\)\/3\);width:calc\(\(100cqw - 24px\)\/3\)\}\}/.test(css) && /@container \(min-width:1200px\)\{\.bh-blog-card\{flex-basis:calc\(\(100cqw - 36px\)\/4\);width:calc\(\(100cqw - 36px\)\/4\)\}\}/.test(css));
test('Brand grid is responsive 2/3/4/6', /\.bh-brand-grid\{display:grid;grid-template-columns:repeat\(2/.test(css) && /@media\(min-width:640px\).*repeat\(3/.test(css) && /@media\(min-width:768px\).*repeat\(4/.test(css) && /@media\(min-width:1024px\).*repeat\(6/.test(css));
test('Mega menu stays within viewport', /\.bh-mega\{.*max-width:calc\(100vw - 24px\)/.test(css));
test('Category mega-menu thumbnails use a dedicated landscape frame', /className="bh-mega-category-thumb shrink-0 overflow-hidden rounded-\[7px\] bg-slate-100"/.test(storefront) && /\.bh-mega-category-thumb\{display:block;flex:0 0 68px;width:68px;height:48px;aspect-ratio:17\/12/.test(css));
test('Category thumbnails fill the frame without changing brand-logo containment', /\.bh-mega-category-thumb img\{display:block;width:100%;height:100%;max-width:none;object-fit:cover!important;object-position:center!important/.test(css) && /\.bh-brand-logo-frame img,\.bh-mega-brand-logo img\{object-fit:contain!important/.test(css));
test('Missing category thumbnails use an icon, not a text placeholder', storefront.includes('aria-hidden="true"><Package size={18}/></div>') && storefront.includes('bh-mega-category-thumb'));
test('Mobile mega/search panels stay within viewport', /max-width:calc\(100vw - 16px\)/.test(css));
test('Main content has zero minimum width', /main\{min-width:0\}/.test(css));
test('Small phone product grid collapses safely', /@media\(max-width:360px\)[\s\S]*\.bh-catalog-grid\{grid-template-columns:1fr/.test(css));

test('Product image frames have stable aspect ratio and contain positioning', /bh-product-image-frame\{.*aspect-ratio:1\/1/.test(css) && /bh-product-image-frame img\{.*object-fit:contain/.test(css));
test('Brand cards use fixed, centered logo frames', /bh-brand-logo-frame\{display:flex;align-items:center;justify-content:center/.test(css) && /bh-brand-logo-frame img\{.*object-fit:contain/.test(css));
test('Category media is edge-to-edge inside its frame', /bh-hero-category-card img\{.*object-fit:cover/.test(css));
test('Promo offers remain vertically stacked', /bh-promo-hero-grid\{display:grid;grid-template-columns:1fr;grid-template-rows:repeat\(2/.test(css));
test('Floating mobile controls do not overlap navigation', /body\{padding-bottom:76px\}/.test(css) && /\.bh-whatsapp\{bottom:calc\(82px \+ env\(safe-area-inset-bottom, 0px\)\)!important;right:12px!important;z-index:100!important/.test(css));
test('Product brand link uses the real collection handle', /RelatedProducts[\s\S]*brandCollection\?\.handle[\s\S]*href=\{`\/brands\/\$\{encodeURIComponent\(brandCollection\.handle\)\}`\}/.test(storefront));
test('Product detail brand logo links to its brand collection', /brandCollection\?\<Link/.test(storefront) || /View .* brand/.test(storefront) && /encodeURIComponent\(brandCollection\.handle\)/.test(storefront));
test('Catalog sort control is labelled', /<select value=\{sort\} onChange=\{e=>setSort\(e.target.value\)\} aria-label=\"Sort products\"/.test(storefront));
test('Search sort control is labelled', /aria-label=\"Sort search results\"/.test(storefront));
test('Category sort control is labelled', /aria-label=\"Sort category products\"/.test(storefront));

test('Shipping UI avoids fabricated ETA data', /Shipping timing and charges vary by product, quantity and destination/.test(storefront));

// Accessibility
const imgTags = storefront.match(/<img\b[^>]*>/g) || [];
const imgMissingAlt = imgTags.filter(tag => !/\balt\s*=/.test(tag));
test('Every rendered img tag has alt attribute', imgMissingAlt.length === 0, imgMissingAlt.slice(0,5).join(' | '));
const dialogTags = (storefront.match(/role="dialog"/g) || []).length;
test('All dialog surfaces declare aria-modal', dialogTags > 0 && (storefront.match(/role="dialog"[^>]*aria-modal="true"/g) || []).length === dialogTags);
test('Skip link exists', /bh-skip-link/.test(storefront) && /href="#main-content"/.test(storefront));
test('Mobile nav has accessible label', /<nav className="bh-mobile-bar md:hidden lg:hidden" aria-label="Quick navigation" data-i18n-aria-label="Quick navigation">/.test(storefront));
test('Cart close button has accessible label and autofocus', /aria-label="Close cart" autoFocus/.test(storefront));
test('Quick view close button has accessible label and autofocus', /aria-label="Close quick view" data-i18n-aria-label="Close quick view" title="Close" data-i18n-title="Close" autoFocus/.test(storefront));

// SEO
for (const item of [
  ['metadataBase uses configurable site URL', /metadataBase: new URL\(siteUrl\)/.test(layout)],
  ['canonical is configured at root', /alternates: \{ canonical: siteUrl \}/.test(layout)],
  ['root OpenGraph configured', /openGraph:/.test(layout) && /og-image\.png/.test(layout)],
  ['twitter card configured', /twitter: \{ card: "summary_large_image"/.test(layout)],
  ['organization JSON-LD emitted', /"@type":"Organization"/.test(layout)],
  ['website SearchAction JSON-LD emitted', /"@type":"SearchAction"/.test(layout)],
  ['JSON-LD serialization escapes HTML-sensitive characters', /serializeJsonLd/.test(layout) && /serializeJsonLd/.test(page) && /\\u003c/.test(fs.readFileSync(path.join(ROOT, 'lib/json-ld.ts'), 'utf8'))],
  ['Sitemap omits the noindex quote route', !/staticPaths = \[\s\S]*?\"\/quote\"/.test(sitemap) && /\"quote\"/.test(page)],
  ['Home hero has a distinct fallback and eager loading priority', /loading=\"eager\" fetchPriority=\"high\"/.test(storefront) && /image\.src=\"\/images\/hero-main\.png\"/.test(storefront) && fs.existsSync(path.join(ROOT, 'public/images/hero-main.png'))],
  ['Catalogue product images are lazy-loaded and decoded asynchronously', /<img[^>]*loading=\"lazy\" decoding=\"async\"[^>]*className=\"bh-product-image h-full w-full object-contain/.test(storefront)],
  ['Google verification env supported', /NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION/.test(layout)],
  ['dynamic generateMetadata exists', /export async function generateMetadata/.test(page)],
  ['product SEO metadata uses Shopify SEO fields', /p\.seo\?\.title/.test(page) && /p\.seo\?\.description/.test(page)],
  ['collection SEO metadata uses Shopify SEO fields', /c\.seo\?\.title/.test(page) && /c\.seo\?\.description/.test(page)],
  ['brand SEO metadata uses collection SEO/image', /const BRAND_META/.test(page) && /image: c\.image/.test(page)],
  ['SEO titles reserve room for root template', /return fitText\(value, 48\)/.test(page) && /template: "%s \| BuyHoreca"/.test(layout)],
  ['Product schema excludes zero-price quote variants', /filter\(\(v: number\) => Number\.isFinite\(v\) && v > 0\)/.test(page) && /offerCount: prices\.length/.test(page)],
  ['article SEO metadata uses Shopify SEO fields', /a\.seo\?\.title/.test(page) && /a\.seo\?\.description/.test(page)],
  ['noindex rules exist for utility pages', /NO_INDEX_ROBOTS/.test(page) && /search", "cart", "wishlist", "compare", "account", "track-order"/.test(page)],
  ['structured Product schema exists', /"@type": "Product"/.test(page)],
  ['structured CollectionPage schema exists', /"@type": "CollectionPage"/.test(page)],
  ['structured Article schema exists', /"@type": "Article"/.test(page)],
  ['structured BreadcrumbList schema exists', /"@type": "BreadcrumbList"/.test(page)],
  ['sitemap is generated', /export default async function sitemap/.test(sitemap)],
  ['sitemap excludes brand collections from category URLs', /brandHandleSet/.test(sitemap) && /!brandHandleSet\.has/.test(sitemap)],
  ['sitemap includes brand collection URLs', /brandEntries/.test(sitemap) && /\/brands\//.test(sitemap)],
  ['robots exposes sitemap', /sitemap: `\$\{base\}\/sitemap\.xml`/.test(robots)],
  ['manifest is configured', /export default function manifest/.test(manifest)],
]) test(item[0], item[1]);

// Customer-account and merchant policy pages
const accountHelperSource = fs.readFileSync(path.join(ROOT, 'lib/customer-account.ts'), 'utf8');
const policyHelperSource = fs.readFileSync(path.join(ROOT, 'lib/shopify-policies.ts'), 'utf8');
test('Customer account page offers a real Shopify-hosted sign-in/create-account CTA rather than a setup warning', /function CustomerAccountPage\(\)/.test(storefront) && /(?:Sign in or create an account|Open account and orders)/.test(storefront) && /href=\{accountUrl\}/.test(storefront) && !/Customer accounts need configuration/.test(storefront));
test('Customer account URL must use HTTPS and rejects credentials', /target\.protocol\s*!==\s*"https:"/.test(accountHelperSource) && /target\.username\s*\|\|\s*target\.password/.test(accountHelperSource));
test('Customer account route uses a configured vanity URL or safe default Shopify /account/login route', /NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_URL/.test(envExample) && /shopifyCustomerLoginUrl/.test(storefront) && /\.myshopify\.com\/account\/login/.test(accountHelperSource) && /customerAccountUrl/.test(accountHelperSource));
test('Policy pages load actual Shopify policy content without injecting merchant HTML', /SHOP_POLICIES_QUERY/.test(storefront) && /policyHtmlToText/.test(storefront) && !/dangerouslySetInnerHTML/.test(storefront.match(/function PolicyPage[\s\S]*?function BrandLogoVisual/)?.[0] || ''));
test('Privacy, returns/refunds, shipping, and terms routes are mapped', ['privacy-policy','refund-policy','shipping-policy','terms-of-service'].every(handle => policyHelperSource.includes(`"${handle}"`)) && /slug\[0\] === "policies"/.test(page));
test('Unpublished policies are noindex and absent from sitemap', /robots: bodyText \? undefined : NO_INDEX_ROBOTS/.test(page) && /policyEntries/.test(sitemap) && /policy\.body\.trim\(\)/.test(sitemap));
test('Legacy shipping path redirects to canonical Shopify policy route', /redirect\("\/policies\/shipping-policy"\)/.test(page) && !/"\/shipping"/.test(sitemap));

// Quote-basket behavior
const quoteHelperSource = fs.readFileSync(path.join(ROOT, 'lib/quote-items.ts'), 'utf8');
test('Direct product quote requests merge into an existing basket idempotently', /mergeQuoteProduct\(current,product,variant\.id/.test(storefront) && /const next=mergeQuoteProduct/.test(storefront) && /alreadyPresent/.test(quoteHelperSource) && /item\.product\.id === product\.id && item\.variantId === variantId/.test(quoteHelperSource));
test('Quote basket persists and broadcasts a newly merged product', /writeQuoteItems\(next\);window\.dispatchEvent\(new CustomEvent\("buyhoreca:quote"/.test(storefront));

// API safety
test('API validates JSON request object', /const input = body as \{ query\?: unknown; variables\?: unknown; operationName\?: unknown \};/.test(api));
test('API bounds JSON request payload size', /MAX_REQUEST_BYTES = 192 \* 1024/.test(api) && /content-length/.test(api) && /new TextEncoder\(\)\.encode\(rawBody\)\.byteLength > MAX_REQUEST_BYTES/.test(api));
test('API requires GraphQL query string', /typeof input.query !== "string"/.test(api) && /input.query.length > 50000/.test(api));
test('API caps GraphQL query length', /query\.length > 50000/.test(api));
test('API validates variables object', /input.variables !== undefined && \(input.variables === null \|\| typeof input.variables !== "object"/.test(api));
test('API uses abort timeout', /AbortController/.test(api) && /setTimeout/.test(api));
test('API clears timeout in finally', /finally \{[\s\S]*clearTimeout/.test(api));
test('API does not return upstream error details directly', !/json\.errors.*message|error\.message.*json/.test(api));

// Project hygiene
const lockfile = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));
const declaredDependencies = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
const missingLockEntries = Object.keys(declaredDependencies).filter(name => !lockfile.packages?.[`node_modules/${name}`]);
if (missingLockEntries.length) {
  warn('package-lock dependency completeness', `Missing locked package entries: ${missingLockEntries.join(', ')}. Regenerate package-lock.json with npm install on a machine with registry access before release; do not run npm ci until fixed.`);
} else {
  pass('package-lock dependency completeness', 'All direct dependencies have lockfile entries');
}
const packageAudit = pkg.scripts?.['audit:comprehensive'] === 'node scripts/comprehensive-audit.mjs' && pkg.scripts?.['audit:final'] === 'node scripts/comprehensive-audit.mjs';
test('Package exposes comprehensive audit scripts', packageAudit);
test('No stale brand metaobject env setting', !/NEXT_PUBLIC_SHOPIFY_BRAND_METAOBJECT_TYPE/.test(envExample));
const docs = fs.readdirSync(ROOT).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
test('Current brand collection workflow documentation exists', fs.existsSync(path.join(ROOT,'BRAND_MANAGEMENT_SETUP.md')));
test('Original source does not include local brand folder requirement', !/public\/images\/brands/.test(storefront));
test('Obsolete Storefront backup is removed from release tree', !fs.existsSync(path.join(ROOT,'app/[[...slug]]/Storefront.tsx.bak')));

// Run full project checks when installed toolchain exists. Missing tools are blockers,
// not silent passes. Keep the audit suitable for CI by returning non-zero on any WARN.
const localBin = path.join(ROOT, 'node_modules', '.bin');
const runGate = (label, command, args, availablePath) => {
  if (!fs.existsSync(availablePath)) {
    warn(label, `Skipped: required local tool is missing (${path.relative(ROOT, availablePath)}). Restore dependencies and rerun before release.`);
    return;
  }
  try {
    execFileSync(command, args, { cwd: ROOT, stdio: 'pipe', timeout: 180000, shell: process.platform === 'win32' });
    pass(label, `${command} ${args.join(' ')} completed`);
  } catch (e) {
    fail(label, (e.stdout?.toString() || e.stderr?.toString() || e.message).slice(-5000));
  }
};
runGate('Whole-project semantic TypeScript', process.platform === 'win32' ? path.join(localBin, 'tsc.cmd') : path.join(localBin, 'tsc'), ['--noEmit'], path.join(localBin, process.platform === 'win32' ? 'tsc.cmd' : 'tsc'));
runGate('TypeScript source lint', process.execPath, ['scripts/lint-source.mjs'], path.join(ROOT, 'node_modules', 'typescript', 'lib', 'typescript.js'));
runGate('Next.js production build', 'npm', ['run', 'build'], path.join(localBin, process.platform === 'win32' ? 'next.cmd' : 'next'));

const failed = results.filter(r => r.status === 'FAIL').length;
const warned = results.filter(r => r.status === 'WARN').length;
const passed = results.filter(r => r.status === 'PASS').length;
const lines = [
  `BuyHoreca Comprehensive Audit`,
  `Date: 2026-10-16`,
  `PASS: ${passed}  FAIL: ${failed}  WARN: ${warned}`,
  '',
  ...results.map(r => `[${r.status}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`),
  '',
  failed ? 'AUDIT STATUS: FAILED — fix the listed failures before release.' : warned ? 'AUDIT STATUS: RELEASE BLOCKED — no static source assertions failed, but the warnings include unverified build/install blockers that must be resolved before release.' : 'AUDIT STATUS: PASS — static checks and configured build checks passed.'
];
const output = lines.join('\n');
console.log(output);
fs.writeFileSync(path.join(ROOT,'COMPREHENSIVE_AUDIT_2026-10-16.txt'), output+'\n');
if (failed || warned) process.exit(1);
