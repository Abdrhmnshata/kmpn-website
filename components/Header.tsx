"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { NAV } from "@/lib/content";

/** First name of a signed-in portal client, from the cookie the portal
 *  middleware sets. Read after mount so static pages hydrate cleanly. */
function usePortalName() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    const raw = document.cookie.match(/(?:^|;\s*)kp_name=([^;]*)/)?.[1];
    if (!raw) return;
    try {
      setName(decodeURIComponent(decodeURIComponent(raw)));
    } catch {
      setName(null);
    }
  }, []);
  return name;
}

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="7.5" r="4" />
    <path d="M4 20.5c0-4.1 3.6-7 8-7s8 2.9 8 7a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5Z" />
  </svg>
);

export function Header({ ctaHref = "#contact" }: { ctaHref?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const portalName = usePortalName();
  const accountHref = portalName ? "/portal" : "/login";
  const accountLabel = portalName ? `أهلاً، ${portalName}` : "تسجيل الدخول";

  const themeLabel = theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن";

  // Escape closes the phone menu, like tapping the dimmed page behind it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="hdr">
      {/* Dims the page while the phone menu is open; tapping it closes the menu. */}
      <div
        className="hdr-backdrop"
        data-open={menuOpen}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />
      <div className="hdr-inner">
        <div className="hdr-bar">
          <Link href="/" aria-label="كامبين" className="logo-mask" style={{ height: 26 }} />

          <nav className="desk-nav" style={{ alignItems: "center", gap: 2 }}>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Client login, or "أهلاً، …" once signed in: icon and words from
                900px, the icon alone on phones. The free-consultation CTA stays
                in the phone menu and on the pages themselves. */}
            <Link
              href={accountHref}
              prefetch={false}
              className="btn-primary hdr-login"
              aria-label={accountLabel}
              title={accountLabel}
            >
              <PersonIcon />
              <span className="hdr-login-text">{accountLabel}</span>
            </Link>

            <button
              type="button"
              onClick={toggle}
              aria-label={themeLabel}
              title={themeLabel}
              className="icon-btn"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="القائمة"
              className="burger mob-nav"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d={menuOpen ? "M6 6l12 12" : "M4 7h16"} />
                <path d="M4 12h16" opacity={menuOpen ? 0 : 1} />
                <path d={menuOpen ? "M18 6L6 18" : "M4 17h16"} />
              </svg>
            </button>
          </div>
        </div>

        <div
          className="mob-menu-wrap"
          style={{
            gridTemplateRows: menuOpen ? "1fr" : "0fr",
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? "auto" : "none",
          }}
        >
          <div className="acc-clip">
            <nav className="mob-menu">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                  <span style={{ color: "var(--muted)" }}>←</span>
                </Link>
              ))}
              <Link
                href={ctaHref}
                onClick={() => setMenuOpen(false)}
                style={{
                  marginTop: 14,
                  background: "var(--accent)",
                  color: "#fff",
                  borderRadius: 999,
                  height: 54,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 700,
                  borderBottom: 0,
                }}
              >
                اطلب استشارة مجانية
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
