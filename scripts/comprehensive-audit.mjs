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
})) {
  const diags = parseTsx(path.join(ROOT, rel), src);
  test(`Syntax parse: ${rel}`, !diags, diags ? diags.join('; ') : 'No TypeScript/TSX parse diagnostics');
}

// Required files
for (const rel of ['app/layout.tsx','app/globals.css','app/sitemap.ts','app/robots.ts','app/manifest.ts','app/api/shopify/route.ts','app/[[...slug]]/Storefront.tsx','app/[[...slug]]/page.tsx','public/og-image.png','public/apple-touch-icon.png','app/icon.png']) {
  test(`Required file exists: ${rel}`, fs.existsSync(path.join(ROOT, rel)));
}

// Shopify collection-driven brand architecture
const activeBrandRefs = ['BRAND_LOGOS','BrandRecord','getBrandMetaobjects','BRAND_METAOBJECTS','brandLogoFor','NEXT_PUBLIC_SHOPIFY_BRAND_METAOBJECT_TYPE'];
for (const ref of activeBrandRefs) test(`No legacy brand-${ref} reference in active source`, ![storefront,page,layout,api,envExample].some(s => s.includes(ref)), 'Collection images are the sole logo source in active app code');
test('Collection query includes collection image and vendor seed', /const COLLECTIONS=.*image\{url/.test(storefront) && /products\(first:1\)\{nodes\{vendor\}\}/.test(storefront));
test('Single collection query includes collection image', /const COLLECTION=.*image\{url/.test(storefront));
test('Brand matching is collection-title to collection product vendor', /brandCollectionsFor=/.test(storefront) && /brandKey\(c\.title\)===brandKey\(c\.vendor\)/.test(storefront));
test('Home brand cards use Shopify collection image', /function BrandShowcase[\s\S]*c\.image\?\.url[\s\S]*<img/.test(storefront));
test('All Brands links use collection handle', /function BrandIndex[\s\S]*href=\{`\/brands\/\$\{encodeURIComponent\(c\.handle\)\}`\}/.test(storefront));
test('Brand page loads actual Shopify collection', /function BrandPage[\s\S]*getCollection\(handle/.test(storefront));
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
test('Brand pages support Shopify facet filtering', /function BrandPage[\s\S]*FacetFilters/.test(storefront) && /function BrandPage[\s\S]*getCollection\(handle/.test(storefront));
test('Brand pages support sorting and pagination', /function BrandPage[\s\S]*Sort brand products/.test(storefront) && /function BrandPage[\s\S]*loadMore=async/.test(storefront));
test('Category index excludes brand collections', /function CategoryIndex[\s\S]*const items=categoryCollectionsFor\(collections\)/.test(storefront));
test('Header category search excludes brand collections', /const categoryCollections=useMemo\(\(\)=>categoryCollectionsFor\(collections\)/.test(storefront));
test('Product information uses real interactive tabs', /function ProductInfoTabs/.test(storefront) && /role="tablist"/.test(storefront) && /role="tabpanel"/.test(storefront));

// Routing / content
for (const route of ['', 'shop','categories','brands','business','search','cart','wishlist','compare','quote','about','contact','faq','shipping','account','track-order','blog']) test(`Root route allowed: ${route || '/'}`, new RegExp(`"${route}"`).test(page) || (route === '' && /new Set\(\[/.test(page)));
test('Business index component present', /function BusinessIndex\(\)/.test(storefront) && /pathname==="\/business"/.test(storefront));
test('Business index cards link to business routes', /function BusinessIndex[\s\S]*href=\{`\/business\/\$\{businessSlugFor\(x\)\}`\}/.test(storefront));
test('Business detail supports load more', /function BusinessPage[\s\S]*loadMore=async/.test(storefront));

// UI hardening / responsive checks
test('No oversized standard page h1 at 5xl in active storefront', !/<h1[^>]*\b(?:text-5xl|md:text-5xl|lg:text-5xl)\b/.test(storefront), 'Home hero uses clamp and is intentionally larger');
test('About h1 is restrained', /More Than a Supplier\. A Partner in Hospitality\.<\/h1>/.test(storefront) && /text-3xl font-semibold leading-tight md:text-4xl lg:text-\[2\.75rem\]/.test(storefront));
test('Contact h1 is restrained', /How can we help\?<\/h1>/.test(storefront) && /text-3xl font-semibold md:text-4xl/.test(storefront));
test('FAQ h1 is restrained', /Frequently Asked Questions<\/h1>/.test(storefront) && /text-3xl font-semibold md:text-4xl/.test(storefront));
test('Track order h1 is restrained', /Track an Order<\/h1>/.test(storefront) && /text-3xl font-semibold md:text-4xl/.test(storefront));
test('Cart drawer action buttons stack on mobile', /className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"/.test(storefront));
test('All form submit buttons have explicit type', !/<button\b(?![^>]*\btype\s*=)[^>]*>/.test(storefront));
test('Mobile floating controls clear bottom navigation', /\.bh-whatsapp\{bottom:calc\(82px \+ env\(safe-area-inset-bottom, 0px\)\)!important;right:12px!important;z-index:100!important/.test(css) && /\.bh-toast\{bottom:78px/.test(css));
test('WhatsApp uses the CSS positioning rule without conflicting utility positions', /className=\"bh-whatsapp grid size-14/.test(storefront) && !/className=\"bh-whatsapp[^\"]*\b(?:fixed|bottom-5|right-5|z-40)\b/.test(storefront) && /\.bh-whatsapp\{position:fixed;/.test(css));
test('Touch devices keep product thumbnails available', /@media\(pointer:coarse\)\{\.bh-product-thumbs\{opacity:1\}\}/.test(css));
test('Catalog paint containment does not clip overflow/shadows', !/\.bh-catalog-grid,\.bh-blog-carousel\{contain:layout paint\}/.test(css));
test('Blog rail is 2/3/4 responsive', /\.bh-blog-card\{width:calc\(\(100% - 12px\)\/2\)/.test(css) && /@media\(min-width:768px\)\{\.bh-blog-card\{width:calc\(\(100% - 24px\)\/3\)\}\}/.test(css) && /@media\(min-width:1200px\)\{\.bh-blog-card\{width:calc\(\(100% - 36px\)\/4\)\}\}/.test(css));
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
test('Mobile nav has accessible label', /<nav className="bh-mobile-bar md:hidden lg:hidden" aria-label="Quick navigation">/.test(storefront));
test('Cart close button has accessible label and autofocus', /aria-label="Close cart" autoFocus/.test(storefront));
test('Quick view close button has accessible label and autofocus', /aria-label="Close quick view" title="Close" autoFocus/.test(storefront));

// SEO
for (const item of [
  ['metadataBase uses configurable site URL', /metadataBase: new URL\(siteUrl\)/.test(layout)],
  ['canonical is configured at root', /alternates: \{ canonical: siteUrl \}/.test(layout)],
  ['root OpenGraph configured', /openGraph:/.test(layout) && /og-image\.png/.test(layout)],
  ['twitter card configured', /twitter: \{ card: "summary_large_image"/.test(layout)],
  ['organization JSON-LD emitted', /"@type":"Organization"/.test(layout)],
  ['website SearchAction JSON-LD emitted', /"@type":"SearchAction"/.test(layout)],
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
const packageAudit = pkg.scripts?.['audit:comprehensive'] === 'node scripts/comprehensive-audit.mjs' && pkg.scripts?.['audit:final'] === 'node scripts/comprehensive-audit.mjs';
test('Package exposes comprehensive audit scripts', packageAudit);
test('No stale brand metaobject env setting', !/NEXT_PUBLIC_SHOPIFY_BRAND_METAOBJECT_TYPE/.test(envExample));
const docs = fs.readdirSync(ROOT).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
test('Current brand collection workflow documentation exists', fs.existsSync(path.join(ROOT,'BRAND_MANAGEMENT_SETUP.md')));
test('Original source does not include local brand folder requirement', !/public\/images\/brands/.test(storefront));
test('Obsolete Storefront backup is removed from release tree', !fs.existsSync(path.join(ROOT,'app/[[...slug]]/Storefront.tsx.bak')));

// Try production build only when dependencies exist; otherwise document the blocker rather than claiming pass.
if (fs.existsSync(path.join(ROOT,'node_modules','.bin','next'))) {
  try {
    execFileSync('npm',['run','build'],{cwd:ROOT,stdio:'pipe',timeout:180000});
    pass('Next.js production build', 'npm run build completed');
  } catch (e) {
    fail('Next.js production build', (e.stdout?.toString() || e.stderr?.toString() || e.message).slice(-4000));
  }
} else {
  warn('Next.js production build', 'Skipped: node_modules is unavailable because npm ci timed out in this environment');
}

const failed = results.filter(r => r.status === 'FAIL').length;
const warned = results.filter(r => r.status === 'WARN').length;
const passed = results.filter(r => r.status === 'PASS').length;
const lines = [
  `BuyHoreca Comprehensive Audit`,
  `Date: 2026-10-12`,
  `PASS: ${passed}  FAIL: ${failed}  WARN: ${warned}`,
  '',
  ...results.map(r => `[${r.status}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`),
  '',
  failed ? 'AUDIT STATUS: FAILED — fix the listed failures before release.' : 'AUDIT STATUS: PASS WITH WARNINGS — no static audit failures; see warnings for environment verification gaps.'
];
const output = lines.join('\n');
console.log(output);
fs.writeFileSync(path.join(ROOT,'COMPREHENSIVE_AUDIT_2026-10-12.txt'), output+'\n');
if (failed) process.exit(1);
