"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth-actions";
import { DEFAULT_OPEN, isSection } from "@/lib/portal/layer";
import { PORTAL_NAV, type NavItem } from "@/lib/portal/nav";

/**
 * The portal's side menu. A section missing from `open` shows as «قريبًا».
 * The previews pass their own items and the active key, and have no
 * sign-out; the director also gets a link to /admin.
 */
export function PortalNav({
  items = PORTAL_NAV,
  active,
  open = DEFAULT_OPEN,
  admin = false,
  signOutButton = true,
}: {
  items?: NavItem[];
  active?: string;
  open?: readonly string[];
  admin?: boolean;
  signOutButton?: boolean;
}) {
  const path = usePathname();
  return (
    <nav className="portal-nav" aria-label="بوابة العملاء">
      {items.map((item) => {
        const current = active ? item.key === active : path === item.href;
        if (isSection(item.key) && !open.includes(item.key)) {
          return (
            <span key={item.key} className="portal-soon" aria-disabled="true">
              {item.label}
              <small>قريبًا</small>
            </span>
          );
        }
        return (
          // Default prefetch: for these dynamic pages Next fetches only the
          // shell down to loading.tsx, never the page's Notion reads, so a
          // click shows the page frame at once. (Full prefetch of every tab
          // used to run into Notion's rate limit.)
          <Link key={item.key} href={item.href} aria-current={current ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
      {admin ? (
        <Link href="/admin" prefetch={false} className="portal-admin">
          لوحة المدير
        </Link>
      ) : null}
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
