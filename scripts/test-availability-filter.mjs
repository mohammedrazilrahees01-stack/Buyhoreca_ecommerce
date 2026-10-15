import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const source = fs.readFileSync(path.join(root, "app/[[...slug]]/Storefront.tsx"), "utf8");
const checks = [
  ["Shared facet UI removes Out of stock values", source.includes("values:f.values.filter(v=>!isOutOfStockFilterLabel(v.label))") && source.includes(".filter(f=>f.values.length>0)")],
  ["Baseline Availability facet offers In stock only", /baseline-availability[^;]+label:\"In stock\"/.test(source) && !source.includes('id:"unavailable",label:"Out of stock"')],
  ["All four selection handlers reject the removed option", (source.match(/if\(isOutOfStockFilterLabel\(value\.label\)\)return;/g) || []).length === 4],
  ["Shopify requests send only active filter inputs", /const activeFacetInputs=\(selected:Record<string,AppliedFacet>\)=>activeFacetSelections\(selected\)\.map\(item=>item\.input\)/.test(source) && (source.match(/activeFacetInputs\(selected\)/g) || []).length >= 6],
  ["Product availability badges and quote actions remain intact", source.includes("Out of stock · Request a quote") && source.includes("Request a Quote") && source.includes("const variantOutOfStock=")]
];
for (const [name, ok] of checks) console.log(`[${ok ? "PASS" : "FAIL"}] ${name}`);
const passed = checks.filter(([, ok]) => ok).length;
console.log(`\nOUT-OF-STOCK FILTER REGRESSION: ${passed} PASS / ${checks.length - passed} FAIL`);
process.exitCode = passed === checks.length ? 0 : 1;
