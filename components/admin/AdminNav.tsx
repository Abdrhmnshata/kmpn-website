"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** The director's side menu on /admin, in the portal menu's style. */
const ITEMS = [
  { href: "/admin", label: "اللوحة" },
  { href: "/admin/signups", label: "المسجّلين" },
  { href: "/admin/clients", label: "العملاء والصلاحيات" },
  { href: "/admin/internal", label: "مشاريع داخلية" },
  { href: "/admin/support", label: "الدعم الفني" },
  { href: "/admin/hr", label: "الموارد البشرية" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="portal-nav" aria-label="لوحة المدير">
      {ITEMS.map((item) => {
        const current = item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
      <Link href="/portal" prefetch={false} className="portal-admin">
        بوابتي
      </Link>
    </nav>
  );
}
