from pathlib import Path
from playwright.sync_api import sync_playwright
import json, re

ROOT = Path('/mnt/data/current_final')
css = (ROOT / 'app/globals.css').read_text(encoding='utf-8').replace('@import "tailwindcss";', '')
OUT = Path('/mnt/data/current_final/qa_visual_final')
OUT.mkdir(parents=True, exist_ok=True)

widths = [320,360,375,390,393,402,414,430,440,480,576,744,768,800,820,846,1024,1100,1133,1280,1366,1440,1536,1680,1920,2560,3440,3840]
heights = {320:568,360:800,375:667,390:844,393:852,402:874,414:896,430:932,440:956,480:900,576:900,744:1133,768:1024,800:1280,820:1180,846:1004,1024:768,1100:800,1133:800,1280:800,1366:768,1440:900,1536:864,1680:1050,1920:1080,2560:1440,3440:1440,3840:2160}

brands = ''.join(f'<a class="bh-brand-mega-card group" href="#"><div class="bh-brand-mega-logo"><img src="/product-placeholder.svg" alt="Brand {i} logo"></div><div class="mt-2 truncate text-center text-xs font-semibold">Brand {i}</div></a>' for i in range(1,49))
products = ''.join(f'<article class="bh-product-card"><div class="bh-product-media"><div class="bh-product-image-frame" style="aspect-ratio:1"><img src="/product-placeholder.svg" alt="Product {i}" style="width:100%;height:100%;object-fit:contain"></div></div><div style="padding:12px"><div>BRAND {i}</div><div style="font-weight:700">Commercial Product {i} with a reasonably long title</div><button class="bh-primary-button" type="button">Add to Cart</button></div></article>' for i in range(1,25))

html = f'''<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>{css}</style><style>
/* utility approximations used only for the QA harness; production component classes are otherwise unchanged */
.mx-auto{{margin-inline:auto}}.grid{{display:grid}}.items-stretch{{align-items:stretch}}.w-full{{width:100%}}.relative{{position:relative}}.hidden{{display:none}}.flex{{display:flex}}.flex-col{{flex-direction:column}}.gap-3{{gap:12px}}.p-5{{padding:20px}}.sm\\:p-6{{padding:24px}}
</style></head><body>
<header>
<nav class="bh-primary-nav" style="display:block;background:#118700;color:white"><div class="bh-primary-nav-track mx-auto grid w-full items-stretch">{''.join(f'<div><button class="bh-primary-nav-item" style="height:44px;width:100%">Menu {i}</button></div>' for i in range(1,9))}</div>
<div class="bh-mega bh-mega--brands"><div class="bh-brand-mega-body p-5"><div class="bh-brand-mega-header"><div><h3>Shop by Brand</h3><p>48 brands from Shopify Collections</p></div><div style="display:flex;gap:8px"><input id="mega-brand-search" style="width:280px;max-width:100%" placeholder="Search brands"><a href="#">View all brands →</a></div></div><div class="bh-brand-mega-scroll"><div class="bh-brand-mega-grid">{brands}</div></div></div></div>
</nav>
<div class="bh-catalog-grid">{products}</div>
</header><div class="bh-mobile-bar"><a href="#">Shop</a><a href="#">Wishlist</a><a href="#">Quote</a><a href="#">Cart</a></div>
</body></html>'''

results=[]
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page()
    for w in widths:
        h=heights[w]
        page.set_viewport_size({'width':w,'height':h})
        page.goto('about:blank')
        page.set_content(html, wait_until='load')
        page.evaluate('document.documentElement.scrollLeft=0; document.body.scrollLeft=0')
        # Force the mega open in all widths only for geometry; at <=1099 it would normally be hidden in the app.
        page.locator('.bh-mega').evaluate("el => { el.style.display='block'; el.style.visibility='visible'; }")
        r = page.evaluate('''() => {
          const rect = el => { const r=el.getBoundingClientRect(); return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}; };
          const mega=document.querySelector('.bh-mega'); const body=document.querySelector('.bh-brand-mega-body'); const scroll=document.querySelector('.bh-brand-mega-scroll'); const grid=document.querySelector('.bh-brand-mega-grid'); const nav=document.querySelector('.bh-primary-nav'); const cat=document.querySelector('.bh-catalog-grid');
          const cols=getComputedStyle(cat).gridTemplateColumns.split(' ').filter(Boolean).length;
          const brandCols=getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
          return {innerWidth:innerWidth, scrollWidth:document.documentElement.scrollWidth, bodyScrollWidth:document.body.scrollWidth, nav:rect(nav), mega:rect(mega), body:rect(body), scroll:rect(scroll), grid:rect(grid), cat:rect(cat), cols, brandCols};
        }''')
        # At narrow widths the mega is an artificially forced test surface; its width must still remain within viewport.
        failures=[]
        if r['scrollWidth'] > w+2 or r['bodyScrollWidth'] > w+2: failures.append('horizontal-overflow')
        if r['mega']['left'] < -1 or r['mega']['right'] > w+1: failures.append('brand-drawer-out-of-viewport')
        nav_center=(r['nav']['left']+r['nav']['right'])/2
        mega_center=(r['mega']['left']+r['mega']['right'])/2
        if abs(mega_center-nav_center)>1.5: failures.append('brand-drawer-not-centered-to-nav')
        if r['body']['width'] < r['mega']['width']*0.98: failures.append('brand-body-not-full-width')
        if r['scroll']['width'] < r['mega']['width']*0.95: failures.append('brand-scroll-not-full-width')
        if r['grid']['width'] < r['mega']['width']*0.90: failures.append('brand-grid-not-wide')
        results.append({'width':w,'height':h,'pass':not failures,'failures':failures,'metrics':r})
        if w in [320,390,768,1024,1280,1536,1920,2560,3840]:
            page.screenshot(path=str(OUT/f'brand-nav-{w}x{h}.png'), full_page=True)
    page.emulate_media(reduced_motion='reduce')
    page.set_viewport_size({'width':1280,'height':800})
    page.set_content(html, wait_until='load')
    page.locator('.bh-mega').evaluate("el => { el.style.display='block'; el.style.visibility='visible'; }")
    reduced = page.evaluate('''() => { const r=document.querySelector('.bh-mega').getBoundingClientRect(); return {left:r.left,right:r.right,width:r.width}; }''')
    nav_rect=page.evaluate('''() => { const r=document.querySelector('.bh-primary-nav').getBoundingClientRect(); return {left:r.left,right:r.right}; }''')
    expected_center=(nav_rect['left']+nav_rect['right'])/2
    reduced_ok=abs((reduced['left']+reduced['right'])/2-expected_center)<1.5 and reduced['right']<=1281
    results.append({'reduced_motion_1280':reduced,'pass':reduced_ok})
    browser.close()

(Path('/mnt/data/current_final/RESPONSIVE_GEOMETRY_QA_2026-10-13.json')).write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps({'all_pass': all(x.get('pass',False) for x in results), 'tested_widths':len(widths), 'results_file':'/mnt/data/current_final/RESPONSIVE_GEOMETRY_QA_2026-10-13.json'}, indent=2))
