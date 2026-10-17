import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const require = createRequire(import.meta.url);
let ts;
try { ts = require("typescript"); }
catch { ts = require("/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js"); }
const source = fs.readFileSync(path.join(ROOT, "lib/quote-items.ts"), "utf8");
const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "buyhoreca-quote-flow-"));
const modulePath = path.join(tempDir, "quote-items.cjs");
fs.writeFileSync(modulePath, result.outputText);
const { mergeQuoteProduct } = require(modulePath);
const checks = [];
const check = (name, fn) => { try { fn(); checks.push({ name, ok: true }); } catch (error) { checks.push({ name, ok: false, error: error.message }); } };
const product = { id: "gid://shopify/Product/1", handle: "steel-tong", name: "Steel Tong" };
const other = { id: "gid://shopify/Product/2", handle: "tray", name: "Tray" };
const first = { id: `${other.id}:v2`, product: other, variantId: "v2", quantity: 3 };
const buildItem = (p, variantId) => ({ id: `${p.id}:${variantId}`, product: p, variantId, quantity: 1 });
check("Adds a directly requested product to a non-empty basket", () => {
  const merged = mergeQuoteProduct([first], product, "v1", buildItem);
  assert.equal(merged.length, 2);
  assert.equal(merged[0], first);
  assert.equal(merged[1].product.id, product.id);
  assert.equal(merged[1].quantity, 1);
});
check("Does not duplicate a product variant already in the basket", () => {
  const current = [first, buildItem(product, "v1")];
  assert.equal(mergeQuoteProduct(current, product, "v1", buildItem), current);
});
check("Allows a different variant of the same product", () => {
  const current = [buildItem(product, "v1")];
  const merged = mergeQuoteProduct(current, product, "v2", buildItem);
  assert.equal(merged.length, 2);
  assert.equal(merged[1].variantId, "v2");
});
check("Does not add products when variant ID is empty", () => {
  const current = [first];
  assert.equal(mergeQuoteProduct(current, product, "", buildItem), current);
});
check("Quote page fetch merges requested product instead of ignoring it when basket is non-empty", () => {
  const storefront = fs.readFileSync(path.join(ROOT, "app/[[...slug]]/Storefront.tsx"), "utf8");
  assert.match(storefront, /if\(!product\)\{setQuoteLoadError/);
  assert.match(storefront, /const next=mergeQuoteProduct\(current,product,variant\.id/);
  assert.match(storefront, /setItems\(next\)/);
  assert.match(storefront, /if\(next!==current\)\{writeQuoteItems\(next\)/);
});
for (const result of checks) console.log(`${result.ok ? "PASS" : "FAIL"}: ${result.name}${result.error ? ` — ${result.error}` : ""}`);
console.log(`Result: ${checks.filter(c=>c.ok).length}/${checks.length} passed`);
try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
if (checks.some(c => !c.ok)) process.exit(1);
