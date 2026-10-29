"use client";

import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import arabicTranslations from "./translations-ar.json";

export type SiteLocale = "en" | "ar";
type TranslationMap = Record<string, string>;

const AR = arabicTranslations as TranslationMap;
const STORAGE_KEY = "buyhoreca_locale";
const LocaleContext = createContext<{
  locale: SiteLocale;
  setLocale: (locale: SiteLocale) => void;
}>({
  locale: "en",
  setLocale: () => undefined,
});

let activeLocale: SiteLocale = "en";

export function getStoredLocale(): SiteLocale {
  if (typeof window === "undefined") return "en";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

function translateDynamicArabic(text: string): string | undefined {
  let match = text.match(/^Only (\d+) left in stock\.$/i);
  if (match) return "يتبقى " + match[1] + " فقط في المخزون.";
  match = text.match(/^Only (\d+) in stock\.$/i);
  if (match) return "المتوفر في المخزون " + match[1] + " فقط.";
  match = text.match(/^(.+) added to cart$/i);
  if (match) return "تمت إضافة " + match[1] + " إلى السلة";
  match = text.match(/^Quick view: (.+)$/i);
  if (match) return "عرض سريع: " + match[1];
  match = text.match(/^Show more (.+)$/i);
  if (match) return "عرض المزيد من " + match[1];
  match = text.match(/^Show previous (.+) products$/i);
  if (match) return "عرض منتجات " + match[1] + " السابقة";
  match = text.match(/^Copy (.+) offer code$/i);
  if (match) return "نسخ رمز العرض " + match[1];
  match = text.match(/^(.+) is not applicable to this cart$/i);
  if (match) return "لا ينطبق " + match[1] + " على هذه السلة";
  match = text.match(/^No brands match “(.+)”$/i);
  if (match) return "لا توجد علامات تجارية تطابق “" + match[1] + "”";
  match = text.match(/^No categories match “(.+)”$/i);
  if (match) return "لا توجد فئات تطابق “" + match[1] + "”";
  match = text.match(/^Search for “(.+)”$/i);
  if (match) return "البحث عن “" + match[1] + "”";
  match = text.match(/^SKU:\s*(.+)$/i);
  if (match) return "رمز المنتج: " + match[1];
  match = text.match(/^Showing (\d+) of (\d+)$/i);
  if (match) return "عرض " + match[1] + " من " + match[2];
  if (text.endsWith(" | BuyHoreca")) {
    const pageTitle = text.slice(0, -" | BuyHoreca".length);
    const translated = AR[pageTitle];
    if (translated) return translated + " | BuyHoreca";
  }
  return undefined;
}

/** Translate a complete UI string while retaining intentional surrounding whitespace. */
export function translateText(input: string, locale: SiteLocale = activeLocale): string {
  if (locale !== "ar" || !input) return input;
  const exact = AR[input];
  if (exact !== undefined && exact !== input) return exact;

  const leading = input.match(/^\s*/)?.[0] || "";
  const trailing = input.match(/\s*$/)?.[0] || "";
  const core = input.slice(leading.length, input.length - trailing.length || undefined);
  const fromTrimmed = AR[core];
  if (fromTrimmed !== undefined && fromTrimmed !== core) return leading + fromTrimmed + trailing;

  const dynamic = translateDynamicArabic(core);
  if (dynamic) return leading + dynamic + trailing;
  return input;
}

function translateNode(value: ReactNode, locale: SiteLocale): ReactNode {
  if (typeof value === "string") return translateText(value, locale);
  if (Array.isArray(value)) {
    return value.map((item, index) => (
      <Fragment key={index}>{translateNode(item, locale)}</Fragment>
    ));
  }
  return value;
}

/**
 * Text-only React component. It renders a Fragment, not an extra span, so existing
 * flex/grid/card markup is preserved while static and dynamic UI strings localize.
 */
export function T({ text, children }: { text?: ReactNode; children?: ReactNode }) {
  const { locale } = useContext(LocaleContext);
  return <>{translateNode(text !== undefined ? text : children, locale)}</>;
}

const ATTRIBUTE_NAMES = [
  "placeholder",
  "aria-label",
  "aria-description",
  "title",
  "alt",
  "label",
] as const;

function applyTranslatedAttributes(element: Element, locale: SiteLocale) {
  for (const name of ATTRIBUTE_NAMES) {
    const source = element.getAttribute(`data-i18n-${name}`);
    if (source !== null) {
      const translated = translateText(source, locale);
      if (element.getAttribute(name) !== translated) {
        element.setAttribute(name, translated);
      }
    }
  }
}

function applyTranslatedDocumentMetadata(locale: SiteLocale) {
  if (typeof document === "undefined") return;
  if (document.title) {
    const translatedTitle = translateText(document.title, locale);
    if (translatedTitle !== document.title) document.title = translatedTitle;
  }
  const selectors = [
    'meta[name="description"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
  ];
  document.querySelectorAll<HTMLMetaElement>(selectors.join(",")).forEach((meta) => {
    const value = meta.getAttribute("content");
    if (value) {
      const translated = translateText(value, locale);
      if (translated !== value) meta.setAttribute("content", translated);
    }
  });
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SiteLocale>("en");

  const setLocale = useCallback((nextLocale: SiteLocale) => {
    if (nextLocale !== "en" && nextLocale !== "ar") return;
    let persisted = false;
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
      persisted = true;
    } catch {
      // Keep the current screen usable even when browser storage is blocked.
    }
    activeLocale = nextLocale;
    document.documentElement.lang = nextLocale === "ar" ? "ar" : "en";
    document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";
    setLocaleState(nextLocale);
    // Reloading re-fetches Shopify's translated product/collection data only
    // when the locale can persist. Otherwise retain the live in-page switch.
    if (persisted && typeof window !== "undefined") window.location.reload();
  }, []);

  useEffect(() => {
    const saved = getStoredLocale();
    activeLocale = saved;
    setLocaleState(saved);
  }, []);

  useEffect(() => {
    activeLocale = locale;
    const root = document.documentElement;
    root.lang = locale === "ar" ? "ar" : "en";
    root.dir = locale === "ar" ? "rtl" : "ltr";
    root.dataset.locale = locale;
    applyTranslatedDocumentMetadata(locale);

    const applyWithin = (node: Node) => {
      if (node instanceof Element) {
        applyTranslatedAttributes(node, locale);
        node.querySelectorAll("[data-i18n-placeholder],[data-i18n-aria-label],[data-i18n-aria-description],[data-i18n-title],[data-i18n-alt],[data-i18n-label]")
          .forEach((item) => applyTranslatedAttributes(item, locale));
      }
    };
    document.querySelectorAll("[data-i18n-placeholder],[data-i18n-aria-label],[data-i18n-aria-description],[data-i18n-title],[data-i18n-alt],[data-i18n-label]")
      .forEach((element) => applyTranslatedAttributes(element, locale));

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes" && record.target instanceof Element) {
          applyTranslatedAttributes(record.target, locale);
        }
        record.addedNodes.forEach(applyWithin);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ATTRIBUTE_NAMES.map((name) => "data-i18n-" + name),
    });
    // Next.js updates <title> and social metadata during client-side navigation.
    // Watch head child/text changes so Arabic titles stay translated after routing.
    const headObserver = new MutationObserver(() => applyTranslatedDocumentMetadata(locale));
    if (document.head) headObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      headObserver.disconnect();
    };
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
