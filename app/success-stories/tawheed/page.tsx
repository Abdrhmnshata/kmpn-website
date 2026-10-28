import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { KpiPanel } from "@/components/tawheed/KpiPanel";
import { Timeline } from "@/components/tawheed/Timeline";
import { BrandCarousel } from "@/components/tawheed/BrandCarousel";
import { AdResults } from "@/components/tawheed/AdResults";

export const metadata: Metadata = {
  title: "التوحيد والنور · قصة نجاح · كامبين",
  description:
    "عملية تحول رقمي بدأت في يونيو 2023: من إعادة تصميم الهوية إلى منظومة بيع أونلاين بـ 6 مليون جنيه مبيعات شهرية.",
};

const CONTEXT_ROWS: [string, string][] = [
  ["العميل:", "التوحيد والنور · سلسلة ريتيل مصرية بـ ~70 فرع في كل المحافظات، من 1975."],
  ["الفترة:", "من يوليو 2023 لـ سبتمبر 2026 — شراكة مستمرة."],
  ["المنصات:", "Shopify · Meta Ads · Google Ads · GA4 · Search Console."],
];

const SERVICE_TAGS: { label: string; bg?: string; fg?: string; dot?: string }[] = [
  { label: "Branding & Rebranding", bg: "#FCE7E5", fg: "#191919", dot: "#EE4037" },
  { label: "Shopify Store", bg: "#E6F5EC", fg: "#031813", dot: "#32AC63" },
  { label: "Meta + Google Ads", bg: "#E1F5FA", fg: "#011633", dot: "#1DB4D8" },
  { label: "SEO", bg: "#E1F5FA", fg: "#011633", dot: "#1DB4D8" },
  { label: "Social & Content", bg: "#FCE7E5", fg: "#191919", dot: "#EE4037" },
  { label: "Analytics" },
];

