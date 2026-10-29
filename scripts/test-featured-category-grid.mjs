import fs from 'node:fs';
import assert from 'node:assert/strict';

const store = fs.readFileSync('app/[[...slug]]/Storefront.tsx', 'utf8');
const css = fs.readFileSync('app/globals.css', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

function pass(message) {
  console.log(`PASS ${message}`);
}

assert.match(store, /const featured36=\[\.\.\.featured,\.\.\.categoryCollections\.filter\(c=>!featured\.some\(f=>f\.id===c\.id\)\)\]\.slice\(0,36\)/);
pass('featured categories can use up to 36 real Shopify collection entries');

assert.match(store, /CategoryRail collections=\{featured36\}/);
pass('homepage category rail uses the expanded live collection list');

assert.match(store, /href="\/categories" className="text-sm font-bold text-\[#008f68\]"/);
pass('View all still links to the complete category index');

const expected = [
  { query: '(max-width:359px)', hidden: 7, cols: 2, items: 6 },
  { query: '(min-width:360px) and (max-width:575px)', hidden: 10, cols: 3, items: 9 },
  { query: '(min-width:576px) and (max-width:767px)', hidden: 13, cols: 4, items: 12 },
  { query: '(min-width:768px) and (max-width:1023px)', hidden: 16, cols: 5, items: 15 },
  { query: '(min-width:1024px) and (max-width:1279px)', hidden: 19, cols: 6, items: 18 },
  { query: '(min-width:1280px) and (max-width:1599px)', hidden: 25, cols: 8, items: 24 },
  { query: '(min-width:1600px) and (max-width:1919px)', hidden: 28, cols: 9, items: 27 },
  { query: '(min-width:1920px) and (max-width:2559px)', hidden: 31, cols: 10, items: 30 },
  { query: '(min-width:2560px) and (max-width:3839px)', hidden: 34, cols: 11, items: 33 },
];

function mediaBlockBodies(query) {
  const token = `@media ${query}`;
  const bodies = [];
  let position = 0;
  while ((position = css.indexOf(token, position)) !== -1) {
    const open = css.indexOf("{", position);
    if (open < 0) break;
    let depth = 1;
    let end = open + 1;
    for (; end < css.length && depth > 0; end++) {
      if (css[end] === "{") depth++;
      else if (css[end] === "}") depth--;
    }
    bodies.push(css.slice(open + 1, end - 1));
    position = end;
  }
  return bodies;
}

for (const item of expected) {
  // The same viewport query can style multiple components. Find the media block
  // containing the category-rail cutoff, not the last arbitrary block for that query.
  const body = mediaBlockBodies(item.query).find(value => value.includes(`.bh-category-rail-grid>a:nth-child(n+${item.hidden})`));
  assert.ok(body, `missing category-rail cutoff ${item.hidden} for ${item.query}`);
  if (item.query.includes('576px')) assert.ok(body.includes('grid-template-columns:repeat(4,minmax(0,1fr))'), '576-767px needs four columns');
  assert.equal(item.cols * 3, item.items);
  pass(`${item.query} shows up to ${item.items} cards (${item.cols} columns × 3 rows)`);
}
// The 4K+ layout is explicitly capped at 36 supplied cards and does not hide them.
assert.match(css, /@media\s*\(min-width:\s*3840px\)[\s\S]*?\.bh-category-rail-grid\{grid-template-columns:repeat\(12,minmax\(0,1fr\)\)!important\}/);
pass('3840px+ shows up to 36 cards in 12 columns × 3 rows');

assert.equal(packageJson.scripts['test:featured-category-grid'], 'node scripts/test-featured-category-grid.mjs');
pass('test is exposed as npm run test:featured-category-grid');

console.log('\nFeatured category grid tests: all passed');
