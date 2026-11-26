import { isSection, type Section } from "./layer";

/**
 * The portal menu, in the site header: the dashboard, two dropdown groups
 * and the account page. Sections not open for a client show as «قريبًا»
 * (see SOON and openFor in ./layer.ts).
 */
export type NavItem = { href: string; label: string; key: string };
export type MenuGroup = { key: string; label: string; children: NavItem[] };
export type MenuEntry = NavItem | MenuGroup;

export const isGroup = (entry: MenuEntry): entry is MenuGroup => "children" in entry;

export const PORTAL_MENU: MenuEntry[] = [
  { key: "dashboard", href: "/portal", label: "اللوحة" },
  {
    key: "work",
    label: "المشاريع",
    children: [
      { key: "projects", href: "/portal/projects", label: "المشاريع الحالية" },
      { key: "deliverables", href: "/portal/deliverables", label: "التسليمات" },
      { key: "resources", href: "/portal/resources", label: "الموارد المطلوبة" },
    ],
  },
  {
    key: "manage",
    label: "إدارة الحساب",
    children: [
      { key: "invoices", href: "/portal/invoices", label: "الفواتير" },
      { key: "contracts", href: "/portal/contracts", label: "العقود" },
      { key: "meetings", href: "/portal/meetings", label: "الاجتماعات" },
      { key: "support", href: "/portal/support", label: "الدعم الفني" },
    ],
  },
  { key: "account", href: "/portal/account", label: "حسابي" },
];

/** Every page in menu order: the «قريبًا» strip, the previews' tabs. */
export const PORTAL_NAV: NavItem[] = PORTAL_MENU.flatMap((entry) => (isGroup(entry) ? entry.children : [entry]));

/**
 * Pages that hold more than one section: «التسليمات» has the ad reports
 * (section "reports") and the content library (section "deliverables") as
 * tabs, and opens when either of them is open.
 */
const PAGE_SECTIONS: Partial<Record<string, Section[]>> = {
  deliverables: ["reports", "deliverables"],
};

/** False when a menu page is «قريبًا» for the client: none of its sections is open. */
export function pageOpen(key: string, open: readonly string[]) {
  const sections = PAGE_SECTIONS[key] ?? (isSection(key) ? [key] : null);
  return !sections || sections.some((s) => open.includes(s));
}

/** Each section's name for the director (/admin/clients): where the client sees it. */
export const SECTION_LABEL: Record<Section, string> = {
  projects: "المشاريع الحالية",
  reports: "التسليمات · تقارير الإعلانات",
  resources: "الموارد المطلوبة",
  meetings: "الاجتماعات",
  support: "الدعم الفني",
  deliverables: "التسليمات · مكتبة المحتوى الإعلاني",
  invoices: "الفواتير",
  contracts: "العقود",
};
