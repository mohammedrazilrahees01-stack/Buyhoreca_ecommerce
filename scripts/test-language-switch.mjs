import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const storefront = fs.readFileSync(path.join(root, "app/[[...slug]]/Storefront.tsx"), "utf8");
const locale = fs.readFileSync(path.join(root, "lib/i18n.tsx"), "utf8");
const translations = JSON.parse(fs.readFileSync(path.join(root, "lib/translations-ar.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
const layout = fs.readFileSync(path.join(root, "app/layout.tsx"), "utf8");
const assistant = fs.readFileSync(path.join(root, "components/BuyHorecaAssistant.tsx"), "utf8");
const api = fs.readFileSync(path.join(root, "app/api/ai-assistant/route.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "app/[[...slug]]/page.tsx"), "utf8");
const pageFiles = [
  storefront,
  page,
  fs.readFileSync(path.join(root, "app/not-found.tsx"), "utf8"),
  fs.readFileSync(path.join(root, "app/error.tsx"), "utf8"),
  fs.readFileSync(path.join(root, "components/BuyHorecaAssistant.tsx"), "utf8"),
];

const checks = [];
const check = (name, fn) => {
  try {
    fn();
    checks.push(true);
    console.log("[PASS] " + name);
  } catch (error) {
    checks.push(false);
    console.log("[FAIL] " + name + ": " + (error instanceof Error ? error.message : String(error)));
  }
};

check("English is the default and only English/Arabic are supported", () => {
  assert.ok(locale.includes('export type SiteLocale = "en" | "ar"'));
  assert.ok(locale.includes('locale: "en"'));
  assert.ok(locale.includes('STORAGE_KEY = "buyhoreca_locale"'));
});

check("Visible top-bar button toggles between العربية and English", () => {
  assert.ok(storefront.includes("const {locale,setLocale}=useLocale()"));
  assert.ok(storefront.includes('onClick={()=>setLocale(locale==="en"?"ar":"en")}'));
  assert.ok(storefront.includes('locale==="en"?"العربية":"English"'));
  assert.ok(storefront.includes('Switch website language to Arabic'));
  assert.ok(storefront.includes('تبديل لغة الموقع إلى الإنجليزية'));
});

check("Language choice persists and updates document language/direction", () => {
  assert.ok(locale.includes("localStorage.setItem(STORAGE_KEY, nextLocale)"));
  assert.ok(locale.includes('root.lang = locale === "ar" ? "ar" : "en"'));
  assert.ok(locale.includes('root.dir = locale === "ar" ? "rtl" : "ltr"'));
  assert.ok(layout.includes("<LocaleProvider>{children}</LocaleProvider>"));
});

check("Arabic dictionary covers the full primary navigation and quote CTA", () => {
  const expected = {
    "Language": "اللغة",
    "Kitchen Utensils": "أدوات المطبخ",
    "Kitchen Equipment": "معدات المطبخ",
    "Tabletop": "أدوات المائدة",
    "Buffetware": "معدات البوفيه",
    "Hotel specials": "مستلزمات الفنادق",
    "Housekeeping": "التدبير المنزلي",
    "Shop by Brand": "تسوّق حسب العلامة التجارية",
    "Shop by Business": "تسوّق حسب نوع النشاط",
    "Clearance": "التخفيضات",
    "Request a Quote": "طلب عرض سعر",
  };
  for (const [en, ar] of Object.entries(expected)) assert.equal(translations[en], ar, en);
});

check("Storefront static text is wrapped by the localization component", () => {
  assert.ok((storefront.match(/<T text=/g) || []).length > 350);
  assert.ok(pageFiles.slice(1).every(source => source.includes("import { T")));
});

check("Placeholders, alt text and accessibility labels support runtime translation", () => {
  assert.ok((storefront.match(/data-i18n-/g) || []).length > 100);
  assert.ok(locale.includes("applyTranslatedAttributes"));
  assert.ok(locale.includes("MutationObserver"));
  assert.ok(locale.includes("applyTranslatedDocumentMetadata"));
});

check("Arabic mode mirrors common alignment, spacing, drawers and floating controls", () => {
  for (const rule of [
    'html[dir="rtl"] body',
    'html[dir="rtl"] .text-left',
    'html[dir="rtl"] [class~="left-0"]',
    'html[dir="rtl"] [class~="ml-4"]',
    'html[dir="rtl"] .bh-whatsapp',
    'html[dir="rtl"] .bh-cart-drawer',
  ]) assert.ok(css.includes(rule), rule);
});

check("Shopify storefront queries request Arabic context and retain an English fallback", () => {
  assert.ok(storefront.includes("function shopifyQueryForLocale"));
  assert.ok(storefront.includes("@inContext(language: AR, country: AE)"));
  assert.ok(storefront.includes("localized?shopifyQueryForLocale(q):q"));
  assert.ok(storefront.includes('getStoredLocale()==="ar"&&error instanceof Error'));
  assert.ok(storefront.includes("request(query,false)"));
});

check("BuyHoreca AI receives locale and answers in Arabic when selected", () => {
  assert.ok(assistant.includes("body: JSON.stringify({ message, history: previous, locale })"));
  assert.ok(api.includes('const locale: "en" | "ar" = input.locale === "ar" ? "ar" : "en"'));
  assert.ok(api.includes("تتبع الشحنة"));
  assert.ok(api.includes("localeInstruction"));
  assert.ok(api.includes("request(localizedQuery)"));
  assert.ok(api.includes('if (!response.ok && locale === "ar") response = await request(query)'));
  assert.ok(api.includes('if (json.errors?.length && locale === "ar")'));
});

check("Arabic page title and social metadata follow locale and client-side routing", () => {
  assert.ok(locale.includes("const translatedTitle = translateText(document.title, locale)"));
  assert.ok(locale.includes('meta[name="description"]'));
  assert.ok(locale.includes('meta[property^="og:"]'));
  assert.ok(locale.includes("headObserver.observe(document.head"));
  assert.ok(translations["Professional HoReCa Equipment & Supplies"]);
  assert.ok(translations["About BuyHoreca"]);
  assert.ok(page.includes("alternates: { canonical: url }"));
});

check("Product and collection text uses Shopify translations where available", () => {
  assert.ok(storefront.includes("getStoredLocale()"));
  assert.ok(storefront.includes("@inContext(language: AR, country: AE)"));
  assert.ok(storefront.includes("function getCollection"));
  assert.ok(storefront.includes("function getProduct"));
});

check("AI fallback uses the chosen language and translated support actions", () => {
  assert.ok(api.includes("customerFallback(message, products, collections, locale)"));
  assert.ok(api.includes("actionLabel: \"طلب عرض سعر\""));
  assert.ok(api.includes("actionLabel: \"تصفح المنتجات\""));
});

check("Clearance and all original primary navigation routes remain in the storefront", () => {
  assert.ok(storefront.includes('["Clearance",[]]'));
  for (const label of ["Kitchen Utensils", "Kitchen Equipment", "Tabletop", "Buffetware", "Hotel specials", "Housekeeping", "Shop by Brand", "Shop by Business"]) {
    assert.ok(storefront.includes('["' + label + '"'));
  }
});

const passed = checks.filter(Boolean).length;
console.log("LANGUAGE SWITCH REGRESSION: " + passed + "/" + checks.length + " PASS / " + (checks.length - passed) + " FAIL");
if (passed !== checks.length) process.exitCode = 1;
