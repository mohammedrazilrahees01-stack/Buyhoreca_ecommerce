import fs from 'node:fs';
import assert from 'node:assert/strict';
const file=fs.readFileSync('app/[[...slug]]/Storefront.tsx','utf8');
const env=fs.readFileSync('.env.local.example','utf8');
const checks=[
 ['quantityAvailable queried', file.includes('quantityAvailable')],
 ['currentlyNotInStock queried', file.includes('currentlyNotInStock')],
 ['zero-stock is non-purchasable', file.includes('typeof v.quantityAvailable!=="number"||v.quantityAvailable>0') && file.includes('quantityAvailable<=0')],
 ['low-stock label', file.includes('Only ${v.quantityAvailable} left')],
 ['out-of-stock quote CTA', file.includes('Out of stock · Request a quote')],
 ['checkout blocked on stock issue', file.includes('cartHasStockIssue(cart)') && file.includes('Remove unavailable items before checkout')],
 ['global add guard', file.includes('This product is out of stock. Please request a quote.')],
 ['cart stock guard', file.includes('Only ${max} in stock.')],
 ['inventory scope documented', env.includes('unauthenticated_read_product_inventory')],
 ['cart increment disabled at reported max', file.includes('l.merchandise.quantityAvailable') && file.includes('l.quantity>=l.merchandise.quantityAvailable')],
];
for (const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} ${name}`);
assert.ok(checks.every(([,ok])=>ok));
