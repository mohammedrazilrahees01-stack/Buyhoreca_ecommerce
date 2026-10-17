import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(new URL("..", import.meta.url).pathname);
const source = fs.readFileSync(path.join(root, "lib/brand-directory.ts"), "utf8");
const storefront = fs.readFileSync(path.join(root, "app/[[...slug]]/Storefront.tsx"), "utf8");
const route = fs.readFileSync(path.join(root, "app/[[...slug]]/page.tsx"), "utf8");
const sitemap = fs.readFileSync(path.join(root, "app/sitemap.ts"), "utf8");
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
let ts;
try { ts = require("typescript"); }
catch { ts = require("/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js"); }
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
new Function("exports", "module", compiled)(mod.exports, mod);
const { CURATED_BRANDS, buildBrandDirectory, normalizeBrandKey, getCuratedBrandBySlug } = mod.exports;
const tests = [];
const test = (name, pass, detail = "") => tests.push({ name, pass: Boolean(pass), detail });

const slugs = CURATED_BRANDS.map((brand) => brand.slug);
const normalizedNames = CURATED_BRANDS.map((brand) => normalizeBrandKey(brand.name));
const logoEntries = CURATED_BRANDS.filter((brand) => brand.logoPath);
const logoFiles = logoEntries.filter((brand) => fs.existsSync(path.join(root, "public", brand.logoPath.replace(/^\//, ""))));
const expectedNames = ["Winco", "Knicer", "Brewing Edge", "Carlisle", "Gi-Metal", "Vollrath", "Bunn", "The Scotsman", "Silikomart Professional", "American Metalcraft", "Bormioli Rocco", "G.E.T.", "Cooper-Atkins", "Prince Castle", "Cambro", "Vitamix Commercial", "Rubbermaid", "Sonoco", "Hamilton Beach", "JB Products", "Jiwins", "Manitowoc"];
test("Brand directory includes all 64 reference logos plus existing Shopify brands", CURATED_BRANDS.length >= 68, `Found ${CURATED_BRANDS.length} curated entries`);
test("Brand slugs are unique", new Set(slugs).size === slugs.length, `${slugs.length} unique slugs`);
test("Brand display names are unique after normalization", new Set(normalizedNames).size === normalizedNames.length, `${normalizedNames.length} unique normalized names`);
test("All 64 reference logo crops are present", logoEntries.length === 64 && logoFiles.length === 64, `${logoFiles.length}/${logoEntries.length} logo files exist`);
test("Known brands from the supplied sheet and existing listing are included", expectedNames.every((name) => CURATED_BRANDS.some((brand) => brand.name === name)));
test("Curated brands can resolve stable planned slugs", getCuratedBrandBySlug("winco")?.name === "Winco" && getCuratedBrandBySlug("get")?.name === "G.E.T.");

const mockCollections = [
  { id: "winco-1", handle: "winco-commercial", title: "Winco", vendor: "Winco", image: { url: "https://cdn.test/winco.png" } },
  { id: "winco-2", handle: "winco-duplicate", title: "WINCO", vendor: "WINCO", image: null },
  { id: "hamilton", handle: "hamilton-beach", title: "Hamilton Beach", vendor: "Hamilton Beach", image: null },
  { id: "extra", handle: "extra-brand", title: "Extra Brand", vendor: "Extra Brand", image: null },
  { id: "not-brand", handle: "kitchen-tools", title: "Kitchen Tools", vendor: "Winco", image: null },
  { id: "buyhoreca", handle: "buyhoreca", title: "BuyHoreca", vendor: "BuyHoreca", image: null },
];
const merged = buildBrandDirectory(mockCollections);
const winco = merged.filter((brand) => normalizeBrandKey(brand.name) === "winco");
test("Matching Shopify collections replace the placeholder route and logo", winco.length === 1 && winco[0].collection?.handle === "winco-commercial" && winco[0].collection?.image?.url === "https://cdn.test/winco.png");
test("A seeded brand handle can be linked without hard-coded redirect edits", (() => { const list = buildBrandDirectory([{ handle: "pavoni-italia", title: "Pavoni Italy Supplier Collection", vendor: "Pavoni Italia", image: { url: "https://cdn.test/pavoni.png" } }]); const item = list.find((brand) => brand.slug === "pavoni-italia"); return item?.status === "available" && item.collection?.handle === "pavoni-italia"; })());
test("Missing curated collections remain visible with a stable slug", merged.some((brand) => brand.name === "Pavoni Italia" && brand.status === "coming-soon" && brand.slug === "pavoni-italia"));
test("Additional Shopify brands are added automatically", merged.some((brand) => brand.name === "Extra Brand" && brand.status === "available"));
test("Mismatched category/vendor collections are not inferred as brands", !merged.some((brand) => brand.name === "Kitchen Tools"));
test("Shop by Brand and header mega-menu use the merged directory", (storefront.match(/buildBrandDirectory\(collections\)/g) || []).length >= 3 && /brandDirectory\.map\(b=>/.test(storefront));
test("Brand page has a coming-soon state for brands not connected to Shopify", /Its dedicated product collection is being prepared/.test(storefront) && /getCollection\(resolvedHandle/.test(storefront));
test("Unlinked brand routes are noindex until a Shopify collection exists", /plannedBrand/.test(route) && /robots: NO_INDEX_ROBOTS/.test(route));
test("Known brand slugs are allowed before their collections are created", /knownBrand = getCuratedBrandBySlug/.test(route) && /!validBrand && !knownBrand/.test(route));
test("Sitemap includes only linked brands and deduplicates duplicate collections", /buildBrandDirectory\(directoryCollections\)\.filter\(\(item\) => item\.collection\)/.test(sitemap) && /brandHandleSet/.test(sitemap) && /products\?\.nodes/.test(sitemap));
test("Brand directory cards have responsive layouts and clear statuses", /bh-brand-directory-grid/.test(css) && /is-coming-soon/.test(css) && /@media\(min-width:1920px\)\{\.bh-brand-directory-grid/.test(css));
test("Brand directory offers accessible brand search", /aria-label="Search brands"/.test(storefront) && /No brands match/.test(storefront));

for (const item of tests) console.log(`[${item.pass ? "PASS" : "FAIL"}] ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
const failures = tests.filter((item) => !item.pass);
console.log(`BRAND DIRECTORY REGRESSION: ${tests.length - failures.length}/${tests.length} passed`);
if (failures.length) process.exit(1);
