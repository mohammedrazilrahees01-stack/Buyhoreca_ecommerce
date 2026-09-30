import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storefront = fs.readFileSync(path.join(root, 'app/[[...slug]]/Storefront.tsx'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');
const checks = [
  ['StoreHeader receives cartPulse', /function StoreHeader[\s\S]*cartPulse:boolean/.test(storefront)],
  ['App passes cartPulse', /<StoreHeader[^>]*cartPulse=\{cartPulse\}/.test(storefront)],
  ['Mobile cart uses the same pulse class', /className=\{cartPulse\?"bh-cart-pulse"/.test(storefront)],
  ['Header uses transparent logo asset', /LOGO_SRC="\/images\/buyhoreca-logo-header\.png"/.test(storefront)],
  ['Transparent logo asset exists', fs.existsSync(path.join(root, 'public/images/buyhoreca-logo-header.png'))],
  ['No PDF image references in web source', !/\.pdf|IMAGE FOR PAGE/i.test(storefront)],
  ['Blog rail supports 2/3/4 cards', /bh-blog-card\{width:calc\(\(100% - 12px\)\/2\)[\s\S]*@media\(min-width:768px\)[\s\S]*@media\(min-width:1200px\)/.test(css)],
  ['Blog hover pauses autoplay', /onMouseEnter=\{pause\} onMouseLeave=\{resume\}/.test(storefront)],
  ['Cart pulse animation exists', /@keyframes bhCartPulse/.test(css)],
  ['No raw GitHub image fallbacks', !/raw\.githubusercontent\.com/.test(storefront)],
  ['Single StoreHeader render in App', (storefront.match(/<StoreHeader\b/g) || []).length === 1],
  ['Single Footer render in App', (storefront.match(/<Footer\/>/g) || []).length === 1],
  ['Wishlist storage hydration guard exists', /const \[storageReady,setStorageReady\]=useState\(false\)/.test(storefront) && /if\(!storageReady\)return;writeStoredJSON\(WISHLIST_KEY,wishlist\)/.test(storefront)],
  ['Wishlist toggle writes ids and snapshots', /writeStoredJSON\(WISHLIST_KEY,next\);writeStoredJSON\(WISHLIST_SNAPSHOT_KEY,existing\)/.test(storefront)],
  ['Wishlist button uses preventDefault', /const toggleWish=\(e\?:ReactMouseEvent<HTMLButtonElement>\)=>\{e\?\.preventDefault\(\);e\?\.stopPropagation\(\);/.test(storefront)],
  ['Wishlist event listener sync exists', /buyhoreca:wishlist/.test(storefront) && /window.addEventListener\("storage"/.test(storefront)],
  ['Wishlist page clear-all exists', /function Wishlist\([\s\S]*clearAll=\(\)=>/.test(storefront)],
];
let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
