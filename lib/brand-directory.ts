/**
 * Seeded BuyHoreca brand directory.
 *
 * These entries make the brands provided by the business visible before their
 * Shopify collections are ready. Once a collection with the same title is
 * created in Shopify, the directory automatically links the brand to the live
 * collection handle and prefers the collection's own logo image.
 */
export type BrandImageLike = { url?: string | null; altText?: string | null } | null;

export type BrandCollectionLike = {
  id?: string;
  handle: string;
  title: string;
  vendor?: string | null;
  image?: BrandImageLike;
};

export type CuratedBrand = {
  name: string;
  slug: string;
  logoPath?: string;
  aliases?: string[];
};

export type BrandDirectoryItem<T extends BrandCollectionLike = BrandCollectionLike> = {
  name: string;
  slug: string;
  logoPath?: string;
  collection: T | null;
  status: "available" | "coming-soon";
  curated: boolean;
};

const brandAsset = (slug: string) => `/images/brands/${slug}.png`;

export const CURATED_BRANDS: CuratedBrand[] = [
  { name: "Winco", slug: "winco", logoPath: brandAsset("winco") },
  { name: "Knicer", slug: "knicer", logoPath: brandAsset("knicer") },
  { name: "Brewing Edge", slug: "brewing-edge", logoPath: brandAsset("brewing-edge") },
  { name: "Carlisle", slug: "carlisle", logoPath: brandAsset("carlisle") },
  { name: "Gi-Metal", slug: "gi-metal", logoPath: brandAsset("gi-metal"), aliases: ["GI Metal", "Gimetal"] },
  { name: "Hoteloop", slug: "hoteloop", logoPath: brandAsset("hoteloop"), aliases: ["Hotel Loop"] },
  { name: "Pujadas", slug: "pujadas", logoPath: brandAsset("pujadas") },
  { name: "Dizdar", slug: "dizdar", logoPath: brandAsset("dizdar") },
  { name: "Vollrath", slug: "vollrath", logoPath: brandAsset("vollrath") },
  { name: "Araven", slug: "araven", logoPath: brandAsset("araven") },
  { name: "Mercer Culinary", slug: "mercer-culinary", logoPath: brandAsset("mercer-culinary") },
  { name: "Ziora", slug: "ziora", logoPath: brandAsset("ziora") },
  { name: "Cal-Mil", slug: "cal-mil", logoPath: brandAsset("cal-mil"), aliases: ["Cal Mil", "Calmil"] },
  { name: "Thermohauser", slug: "thermohauser", logoPath: brandAsset("thermohauser"), aliases: ["Thermo Hauser"] },
  { name: "San Jamar", slug: "san-jamar", logoPath: brandAsset("san-jamar"), aliases: ["Sanjamar"] },
  { name: "BurlRite", slug: "burlrite", logoPath: brandAsset("burlrite"), aliases: ["BurelRite", "Burl Rite"] },
  { name: "Tightvac", slug: "tightvac", logoPath: brandAsset("tightvac"), aliases: ["Tight Vac"] },
  { name: "Barfly", slug: "barfly", logoPath: brandAsset("barfly") },
  { name: "Bunn", slug: "bunn", logoPath: brandAsset("bunn") },
  { name: "Euroceppi", slug: "euroceppi", logoPath: brandAsset("euroceppi") },
  { name: "The Scotsman", slug: "the-scotsman", logoPath: brandAsset("the-scotsman") },
  { name: "Silikomart Professional", slug: "silikomart-professional", logoPath: brandAsset("silikomart-professional"), aliases: ["Silikomart"] },
  { name: "American Metalcraft", slug: "american-metalcraft", logoPath: brandAsset("american-metalcraft") },
  { name: "Nosse Ceramics", slug: "nosse-ceramics", logoPath: brandAsset("nosse-ceramics"), aliases: ["Nosse"] },
  { name: "Tablecraft", slug: "tablecraft", logoPath: brandAsset("tablecraft") },
  { name: "Sanelli", slug: "sanelli", logoPath: brandAsset("sanelli") },
  { name: "Bormioli Rocco", slug: "bormioli-rocco", logoPath: brandAsset("bormioli-rocco") },
  { name: "Tiger Company", slug: "tiger-company", logoPath: brandAsset("tiger-company"), aliases: ["Tiger"] },
  { name: "Arcos", slug: "arcos", logoPath: brandAsset("arcos") },
  { name: "Mitylite", slug: "mitylite", logoPath: brandAsset("mitylite") },
  { name: "Vitrifrigo", slug: "vitrifrigo", logoPath: brandAsset("vitrifrigo") },
  { name: "Cristema", slug: "cristema", logoPath: brandAsset("cristema") },
  { name: "Borgonovo", slug: "borgonovo", logoPath: brandAsset("borgonovo") },
  { name: "Wegter", slug: "wegter", logoPath: brandAsset("wegter") },
  { name: "G.E.T.", slug: "get", logoPath: brandAsset("get"), aliases: ["GET", "G E T"] },
  { name: "Kera Ceramika", slug: "kera-ceramika", logoPath: brandAsset("kera-ceramika") },
  { name: "de Buyer", slug: "de-buyer", logoPath: brandAsset("de-buyer"), aliases: ["Debuyer"] },
  { name: "BAR Professional", slug: "bar-professional", logoPath: brandAsset("bar-professional"), aliases: ["Bar Professional"] },
  { name: "Herdmar", slug: "herdmar", logoPath: brandAsset("herdmar") },
  { name: "Edhard", slug: "edhard", logoPath: brandAsset("edhard") },
  { name: "Schneider", slug: "schneider", logoPath: brandAsset("schneider") },
  { name: "Technomax Hotel Division", slug: "technomax-hotel-division", logoPath: brandAsset("technomax-hotel-division"), aliases: ["Technomax"] },
  { name: "Cutlery-Pro", slug: "cutlery-pro", logoPath: brandAsset("cutlery-pro"), aliases: ["Cutlery Pro"] },
  { name: "Cooper-Atkins", slug: "cooper-atkins", logoPath: brandAsset("cooper-atkins"), aliases: ["Cooper Atkins"] },
  { name: "Lava", slug: "lava", logoPath: brandAsset("lava") },
  { name: "Turanci", slug: "turanci", logoPath: brandAsset("turanci") },
  { name: "Bisetti", slug: "bisetti", logoPath: brandAsset("bisetti") },
  { name: "DayMark Safety Systems", slug: "daymark-safety-systems", logoPath: brandAsset("daymark-safety-systems"), aliases: ["DayMark", "Day Mark"] },
  { name: "Prince Castle", slug: "prince-castle", logoPath: brandAsset("prince-castle"), aliases: ["PrinceCastle"] },
  { name: "Pavoni Italia", slug: "pavoni-italia", logoPath: brandAsset("pavoni-italia") },
  { name: "Garibaldi Food Solutions", slug: "garibaldi-food-solutions", logoPath: brandAsset("garibaldi-food-solutions"), aliases: ["Garibaldi"] },
  { name: "Cambro", slug: "cambro", logoPath: brandAsset("cambro") },
  { name: "Turbo Air", slug: "turbo-air", logoPath: brandAsset("turbo-air"), aliases: ["TurboAir"] },
  { name: "Kalando", slug: "kalando", logoPath: brandAsset("kalando") },
  { name: "Kopykake", slug: "kopykake", logoPath: brandAsset("kopykake") },
  { name: "Ormel", slug: "ormel", logoPath: brandAsset("ormel") },
  { name: "Goreme Horeca Equipments", slug: "goreme-horeca-equipments", logoPath: brandAsset("goreme-horeca-equipments"), aliases: ["Goreme Horeca Equipment"] },
  { name: "FIFO Innovations", slug: "fifo-innovations", logoPath: brandAsset("fifo-innovations"), aliases: ["FIFO"] },
  { name: "Vitamix Commercial", slug: "vitamix-commercial", logoPath: brandAsset("vitamix-commercial"), aliases: ["Vitamix"] },
  { name: "Testo", slug: "testo", logoPath: brandAsset("testo") },
  { name: "iSi", slug: "isi", logoPath: brandAsset("isi"), aliases: ["ISI"] },
  { name: "Ditting", slug: "ditting", logoPath: brandAsset("ditting") },
  { name: "Rubbermaid", slug: "rubbermaid", logoPath: brandAsset("rubbermaid") },
  { name: "Sonoco", slug: "sonoco", logoPath: brandAsset("sonoco") },
  // Brands visible in the existing Shopify directory. Their Shopify collection image
  // is preferred; otherwise the card uses an honest text/initial fallback until a logo is supplied.
  { name: "Hamilton Beach", slug: "hamilton-beach" },
  { name: "JB Products", slug: "jb-products" },
  { name: "Jiwins", slug: "jiwins" },
  { name: "Manitowoc", slug: "manitowoc" },
];

