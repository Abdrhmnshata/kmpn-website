import Link from "next/link";
import { COPYRIGHT, FOOTER_BLURB, FOOTER_NAV, SOCIALS } from "@/lib/content";

const ICONS: Record<string, React.ReactNode> = {
  Facebook: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8a0 0 0 0 1 0 0Z" />,
  Instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </>
  ),
  LinkedIn: (
    <>
      <rect x="3" y="9" width="4" height="12" />
      <circle cx="5" cy="4.5" r="2" />
      <path d="M10 9h4v2a4 4 0 0 1 7 3v7h-4v-6a2 2 0 0 0-4 0v6h-3Z" />
    </>
  ),
  Behance: (
    <path d="M3 6h5.5a3 3 0 0 1 0 6H3Zm0 6h6a3 3 0 0 1 0 6H3Zm12-5h5M14 14.5h7a3.5 3.5 0 1 0-1 2.5" />
  ),
};

export function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr-inner">
        <div
          style={{
            display: "grid",
            gap: 18,
            justifyItems: "start",
            maxWidth: 560,
          }}
        >
          <span
            role="img"
            aria-label="كامبين"
            style={{
              display: "block",
              height: "clamp(44px, 6vw, 64px)",
              aspectRatio: "3192.5 / 1200",
              background: "#FAF7F2",
              WebkitMask: "url(/assets/kmpn-logo-ar.svg) center/contain no-repeat",
              mask: "url(/assets/kmpn-logo-ar.svg) center/contain no-repeat",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 14.5,
              lineHeight: 1.9,
              color: "#C4BEB1",
              textWrap: "pretty",
            }}
          >
            {FOOTER_BLURB}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                title={s.name}
                className="social"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {ICONS[s.name]}
                </svg>
              </a>
            ))}
          </div>

          <nav
            className="ftr-nav"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px clamp(20px, 3vw, 36px)",
            }}
          >
            {FOOTER_NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          style={{
            borderTop: "1px solid #2E2C27",
            paddingTop: 24,
            textAlign: "center",
            fontSize: 14,
            color: "#C4BEB1",
          }}
        >
          {COPYRIGHT}
        </div>
      </div>
    </footer>
  );
}
