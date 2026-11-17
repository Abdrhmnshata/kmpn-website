"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth-actions";

export type NavItem = { href: string; label: string; key: string };

export const PORTAL_NAV: NavItem[] = [
  { key: "dashboard", href: "/portal", label: "اللوحة" },
  { key: "projects", href: "/portal/projects", label: "المشاريع" },
  { key: "reports", href: "/portal/reports", label: "التقارير" },
  { key: "resources", href: "/portal/resources", label: "المطلوب منك" },
  { key: "meetings", href: "/portal/meetings", label: "الاجتماعات" },
  { key: "invoices", href: "/portal/invoices", label: "الفواتير" },
  { key: "support", href: "/portal/support", label: "الدعم الفني" },
  { key: "account", href: "/portal/account", label: "حسابي" },
];

/**
 * The portal's side menu. The local preview passes its own items and the
 * active key, and has no sign-out.
 */
export function PortalNav({
  items = PORTAL_NAV,
  active,
  signOutButton = true,
}: {
  items?: NavItem[];
  active?: string;
  signOutButton?: boolean;
}) {
  const path = usePathname();
  return (
    <nav className="portal-nav" aria-label="بوابة العملاء">
      {items.map((item) => {
        const current = active ? item.key === active : path === item.href;
        return (
          <Link key={item.key} href={item.href} aria-current={current ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
      {signOutButton ? (
        <form action={signOut}>
          <button type="submit" className="portal-out">
            تسجيل الخروج
          </button>
        </form>
      ) : null}
    </nav>
  );
}
