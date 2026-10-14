export type PrimaryNavGroup = readonly [title: string, items: readonly string[]];

export const BUSINESS_TYPES = [
  { name: "Café & Coffee Shop", slug: "cafe-coffee-shop" },
  { name: "Restaurant", slug: "restaurant" },
  { name: "Hotel", slug: "hotel" },
  { name: "Bakery & Pastry", slug: "bakery-pastry" },
  { name: "Bar & Lounge", slug: "bar-lounge" },
  { name: "Catering & Banqueting", slug: "catering-banqueting" },
  { name: "Fast Food / QSR", slug: "fast-food-qsr" },
  { name: "School & Institution", slug: "school-institution" },
  { name: "Corporate / Office Catering", slug: "corporate-office-catering" },
  { name: "Event & Hospitality", slug: "event-hospitality" },
] as const;

export const PRIMARY_NAV: readonly PrimaryNavGroup[] = [
  ["Kitchen Utensils", [
    "Kitchen Tools", "Measuring Tools", "Kitchen Cutlery", "Slicers", "Bakeware Moulds",
    "GN Pans", "Pizza", "Food Storage Containers", "Food Decoration", "Storage & Transport", "Poly Pans",
  ]],
  ["Kitchen Equipment", [
    "Refrigerator", "Coffee Machines", "Cooking Equipment", "Plug-in Equipment", "Food Preparation", "Ovens",
  ]],
  ["Tabletop", ["Crockery", "Cutlery", "Glassware", "Table Accessories", "Serving & Display"]],
  ["Buffetware", ["Chafing Dish", "Buffet Display", "Serving Utensils", "Buffet Tables", "Banqueting Equipment"]],
  ["Hotel", ["Room Accessories", "Linen", "Lobby", "Amenities"]],
  ["Housekeeping", []],
  ["Shop by Brand", []],
  ["Shop by Business", BUSINESS_TYPES.map((x) => x.name)],
] as const;

export const COLLECTION_ALIASES: Record<string, readonly string[]> = {
  "Measuring Tools": ["Measuring Equipments", "Measuring Equipment"],
  "Slicers": ["Commercial Slicers"],
  "Bakeware Moulds": ["Bakeware & Molds", "Baking Moulds", "Baking Molds"],
  "GN Pans": ["Gastronorm Pans", "Gastronorm Containers"],
  "Pizza": ["Pizzeria"],
  "Food Decoration": ["Decorating Supplies"],
  "Poly Pans": ["Poly Pan"],
  "Refrigerator": ["Refrigerators", "Commercial Refrigeration"],
  "Coffee Machines": ["Coffee Machine"],
  "Cooking Equipment": ["Cooking Equipment's", "Cooking"],
  "Plug-in Equipment": ["Plug-in Equipments", "Plug In Equipments"],
  "Food Preparation": ["Preparation Tools", "Food Preparation Tools"],
  "Ovens": ["Commercial Ovens"],
  "Serving & Display": ["Servingware", "Serving & Display"],
  "Chafing Dish": ["Chafing Dishes & Food Warmers", "Chafing Dishes"],
  "Buffet Display": ["Buffet Risers & Displays", "Buffet Display"],
  "Banqueting Equipment": ["Banquet Supplies", "Banqueting Supplies"],
  "Linen": ["Bed & Bath Linens"],
} as const;

export function brandKey(name: string): string {
  return name.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function isBrandCollectionData(collection: { title?: string | null; vendors?: string[]; vendor?: string | null; handle?: string | null }): boolean {
  if (!collection.handle || collection.handle === "all" || !collection.title) return false;
  const vendors = (collection.vendors?.length ? collection.vendors : collection.vendor ? [collection.vendor] : []).filter(Boolean);
  if (!vendors.length) return false;
  const titleKey = brandKey(collection.title);
  if (!titleKey || titleKey === brandKey("BuyHoreca")) return false;
  return vendors.every((vendor) => brandKey(vendor) === titleKey);
}

export function businessBySlug(slug: string) {
  return BUSINESS_TYPES.find((x) => x.slug === slug);
}

export function businessNameFromSlug(slug: string): string {
  return businessBySlug(slug)?.name || slug.split("-").filter(Boolean).map((x) => x[0]?.toUpperCase() + x.slice(1)).join(" ");
}
