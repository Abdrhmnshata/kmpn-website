"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { NAV } from "@/lib/content";

export function Header({ ctaHref = "#contact" }: { ctaHref?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const themeLabel = theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن";

  return (
    <header className="hdr">
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
            <Link
              href={ctaHref}
              className="btn-primary desk-nav"
              style={{ height: 40, padding: "0 18px", fontSize: 14 }}
            >
              اطلب استشارة مجانية
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
