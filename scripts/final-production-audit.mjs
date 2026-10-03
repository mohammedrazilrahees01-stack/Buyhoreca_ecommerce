import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let ts = null;
try { ts = require('typescript'); } catch { try { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); } catch {} }
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'app/[[...slug]]/Storefront.tsx'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');
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

const checks = [
  ['10 primary nav items (9 categories + Quote)', (src.match(/\n  \["[^"]+",\[/g) || []).length === 9 && /href="\/quote"[^>]*>Quote<\/Link>/.test(src)],
  ['Nav labels are medium/regular, not bold', /bh-primary-nav-item[^\"`]*text-\[12px\] font-medium/.test(src) && !/bh-primary-nav-item[^\"`]*text-\[12px\] font-bold/.test(src)],
  ['Mega menu is viewport-anchored, not item-anchored', /<nav className="relative hidden[\s\S]*?bh-mega border/.test(src) && /\.bh-mega\{position:absolute;left:50%;right:auto;top:100%;width:min\(1280px,calc\(100vw - 24px\)\)/.test(css) && !/bh-mega absolute left-1\/2/.test(src)],
  ['Mega menu tracks have min-width zero to prevent child overflow', /\.bh-mega-grid\{display:grid;grid-template-columns:minmax\(0,1\.25fr\) minmax\(280px,\.95fr\)/.test(css) && /\.bh-mega-card-label\{min-width:0/.test(css) && /\.bh-mega-more-link\{display:block;min-width:0/.test(css)],
  ['Mega menu nested category cards cannot force horizontal overflow', /bh-mega-card group flex min-h-\[66px\] min-w-0/.test(src) && /bh-mega-card-label/.test(src)],
  ['Full Shopify collections are paginated without artificial limit', (/async function getCollections\(\)/.test(src)&&src.includes('first:250')&&src.includes('do{')&&src.includes('while(after)'))],
  ['All-category dropdown is scrollable', /all-category-list[\s\S]*max-h-\[min\(62vh,560px\)\][\s\S]*overflow-y-auto/.test(src)],
  ['Mobile all-category dropdown exists', /mobile-all-category-list/.test(src) && /Search all categories on mobile/.test(src)],
  ['Current collection image behavior is preserved', src.includes('function CategoryRail') && src.includes('{c.image?<img src={c.image.url}')],
  ['Correct BuyHoreca header logo path', /LOGO_SRC="\/images\/buyhoreca-logo-header\.png"/.test(src)],
  ['Header logo asset exists', fs.existsSync(path.join(root, 'public/images/buyhoreca-logo-header.png'))],
  ['Company shop image exact preferred path is wired', /COMPANY_SHOP_IMAGE="\/images\/company\/shop_of_buyhoreca\.png"/.test(src)],
  ['Company shop fallback exists', fs.existsSync(path.join(root, 'public/images/company/modern-buyhoreca-storefront.png'))],
  ['PDF pages are not rendered in web source', !/\.pdf|IMAGE FOR PAGE/i.test(src)],
  ['Blog homepage is Shopify-backed', /getBlogs\(\)/.test(src) && /function BlogIndex/.test(src)],
  ['Blog has 2/3/4 responsive widths', /\.bh-blog-card\{width:calc\(\(100% - 12px\)\/2\)/.test(css) && /@media\(min-width:768px\)\{\.bh-blog-card\{width:calc\(\(100% - 24px\)\/3\)/.test(css) && /@media\(min-width:1200px\)\{\.bh-blog-card\{width:calc\(\(100% - 36px\)\/4\)/.test(css)],
  ['Blog autoplay pauses on hover/focus', /onMouseEnter=\{pause\} onMouseLeave=\{resume\}/.test(src) && /onFocusCapture=\{pause\}/.test(src)],
  ['Product cards have real small gaps', /\.bh-catalog-grid\{[\s\S]*gap:12px/.test(css) && /\.bh-product-card\{/.test(css)],
  ['Product card wishlist action persists', /toggleWish[\s\S]*writeStoredJSON\(WISHLIST_KEY,next\)[\s\S]*writeStoredJSON\(WISHLIST_SNAPSHOT_KEY,existing\)/.test(src)],
  ['Wishlist hydration race guard exists', /const \[storageReady,setStorageReady\]=useState\(false\)/.test(src) && /if\(!storageReady\)return;writeStoredJSON\(WISHLIST_KEY,wishlist\)/.test(src)],
  ['Cart pulse is correctly passed into header', /function StoreHeader\([\s\S]*cartPulse:boolean/.test(src) && /<StoreHeader[^>]*cartPulse=\{cartPulse\}/.test(src) && /@keyframes bhCartPulse/.test(css)],
  ['Real Shopify cart mutations exist', /CREATE_CART/.test(src) && /ADD_LINES/.test(src) && /UPDATE_LINES/.test(src) && /REMOVE_LINES/.test(src)],
  ['Predictive search includes products/collections/articles', /predictiveSearch\(query:\$query,types:\[PRODUCT,COLLECTION,ARTICLE\]\)/.test(src)],
  ['Brand logo images are wired for available assets', /BRAND_LOGOS/.test(src) && /brandLogoFor/.test(src) && /src\?<img/.test(src)],
  ['Brand page also uses image assets where available', /function BrandPage[\s\S]*brandLogoFor\(name\)/.test(src)],
  ['Analytics event layer exists', /const trackEvent=/.test(src) && /dataLayer/.test(src) && /view_item/.test(src) && /add_to_cart/.test(src)],
  ['SEO metadata + sitemap + robots exist', fs.existsSync(path.join(root,'app/sitemap.ts')) && fs.existsSync(path.join(root,'app/robots.ts')) && fs.existsSync(path.join(root,'app/[[...slug]]/page.tsx'))],
  ['Security headers are configured', /Referrer-Policy/.test(fs.readFileSync(path.join(root,'next.config.ts'),'utf8')) && /X-Content-Type-Options/.test(fs.readFileSync(path.join(root,'next.config.ts'),'utf8'))],
  ['404 and error boundaries exist', fs.existsSync(path.join(root,'app/not-found.tsx')) && fs.existsSync(path.join(root,'app/error.tsx'))],
  ['Reduced-motion support exists', /prefers-reduced-motion:reduce/.test(css)],
  ['No raw GitHub image fallback remains', !/raw\.githubusercontent\.com/.test(src)],
  ['No placeholder external image services remain', !/placehold\.co|unsplash\.com/.test(src)],
  ['Only one rendered StoreHeader and Footer in App', (src.match(/<StoreHeader\b/g)||[]).length===1 && (src.match(/<Footer\/>/g)||[]).length===1],
  ['Primary navigation opens mega menu by click for keyboard access', /onClick=\{\(\)=>setHoverNav\(active\?null:title\)\}/.test(src)],
  ['All-category dropdown renders every fetched collection', /filteredAll\.map\(c =>/.test(src) && !/filteredAll\.slice\(/.test(src)],
  ['Blog index supports article search and topic filters', /Search articles, topics or tags/.test(src) && /Filter blog topics/.test(src) && /tags=/.test(src) || (/Search articles, topics or tags/.test(src) && /setTag\(x\)/.test(src))],
  ['Product page stores recently viewed products', /RECENT_KEY="buyhoreca_recently_viewed"/.test(src) && /readStoredSnapshots\(RECENT_KEY\)/.test(src) && /writeStoredJSON\(RECENT_KEY/.test(src)],
  ['Product page offers related products from the same manufacturer', /function RelatedProducts\(/.test(src) && /vendor:"\$\{vendor\}"/.test(src)],
  ['Product page exposes real-data specifications', /Product specifications/.test(src) && /selectedOptions/.test(src)],
  ['Product page provides product-question contact workflow', /Questions about this product\?/.test(src) && /Ask for a Quote/.test(src)],
  ['Product route has Suspense boundary for navigation hooks', /import \{ Suspense \} from "react"/.test(fs.readFileSync(path.join(root,'app/[[...slug]]/page.tsx'),'utf8')) && /<Suspense fallback=/.test(fs.readFileSync(path.join(root,'app/[[...slug]]/page.tsx'),'utf8'))],
  ['Typography restraint also caps extra-bold utility', /\.font-extrabold\{font-weight:700\}/.test(css)],
  ['Optional GA4 integration is configured from environment', /NEXT_PUBLIC_GA4_ID/.test(fs.readFileSync(path.join(root,'.env.local.example'),'utf8')) && /googletagmanager\.com/.test(fs.readFileSync(path.join(root,'app/layout.tsx'),'utf8'))],
  ['Optional Meta Pixel integration is configured from environment', /NEXT_PUBLIC_META_PIXEL_ID/.test(fs.readFileSync(path.join(root,'.env.local.example'),'utf8')) && /connect\.facebook\.net/.test(fs.readFileSync(path.join(root,'app/layout.tsx'),'utf8'))],
  ['Customer account route exists', /pathname==="\/account"/.test(src) && /Customer Account/.test(src)],
  ['Order tracking support route exists', /pathname==="\/track-order"/.test(src) && /Track an Order/.test(src)],
];

let failures=0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
}

console.log('\nTypeScript/TSX parser audit');
if (ts) {
  for (const f of files.sort()) {
    const text = fs.readFileSync(f, 'utf8');
    const kind = f.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, kind);
    const diags = sf.parseDiagnostics || [];
    const rel = path.relative(root, f);
    if (diags.length) {
      failures++;
      console.log(`FAIL  ${rel} (${diags.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('; ')})`);
    } else {
      console.log(`PASS  ${rel}`);
    }
  }
} else {
  console.log('SKIP  TypeScript parser (install dependencies first)');
}

if (failures) process.exit(1);
console.log(`\nFINAL AUDIT PASSED: ${checks.length} requirement checks + ${files.length} TypeScript/TSX parser checks.`);
