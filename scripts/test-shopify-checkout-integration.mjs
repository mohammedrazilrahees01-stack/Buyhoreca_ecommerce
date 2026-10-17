import fs from "node:fs";

const storefront = fs.readFileSync("app/[[...slug]]/Storefront.tsx", "utf8");
const api = fs.readFileSync("app/api/shopify/route.ts", "utf8");
const checks = [
  ["Storefront GraphQL uses Shopify cartCreate", /mutation CartCreate[\s\S]{0,120}cartCreate\(/.test(storefront)],
  ["Cart mutations add, update and remove Shopify cart lines", /mutation Add[\s\S]{0,100}cartLinesAdd\(/.test(storefront) && /mutation Update[\s\S]{0,100}cartLinesUpdate\(/.test(storefront) && /mutation Remove[\s\S]{0,100}cartLinesRemove\(/.test(storefront)],
  ["Discount code mutation is connected to Shopify cart", /mutation UpdateDiscounts[\s\S]{0,160}cartDiscountCodesUpdate\(/.test(storefront)],
  ["Shopify returns checkoutUrl in cart queries", /cart\(id:\$id\)\{id checkoutUrl/.test(storefront) && /cartCreate\(input:\{lines:\$lines\}\)\{cart\{id checkoutUrl/.test(storefront)],
  ["Cart drawer checkout links to Shopify-provided URL", /href=\{cart\.checkoutUrl\}[^>]*>[\s\S]{0,150}Proceed to Secure Checkout/.test(storefront)],
  ["Cart page checkout links to Shopify-provided URL", /href=\{cart\.checkoutUrl\}[^>]*>[\s\S]{0,100}Proceed to Checkout/.test(storefront)],
  ["Checkout is blocked when stock issues exist", /cartHasStockIssue\(cart\)[\s\S]{0,500}Remove unavailable items before checkout/.test(storefront)],
  ["Stock and quantity validation guard add-to-cart", /This product is out of stock\. Please request a quote\./.test(storefront) && /existing\+q>stock/.test(storefront)],
  ["Shopify API route calls the Storefront GraphQL endpoint", /api\/\$\{version\}\/graphql\.json/.test(api) && /X-Shopify-Storefront-Access-Token/.test(api)],
  ["Shopify API failures are returned as controlled public errors", /const publicError/.test(api) && /catch\s*\{\s*return publicError\(\)/.test(api)],
];
for (const [name, pass] of checks) console.log(`${pass ? "[PASS]" : "[FAIL]"} ${name}`);
console.log(`SHOPIFY CHECKOUT SOURCE REGRESSION: ${checks.filter((x) => x[1]).length}/${checks.length} passed`);
if (checks.some((x) => !x[1])) process.exit(1);
console.log("NOTE: These checks verify source wiring, not a live authenticated order or payment.");
