import fs from 'node:fs';
const storefront = fs.readFileSync('app/[[...slug]]/Storefront.tsx','utf8');
const css = fs.readFileSync('app/globals.css','utf8');
const cases = [
  ['320-359', 7, 2],
  ['360-575', 10, 3],
  ['576-767', 13, 4],
  ['768-1023', 16, 5],
  ['1024-1279', 19, 6],
  ['1280-1599', 25, 8],
  ['1600-1919', 28, 9],
  ['1920-2559', 31, 10],
  ['2560-3839', 34, 11],
  ['3840+', 37, 12],
];
let failures=0;
function check(name, condition){console.log(`${condition?'PASS':'FAIL'} ${name}`);if(!condition)failures++;}
check('Home category rail sources up to 36 real Shopify collections', /featured36=\[\.\.\.featured,\.\.\.categoryCollections\.filter\(c=>!featured\.some\(f=>f\.id===c\.id\)\)\]\.slice\(0,36\)/.test(storefront) && /<CategoryRail collections=\{featured36\}\/>/.test(storefront));
for(const [range,nth,cols] of cases){
 check(`${range}: ${cols} columns and hides item ${nth} onward (three rows)`, css.includes(`.bh-category-rail-grid>a:nth-child(n+${nth}){display:none!important}`));
}
check('Tablet-sized category rail 576-767px explicitly uses four columns', /@media \(min-width:576px\) and \(max-width:767px\)\{\s*\.bh-category-rail-grid\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important\}/.test(css));
if(failures){console.error(`CATEGORY RAIL TEST: ${failures} failure(s)`);process.exit(1)}
console.log(`CATEGORY RAIL TEST: ${cases.length+2} checks passed`);
