import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const s = fs.readFileSync(path.join(root, "app/[[...slug]]/Storefront.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
const page = fs.readFileSync(path.join(root, "app/[[...slug]]/page.tsx"), "utf8");
const trackingCompatibility = fs.readFileSync(path.join(root, "app/apps/track123/page.tsx"), "utf8");
const pass=[]; const fail=[];
const check=(name,cond,detail="")=> (cond?pass:fail).push(`[${cond?"PASS":"FAIL"}] ${name}${detail?` — ${detail}`:""}`);

check("Category dropdown is a Lenis-isolated native scroll surface", s.includes('id="all-category-list"') && s.includes('id="all-category-list" role="menu"') && s.includes('data-lenis-prevent data-native-scroll onWheelCapture={handleNativeWheel}'));
check("Mobile category dropdown is a Lenis-isolated native scroll surface", s.includes('id="mobile-all-category-list"') && s.includes('data-lenis-prevent>'));
check("Search suggestion columns are Lenis-isolated", s.includes('overflow-auto bg-slate-50 p-3" data-lenis-prevent') && s.includes('overflow-auto p-4" data-lenis-prevent'));
check("Filter and dialog scrolling is Lenis-isolated", s.includes('overflow-auto bg-white p-5 shadow-xl" data-lenis-prevent') && s.includes('overflow-auto bg-white p-6 shadow-2xl" data-lenis-prevent'));
check("Brand mega menu uses a full-width grid mode", s.includes("bh-mega-grid ${isBrands?\"bh-mega-grid-brands\":\"\"}") && css.includes('.bh-mega-grid-brands{grid-template-columns:minmax(0,1fr)!important}'));
check("Brand mega menu renders curated plus live brand directory", s.includes('buildBrandDirectory(collections)') && s.includes('const brandDirectory=useMemo'));
check("Brand logo prefers collection image and planned brand cards remain navigable", s.includes('item.collection?.image?.url||item.logoPath') && s.includes('item.collection?.handle||item.slug'));
check("Blog auto-scroll uses requestAnimationFrame", s.includes('let frame=0,last=performance.now()') && s.includes('requestAnimationFrame(tick)'));
check("Blog auto-scroll is continuous, left-moving and slow", s.includes('offsetRef.current=(offsetRef.current+18*(dt/1000))%cycle') && s.includes('requestAnimationFrame(tick)') && s.includes('translate3d(${-offsetRef.current}px,0,0)'));
check("Blog rail does not pause on the whole container", !s.includes('onMouseEnter={pause} onMouseLeave={resume} onFocusCapture={pause} onBlurCapture') );
check("Blog cards pause individually on hover", s.includes('onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur='));
check("Blog rail hides manual overflow", css.includes('.bh-blog-carousel{position:relative;display:block;overflow:hidden') && !s.includes('onWheel={(e)=>e.preventDefault()}'));
check("Business route allow-list matches navigation slugs", ['cafe-coffee-shop','bakery-pastry','bar-lounge','catering-banqueting','fast-food-qsr','school-institution','corporate-office-catering','event-hospitality'].every(x=>page.includes(x)));
check("Pointer-aware navigation supports mouse hover and touch/pen tap", s.includes('onPointerEnter={e=>{if(e.pointerType==="mouse")') && s.includes('onPointerDown={e=>{navPointerType.current=e.pointerType') && s.includes('onFocus={e=>{if(e.currentTarget.matches(":focus-visible"))setHoverNav(title)}}'));
check("Reduced motion disables animated blog auto-scroll and explains manual controls", s.includes('setReducedMotion(media.matches)') && s.includes('if(!t||!group.current||items.length===0||paused||!autoSlide||reducedMotion)return;') && s.includes('Reduced motion is enabled') && css.includes('prefers-reduced-motion:reduce'));

check("Track123 headless widget loads from its HTTPS embed script", s.includes("track123-tracking-widget") && s.includes("https://shp.track123.com/tracking-page/build/widget.min.js") && s.includes("buyhoreca.myshopify.com"));
check("Track123 widget has a clear service-failure fallback", s.includes("Live tracking is temporarily unavailable") && s.includes("Contact support") && s.includes("Try again"));
check("Tracking page bypasses global catalogue loading/error state", s.includes('let content:ReactNode;if(pathname==="/track-order")content=<TrackOrderPage/>;else if(loading)'));
check("Legacy Track123 route preserves query values for prefilled live tracking", trackingCompatibility.includes("redirect") && trackingCompatibility.includes("/track-order") && trackingCompatibility.includes("query.toString()") && s.includes('searchParams.get("nums")'));
console.log([...pass,...fail].join("\n"));
console.log(`\nINTERACTION AUDIT: ${pass.length} PASS / ${fail.length} FAIL`);
process.exitCode=fail.length?1:0;
