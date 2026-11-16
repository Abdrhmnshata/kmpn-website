/**
 * "أعمالنا": the work of Kampaign's three verticals. `portfolio.json` and the
 * images in `public/portfolio/` are written by `scripts/sync-portfolio.mjs`
 * from the Notion databases under "Kampaign Portfolio". Edit the work in
 * Notion, not here; this file only maps Notion's values to Arabic labels.
 */
import data from "./portfolio.json";

export type Img = {
  src: string;
  width: number;
  height: number;
  /** Background colour at the image's corner; null when it is transparent. */
  color?: string | null;
  /** For transparent images: whether what is drawn is light or dark. */
  ink?: "light" | "dark";
};

export type StudioProject = {
  id: string;
  slug: string;
  name: string;
  /** Notion "Type" values, in English as stored there. */
  services: string[];
  year: string | null;
  country: string | null;
  behance: string | null;
  brandBook: string | null;
  cover: Img | null;
  concept: Img | null;
};

export type Store = {
  id: string;
  slug: string;
  name: string;
  url: string | null;
  year: string | null;
  country: string | null;
  migratedFrom: string | null;
  image: Img | null;
  logo: Img | null;
};

export type DigitalCase = {
  id: string;
  slug: string;
  brand: string;
  solution: string | null;
  services: string[];
  industries: string[];
  country: string | null;
  performance: string | null;
  monthly: string | null;
  roi: string | null;
  store: string | null;
  priority: number | null;
  logo: Img | null;
};

export const STUDIO = data.studio as StudioProject[];
export const COMMERCE = data.commerce as Store[];
export const DIGITAL = data.digital as DigitalCase[];

/* ---------------------------------------------------------- verticals ---- */

export type VerticalKey = "studio" | "commerce" | "digital";

export const VERTICALS: {
  key: VerticalKey;
  name: string;
  href: string;
  tagline: string;
  unit: string;
  count: number;
}[] = [
  {
    key: "studio",
    name: "كامبين استوديو",
    href: "/portfolio/studio",
    tagline: "هويات بصرية واستراتيجيات علامات تجارية تُعرَف من أول نظرة.",
    unit: "هوية",
    count: STUDIO.length,
  },
  {
    key: "commerce",
    name: "كامبين كومرس",
    href: "/portfolio/commerce",
    tagline: "متاجر شوبيفاي أطلقناها أو نقلناها، وكلها تعمل وتبيع الآن.",
    unit: "متجر",
    count: COMMERCE.length,
  },
  {
    key: "digital",
    name: "كامبين ديجيتال",
    href: "/portfolio/digital",
    tagline: "تحول رقمي كامل من الهوية إلى المتجر إلى الإعلانات، بنتائج تُقاس.",
    unit: "علامة",
    count: DIGITAL.length,
  },
];

export const vertical = (key: VerticalKey) => VERTICALS.find((v) => v.key === key)!;

/* ------------------------------------------------------------- labels ---- */

/** `null` hides an option on the site. */
const STUDIO_SERVICES: Record<string, string | null> = {
  "Logo Design": "تصميم الشعار",
  "Brand Strategy": "استراتيجية العلامة التجارية",
  "Re-branding": "إعادة بناء الهوية",
  Branding: "الهوية البصرية",
  Webdesign: "تصميم المواقع",
  "Company profle": "بروفايل الشركة",
  Brochure: "البروشورات",
  "Graphic design": "التصميم الجرافيكي",
  "App Design": "تصميم التطبيقات",
  "UI Design": "تصميم الواجهات",
  "UX Design": "تجربة المستخدم",
  Development: "البرمجة",
  Shopify: "متجر شوبيفاي",
  Billboards: "اللوحات الإعلانية",
  dribbble: null,
};

const DIGITAL_SERVICES: Record<string, string> = {
  "Brand Strategy": "استراتيجية العلامة",
  Shopify: "متجر شوبيفاي",
  "Performance Marketing": "التسويق بالأداء",
  "Copywrite Strategy": "استراتيجية المحتوى",
  "Social Content": "محتوى السوشيال",
  "Media production": "الإنتاج المرئي",
};

