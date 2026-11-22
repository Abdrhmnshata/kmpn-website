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
      { key: "reports", href: "/portal/reports", label: "التقارير" },
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

/** Every page in menu order: the «قريبًا» strip, the previews' tabs, the director's section names. */
export const PORTAL_NAV: NavItem[] = PORTAL_MENU.flatMap((entry) => (isGroup(entry) ? entry.children : [entry]));