function Check({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function TawheedCaseStudy() {
  return (
    <div className="page">
      <Header ctaHref="#contact" />

      <main id="top" className="container">
        {/* ----------------------------------------------- 01 Hero ---- */}
        <section
          style={{
            padding: "clamp(36px, 5vw, 64px) 0 clamp(28px, 4vw, 44px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))",
            gap: "28px clamp(28px, 5vw, 64px)",
            alignItems: "end",
          }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "#FCE7E5",
                  color: "#191919",
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#EE4037",
                  }}
                />
                قصة نجاح
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>
                التوحيد والنور
              </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                40 شهر | من يونيو 2023 لـ سبتمبر 2026
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(34px, 5.2vw, 64px)",
                lineHeight: 1.3,
                fontWeight: 700,
                textWrap: "balance",
              }}
            >
              من محلات عريقة لـ علامة تجارية واضحة،{" "}
              <span style={{ color: "var(--accent)" }}>ديجيتال!</span>
            </h1>

            <p
              style={{
                fontSize: 16.5,
                lineHeight: 1.9,
                color: "var(--fg2)",
                maxWidth: "52ch",
                textWrap: "pretty",
              }}
            >
              عملية تحول رقمي بدأت في يونيو 2023 لإدارة من إدارات التوحيد والنور
              في مصر، تحديات كتيرة بدأت من إعادة تصميم الهوية وانتهت بـ منظومة
              كاملة تعمل بكفاءة.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <a
                href="#timeline"
                className="btn-primary"
                style={{ height: 44, padding: "0 20px", fontSize: 14.5 }}
              >
                الخطوات
              </a>
              <a
                href="#results"
                className="btn-outline"
                style={{ height: 44, padding: "0 20px", fontSize: 14.5 }}
              >
                الأرقام
              </a>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                aspectRatio: "16 / 11",
                borderRadius: 16,
                overflow: "hidden",
                background: "#FFFFFF",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/tawheed-brand-grid.jpg"
                alt="هوية التوحيد والنور: الشعار، الـ Brand Mark، وتطبيقات"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transform: "scale(1.16)",
                }}
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------- 01a KPIs ---- */}
        <KpiPanel />

        {/* ---------------------------------------------- 01b Film ---- */}
        <div
          style={{
            position: "relative",
            aspectRatio: "21 / 9",
            borderRadius: 16,
            overflow: "hidden",
            background: "#191919",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/tawheed-wall-sign.jpg"
            alt="شعار التوحيد والنور على حائط خرساني"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 45%",
              display: "block",
            }}
          />
        </div>

        {/* -------------------------------------------- 02 Context ---- */}
        <section
          className="sec-line-b"
          style={{ padding: "clamp(40px, 5vw, 64px) 0" }}
        >
          <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
            <h2
              style={{
                fontSize: "clamp(26px, 3.2vw, 40px)",
                lineHeight: 1.35,
                fontWeight: 700,
                textWrap: "balance",
              }}
            >
              التحدي <span style={{ color: "var(--accent)" }}>قبل ما نبدأ</span>
            </h2>
            <p style={{ color: "var(--fg2)", lineHeight: 1.8, textWrap: "pretty" }}>
              اسم عمره 51 سنة في كل بيت مصري — بس مالوش وجود ديجيتال بنفس الوزن.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderRadius: 14,
                padding: "16px 18px",
                background: "#E6F5EC",
                color: "#031813",
                border: "1px solid rgba(50,172,99,.3)",
              }}
            >
              <span
                style={{
                  flex: "none",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#32AC63",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={16} />
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.6 }}>
                نحافظ على الـ equity التاريخي للاسم
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderRadius: 14,
                padding: "16px 18px",
                background: "#FCE7E5",
                color: "#191919",
                border: "1px solid rgba(238,64,55,.3)",
              }}
            >
              <span
                style={{
                  flex: "none",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#EE4037",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.6 }}>
                من غير ما نفضل محل وبس — لازم مبيعات أونلاين
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {CONTEXT_ROWS.map(([label, body]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: "14px 18px",
                  background: "var(--bg)",
                }}
              >
                <span
                  style={{
                    flex: "none",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--fg)",
                    color: "var(--bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check />
                </span>
                <span
                  style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--fg2)" }}
                >
                  <strong style={{ color: "var(--fg)", fontWeight: 700 }}>
                    {label}
                  </strong>{" "}
                  {body}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------- 03 Timeline ---- */}
        <section
          id="timeline"
          style={{ padding: "clamp(48px, 6vw, 80px) 0", scrollMarginTop: 58 }}
        >
          <Timeline />
        </section>

        {/* ---------------------------------------------- 04 Brand ---- */}
        <section
          id="brand"
          className="sec-line-t"
          style={{ padding: "clamp(48px, 6vw, 80px) 0", scrollMarginTop: 58 }}
        >
          <BrandCarousel />
        </section>

        {/* -------------------------------------------- 05 Results ---- */}
        <section
          id="results"
          className="sec-line-t"
          style={{ padding: "clamp(48px, 6vw, 80px) 0", scrollMarginTop: 58 }}
        >
          <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
              النتائج
            </span>
            <h2
              style={{
                fontSize: "clamp(26px, 3.2vw, 40px)",
                lineHeight: 1.35,
                fontWeight: 700,
                textWrap: "balance",
              }}
            >
              قناتين مدفوعتين، نفس الكفاءة تقريباً.
            </h2>
          </div>
          <AdResults />
        </section>

        {/* ------------------------------------------- 06 Services ---- */}
        <section
          className="sec-line-t"
          style={{
            padding: "clamp(48px, 6vw, 80px) 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: "24px clamp(24px, 5vw, 64px)",
          }}
        >
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
              اللي قدمناه
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SERVICE_TAGS.map((t) => (
                <span
                  key={t.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: t.bg ?? "transparent",
                    color: t.fg ?? "var(--fg)",
                    border: t.bg ? undefined : "1px solid var(--line2)",
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.dot ? (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: t.dot,
                      }}
                    />
                  ) : null}
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ 07 CTA ---- */}
        <section
          id="contact"
          style={{
            padding: "clamp(40px, 5vw, 64px) 0 clamp(48px, 6vw, 80px)",
            scrollMarginTop: 80,
          }}
        >
          <div
            style={{
              borderRadius: 24,
              padding: "clamp(28px, 5vw, 56px) clamp(20px, 4vw, 48px)",
              background:
                "linear-gradient(135deg, #3A1210 0%, #1A0B0A 50%, #0B0B0B 100%)",
              border: "1px solid rgba(238,64,55,.3)",
              display: "grid",
              justifyItems: "center",
              textAlign: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 999,
                background: "rgba(238,64,55,.16)",
                color: "#FF7266",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#EE4037",
                }}
              />
              جلسة استكشافية مجانية
            </span>
            <h2
              style={{
                fontSize: "clamp(30px, 4.4vw, 52px)",
                lineHeight: 1.3,
                fontWeight: 700,
                color: "#FAF7F2",
                textWrap: "balance",
              }}
            >
              احجز استشارة <span style={{ color: "#FF5B4F" }}>مجانية</span>
            </h2>
            <p
              style={{
                fontSize: "clamp(15px, 1.6vw, 18px)",
                lineHeight: 1.9,
                color: "#C4BEB1",
                maxWidth: "46ch",
                textWrap: "pretty",
              }}
            >
              ابدأ تحويل أعمالك رقميًا بخطوات واضحة ومدروسة. احجز جلسة استكشافية
              نراجع فيها متجرك ونضع خطة تنفيذية تناسب أهدافك.
            </p>
            <a
              href="https://calendar.google.com/calendar/appointments"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn"
              style={{
                marginTop: 8,
                background: "#EE4037",
                color: "#fff",
                borderRadius: 999,
                height: 56,
                padding: "0 32px",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontSize: 16,
                fontWeight: 700,
                boxShadow: "0 14px 30px -12px rgba(238,64,55,.7)",
              }}
            >
              احجز موعدك الآن <span aria-hidden="true">←</span>
            </a>
            <span style={{ fontSize: 13, color: "#9C9587" }}>
              أو راسلنا على{" "}
              <a
                href="mailto:a@kmpn.agency"
                dir="ltr"
                style={{ color: "#EFEDE8", fontWeight: 600 }}
              >
                a@kmpn.agency
              </a>
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