const SOLUTIONS: Record<string, string> = {
  "Digital transformation": "تحول رقمي",
  "Go to market": "دخول السوق",
  "New market launching": "إطلاق في سوق جديد",
  Rebranding: "إعادة بناء العلامة",
  "Growth Marketing": "تسويق النمو",
};

const INDUSTRIES: Record<string, string> = {
  Retail: "تجزئة",
  "Service Booking": "حجز خدمات",
  Hardware: "معدات",
  "Home Services": "خدمات منزلية",
  "Consumer Electronics": "إلكترونيات",
  Automotive: "سيارات",
  "Construction / Industrial": "بناء وصناعة",
  "Software / SaaS": "برمجيات",
  "Information Technology": "تقنية معلومات",
  "Jewelry & Fashion Accessories": "مجوهرات وإكسسوارات",
  "Food & Beverage": "أغذية ومشروبات",
  Education: "تعليم",
};

const MIGRATIONS: Record<string, string> = {
  WooCommerce: "منقول من WooCommerce",
  Salla: "منقول من سلة",
  Zid: "منقول من زد",
  Instagram: "من إنستجرام إلى متجر",
  Migration: "متجر منقول",
};

const COUNTRIES: Record<string, string> = {
  "Saudi Arabia": "السعودية",
  KSA: "السعودية",
  Egypt: "مصر",
  "United Arab Emirates": "الإمارات",
  UAE: "الإمارات",
  Kuwait: "الكويت",
  Qatar: "قطر",
  Oman: "عُمان",
  Bahrain: "البحرين",
  Jordan: "الأردن",
  "United States": "الولايات المتحدة",
};

const label = (map: Record<string, string | null>, s: string) => (s in map ? map[s] : s);
const labels = (map: Record<string, string | null>, list: string[]) =>
  list.map((s) => label(map, s)).filter((l): l is string => Boolean(l));

export const studioServiceLabel = (s: string) => label(STUDIO_SERVICES, s);
export const studioServiceLabels = (p: StudioProject) => labels(STUDIO_SERVICES, p.services);
export const digitalServiceLabels = (c: DigitalCase) => labels(DIGITAL_SERVICES, c.services);
export const industryLabels = (c: DigitalCase) => labels(INDUSTRIES, c.industries);
export const solutionLabel = (s: string | null) => (s ? SOLUTIONS[s] ?? s : null);
export const migrationLabel = (s: string | null) => (s ? MIGRATIONS[s] ?? s : null);
export const countryLabel = (c: string | null) => (c ? COUNTRIES[c] ?? c : null);

/** Hosts shown on store cards: "https://www.store.com/" → "store.com". */
export const displayHost = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

/** Background for a logo: its own corner colour, else one its ink shows on. */
export const logoBackground = (img: Img) =>
  img.color ?? (img.ink === "light" ? "#1A1917" : "#F4F1EA");

/** Digital cases that have a full case-study page on this site. */
const CASE_PAGES: Record<string, string> = {
  "tawheed-wel-nour": "/success-stories/tawheed",
};
export const casePage = (c: DigitalCase) => CASE_PAGES[c.slug] ?? null;

/* ------------------------------------------------------------ filters ---- */

/**
 * Filter chips: values that narrow the list. One on every item, or on only
 * one, would not, so it gets no chip; and a single chip is not worth showing.
 * Most common first.
 */
export function chipValues<T>(items: T[], valuesOf: (item: T) => string[]): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const v of new Set(valuesOf(item))) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  const chips = [...counts]
    .filter(([, n]) => n >= 2 && n < items.length)
    .sort((a, b) => b[1] - a[1])
    .map(([v]) => v);
  return chips.length >= 2 ? chips : [];
}

/* ------------------------------------------------------------- studio ---- */

export const getStudioProject = (slug: string) => STUDIO.find((p) => p.slug === slug);

/** The next `n` studio projects after `slug`, wrapping around. */
export function otherStudioProjects(slug: string, n = 3): StudioProject[] {
  const i = STUDIO.findIndex((p) => p.slug === slug);
  return [...STUDIO.slice(i + 1), ...STUDIO.slice(0, Math.max(i, 0))].slice(0, n);
}
