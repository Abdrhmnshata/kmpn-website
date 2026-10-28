import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaSection } from "@/components/CtaSection";
import { SERVICE_GROUPS } from "@/lib/content";

export const metadata: Metadata = {
  title: "الخدمات · كامبين",
  description:
    "حوّل نشاطك التجاري إلى منظومة رقمية للنمو الربحي، من خلال منهجية عمل وخدمات واضحة.",
};

export default function ServicesPage() {
  return (
    <div className="page">
      <Header />

      <main id="top" className="container">
        {/* ------------------------------------------ 01 Services ---- */}
        <section
          style={{
            padding: "clamp(40px, 6vw, 80px) 0 clamp(32px, 4vw, 48px)",
            display: "grid",
            gap: 18,
            maxWidth: 760,
          }}
        >
          <span className="pill" style={{ justifySelf: "start" }}>
            <span className="dot" />
            الحلول
          </span>
          <h1
            style={{
              fontSize: "clamp(34px, 5.2vw, 60px)",
              lineHeight: 1.3,
              fontWeight: 700,
              textWrap: "balance",
            }}
          >
            خدمات تحول المتاجر <span style={{ color: "var(--accent)" }}>رقمياً</span>
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.9,
              color: "var(--fg2)",
              textWrap: "pretty",
            }}
          >
            حوّل نشاطك التجاري إلى منظومة رقمية للنمو الربحي، من خلال منهجية عمل
            وخدمات واضحة.
          </p>
        </section>

        <nav
          aria-label="أقسام الخدمات"
          style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingBottom: 8 }}
        >
          {SERVICE_GROUPS.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 42,
                padding: "0 18px",
                borderRadius: 999,
                background: g.tint,
                color: "#191919",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: g.accent,
                }}
              />
              {g.title}
            </a>
          ))}
        </nav>

        {/* ------------------------------------- 02–04 service groups ---- */}
        {SERVICE_GROUPS.map((g) => (
          <section
            key={g.id}
            id={g.id}
            className="sec-line-t"
            style={{
              padding: "clamp(40px, 5vw, 64px) 0",
              display: "grid",
              gap: 24,
              scrollMarginTop: 80,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "end",
                gap: 16,
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    justifySelf: "start",
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: g.tint,
                    color: "#191919",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: g.accent,
                    }}
                  />
                  {g.eyebrow}
                </span>
                <h2
                  style={{
                    fontSize: "clamp(26px, 3.4vw, 40px)",
                    lineHeight: 1.35,
                    fontWeight: 700,
                  }}
                >
                  {g.title}
                </h2>
              </div>
              <Link
                href="/success-stories"
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  borderBottom: "1.5px solid currentColor",
                  paddingBottom: 1,
                }}
              >
                سابقة الأعمال ←
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                gap: 12,
              }}
            >
              {g.items.map((item) => (
                <article
                  key={item.t}
                  style={{
                    border: "1px solid var(--line)",
                    borderTop: `3px solid ${g.accent}`,
                    borderRadius: 18,
                    padding: 22,
                    display: "grid",
                    gap: 8,
                    alignContent: "start",
                    background: "var(--bg)",
                  }}
                >
                  <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5 }}>
                    {item.t}
                  </h3>
                  <p
                    style={{
                      fontSize: 14.5,
                      color: "var(--fg2)",
                      lineHeight: 1.85,
                    }}
                  >
                    {item.d}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}

        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
