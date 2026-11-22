"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_OPEN, isSection } from "@/lib/portal/layer";
import { PORTAL_MENU, isGroup, type MenuEntry, type NavItem } from "@/lib/portal/nav";
import { NAV } from "@/lib/content";

/** «كامبين»: the rest of the site, one click away from the portal. */
const SITE: MenuEntry = {
  key: "site",
  label: "كامبين",
  children: NAV.map((n) => ({ key: `site:${n.href}`, href: n.href, label: n.label })),
};
const ENTRIES: MenuEntry[] = [...PORTAL_MENU, SITE];

/**
 * The portal menu: in the site header on the portal pages (dropdown groups
 * on wide screens, a stacked list in the phone menu), and as a bar on the
 * director's "view as client" page. A section not open for the client
 * shows as «قريبًا».
 */

type MenuProps = {
  open?: readonly string[];
  admin?: boolean;
  /** For the director's preview: tabs are `${tabBase}?tab=<key>` instead of /portal pages. */
  tabBase?: string;
  /** The current tab when the path alone can't tell (the preview). */
  active?: string;
  /** Entries left out (the preview has no account page). */
  hide?: string[];
};

function useMenu({ tabBase, active }: Pick<MenuProps, "tabBase" | "active">) {
  const path = usePathname();
  const hrefOf = (item: NavItem) =>
    tabBase ? (item.key === "dashboard" ? tabBase : `${tabBase}?tab=${item.key}`) : item.href;
  const isCurrent = (item: NavItem) => (active ? item.key === active : path === item.href);
  return { path, hrefOf, isCurrent };
}

function Entry({
  item,
  href,
  current,
  open,
  className,
  onNavigate,
}: {
  item: NavItem;
  href: string;
  current: boolean;
  open: readonly string[];
  className: string;
  onNavigate?: () => void;
}) {
  if (isSection(item.key) && !open.includes(item.key)) {
    return (
      <span className={`${className} pm-soon`} aria-disabled="true">
        {item.label}
        <small>قريبًا</small>
      </span>
    );
  }
  return (
    <Link href={href} className={className} aria-current={current ? "page" : undefined} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

/** Wide screens: links and dropdown groups, opened on hover or click. */
export function PortalMenu({ open = DEFAULT_OPEN, admin = false, tabBase, active, hide = [] }: MenuProps) {
  const { path, hrefOf, isCurrent } = useMenu({ tabBase, active });
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // A new page closes the dropdown; so do a click outside and Escape.
  useEffect(() => setOpenGroup(null), [path, active]);
  useEffect(() => {
    if (!openGroup) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenGroup(null);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [openGroup]);

  return (
    <div className="pm" ref={ref}>
      {ENTRIES.filter((entry) => !hide.includes(entry.key)).map((entry) => {
        if (!isGroup(entry)) {
          return (
            <Entry
              key={entry.key}
              item={entry}
              href={hrefOf(entry)}
              current={isCurrent(entry)}
              open={open}
              className="nav-link pm-link"
            />
          );
        }
        const expanded = openGroup === entry.key;
        return (
          <div key={entry.key} className="pm-group">
            <button
              type="button"
              className="nav-link pm-link pm-toggle"
              aria-expanded={expanded}
              aria-haspopup="true"
              data-current={entry.children.some(isCurrent) || undefined}
              onClick={() => setOpenGroup(expanded ? null : entry.key)}
            >
              {entry.label}
              <span className="pm-caret" aria-hidden="true" />
            </button>
            <div className="pm-drop" data-open={expanded || undefined}>
              <div className="pm-drop-box">
                {entry.children.map((child) => (
                  <Entry
                    key={child.key}
                    item={child}
                    href={hrefOf(child)}
                    current={isCurrent(child)}
                    open={open}
                    className="pm-item"
                    onNavigate={() => setOpenGroup(null)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
      {admin ? (
        <Link href="/admin" prefetch={false} className="nav-link pm-link pm-admin">
          لوحة المدير
        </Link>
      ) : null}
    </div>
  );
}

/** The phone menu: the same entries, the groups as headed lists. */
export function PortalMenuStacked({
  open = DEFAULT_OPEN,
  admin = false,
  onNavigate,
}: Pick<MenuProps, "open" | "admin"> & { onNavigate?: () => void }) {
  const { hrefOf, isCurrent } = useMenu({});
  return (
    <>
      {ENTRIES.map((entry) =>
        isGroup(entry) ? (
          <div key={entry.key} className="pm-stack-group">
            <span className="pm-stack-head">{entry.label}</span>
            {entry.children.map((child) => (
              <Entry
                key={child.key}
                item={child}
                href={hrefOf(child)}
                current={isCurrent(child)}
                open={open}
                className="pm-stack-item"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : (
          <Entry
            key={entry.key}
            item={entry}
            href={hrefOf(entry)}
            current={isCurrent(entry)}
            open={open}
            className="pm-stack-top"
            onNavigate={onNavigate}
          />
        ),
      )}
      {admin ? (
        <Link href="/admin" prefetch={false} className="pm-stack-top" onClick={onNavigate}>
          لوحة المدير
        </Link>
      ) : null}
    </>
  );
}
