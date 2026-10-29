import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const root=process.cwd();
const file=path.join(root,"app/[[...slug]]/Storefront.tsx");
const source=fs.readFileSync(file,"utf8");
const failures=[];let passed=0;
function check(label,fn){try{fn();passed++;console.log(`[PASS] ${label}`)}catch(error){failures.push({label,error:error.message});console.log(`[FAIL] ${label}: ${error.message}`)}}
check("Clearance products are loaded from the live Shopify Clearance collection",()=>{assert.match(source,/x\.handle\.toLowerCase\(\)==="clearance"\|\|x\.title\.trim\(\)\.toLowerCase\(\)==="clearance"/);assert.match(source,/clearanceCollection\?getCollection\(clearanceCollection\.handle,null,\[\],"BEST_SELLING",false\)/);assert.match(source,/setHomeClearance\(clearance\?\.products\|\|\[\]\)/)});
check("Clearance query runs alongside the existing homepage product queries",()=>{const i=source.indexOf('const [best,newest,clearance]=await Promise.all(');assert.ok(i>0);assert.match(source.slice(i,i+600),/getProducts\(16,null,undefined,"BEST_SELLING",false\)/);assert.match(source.slice(i,i+600),/getProducts\(16,null,undefined,"CREATED_AT",true\)/)});
check("Clearance section appears immediately after the featured category section",()=>{const i=source.indexOf('<CategoryRail collections={featured36}/>');const j=source.indexOf('<ProductStrip title="Clearance"',i);const k=source.indexOf('sectionData.filter',i);assert.ok(i>=0&&j>i&&k>j,`expected CategoryRail < Clearance < other product strips, got ${i},${j},${k}`)});
check("Clearance section links to the real collection handle",()=>{assert.match(source,/viewAllHref=\{`\/categories\/\$\{clearanceHandle\}`\}/);assert.match(source,/viewAllLabel="Shop all clearance"/)});
check("Clearance strip reuses existing product cards and cart/quick-view handlers",()=>{const i=source.indexOf('<ProductStrip title="Clearance"');const frag=source.slice(i,i+360);assert.ok(frag.includes("products={clearanceProducts.slice(0,16)}"));assert.ok(frag.includes("onAdd={onAdd}"));assert.ok(frag.includes("onQuick={onQuick}"))});
check("Clearance is only rendered when Shopify returns products",()=>{const i=source.indexOf('function ProductStrip');assert.match(source.slice(i,i+1200),/if\(!products\.length\)return null/)});
check("Clearance uses a subtle accent without changing normal product strips",()=>{assert.match(source,/accent\?"border-y border-rose-100 bg-gradient-to-b from-rose-50\/60 to-white":""/);assert.match(source,/eyebrow="Limited-time savings"/)});
check("Non-home refresh clears homepage-only clearance products",()=>{const i=source.indexOf('const refresh=async()=>');const j=source.indexOf('useEffect(',i);const frag=source.slice(i,j);assert.ok((frag.match(/setHomeClearance\(\[\]\)/g)||[]).length>=2)});
console.log(`HOME CLEARANCE SECTION: ${passed}/8 PASS / ${failures.length} FAIL`);
if(failures.length)process.exitCode=1;
