import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const s = fs.readFileSync(path.join(root, "app/[[...slug]]/Storefront.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
const page = fs.readFileSync(path.join(root, "app/[[...slug]]/page.tsx"), "utf8");
const trackingCompatibility = fs.readFileSync(path.join(root, "app/apps/track123/page.tsx"), "utf8");
const aiRoute = fs.readFileSync(path.join(root, "app/api/ai-assistant/route.ts"), "utf8");
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
check("Mega menu has a full-width transparent hover corridor under all top-level tabs", s.includes('className="bh-mega text-[#0f2630]"') && css.includes("left:0!important;right:0!important;top:calc(100% - 1px)!important") && css.includes("width:100%!important;max-width:none!important") && css.includes(".bh-mega-inner") && css.includes("margin-inline:auto") && s.includes("data-native-scroll onWheelCapture={handleNativeWheel}"));
check("Reduced motion disables animated blog auto-scroll and explains manual controls", s.includes('setReducedMotion(media.matches)') && s.includes('if(!t||!group.current||items.length===0||paused||!autoSlide||reducedMotion)return;') && s.includes('Reduced motion is enabled') && css.includes('prefers-reduced-motion:reduce'));

check("Track123 headless widget loads from its HTTPS embed script", s.includes("track123-tracking-widget") && s.includes("https://shp.track123.com/tracking-page/build/widget.min.js") && s.includes("buyhoreca.myshopify.com"));
check("Track123 widget has a clear service-failure fallback", s.includes("Live tracking is temporarily unavailable") && s.includes("Contact support") && s.includes("Try again"));
check("Track123 page omits promotional attribution text and scopes to a clean tracking panel", !s.includes("Live order and shipment updates provided by Track123.") && s.includes('aria-label="Live order tracking"'));
check("Track123 primary Track buttons override Tailwind reset with visible green CTA styling", css.includes("track123-tracking-widget #track123_submit_button") && css.includes("background:#008f68!important") && css.includes("color:#fff!important") && css.includes("min-height:44px!important") && css.includes("track123-tracking-widget .track123_form_button_style:hover"));

check("Tracking page bypasses global catalogue loading/error state", s.includes('let content:ReactNode;if(pathname==="/track-order")content=<TrackOrderPage/>;else if(pathname==="/account")content=<CustomerAccountPage/>;else if(loading)'));
check("Legacy Track123 route preserves query values for prefilled live tracking", trackingCompatibility.includes("redirect") && trackingCompatibility.includes("/track-order") && trackingCompatibility.includes("query.toString()") && s.includes('searchParams.get("nums")'));

check("BuyHoreca AI launcher is rendered above WhatsApp", s.includes("BuyHorecaAssistant/><a href=\"https://wa.me/971565334464\"") && s.includes("<BuyHorecaAssistant/>"));
check("Track Shipment appears in header actions and account page", s.includes("Track Shipment</Link><Link href=\"/quote\"") && s.includes("Open account and orders") && s.includes('href=\"/track-order\" className=\"inline-flex min-h-11'));
check("AI answers simple greetings locally and hides internal setup errors from customers", fs.readFileSync(path.join(root, "components/BuyHorecaAssistant.tsx"), "utf8").includes("if (isSimpleGreeting(message))") && fs.readFileSync(path.join(root, "components/BuyHorecaAssistant.tsx"), "utf8").includes("SUPPORT_FALLBACK") && !fs.readFileSync(path.join(root, "components/BuyHorecaAssistant.tsx"), "utf8").includes("The site administrator needs to add the Cloudflare AI account ID"));
check("Track123 localhost API and SPA assets are rewritten before the catch-all route", fs.readFileSync(path.join(root, "next.config.ts"), "utf8").includes("source: \"/endApi/api/store/anonymous/:path*\"") && fs.readFileSync(path.join(root, "next.config.ts"), "utf8").includes("destination: \"https://shp.track123.com/endApi/api/store/anonymous/:path*\"") && fs.readFileSync(path.join(root, "next.config.ts"), "utf8").includes("/endApi/api/store/get-tracking-page-translation-config") && fs.readFileSync(path.join(root, "next.config.ts"), "utf8").includes("source: \"/tracking-page-spa/:path*\"") && fs.readFileSync(path.join(root, "next.config.ts"), "utf8").includes("beforeFiles"));
check("Catalogue filter fallback covers availability, brand, product type, price, and sort when all-collection lookup fails", fs.readFileSync(path.join(root,"app/[[...slug]]/Storefront.tsx"),"utf8").includes("productQueryFromFacets(selected)||undefined") && fs.readFileSync(path.join(root,"app/[[...slug]]/Storefront.tsx"),"utf8").includes("variants.price:<=${max}") && fs.readFileSync(path.join(root,"app/[[...slug]]/Storefront.tsx"),"utf8").includes("available_for_sale:${input.available}"));
check("BuyHoreca assistant continues to answer common questions and search Shopify without LLM credentials", fs.readFileSync(path.join(root,"app/api/ai-assistant/route.ts"),"utf8").includes("customerFallback(message, products, collections)") && fs.readFileSync(path.join(root,"app/api/ai-assistant/route.ts"),"utf8").includes("const productNodes = json.data?.products?.nodes || []") && fs.readFileSync(path.join(root,"components/BuyHorecaAssistant.tsx"),"utf8").includes("m.actionUrl && m.actionLabel"));
check("Track123 watermark limitation is documented as provider-plan controlled", fs.readFileSync(path.join(root,"README.md"),"utf8").includes("Remove Track123 branding") && fs.readFileSync(path.join(root,"README.md"),"utf8").includes("do not attempt to suppress this provider mark in CSS"));
check("AI server route uses Cloudflare and live Shopify context without public AI secrets", fs.existsSync(path.join(root,"app/api/ai-assistant/route.ts")) && aiRoute.includes("CLOUDFLARE_AI_API_TOKEN") && aiRoute.includes("products(first: 5, query: $search"));
console.log([...pass,...fail].join("\n"));
console.log(`\nINTERACTION AUDIT: ${pass.length} PASS / ${fail.length} FAIL`);
process.exitCode=fail.length?1:0;
