import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const storefront = read('app/[[...slug]]/Storefront.tsx');
const page = read('app/[[...slug]]/page.tsx');
const layout = read('app/layout.tsx');
const sitemap = read('app/sitemap.ts');
const jsonLdSource = read('lib/json-ld.ts');
const paginationSource = read('lib/shopify-pagination.ts');
const stylesheet = read('app/globals.css');
const mobileNavigation = storefront.match(/id=\"mobile-navigation\"([\s\S]*?)<\/nav>/)?.[1] || '';
const checks = [];
function check(name, condition, detail = '') {
  checks.push({ name, passed: Boolean(condition), detail });
}

// Execute the actual dependency-free TypeScript helpers after transpiling with the
// installed TypeScript compiler. This tests behavior, not just source patterns.
const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); }
catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }
function loadTypeScriptHelper(source, exportNames) {
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  runInNewContext(javascript, { exports, module: { exports }, Set, Array, JSON });
  return Object.fromEntries(exportNames.map((name) => [name, exports[name]]));
}

const { serializeJsonLd } = loadTypeScriptHelper(jsonLdSource, ['serializeJsonLd']);
const hostileValue = { headline: '</script><img src=x onerror=alert(1)> & \u2028', text: 'BuyHoreca' };
const safeJsonLd = serializeJsonLd(hostileValue);
check('JSON-LD escapes HTML-sensitive characters before script insertion',
  !safeJsonLd.includes('<') && !safeJsonLd.includes('>') && !safeJsonLd.includes('&') &&
  JSON.stringify(JSON.parse(safeJsonLd)) === JSON.stringify(hostileValue));
check('Root and dynamic JSON-LD scripts use the safe serializer',
  /serializeJsonLd\(organizationSchema\)/.test(layout) &&
  /serializeJsonLd\(websiteSchema\)/.test(layout) &&
  /serializeJsonLd\(schema\)/.test(page));

