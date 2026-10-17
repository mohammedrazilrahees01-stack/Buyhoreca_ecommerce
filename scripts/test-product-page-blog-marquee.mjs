import fs from "node:fs";
const storefront=fs.readFileSync("app/[[...slug]]/Storefront.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const checks=[
 ["Direct editable quantity input",/aria-label="Product quantity"/.test(storefront)],
 ["Quantity is stock-clamped for purchasable variants",/const quantityLimit=purchasable&&typeof variant\?\.quantityAvailable==="number"/.test(storefront)],
 ["Estimated line subtotal labelled",/Estimated subtotal/.test(storefront)],
 ["SKU copy action",/const copySku=async/.test(storefront)&&/const copyText=async/.test(storefront)],
 ["Native share or clipboard fallback",/const shareProduct=async/.test(storefront)&&/navigator\.share/.test(storefront)&&/await copyText\(url\)/.test(storefront)],
 ["Product save and compare persist snapshots",/const toggleSaved=/.test(storefront)&&/const toggleCompared=/.test(storefront)&&/WISHLIST_SNAPSHOT_KEY/.test(storefront)&&/COMPARE_SNAPSHOT_KEY/.test(storefront)],
 ["Unavailable variants selectable for quote",/onClick=\{\(\)=>selectVariant\(v\)\}/.test(storefront)&&/addToQuote\(product,variant,q\)/.test(storefront)],
 ["Marquee uses all supplied articles",/const items=articles;/.test(storefront)],
 ["Marquee dynamically repeats to cover narrow item counts",/const needed=Math\.max\(2,Math\.ceil\(viewport\/cycle\)\+1\)/.test(storefront)&&/Array\.from\(\{length:copyCount\}/.test(storefront)],
 ["Marquee preserves normalized positive offsets and wraps at one group width",/const cycle=cycleWidth\(\);/.test(storefront)&&/offsetRef\.current=\(offsetRef\.current\+18\*\(dt\/1000\)\)%cycle/.test(storefront)&&/offsetRef\.current=\(\(offsetRef\.current%cycle\)\+cycle\)%cycle/.test(storefront)],
 ["Marquee uses equal inter-card and loop-seam spacing",/bh-blog-group\{display:flex;flex:0 0 auto;gap:12px;padding-right:12px;min-width:0\}/.test(css)&&/@media\(max-width:480px\)\{\.bh-blog-group\{gap:9px;padding-right:9px\}/.test(css)],
 ["Reduced-motion marquee remains manually scrollable",/bh-blog-group-duplicate\{display:none!important\}/.test(css)&&/bh-blog-carousel\{overflow-x:auto;scroll-behavior:auto!important/.test(css)],
 ["Homepage blog rail uses a separate bounded preview query",/const HOME_BLOGS=`query HomeBlogs\(\$first:Int!\)/.test(storefront)&&/articles\(first:8,sortKey:PUBLISHED_AT/.test(storefront)&&!/const HOME_BLOGS=`[^`]*contentHtml[^`]*`/.test(storefront)],
 ["Blog index paginates every blog and article connection",/query Blogs\(\$first:Int!,\$after:String\)/.test(storefront)&&/query BlogArticles\(\$handle:String!,\$first:Int!,\$after:String\)/.test(storefront)&&/fetchConnectionPages/.test(storefront)&&/collectPages/.test(storefront)&&/nextCursor\s*===\s*after/.test(fs.readFileSync("lib/shopify-pagination.ts","utf8"))&&/async function getBlogs\(\):Promise<Blog\[]>/.test(storefront)],
];
for(const [name,ok] of checks)console.log(`${ok?"[PASS]":"[FAIL]"} ${name}`);
console.log(`PRODUCT/BLOG REGRESSION: ${checks.filter(x=>x[1]).length}/${checks.length} passed`);
if(checks.some(x=>!x[1]))process.exit(1);
