import assert from 'node:assert/strict';
class Storage { constructor(){this.m=new Map()} getItem(k){return this.m.has(k)?this.m.get(k):null} setItem(k,v){this.m.set(k,String(v))} removeItem(k){this.m.delete(k)} }
const localStorage=new Storage();
const readStoredIds=key=>{try{const raw=localStorage.getItem(key);if(!raw)return [];const parsed=JSON.parse(raw);return Array.isArray(parsed)?Array.from(new Set(parsed.filter(x=>typeof x==='string'))):[]}catch{return []}};
const readStoredSnapshots=key=>{try{const parsed=JSON.parse(localStorage.getItem(key)||'{}');if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return {};return Object.fromEntries(Object.entries(parsed).filter(([id,v])=>typeof id==='string'&&v&&typeof v==='object'))}catch{return {}}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
// The hydration race that caused the bug: do not persist state until it has been hydrated.
write('buyhoreca_wishlist',['p1']); let wishlist=[]; let storageReady=false; assert.deepEqual(readStoredIds('buyhoreca_wishlist'),['p1']); storageReady=true; wishlist=readStoredIds('buyhoreca_wishlist'); if(storageReady) write('buyhoreca_wishlist',wishlist); assert.deepEqual(readStoredIds('buyhoreca_wishlist'),['p1']);
// Add and remove a product, including its snapshot.
let current=readStoredIds('buyhoreca_wishlist'); let next=current.includes('p2')?current.filter(x=>x!=='p2'):[...current,'p2']; let snapshots=readStoredSnapshots('buyhoreca_wishlist_snapshots'); snapshots.p2={id:'p2',name:'Test Product'}; write('buyhoreca_wishlist',next); write('buyhoreca_wishlist_snapshots',snapshots); assert.deepEqual(readStoredIds('buyhoreca_wishlist'),['p1','p2']); assert.equal(readStoredSnapshots('buyhoreca_wishlist_snapshots').p2.name,'Test Product');
current=readStoredIds('buyhoreca_wishlist'); next=current.filter(x=>x!=='p2'); snapshots=readStoredSnapshots('buyhoreca_wishlist_snapshots'); delete snapshots.p2; write('buyhoreca_wishlist',next); write('buyhoreca_wishlist_snapshots',snapshots); assert.deepEqual(readStoredIds('buyhoreca_wishlist'),['p1']); assert.equal(readStoredSnapshots('buyhoreca_wishlist_snapshots').p2,undefined);
localStorage.setItem('buyhoreca_wishlist','not-json'); assert.deepEqual(readStoredIds('buyhoreca_wishlist'),[]);
console.log('PASS Wishlist persistence, toggle, snapshot cleanup and malformed-storage handling');