const staticPathsBlock = sitemap.match(/const staticPaths\s*=\s*\[([\s\S]*?)\];/)?.[1] || '';
check('Noindex quote page is excluded from sitemap paths',
  !/['"]\/quote['"]/.test(staticPathsBlock) && /"quote"/.test(page));
check('Sitemap pagination uses the guarded page collector',
  sitemap.includes('import { collectPages, connectionPageFrom } from "../lib/shopify-pagination";') &&
  sitemap.includes('return collectPages<any>(async (after)') &&
  sitemap.includes('connectionPageFrom<any>(data, baseVars.blog ? "blog.articles" : undefined)') &&
  !/while\s*\(true\)/.test(sitemap));

check('Homepage hero uses a distinct existing fallback image',
  /loading="eager" fetchPriority="high"/.test(storefront) &&
  /image\.src="\/images\/hero-main\.png"/.test(storefront) &&
  fs.existsSync(path.join(root, 'public/images/hero-main.png')) &&
  !/onError=\{e=>\{e\.currentTarget\.src="\/images\/hero\/hero-main\.jpg"\}\}/.test(storefront));
check('Product cards lazy-load images and decode asynchronously',
  /<img[^>]*loading="lazy" decoding="async"[^>]*className="bh-product-image h-full w-full object-contain/.test(storefront));
check('Home blog query is bounded and preview-only',
  /const HOME_BLOGS=`query HomeBlogs\(\$first:Int!\)/.test(storefront) &&
  /articles\(first:8,sortKey:PUBLISHED_AT/.test(storefront) &&
  !/const HOME_BLOGS=[^;]*contentHtml/.test(storefront));
check('Storefront collection listing uses guarded cursor pagination',
  /async function getCollections\(\)\{const nodes=await fetchConnectionPages<any>\(COLLECTIONS,\{\},\"collections\",250\)/.test(storefront));
check('Blog index uses cursor-paginated blog and article queries',
  /const BLOGS=`query Blogs\(\$first:Int!,\$after:String\)/.test(storefront) &&
  /const BLOG_ARTICLES=`query BlogArticles\(\$handle:String!,\$first:Int!,\$after:String\)/.test(storefront) &&
  /fetchConnectionPages<any>\(BLOG_ARTICLES/.test(storefront));
check('Blog card hover animation is present and reduced-motion disables it',
  /\.bh-blog-card:hover\{transform:translateY\(-2px\);box-shadow:var\(--bh-shadow\)/.test(stylesheet) &&
  /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.bh-blog-card\{transition:none!important/.test(stylesheet));
check('Mobile navigation has unique React keys and no duplicated quote route',
  mobileNavigation.includes('key={`${t}-${h}`}') &&
  !mobileNavigation.includes(`["Get a Quote","/quote"]`) &&
  !mobileNavigation.includes(`["Cleaning & Hygiene","/categories/cleaning-hygiene"]`));
check('New Items link drives the catalog sort state from the URL',
  /const requestedSort=params\.get\(\"sort\"\)/.test(storefront) &&
  /useEffect\(\(\)=>\{setSort\(initialSort\)\},\[initialSort\]\)/.test(storefront) &&
  /\[\"New Items\",\"\/shop\?sort=NEWEST\"\]/.test(storefront));
check('Quote rows use persisted basket quantity/removal handlers without a legacy item fallback',
  /activeItems\.map\(item=>/.test(storefront) &&
  /onClick=\{\(\)=>updateQuoteItem\(item\.id,item\.quantity-1\)\}/.test(storefront) &&
  /onClick=\{\(\)=>removeQuoteItem\(item\.id\)\}/.test(storefront) &&
  !/legacyQuantity|startsWith\("legacy:"\)/.test(storefront));
const lastReducedMotionBlock = stylesheet.slice(stylesheet.lastIndexOf('@media (prefers-reduced-motion: reduce)'));
check('Last reduced-motion override does not re-enable category image zoom',
  lastReducedMotionBlock.includes('.bh-collection-image-fill,') &&
  /transform:\s*none\s*!important/.test(lastReducedMotionBlock) &&
  !/\.bh-collection-image-fill\s*\{\s*transform:\s*scale\(/.test(lastReducedMotionBlock));
check('Final reduced-motion sweep disables the rest of the site’s hover motion',
  stylesheet.includes('.bh-promo-hero-card:hover .bh-promo-hero-image') &&
  stylesheet.includes('.bh-mega-card:hover .bh-mega-category-thumb img') &&
  /\.bh-cart-drawer[\s\S]*?animation:\s*none\s*!important/.test(lastReducedMotionBlock));

const { collectPages, connectionPageFrom } = loadTypeScriptHelper(paginationSource, ['collectPages', 'connectionPageFrom']);
const nestedConnection = connectionPageFrom({ blog: { handle: 'news', articles: { nodes: ['article-1'], pageInfo: { hasNextPage: true, endCursor: 'article-cursor' } } } }, 'blog.articles');
check('Pagination resolver finds nested Shopify blog article connections',
  JSON.stringify(nestedConnection?.nodes) === JSON.stringify(['article-1']) && nestedConnection?.pageInfo?.endCursor === 'article-cursor');
const rootConnection = connectionPageFrom({ products: { nodes: ['product-1'], pageInfo: { hasNextPage: false, endCursor: null } } });
check('Pagination resolver finds root Shopify product connections',
  JSON.stringify(rootConnection?.nodes) === JSON.stringify(['product-1']));
let cursors = [];
const paged = await collectPages(async (after) => {
  cursors.push(after);
  if (after === null) return { nodes: ['A', 'B'], pageInfo: { hasNextPage: true, endCursor: 'cursor-1' } };
  if (after === 'cursor-1') return { nodes: ['C'], pageInfo: { hasNextPage: true, endCursor: 'cursor-2' } };
  return { nodes: ['D'], pageInfo: { hasNextPage: false, endCursor: 'cursor-3' } };
});
check('Pagination helper collects all pages in cursor order',
  JSON.stringify(paged) === JSON.stringify(['A', 'B', 'C', 'D']) &&
  JSON.stringify(cursors) === JSON.stringify([null, 'cursor-1', 'cursor-2']));

let repeatedCursorCalls = 0;
const repeatedCursorItems = await collectPages(async (after) => {
  repeatedCursorCalls += 1;
  return { nodes: [repeatedCursorCalls], pageInfo: { hasNextPage: true, endCursor: after === null ? 'repeat' : 'repeat' } };
});
check('Pagination helper stops on repeated cursors', repeatedCursorCalls === 2 && repeatedCursorItems.length === 1);

let boundedCalls = 0;
const boundedItems = await collectPages(async (after) => {
  boundedCalls += 1;
  return { nodes: [boundedCalls], pageInfo: { hasNextPage: true, endCursor: `cursor-${boundedCalls}` } };
}, 3);
check('Pagination helper respects a hard page budget', boundedCalls === 3 && boundedItems.length === 3);

let emptyCalls = 0;
const emptyItems = await collectPages(async () => {
  emptyCalls += 1;
  return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
});
check('Pagination helper terminates cleanly on an empty connection', emptyCalls === 1 && emptyItems.length === 0);

for (const result of checks) {
  console.log(`${result.passed ? '[PASS]' : '[FAIL]'} ${result.name}${result.detail ? ` — ${result.detail}` : ''}`);
}
const failed = checks.filter((result) => !result.passed);
console.log(`RELEASE HARDENING REGRESSION: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
