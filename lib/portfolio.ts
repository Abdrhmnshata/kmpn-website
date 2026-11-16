/**
 * Portfolio data. `portfolio.json` and the images in `public/portfolio/` are
 * written by `scripts/sync-portfolio.mjs` from the Notion database
 * "KMPN Studio - Branding Case Studies - [Public]" (Publish Status =
 * Published). Edit the projects in Notion, not here.
 */
import data from "./portfolio.json";

export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  /** Background colour at the image's corner, used to extend it seamlessly. */
  color?: string | null;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  /** Notion "Type" values, in English as stored there. */
  services: string[];
  year: string | null;
  country: string | null;
  behance: string | null;
  brandBook: string | null;
  cover: ProjectImage | null;
  concept: ProjectImage | null;
};

export const PROJECTS: Project[] = data.projects;

/** Arabic labels for the Notion "Type" options. `null` hides an option. */
const SERVICE_LABELS: Record<string, string | null> = {
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

const COUNTRY_LABELS: Record<string, string> = {
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
};

export const serviceLabel = (s: string) =>
  s in SERVICE_LABELS ? SERVICE_LABELS[s] : s;

/** A project's services as Arabic labels, hidden options dropped. */
export const serviceLabels = (p: Project) =>
  p.services.map(serviceLabel).filter((l): l is string => Boolean(l));

export const countryLabel = (c: string | null) => (c ? COUNTRY_LABELS[c] ?? c : null);

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);

/**
 * Filter chips for the index page: services that narrow the list. A service
 * on every project (or on only one) would not, so it gets no chip.
 * Most common first.
 */
export function portfolioFilters(projects: Project[] = PROJECTS): string[] {
  const counts = new Map<string, number>();
  for (const p of projects) {
    for (const s of p.services) {
      if (serviceLabel(s)) counts.set(s, (counts.get(s) ?? 0) + 1);
    }
  }
  return [...counts]
    .filter(([, n]) => n >= 2 && n < projects.length)
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s);
}

/** The next `n` projects after `slug`, wrapping around. */
export function otherProjects(slug: string, n = 3): Project[] {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  const rest = [...PROJECTS.slice(i + 1), ...PROJECTS.slice(0, Math.max(i, 0))];
  return rest.slice(0, n);
}
