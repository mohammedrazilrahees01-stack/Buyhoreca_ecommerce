import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); }
catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routeSource = fs.readFileSync(path.join(root, 'lib/route-manifest.ts'), 'utf8');
const compiled = ts.transpileModule(routeSource, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { classifyStorefrontRoute, BUSINESS_SLUGS } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const policies = ['privacy-policy', 'refund-policy', 'shipping-policy', 'terms-of-service'];
const cases = [
  { path: '/', kind: 'render' },
  { path: '/shop', kind: 'render' },
  { path: '/categories', kind: 'render' },
  { path: '/categories/kitchen-utensils', kind: 'render' },
  { path: '/brands', kind: 'render' },
  { path: '/brands/winco', kind: 'render' },
  { path: '/business', kind: 'render' },
  { path: '/business/restaurant', kind: 'render' },
  { path: '/cart', kind: 'render' },
  { path: '/wishlist', kind: 'render' },
  { path: '/compare', kind: 'render' },
  { path: '/quote?handle=sample-product', kind: 'render' },
  { path: '/account', kind: 'render' },
  { path: '/track-order', kind: 'render' },
  { path: '/blog', kind: 'render' },
  { path: '/blog/news-and-insights', kind: 'not-found' },
  { path: '/blog/news-and-insights/sample-article', kind: 'render' },
  { path: '/blog/news/sample/article/extra', kind: 'not-found' },
  { path: '/about', kind: 'render' },
  { path: '/contact', kind: 'render' },
  { path: '/faq', kind: 'render' },
  { path: '/collections', kind: 'render' },
  { path: '/products/sample-product', kind: 'render' },
  { path: '/products', kind: 'not-found' },
  { path: '/products/sample/extra', kind: 'not-found' },
  { path: '/categories/a/b', kind: 'not-found' },
  { path: '/business/not-a-business', kind: 'not-found' },
  { path: '/account/login', kind: 'not-found' },
  { path: '/policies/privacy-policy', kind: 'render' },
  { path: '/policies/refund-policy', kind: 'render' },
  { path: '/policies/shipping-policy', kind: 'render' },
  { path: '/policies/terms-of-service', kind: 'render' },
  { path: '/policies/unknown-policy', kind: 'not-found' },
  { path: '/policies', kind: 'not-found' },
  { path: '/shipping', kind: 'redirect', destination: '/policies/shipping-policy' },
  { path: '/does-not-exist', kind: 'not-found' },
];
// Assert every supported business slug and every supported Shopify policy route, not only samples.
for (const businessSlug of BUSINESS_SLUGS) cases.push({ path: `/business/${businessSlug}`, kind: 'render' });
for (const policyHandle of policies) cases.push({ path: `/policies/${policyHandle}`, kind: 'render' });
let failed = 0;
let passed = 0;
function check(name, ok, note='') {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${note ? ` — ${note}` : ''}`);
  if (ok) passed++; else failed++;
}
for (const c of cases) {
  const url = new URL(c.path, 'https://buyhoreca.com');
  const slug = url.pathname.split('/').filter(Boolean);
  const actual = classifyStorefrontRoute(slug, policies);
  check(`${c.path} route decision`, actual.kind === c.kind && (c.kind !== 'redirect' || actual.destination === c.destination), JSON.stringify(actual));
}

// Every literal internal href in the Storefront component must point to a route root/shape the app accepts.
const storefront = fs.readFileSync(path.join(root, 'app/[[...slug]]/Storefront.tsx'), 'utf8');
const serverPage = fs.readFileSync(path.join(root, 'app/[[...slug]]/page.tsx'), 'utf8');
const routeLinkSources = [storefront, fs.readFileSync(path.join(root, 'app/not-found.tsx'), 'utf8')];
const renderMappings = [
  ['home route', 'pathname==="/"', '<Home '],
  ['shop and search routes', 'pathname==="/shop"||pathname==="/search"', '<Catalog '],
  ['category index routes', 'pathname==="/categories"||pathname==="/collections"', '<CategoryIndex '],
  ['category detail routes', 'pathname.startsWith("/categories/")', '<CategoryLoader '],
  ['product detail routes', 'pathname.startsWith("/products/")', '<ProductPage '],
  ['brand index route', 'pathname==="/brands"', '<BrandIndex '],
  ['brand detail routes', 'pathname.startsWith("/brands/")', '<BrandPage '],
  ['business index route', 'pathname==="/business"', '<BusinessIndex/>'],
  ['business detail routes', 'pathname.startsWith("/business/")', '<BusinessPage '],
  ['cart route', 'pathname==="/cart"', '<CartPage '],
  ['wishlist route', 'pathname==="/wishlist"', '<Wishlist '],
  ['compare route', 'pathname==="/compare"', '<ComparePage '],
  ['quote route', 'pathname==="/quote"', '<QuotePage/>'],
  ['about route', 'pathname==="/about"', '<AboutPage '],
  ['contact route', 'pathname==="/contact"', '<ContactPage '],
  ['FAQ route', 'pathname==="/faq"', '<FAQPage/>'],
  ['customer-account route', 'pathname==="/account"', '<CustomerAccountPage/>'],
  ['tracking support route', 'pathname==="/track-order"', '<TrackOrderPage/>'],
  ['policy detail routes', 'pathname.startsWith("/policies/")', '<PolicyPage '],
  ['blog index route', 'pathname==="/blog"', '<BlogIndex/>'],
  ['blog article route', 'pathname.startsWith("/blog/")', '<BlogArticleLoader '],
];
for (const [name, branch, component] of renderMappings) check(`${name} has a client renderer`, storefront.includes(branch) && storefront.includes(component));
check('Server route validator sends malformed and unknown URLs to Next.js 404', /routeDecision.kind === "not-found"\) notFound\(\)/.test(serverPage));
check('Server route validator handles legacy shipping redirect', /routeDecision.kind === "redirect"\) redirect\(routeDecision.destination\)/.test(serverPage));
const businessNavBlock = storefront.match(/const BUSINESS_NAV_ITEMS=\[([\s\S]*?)\] as const/);
const businessNavSlugs = Array.from(businessNavBlock?.[1]?.matchAll(/\["[^"\n]+","([a-z0-9-]+)"\]/g) || [], match => match[1]);
const businessRouteSlugs = Array.from(BUSINESS_SLUGS);
check('Every business navigation link matches the server route allow-list', businessNavSlugs.length === businessRouteSlugs.length && businessNavSlugs.every(slug => BUSINESS_SLUGS.has(slug)) && businessRouteSlugs.every(slug => businessNavSlugs.includes(slug)), JSON.stringify({ navigation: businessNavSlugs, allowed: businessRouteSlugs }));
const staticHrefs = routeLinkSources.flatMap(source => [...source.matchAll(/\bhref="(\/[^"]*)"/g)].map(m => m[1]));
for (const href of [...new Set(staticHrefs)]) {
  const url = new URL(href, 'https://buyhoreca.com');
  const decision = classifyStorefrontRoute(url.pathname.split('/').filter(Boolean), policies);
  check(`internal href ${href}`, decision.kind !== 'not-found', JSON.stringify(decision));
}

// The static routes put in the sitemap must resolve in the route manifest.
const sitemap = fs.readFileSync(path.join(root, 'app/sitemap.ts'), 'utf8');
const expectedStatic = ['/', '/shop', '/categories', '/brands', '/business', '/blog', '/about', '/contact', '/faq'];
for (const p of expectedStatic) {
  const actual = classifyStorefrontRoute(new URL(p, 'https://buyhoreca.com').pathname.split('/').filter(Boolean), policies);
  check(`sitemap static route ${p}`, actual.kind === 'render', JSON.stringify(actual));
}
check('Business route manifest is non-empty and consistent with the sitemap', BUSINESS_SLUGS.size === 10 && /BUSINESS_SLUGS/.test(sitemap));
check('Server page uses the route manifest before rendering', /classifyStorefrontRoute/.test(fs.readFileSync(path.join(root, 'app/[[...slug]]/page.tsx'), 'utf8')));
check('Blog detail existence query is only executed for article-shaped URLs', /if \(slug\[0\] === "blog" && slug\.length === 3\)/.test(fs.readFileSync(path.join(root, 'app/[[...slug]]/page.tsx'), 'utf8')));

// Inspect JSX control wiring with the TypeScript parser.
const tsxFiles = ['app/[[...slug]]/Storefront.tsx', 'app/layout.tsx', 'app/not-found.tsx', 'app/error.tsx', 'app/global-error.tsx'];
let buttonCount = 0;
let formCount = 0;
for (const rel of tsxFiles) {
  const source = fs.readFileSync(path.join(root, rel), 'utf8');
  const kind = rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(rel, source, ts.ScriptTarget.Latest, true, kind);
  function walk(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const name = node.tagName.getText(sf);
      const attrs = node.attributes.properties;
      const names = attrs.map(a => a.name?.getText(sf)).filter(Boolean);
      if (name === 'button') {
        buttonCount++;
        const typeAttr = attrs.find(a => a.name?.getText(sf) === 'type');
        const typeText = typeAttr?.initializer?.getText(sf) || '';
        const wired = names.includes('onClick') || names.includes('disabled') || typeText.includes('submit');
        const pos = sf.getLineAndCharacterOfPosition(node.getStart(sf));
        check(`${rel}:${pos.line + 1} button has event/submit/intentional-disabled wiring`, wired);
      }
      if (name === 'form') {
        formCount++;
        const wired = names.includes('onSubmit') || names.includes('action');
        const pos = sf.getLineAndCharacterOfPosition(node.getStart(sf));
        check(`${rel}:${pos.line + 1} form has submit handler or action`, wired);
      }
    }
    ts.forEachChild(node, walk);
  }
  walk(sf);
}
check(`JSX control audit found buttons to inspect (${buttonCount})`, buttonCount > 0);
check(`JSX control audit found forms to inspect (${formCount})`, formCount > 0);

// Every hard-coded local image/poster URL in JSX must map to an existing public asset.
const localImagePaths = new Set();
for (const rel of tsxFiles) {
  const source = fs.readFileSync(path.join(root, rel), 'utf8');
  for (const match of source.matchAll(/\b(?:src|poster)="(\/[^"#?]+)"/g)) {
    const value = match[1];
    if (value.startsWith('//') || /^(?:https?:|data:)/i.test(value)) continue;
    localImagePaths.add(value);
  }
}
for (const imagePath of [...localImagePaths]) {
  check(`local public asset ${imagePath}`, fs.existsSync(path.join(root, 'public', imagePath.slice(1))));
}

// Dynamic href templates should match supported route families; test with representative valid slugs.
const templateHrefs = routeLinkSources.flatMap(source => [...source.matchAll(/\bhref=\{`([^`]+)`\}/g)].map(m => m[1]));
for (const template of [...new Set(templateHrefs)]) {
  let sample = null;
  if (template.startsWith('/categories/')) sample = '/categories/sample-category';
  else if (template.startsWith('/products/')) sample = '/products/sample-product';
  else if (template.startsWith('/brands/')) sample = '/brands/sample-brand';
  else if (template.startsWith('/business/')) sample = '/business/restaurant';
  else if (template.startsWith('/blog/')) sample = '/blog/sample-blog/sample-article';
  else if (template.startsWith('/quote')) sample = '/quote?handle=sample-product';
  if (sample) {
    const actual = classifyStorefrontRoute(new URL(sample, 'https://buyhoreca.com').pathname.split('/').filter(Boolean), policies);
    check(`dynamic href template ${template.slice(0, 100)}`, actual.kind === 'render', JSON.stringify(actual));
  } else {
    check(`dynamic href template has a recognized internal family ${template.slice(0, 100)}`, /^(?:\/|https?:)/.test(template));
  }
}

console.log(`\nROUTE COVERAGE: ${passed} pass / ${failed} fail; ${cases.length} route cases (including all ${BUSINESS_SLUGS.size} business and ${policies.length} policy routes), ${new Set(staticHrefs).size} static internal hrefs, ${expectedStatic.length} sitemap route cases.`);
if (failed) process.exit(1);
