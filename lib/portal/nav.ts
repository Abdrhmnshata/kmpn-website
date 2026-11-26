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

/* ------------------------------------------------------------ rail ---- */

/**
 * The portal's own app shell (components/portal/PortalShell.tsx): a rail of
 * icons on wide screens, each group opening a panel beside it, and a bottom
 * bar with «الكل» on phones. A link whose section is closed shows «قريبًا»
 * (pageOpen); a group with nothing open is dimmed.
 */
export type RailIcon = "home" | "projects" | "deliverables" | "finance" | "support";
export type RailItem = { key: string; label: string; icon: RailIcon; href: string; children?: NavItem[] };

export const PORTAL_RAIL: RailItem[] = [
  { key: "dashboard", label: "الرئيسية", icon: "home", href: "/portal" },
  {
    key: "work",
    label: "المشاريع",
    icon: "projects",
    href: "/portal/projects",
    children: [
      { key: "projects", href: "/portal/projects", label: "المشاريع الحالية" },
      { key: "resources", href: "/portal/resources", label: "الموارد المطلوبة" },
      { key: "meetings", href: "/portal/meetings", label: "الاجتماعات" },
    ],
  },
  {
    key: "deliver",
    label: "التسليمات",
    icon: "deliverables",
    href: "/portal/deliverables",
    children: [
      { key: "reports", href: "/portal/deliverables", label: "تقارير أداء الإعلانات" },
      { key: "reports", href: "/portal/deliverables/content", label: "تقارير أداء المحتوى الإعلاني" },
      { key: "deliverables", href: "/portal/deliverables/library", label: "مكتبة المحتوى الإعلاني" },
    ],
  },
  {
    key: "money",
    label: "المالية",
    icon: "finance",
    href: "/portal/invoices",
    children: [
      { key: "invoices", href: "/portal/invoices", label: "الفواتير" },
      { key: "contracts", href: "/portal/contracts", label: "العقود" },
    ],
  },
  { key: "support", label: "الدعم", icon: "support", href: "/portal/support" },
];

/** The rail item a path belongs to (its own page or one of its links). */
export function railCurrent(item: RailItem, path: string) {
  if (path === item.href) return true;
  if (item.href !== "/portal" && path.startsWith(`${item.href}/`)) return true;
  return (item.children ?? []).some((c) => c.href === path);
}

/* -------------------------------------- view as client / local preview */

const DELIVERY_PATHS: Record<string, string> = {
  ads: "/portal/deliverables",
  content: "/portal/deliverables/content",
  library: "/portal/deliverables/library",
  ops: "/portal/deliverables/operations",
};

/** A portal path as the director's "view as client" (or the preview) addresses it: `${base}?tab=…`. */
export function previewHref(base: string, href: string) {
  if (href !== "/portal" && !href.startsWith("/portal/")) return href;
  if (href === "/portal") return base;
  const view = Object.entries(DELIVERY_PATHS).find(([, p]) => p === href)?.[0];
  if (view) return `${base}?tab=deliverables&view=${view}`;
  return `${base}?tab=${href.slice("/portal/".length)}`;
}

/** The portal path a preview tab stands for (what the client's address would be). */
export function previewPath(tab: string, deliveryView?: string) {
  if (tab === "dashboard") return "/portal";
  if (tab === "deliverables") return DELIVERY_PATHS[deliveryView ?? "ads"] ?? "/portal/deliverables";
  return `/portal/${tab}`;
}
