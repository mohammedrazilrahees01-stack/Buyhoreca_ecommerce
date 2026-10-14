import fs from 'node:fs';
const file='app/[[...slug]]/Storefront.tsx';
const s=fs.readFileSync(file,'utf8');
const checks=[
  ['baseline availability filter', /id:"bh-availability"/.test(s)],
  ['baseline price filter', /id:"bh-price"/.test(s)],
  ['real price ProductFilter input', /input:\{price:\{/.test(s)],
  ['baseline brand filter from collections', /productVendor:c\.title/.test(s)],
  ['dynamic Shopify facets preserved', /f\.values/.test(s) && /FilterValue/.test(s) === false],
  ['show all filter values', /Show all \$\{f\.values\.length\}/.test(s)],
  ['catalog category browsing', /Browse by category/.test(s) && /categoryCollectionsFor\(collections\)/.test(s)],
  ['desktop filter panel', /lg:hidden.*Filters|lg:sticky/.test(s)],
  ['mobile filter drawer', /Filter catalogue|Search filters|Filter brand products/.test(s)],
  ['no obsolete blank-filter message', !/No additional filters are configured for this catalogue view/.test(s)],
];
let fail=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`); if(!ok)fail++;}
console.log(`FILTER AUDIT: ${checks.length-fail} PASS / ${fail} FAIL`); process.exitCode=fail?1:0;
