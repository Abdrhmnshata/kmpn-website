"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth-actions";
import { isSoon } from "@/lib/portal/layer";
import { PORTAL_NAV, type NavItem } from "@/lib/portal/nav";

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
        if (isSoon(item.key)) {
          return (
            <span key={item.key} className="portal-soon" aria-disabled="true">
              {item.label}
              <small>قريبًا</small>
            </span>
          );
        }
        return (
          // No prefetch: each portal page reads Notion, and prefetching every
          // tab at once used to run into Notion's rate limit.
          <Link
            key={item.key}
            href={item.href}
            prefetch={false}
            aria-current={current ? "page" : undefined}
          >
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
