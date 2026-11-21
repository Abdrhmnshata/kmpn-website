/**
 * The portal menu, shared by the client-side menu (components/portal/
 * PortalNav.tsx) and the server-rendered local preview. Open sections first,
 * then the ones not open yet (shown as «قريبًا», see SOON in ./layer.ts),
 * then the account page.
 */
export type NavItem = { href: string; label: string; key: string };

export const PORTAL_NAV: NavItem[] = [
  { key: "dashboard", href: "/portal", label: "اللوحة" },
  { key: "projects", href: "/portal/projects", label: "المشاريع" },
  { key: "reports", href: "/portal/reports", label: "التقارير" },
  { key: "resources", href: "/portal/resources", label: "المطلوب منك" },
  { key: "meetings", href: "/portal/meetings", label: "الاجتماعات" },
  { key: "support", href: "/portal/support", label: "الدعم الفني" },
  { key: "deliverables", href: "/portal/deliverables", label: "التسليمات" },
  { key: "invoices", href: "/portal/invoices", label: "الفواتير" },
  { key: "contracts", href: "/portal/contracts", label: "العقود" },
  { key: "account", href: "/portal/account", label: "حسابي" },
];
