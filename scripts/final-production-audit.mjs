import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let ts = null;
try { ts = require('typescript'); }
catch {
  try { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); } catch {}
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'app/[[...slug]]/Storefront.tsx'), 'utf8');
const page = fs.readFileSync(path.join(root, 'app/[[...slug]]/page.tsx'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'app/sitemap.ts'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');
const nextConfig = fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8');
const trackingCompatibility = fs.readFileSync(path.join(root, 'app/apps/track123/page.tsx'), 'utf8');

const primaryExpected = [
  'Kitchen Utensils', 'Kitchen Equipment', 'Tabletop', 'Buffetware',
  'Hotel specials', 'Housekeeping', 'Shop by Brand', 'Shop by Business'
];

const businessExpected = [
  'cafe-coffee-shop', 'restaurant', 'hotel', 'bakery-pastry', 'bar-lounge',
  'catering-banqueting', 'fast-food-qsr', 'school-institution',
  'corporate-office-catering', 'event-hospitality'
];

const checks = [
  ['Primary navigation has exactly 8 requested groups', primaryExpected.every(x => src.includes(`"${x}"`)) && !/href="\/quote"[^>]*>Quote<\/Link>/.test(src)],
  ['Primary navigation labels use regular/medium weight', /bh-primary-nav-item[^"`]*text-\[12px\] font-medium/.test(src)],
  ['Primary navigation opens with mouse hover, pointer tap and keyboard focus', src.includes('onPointerEnter={e=>{if(e.pointerType==="mouse")') && src.includes('onPointerDown={e=>{navPointerType.current=e.pointerType') && src.includes('onFocus={e=>{if(e.currentTarget.matches(":focus-visible"))setHoverNav(title)}}') && src.includes('navPointerType.current==="mouse"')],
  ['Mega menu is viewport-centered and width-bounded', /\.bh-mega\{position:absolute;left:50%;/.test(css) && /width:min\(/.test(css) && /max-width:calc\(100vw -/.test(css)],
  ['Shop by Brand uses the full mega-menu width', /bh-mega-grid-brands/.test(src) && /\.bh-mega-grid-brands\{grid-template-columns:minmax\(0,1fr\)!important\}/.test(css) && /\.bh-mega-card-grid-brands\{grid-template-columns:minmax\(0,1fr\)!important\}/.test(css)],
  ['Shop by Brand prefers live Shopify collection images', /const brandDirectory=useMemo\(\(\)=>buildBrandDirectory\(collections\),\[collections\]\)/.test(src) && /const src=c\?\.image\?\.url\|\|b\.logoPath/.test(src) && /const src=item\.collection\?\.image\?\.url\|\|item\.logoPath/.test(src)],
  ['Brand menu/index is not limited to a fixed small set', !/brandCollections\.slice\(0,\d+\)/.test(src) && !/function BrandIndex\([\s\S]*?brandCollectionsFor\(collections\)\.slice\(0,\d+\)/.test(src)],
  ['Brand detail reads the actual Shopify collection', /function BrandPage/.test(src) && /getCollection\(handle/.test(src)],
  ['Brand detail paginates collection products', /getCollection\(resolvedHandle,collection\.pageInfo\.endCursor/.test(src) && /Load more products/.test(src)],
  ['Category and brand collection surfaces remain separated', /buildBrandDirectory\(collections\)/.test(src) && /const categoryCollectionsFor=/.test(src) && /function CategoryIndex\(\{collections\}:\{collections:Collection\[\]\}\)\{const items=categoryCollectionsFor\(collections\)/.test(src)],
  ['All-category dropdown has native wheel scrolling isolated from Lenis', /id="all-category-list"[\s\S]*overflow-y-auto[\s\S]*data-lenis-prevent[\s\S]*onWheelCapture=\{handleNativeWheel\}/.test(src) && /function handleNativeWheel/.test(src)],
  ['Search panels have native nested scrolling isolated from Lenis', /focus&&<div className="bh-search-panel[\s\S]*overflow-y-auto[\s\S]*data-lenis-prevent/.test(src)],
  ['Filter/dialog/cart scroll surfaces are Lenis-isolated', /data-lenis-prevent/.test(src) && /Filter brand products/.test(src) && /Shopping cart/.test(src) && /Quick view/.test(src)],
  ['Blog rail hides overflow during motion and supports manual scrolling for reduced motion', /\.bh-blog-carousel\{position:relative;display:block;overflow:hidden;/.test(css) && /@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?\.bh-blog-carousel\{overflow-x:auto/.test(css)],
  ['Blog rail continuously auto-scrolls with requestAnimationFrame', /function BlogRail/.test(src) && /requestAnimationFrame\(tick\)/.test(src) && /offsetRef\.current=\(offsetRef\.current\+18\*\(dt\/1000\)\)%cycle/.test(src)],
  ['Blog rail moves leftward continuously at a restrained speed', /offsetRef\.current=\(offsetRef\.current\+18\*\(dt\/1000\)\)%cycle/.test(src) && /translate3d\(\$\{-offsetRef\.current\}px,0,0\)/.test(src)],
  ['Blog rail pauses only on individual card hover/focus', /onMouseEnter=\{pause\} onMouseLeave=\{resume\}/.test(src) && /onFocus=\{pause\}|onFocusCapture=\{pause\}/.test(src) && !/onMouseEnter=\{pause\}.*bh-blog-carousel/.test(src)],
  ['Blog rail does not hijack mouse-wheel/trackpad vertical scrolling', /bh-blog-carousel[^}]*role=\"region\"/.test(src) && !/bh-blog-carousel[\s\S]*onWheel=/.test(src)],
  ['Reduced motion disables the animated blog rail', /prefers-reduced-motion: reduce/.test(src) && /prefers-reduced-motion:reduce/.test(css)],
  ['Product image frames contain images without artificial internal padding', /bh-product-image-frame/.test(src) && /\.bh-product-image\{padding:0\}/.test(css)],
  ['Featured category images use square edge-to-edge cover frames with rounded 12px corners', /function CategoryRail/.test(src) && /bh-category-rail-frame[^\"]*aspect-square w-full max-w-\[160px\][^\"]*overflow-hidden/.test(src) && /bh-category-rail-image[^>]*object-cover/.test(src) && /\.bh-category-rail-frame\{[^}]*aspect-ratio:1\/1[^}]*border-radius:12px/.test(css) && /\.bh-category-rail-frame \.bh-category-rail-image\{[^}]*object-fit:cover!important/.test(css)],
  ['Collection images preserve their independent edge-to-edge cover framing', /\.bh-collection-image-fill\{[^}]*transform:scale\(1\.28\)/.test(css)],
  ['Brand logos preserve proportions without fake gray framing', /bh-mega-brand-logo\{background:transparent!important\}/.test(css) && /object-contain object-center/.test(src)],
  ['Out-of-stock products are quote-only', /Out of stock · Request a quote/.test(src) && /cartHasStockIssue/.test(src)],
  ['Low stock under 10 is shown from live quantityAvailable', /quantityAvailable/.test(src) && /Only \$\{/.test(src)],
  ['Quantity controls respect available stock', /quantityAvailable/.test(src) && /q>maxStock/.test(src) && /quantity>=l\.merchandise\.quantityAvailable/.test(src)],
  ['Shop has price/brand/product filters and sorting', /FacetFilters/.test(src) && /Price low to high|Price: low to high/.test(src) && /Sort products/.test(src)],
  ['Quote basket supports multi-product requests', /QUOTE_KEY/.test(src) && /activeItems\.map/.test(src) && /addToQuote/.test(src)],
  ['Cart uses Shopify discount code mutation', /discountCodesUpdate|DISCOUNT/.test(src) && /onDiscount/.test(src)],
  ['Dynamic SEO metadata is present', /generateMetadata/.test(page) && /metadataBase/.test(layout)],
  ['Canonical and social metadata are configured', /canonical/.test(layout) && /openGraph/.test(layout) && /twitter/.test(layout)],
  ['Product/collection/brand/article structured data is present', /"@type":"Product"|"@type": "Product"/.test(page) && /CollectionPage/.test(page) && /BreadcrumbList/.test(page) && /Article/.test(page)],
  ['Utility pages use noindex rules', /const noIndex = \["search", "cart", "wishlist", "compare", "account", "track-order", "quote"\]/.test(page) && /NO_INDEX_ROBOTS/.test(page)],
  ['Sitemap contains products, categories, brands and business routes', /productEntries/.test(sitemap) && /categoryEntries/.test(sitemap) && /brandEntries/.test(sitemap) && /BUSINESS_SLUGS/.test(sitemap)],
  ['Sitemap business slugs match current navigation', businessExpected.every(x => sitemap.includes(`"${x}"`))],
  ['Robots exposes the sitemap', /sitemap/.test(fs.readFileSync(path.join(root, 'app/robots.ts'), 'utf8'))],
  ['Security headers are configured', /X-Content-Type-Options/.test(nextConfig) && /Referrer-Policy/.test(nextConfig)],
  ['Accessible focus indicator is present', /:focus-visible/.test(css)],
  ['Coarse-pointer and reduced-motion behavior is present', /@media\(pointer:coarse\)/.test(css) && /@media \(hover:none\), \(pointer:coarse\)/.test(css) && /prefers-reduced-motion/.test(css)],
  ['Responsive 320px through 3840px+ ranges are represented', /max-width:359px/.test(css) && /min-width:360px/.test(css) && /max-width:575px/.test(css) && /max-width:767px/.test(css) && /min-width:768px/.test(css) && /max-width:1099px/.test(css) && /min-width:1024px/.test(css) && /max-width:1279px/.test(css) && /min-width:1280px/.test(css) && /max-width:1599px/.test(css) && /min-width:1600px/.test(css) && /max-width:1919px/.test(css) && /min-width:1920px/.test(css) && /max-width:2559px/.test(css) && /min-width:2560px/.test(css) && /max-width:3839px/.test(css) && /min-width:3840px/.test(css)],
  ['Mobile/tablet navigation is suppressed at touch-safe widths', /@media\s*\(min-width:768px\)\s+and\s+\(max-width:1099px\)[\s\S]*?bh-primary-nav\{display:none!important\}/.test(css) && /@media\(max-width:767px\)[\s\S]*?bh-primary-nav\{display:none!important\}/.test(css)],
  ['No external placeholder image services are used', !/unsplash\.com|placehold\.co/.test(src)],
  ['No local brand-logo dependency remains in active code', !/BRAND_LOGOS|brandLogoFor|getBrandMetaobjects|BrandRecord|BRAND_METAOBJECTS/.test(src)],
  ['Tracking page embeds the official Track123 live-tracking widget over HTTPS', src.includes('track123-tracking-widget') && src.includes('https://shp.track123.com/tracking-page/build/widget.min.js') && src.includes('buyhoreca.myshopify.com')],
  ['Tracking page has a clear live-widget failure fallback with support option', src.includes('Live tracking is temporarily unavailable') && src.includes('Contact support')],
  ['Tracking page excludes promotional attribution copy', !src.includes('Live order and shipment updates provided by Track123.')],
  ['Track123 primary actions remain visible despite Tailwind button reset', css.includes('track123-tracking-widget #track123_submit_button') && css.includes('background:#008f68!important') && css.includes('color:#fff!important') && css.includes('min-height:44px!important')],
  ['Top Request a Quote CTA remains and duplicate header Quote is removed', src.includes('text-sm font-semibold text-[#0b2b22] transition hover:bg-white/50') && !src.includes('className=\"hidden px-2 text-xs font-medium text-slate-700 lg:block\">Quote{quoteItems.length')],
  ["Header click-away handles mega menus, categories, search and mobile menu in capture phase", src.includes(`const insideMega=!!target.closest(".bh-mega-inner")||!!target.closest(".bh-primary-nav-item")`) && src.includes(`document.addEventListener("pointerdown",closeOutside,true)`) && src.includes(`document.addEventListener("click",closeOutside,true)`) && src.includes(`if(!insideCategoryPanel){setCategoryOpen(false);setCategoryQuery("")}`) && src.includes("if(!insideSearch)setFocus(false)") && src.includes("if(!insideMobileNav)setMobile(false)")],
  ['First-visit welcome offer appears once and gates close button for three seconds', src.includes('buyhoreca_welcome_offer_seen_v1') && src.includes('window.setTimeout(()=>setCanDismiss(true),3000)') && src.includes('aria-label=\"Close welcome offers\"')],
  ['First-visit welcome poster uses existing offer codes and compressed image', src.includes('copyCode(\"WELCOME10\")') && src.includes('copyCode(\"HORECA5\")') && src.includes('/images/promo/welcome-offer.webp')],
  ['Catalogue filters reload when all-products collection is unavailable', src.includes('productQueryFromFacets(selected)||undefined') && src.includes('if(!collectionReady)return;void load(true)') && src.includes('available_for_sale:${input.available}') && src.includes('vendor:${quoteSearchValue(input.productVendor.trim())}')],
  ['Track123 local API and SPA asset requests proxy before the storefront catch-all', fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8').includes('beforeFiles') && fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8').includes('/endApi/api/store/anonymous/:path*') && fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8').includes('https://shp.track123.com/endApi/api/store/anonymous/:path*') && fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8').includes('/endApi/api/store/get-tracking-page-translation-config') && fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8').includes('/tracking-page-spa/:path*') && fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8').includes('https://shp.track123.com/tracking-page-spa/:path*')],
  ['Track Shipment is reachable from the header actions', src.includes('/track-order\" className=\"hidden items-center gap-1') && src.includes('Track Shipment</Link><Link href=\"/quote\"')],
  ['BuyHoreca AI button and server route are part of the site', src.includes('BuyHorecaAssistant/><a href=\"https://wa.me/971565334464\"') && fs.existsSync(path.join(root, 'app/api/ai-assistant/route.ts')) && fs.existsSync(path.join(root, 'components/BuyHorecaAssistant.tsx'))],
  ['AI responses do not leak internal setup instructions', !fs.readFileSync(path.join(root, 'app/api/ai-assistant/route.ts'), 'utf8').includes('The site administrator needs to add') && fs.readFileSync(path.join(root, 'components/BuyHorecaAssistant.tsx'), 'utf8').includes('SUPPORT_FALLBACK')],
  ['AI customer fallback searches the Shopify catalog without model credentials', fs.readFileSync(path.join(root, 'app/api/ai-assistant/route.ts'), 'utf8').includes('customerFallback(message, products, collections)') && fs.readFileSync(path.join(root, 'app/api/ai-assistant/route.ts'), 'utf8').includes('const productNodes = json.data?.products?.nodes || []') && fs.readFileSync(path.join(root, 'components/BuyHorecaAssistant.tsx'), 'utf8').includes('m.actionUrl && m.actionLabel')],
  ['Account page labels the hosted portal and provides a tracking shortcut', src.includes('Open account and orders') && src.includes('Shopify’s account portal') && src.includes('href=\"/track-order\" className=\"inline-flex min-h-11')],
  ['Tracking page bypasses catalogue loading/error fallback', src.includes('let content:ReactNode;if(pathname==="/track-order")content=<TrackOrderPage/>;else if(pathname==="/account")content=<CustomerAccountPage/>;else if(loading)')],
  ['Legacy Track123 route preserves nums and redirects to track-order', trackingCompatibility.includes('redirect') && trackingCompatibility.includes('/track-order') && trackingCompatibility.includes('query.toString()') && src.includes('searchParams.get("nums")')],
  ['Unknown routes use Next.js 404 handling', /notFound\(\)/.test(page) && /ROOT_ROUTES/.test(page)],
  ['Business pages match the current business taxonomy', businessExpected.every(x => page.includes(`"${x}"`))],
];

let failures = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
}

console.log('\nTypeScript/TSX parser audit');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
}
walk(path.join(root, 'app'));
walk(path.join(root, 'lib'));
if (ts) {
  for (const f of files.sort()) {
    const text = fs.readFileSync(f, 'utf8');
    const kind = f.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, kind);
    const diags = sf.parseDiagnostics || [];
    if (diags.length) {
      failures++;
      console.log(`FAIL  ${path.relative(root, f)} (${diags.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('; ')})`);
    } else console.log(`PASS  ${path.relative(root, f)}`);
  }
} else console.log('SKIP  TypeScript parser');

console.log(`\nFINAL STATIC AUDIT: ${checks.length - failures} PASS / ${failures} FAIL across ${checks.length} requirement checks + ${files.length} TypeScript/TSX parser checks.`);
if (failures) process.exit(1);
