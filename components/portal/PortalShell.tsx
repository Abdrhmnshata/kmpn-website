"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { signOut } from "@/app/auth-actions";
import { PORTAL_RAIL, pageOpen, previewHref, railCurrent, type NavItem, type RailItem } from "@/lib/portal/nav";
import { Icon } from "./ShellIcons";
import "@/app/portal-shell.css";

/**
 * The client portal's app shell. Wide screens: a rail of icons at the
 * start edge; a group opens its links in a panel beside the rail (hover or
 * click). Phones: a bottom bar with the main pages and «الكل», a sheet
 * with every page and a search. Closed sections show «قريبًا».
 *
 * The director's "view as client" and the team's local preview use it too
 * (`viewer`): read-only, no account or sign-out, links mapped under `base`
 * to their ?tab= addresses and the current page given as `current`.
 */

const PHONE_BAR = ["dashboard", "work", "deliver", "support"];

function SubLink({
  item,
  open,
  current,
  className,
  onNavigate,
  linkFor,
}: {
  item: NavItem;
  open: readonly string[];
  current: boolean;
  className: string;
  onNavigate?: () => void;
  linkFor: (href: string) => string;
}) {
  if (!pageOpen(item.key, open)) {
    return (
      <span className={`${className} is-soon`} aria-disabled="true">
        {item.label}
        <small>قريبًا</small>
      </span>
    );
  }
  return (
    <Link href={linkFor(item.href)} className={className} aria-current={current ? "page" : undefined} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

/** A group is dimmed when none of its links is open. */
const groupOpen = (item: RailItem, open: readonly string[]) =>
  item.children ? item.children.some((c) => pageOpen(c.key, open)) : pageOpen(item.key, open);

export function PortalShell({
  open,
  admin,
  name,
  children,
  viewer = false,
  banner,
  base,
  current: currentPath,
}: {
  open: readonly string[];
  admin: boolean;
  name: string;
  children: React.ReactNode;
  /** Read-only: the director's "view as client" or the team's preview. */
  viewer?: boolean;
  /** Shown above the page (the preview's note). */
  banner?: React.ReactNode;
  /** The preview's own address: links become `${base}?tab=…`. */
  base?: string;
  /** The portal path being shown, when the address alone can't tell. */
  current?: string;
}) {
  const routePath = usePathname();
  const path = currentPath ?? routePath;
  const linkFor = (href: string) => (base ? previewHref(base, href) : href);
  const { theme, toggle } = useTheme();
  const [flyout, setFlyout] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const shell = useRef<HTMLDivElement>(null);
  const leave = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A new page closes the panel and the sheet.
  useEffect(() => {
    setFlyout(null);
    setSheet(false);
  }, [path]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setFlyout(null);
      setSheet(false);
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".ps-rail") && !t.closest(".ps-fly")) setFlyout(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  // The sheet covers the page: no scrolling behind it.
  useEffect(() => {
    document.documentElement.style.overflow = sheet ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [sheet]);

  const hoverOpen = (key: string | null) => {
    if (leave.current) clearTimeout(leave.current);
    setFlyout(key);
  };
  const hoverLeave = () => {
    if (leave.current) clearTimeout(leave.current);
    leave.current = setTimeout(() => setFlyout(null), 220);
  };

  const group = PORTAL_RAIL.find((r) => r.key === flyout && r.children);
  const themeLabel = theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن";
  const q = query.trim();
  const matches = (label: string) => !q || label.includes(q);

  return (
    <div className="ps" ref={shell}>
      {/* ------------------------------------------------ wide: the rail */}
      <aside className="ps-rail" aria-label="بوابة العملاء" onMouseLeave={hoverLeave}>
        <Link href={linkFor("/portal")} className="ps-logo" aria-label="بوابة العملاء · كامبين">
          <span className="logo-mask" />
        </Link>
        <nav className="ps-items">
          {PORTAL_RAIL.map((item) => {
            const current = railCurrent(item, path);
            const dim = !groupOpen(item, open);
            const body = (
              <>
                <span className="ps-ico">
                  <Icon name={item.icon} />
                </span>
                <span className="ps-lab">{item.label}</span>
              </>
            );
            return item.children ? (
              <button
                key={item.key}
                type="button"
                className={`ps-item${dim ? " is-dim" : ""}`}
                data-current={current || undefined}
                aria-expanded={flyout === item.key}
                aria-haspopup="true"
                onClick={() => setFlyout(flyout === item.key ? null : item.key)}
                onMouseEnter={() => hoverOpen(item.key)}
              >
                {body}
              </button>
            ) : dim ? (
              <span key={item.key} className="ps-item is-dim" aria-disabled="true" onMouseEnter={() => hoverOpen(null)}>
                {body}
              </span>
            ) : (
              <Link
                key={item.key}
                href={linkFor(item.href)}
                className="ps-item"
                data-current={current || undefined}
                aria-current={current ? "page" : undefined}
                onMouseEnter={() => hoverOpen(null)}
              >
                {body}
              </Link>
            );
          })}
        </nav>
        {viewer ? null : (
          <div className="ps-items ps-bottom">
            {admin ? (
              <Link href="/admin" prefetch={false} className="ps-item">
                <span className="ps-ico">
                  <Icon name="admin" />
                </span>
                <span className="ps-lab">لوحة المدير</span>
              </Link>
            ) : null}
            <Link
              href="/portal/account"
              className="ps-item"
              data-current={path === "/portal/account" || undefined}
              aria-current={path === "/portal/account" ? "page" : undefined}
            >
              <span className="ps-ico">
                <Icon name="account" />
              </span>
              <span className="ps-lab">حسابي</span>
            </Link>
          </div>
        )}
      </aside>

      {group ? (
        <div
          className="ps-fly"
          role="menu"
          aria-label={group.label}
          onMouseEnter={() => hoverOpen(group.key)}
          onMouseLeave={hoverLeave}
        >
          <p className="ps-fly-title">{group.label}</p>
          {group.children!.map((c) => (
            <SubLink
              key={c.href}
              item={c}
              open={open}
              current={path === c.href}
              className="ps-fly-link"
              onNavigate={() => setFlyout(null)}
              linkFor={linkFor}
            />
          ))}
        </div>
      ) : null}

      {/* ------------------------------------------------------- the page */}
      <div className="ps-main">
        <header className="ps-top">
          <Link href={linkFor("/portal")} className="ps-top-logo logo-mask" aria-label="بوابة العملاء · كامبين" />
          <p className="ps-hello">
            أهلاً، <strong>{name}</strong>
          </p>
          <div className="ps-actions">
            <Link href="/" className="ps-btn ps-site" title="موقع كامبين">
              <Icon name="site" size={18} />
              <span>الموقع</span>
            </Link>
            <button type="button" className="ps-btn ps-icon-btn" onClick={toggle} aria-label={themeLabel} title={themeLabel}>
              <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
            </button>
            {viewer ? null : (
              <form action={signOut} className="ps-out">
                <button type="submit" className="ps-btn ps-exit" title="تسجيل الخروج">
                  <Icon name="exit" size={18} />
                  <span>تسجيل الخروج</span>
                </button>
              </form>
            )}
          </div>
        </header>
        <main className="ps-content">
          {banner}
          {children}
        </main>
      </div>

      {/* --------------------------------------------- phones: bottom bar */}
      <nav className="ps-tabbar" aria-label="بوابة العملاء">
        {PHONE_BAR.map((key) => {
          const item = PORTAL_RAIL.find((r) => r.key === key)!;
          const current = railCurrent(item, path);
          return (
            <Link
              key={key}
              href={linkFor(item.href)}
              className="ps-tab"
              data-current={current || undefined}
              aria-current={current ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className="ps-tab"
          aria-expanded={sheet}
          aria-controls="ps-sheet"
          onClick={() => setSheet(true)}
        >
          <Icon name="all" />
          <span>الكل</span>
        </button>
      </nav>

      <div id="ps-sheet" className="ps-sheet" hidden={!sheet} role="dialog" aria-modal="true" aria-label="كل الصفحات">
        <div className="ps-sheet-head">
          <h2>الكل</h2>
          <button type="button" className="ps-btn ps-icon-btn" onClick={() => setSheet(false)} aria-label="إغلاق">
            <Icon name="close" size={18} />
          </button>
        </div>
        <label className="ps-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            placeholder="ابحث..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="ابحث في الصفحات"
          />
        </label>
        <ul className="ps-list">
          {PORTAL_RAIL.map((item) => {
            const kids = (item.children ?? []).filter((c) => matches(c.label) || matches(item.label));
            if (item.children ? !kids.length : !matches(item.label)) return null;
            const show = Boolean(q) || expanded === item.key;
            return (
              <li key={item.key}>
                {item.children ? (
                  <>
                    <button
                      type="button"
                      className="ps-row"
                      aria-expanded={show}
                      onClick={() => setExpanded(expanded === item.key ? null : item.key)}
                    >
                      <Icon name={item.icon} />
                      <span>{item.label}</span>
                      <span className="ps-chev">
                        <Icon name="chevron" size={16} />
                      </span>
                    </button>
                    {show ? (
                      <div className="ps-sub">
                        {kids.map((c) => (
                          <SubLink
                            key={c.href}
                            item={c}
                            open={open}
                            current={path === c.href}
                            className="ps-sub-link"
                            onNavigate={() => setSheet(false)}
                            linkFor={linkFor}
                          />
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <Link href={linkFor(item.href)} className="ps-row" onClick={() => setSheet(false)}>
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <div className="ps-sheet-foot">
          {viewer ? null : (
            <Link href="/portal/account" className="ps-row" onClick={() => setSheet(false)}>
              <Icon name="account" />
              <span>حسابي</span>
            </Link>
          )}
          {admin ? (
            <Link href="/admin" prefetch={false} className="ps-row">
              <Icon name="admin" />
              <span>لوحة المدير</span>
            </Link>
          ) : null}
          <Link href="/" className="ps-row">
            <Icon name="site" />
            <span>موقع كامبين</span>
          </Link>
          <button type="button" className="ps-row" onClick={toggle}>
            <Icon name={theme === "dark" ? "sun" : "moon"} />
            <span>{themeLabel}</span>
          </button>
          {viewer ? null : (
            <form action={signOut}>
              <button type="submit" className="ps-row ps-row-out">
                <Icon name="exit" />
                <span>تسجيل الخروج</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