export function normalizeBrandKey(value: string): string {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function slugifyBrandName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function brandKeys(brand: CuratedBrand): Set<string> {
  return new Set([brand.name, ...(brand.aliases || [])].map(normalizeBrandKey));
}

export function getCuratedBrandBySlug(slug: string): CuratedBrand | undefined {
  return CURATED_BRANDS.find((brand) => brand.slug === slug || slugifyBrandName(brand.name) === slug);
}

export function getCuratedBrandByName(name: string): CuratedBrand | undefined {
  const key = normalizeBrandKey(name);
  return CURATED_BRANDS.find((brand) => brandKeys(brand).has(key));
}

function bestCollectionMatch<T extends BrandCollectionLike>(brand: CuratedBrand, collections: T[]): T | null {
  const keys = brandKeys(brand);
  const candidates = collections.filter((collection) => collection.handle && (keys.has(normalizeBrandKey(collection.title)) || collection.handle === brand.slug || collection.handle === slugifyBrandName(brand.name)));
  candidates.sort((a, b) => {
    const titleScore = Number(keys.has(normalizeBrandKey(b.title))) - Number(keys.has(normalizeBrandKey(a.title)));
    if (titleScore) return titleScore;
    const imageScore = Number(Boolean(b.image?.url)) - Number(Boolean(a.image?.url));
    if (imageScore) return imageScore;
    const vendorScore = Number(normalizeBrandKey(b.vendor || "") === normalizeBrandKey(b.title)) - Number(normalizeBrandKey(a.vendor || "") === normalizeBrandKey(a.title));
    if (vendorScore) return vendorScore;
    return a.handle.localeCompare(b.handle);
  });
  return candidates[0] || null;
}

export function buildBrandDirectory<T extends BrandCollectionLike>(collections: T[]): BrandDirectoryItem<T>[] {
  const result: BrandDirectoryItem<T>[] = [];
  const curatedKeys = new Set<string>();
  const usedHandles = new Set<string>();

  for (const brand of CURATED_BRANDS) {
    const keys = brandKeys(brand);
    for (const key of keys) curatedKeys.add(key);
    const collection = bestCollectionMatch(brand, collections);
    if (collection) usedHandles.add(collection.handle);
    result.push({
      name: brand.name,
      slug: brand.slug,
      logoPath: brand.logoPath,
      collection,
      status: collection ? "available" : "coming-soon",
      curated: true,
    });
  }

  // Include any additional correctly configured Shopify brands automatically,
  // deduplicated by normalized title (e.g. duplicate Tightvac/Vollrath collections).
  const groups = new Map<string, T[]>();
  for (const collection of collections) {
    const titleKey = normalizeBrandKey(collection.title || "");
    const vendorKey = normalizeBrandKey(collection.vendor || "");
    if (!collection.handle || !titleKey || !vendorKey || titleKey !== vendorKey || titleKey === normalizeBrandKey("BuyHoreca")) continue;
    if (curatedKeys.has(titleKey)) continue;
    const group = groups.get(titleKey) || [];
    group.push(collection);
    groups.set(titleKey, group);
  }

  for (const [key, candidates] of groups) {
    candidates.sort((a, b) => Number(Boolean(b.image?.url)) - Number(Boolean(a.image?.url)) || a.handle.localeCompare(b.handle));
    const collection = candidates[0];
    if (usedHandles.has(collection.handle)) continue;
    const curated = getCuratedBrandByName(collection.title);
    result.push({
      name: collection.title,
      slug: slugifyBrandName(collection.title),
      logoPath: curated?.logoPath,
      collection,
      status: "available",
      curated: false,
    });
  }

  const seen = new Set<string>();
  return result.filter((item) => {
    const key = normalizeBrandKey(item.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
