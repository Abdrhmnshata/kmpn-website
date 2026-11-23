"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** The HR pages' tabs, in the portal's chip style. */
const TABS = [
  { href: "/admin/hr", label: "نظرة عامة" },
  { href: "/admin/hr/team", label: "الفريق" },
  { href: "/admin/hr/leaves", label: "الإجازات" },
  { href: "/admin/hr/payroll", label: "المرتبات" },
];

export function HrTabs() {
  const path = usePathname();
  return (
    <nav className="work-chips h-tabs" aria-label="الموارد البشرية">
      {TABS.map((t) => {
        const current = t.href === "/admin/hr" ? path === "/admin/hr" : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className="work-chip" aria-current={current ? "page" : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
