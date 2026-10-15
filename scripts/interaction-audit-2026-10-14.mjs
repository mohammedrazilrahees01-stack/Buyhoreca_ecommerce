import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const s = fs.readFileSync(path.join(root, "app/[[...slug]]/Storefront.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
const page = fs.readFileSync(path.join(root, "app/[[...slug]]/page.tsx"), "utf8");
const pass=[]; const fail=[];
const check=(name,cond,detail="")=> (cond?pass:fail).push(`[${cond?"PASS":"FAIL"}] ${name}${detail?` — ${detail}`:""}`);

check("Category dropdown is a Lenis-isolated native scroll surface", s.includes('id="all-category-list"') && s.includes('id="all-category-list" role="menu"') && s.includes('data-lenis-prevent data-native-scroll onWheelCapture={handleNativeWheel}'));
check("Mobile category dropdown is a Lenis-isolated native scroll surface", s.includes('id="mobile-all-category-list"') && s.includes('data-lenis-prevent>'));
check("Search suggestion columns are Lenis-isolated", s.includes('overflow-auto bg-slate-50 p-3" data-lenis-prevent') && s.includes('overflow-auto p-4" data-lenis-prevent'));
check("Filter and dialog scrolling is Lenis-isolated", s.includes('overflow-auto bg-white p-5 shadow-xl" data-lenis-prevent') && s.includes('overflow-auto bg-white p-6 shadow-2xl" data-lenis-prevent'));
check("Brand mega menu uses a full-width grid mode", s.includes("bh-mega-grid ${isBrands?\"bh-mega-grid-brands\":\"\"}") && css.includes('.bh-mega-grid-brands{grid-template-columns:minmax(0,1fr)!important}'));
check("Brand mega menu renders the live brand collection set", s.includes('const brandCollections=useMemo') && s.includes('const more=isBrands?brandCollections'));
check("Brand logo uses Shopify collection image", s.includes('c.image?') && s.includes('/brands/${c.handle}'));
check("Blog auto-scroll uses requestAnimationFrame", s.includes('let frame=0,last=performance.now()') && s.includes('requestAnimationFrame(tick)'));
check("Blog auto-scroll is continuous, right-moving and slow", s.includes('offsetRef.current-=18*(dt/1000)') && s.includes('requestAnimationFrame(tick)'));
check("Blog rail does not pause on the whole container", !s.includes('onMouseEnter={pause} onMouseLeave={resume} onFocusCapture={pause} onBlurCapture') );
check("Blog cards pause individually on hover", s.includes('onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur='));
check("Blog rail hides manual overflow", css.includes('.bh-blog-carousel{position:relative;display:block;overflow:hidden') && !s.includes('onWheel={(e)=>e.preventDefault()}'));
check("Business route allow-list matches navigation slugs", ['cafe-coffee-shop','bakery-pastry','bar-lounge','catering-banqueting','fast-food-qsr','school-institution','corporate-office-catering','event-hospitality'].every(x=>page.includes(x)));
check("Keyboard focus opens primary navigation menus", s.includes('onFocus={()=>setHoverNav(title)}'));
check("Reduced motion disables animated blog auto-scroll", s.includes('window.matchMedia("(prefers-reduced-motion: reduce)")') && css.includes('prefers-reduced-motion:reduce'));

console.log([...pass,...fail].join("\n"));
console.log(`\nINTERACTION AUDIT: ${pass.length} PASS / ${fail.length} FAIL`);
process.exitCode=fail.length?1:0;
