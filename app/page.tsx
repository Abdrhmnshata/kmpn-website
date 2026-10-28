import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaSection } from "@/components/CtaSection";
import { NumbersPanel } from "@/components/home/NumbersPanel";
import { GrowthAccordion } from "@/components/home/GrowthAccordion";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { MethodCard } from "@/components/home/MethodCard";
import {
  CLIENTS,
  GROWTH_IMG,
  HERO_IMG,
  PARTNERS,
  SITUATIONS,
  WHY,
} from "@/lib/content";

const sectionHead: React.CSSProperties = {
  fontSize: "clamp(26px, 3.4vw, 42px)",
  lineHeight: 1.35,
  fontWeight: 700,
};

export default function Home() {
  return (
    <div className="page">
      <Header />

      <main id="top" className="container">
        {/* ---------------------------------------------- 01 Hero ---- */}
        <section
          style={{
            padding: "clamp(40px, 6vw, 80px) 0 clamp(32px, 4vw, 56px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: "32px clamp(28px, 5vw, 64px)",
            alignItems: "center",
          }}
        >
          <div style={{ display: "grid", gap: 20, justifyItems: "start" }}>
            <span className="pill">
              <span className="dot" />
              خبراء تحول المتاجر رقمياً
            </span>
            <h1
              style={{
                fontSize: "clamp(34px, 5.2vw, 62px)",
                lineHeight: 1.3,
                fontWeight: 700,
                textWrap: "balance",
              }}
            >
              حوّل نشاطك التجاري إلى منظومة رقمية{" "}
              <span style={{ color: "var(--accent)" }}>للنمو الربحي!</span>
            </h1>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.9,
                color: "var(--fg2)",
                maxWidth: "50ch",
                textWrap: "pretty",
              }}
            >
              نقود رحلة التحول الرقمي لنشاطك التجاري عبر استراتيجية علامة تجارية
              قوية، ومتجر إلكتروني جاهز للبيع، وتسويق مبني على البيانات.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Link
                href="#contact"
                className="btn-primary"
                style={{
                  height: 52,
                  padding: "0 26px",
                  fontSize: 16,
                  boxShadow: "0 14px 30px -14px rgba(238,64,55,.7)",
                }}
              >
                احجز استشارة مجانية
              </Link>
              <Link
                href="/success-stories"
                className="btn-outline"
                style={{ height: 52, padding: "0 24px", fontSize: 15 }}
              >
                قصص النجاح
              </Link>
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              overflow: "hidden",
              background: "var(--bg)",
              aspectRatio: "1 / 1",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMG}
              alt="التحول الرقمي مع كامبين"
              className="themed-img"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </section>

        {/* ------------------------------------------- 02 Clients ---- */}
        <section
          className="sec-line-t sec-line-b"
          style={{
            padding: "clamp(28px, 4vw, 48px) 0",
            display: "grid",
            gap: 24,
          }}
        >
          <h2
            style={{
              fontSize: "clamp(18px, 2vw, 22px)",
              fontWeight: 700,
              textAlign: "center",
              textWrap: "balance",
            }}
          >
            أدرنا التحوّل الرقمي لكبرى العلامات التجارية الرائدة
          </h2>
          <div className="logo-row">
            {CLIENTS.map((c) => (
              <div key={c.name} className="logo-cell">
                <span
                  role="img"
                  aria-label={c.name}
                  className="logo-img"
                  style={{ backgroundImage: `url("${c.src}")` }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------- 03 Situations ---- */}
        <section
          style={{ padding: "clamp(48px, 6vw, 80px) 0", display: "grid", gap: 28 }}
        >
          <div style={{ display: "grid", gap: 8, maxWidth: "60ch" }}>
            <h2 style={{ ...sectionHead, textWrap: "balance" }}>
              كل رحلة تحول ناجحة تبدأ بفهم{" "}
              <span style={{ color: "var(--accent)" }}>الوضع الحالي</span>
            </h2>
            <p style={{ color: "var(--fg2)", lineHeight: 1.85 }}>
              نضعك على المسار الصحيح للتحول الرقمي في أي مرحلة من رحلتك التجارية.
            </p>
          </div>

          <div
            className="rail"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            }}
          >
            {SITUATIONS.map((s) => (
              <article
                key={s.title}
                className="card"
                style={{
                  padding: 24,
                  display: "grid",
                  gap: 14,
                  alignContent: "start",
                }}
              >
                <span
                  aria-hidden="true"
                  className="themed-logo"
                  style={{
                    display: "block",
                    width: 40,
                    height: 40,
                    background: "center/contain no-repeat",
                    backgroundImage: `url("${s.icon}")`,
                  }}
                />
                <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5 }}>
                  {s.title}
                </h3>
                <p
                  style={{
                    color: "var(--fg2)",
                    fontWeight: 600,
                    whiteSpace: "pre-line",
                    lineHeight: 1.7,
                    minHeight: "3.4em",
                  }}
                >
                  {s.lead}
                </p>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  {s.points.map((pt) => (
                    <li
                      key={pt}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        minHeight: 52,
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "var(--tint)",
                        border: "1px solid rgba(238,64,55,.25)",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--fg)",
                        lineHeight: 1.6,
                      }}
                    >
                      <span
                        style={{
                          flex: "none",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#EE4037",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        >
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ----------------------------------------------- 04 Why ---- */}
        <section
          className="sec-line-t"
          style={{ padding: "clamp(48px, 6vw, 80px) 0", display: "grid", gap: 28 }}
        >
          <div style={{ display: "grid", gap: 8, maxWidth: "62ch" }}>
            <h2 style={sectionHead}>
              لماذا تختار <span style={{ color: "var(--accent)" }}>كامبين؟</span>
            </h2>
            <p style={{ color: "var(--fg2)", lineHeight: 1.85 }}>
              التحوّل الرقمي لا ينجح بالأدوات، بل بشريك يفهم مشكلاتك ويعرف كيف
              يحوّلها إلى نمو ربحي.
            </p>
          </div>

          <div
            className="rail"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            }}
          >
            {WHY.map((w) => (
              <article
                key={w.title}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  borderRadius: 20,
                  padding: 22,
                  display: "grid",
                  gap: 12,
                  alignContent: "start",
                  boxShadow: "0 6px 18px -12px rgba(11,11,11,.18)",
                }}
              >
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "var(--ok-bg)",
                    border: "1px solid rgba(50,172,99,.3)",
                    color: "var(--ok-fg)",
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      flex: "none",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#32AC63",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  {w.title}
                </h3>
                <p
                  style={{
                    fontSize: 14.5,
                    color: "var(--fg2)",
                    lineHeight: 1.85,
                    textWrap: "pretty",
                  }}
                >
                  {w.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ------------------------------------------- 05 Numbers ---- */}
        <NumbersPanel />

        {/* -------------------------------------- 06 Growth system ---- */}
        <section
          style={{
            padding: "clamp(48px, 6vw, 80px) 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
            gap: "28px clamp(28px, 5vw, 56px)",
            alignItems: "center",
          }}
        >
          <div
            style={{
              borderRadius: 24,
              overflow: "hidden",
              background: "var(--bg)",
              aspectRatio: "1 / 1",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GROWTH_IMG}
              alt="منظومة النمو الربحي"
              loading="lazy"
              className="themed-img"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
          <div style={{ display: "grid", gap: 18 }}>
            <h2 style={sectionHead}>
              منظومة <span style={{ color: "var(--accent)" }}>النمو الربحي</span>
            </h2>
            <p style={{ color: "var(--fg2)", lineHeight: 1.85, textWrap: "pretty" }}>
              نظام عمل متكامل يربط علامتك التجارية، ومتجرك، وجهودك التسويقية في
              مسار واحد لتحقيق نمو مستمر وربحية حقيقية.
            </p>
            <GrowthAccordion />
          </div>
        </section>

        {/* ------------------------------------------- 07 Process ---- */}
        <section
          className="sec-line-t"
          style={{ padding: "clamp(48px, 6vw, 80px) 0", display: "grid", gap: 24 }}
        >
          <div style={{ display: "grid", gap: 8, maxWidth: "62ch" }}>
            <h2 style={{ ...sectionHead, textWrap: "balance" }}>
              اكتشف كيف نقود التحول الرقمي{" "}
              <span style={{ color: "var(--accent)" }}>لمتجرك!</span>
            </h2>
            <p style={{ color: "var(--fg2)", lineHeight: 1.85 }}>
              منهجية تنفيذ واضحة لتحديد الفرص وتحقيق نمو قابل للقياس، مع متابعة
              وتقارير شفافة في كل مرحلة.
            </p>
          </div>
          <ProcessSteps />
        </section>

        {/* -------------------------------------------- 08 Method ---- */}
        <section
          className="sec-line-t"
          style={{ padding: "clamp(48px, 6vw, 80px) 0", display: "grid", gap: 28 }}
        >
          <div style={{ display: "grid", gap: 8, maxWidth: "62ch" }}>
            <h2 style={{ ...sectionHead, textWrap: "balance" }}>
              منهجية عملنا في تحويل المتاجر{" "}
              <span style={{ color: "var(--accent)" }}>رقميًا</span>
            </h2>
            <p style={{ color: "var(--fg2)", lineHeight: 1.85 }}>
              نُصمم خطة عمل متكاملة لتحوّيل أعمالك لمنظومة نمو ربحي لا تتوقف!
            </p>
          </div>
          <MethodCard />
        </section>

        {/* ------------------------------------------ 09 Partners ---- */}
        <section
          className="sec-line-t"
          style={{ padding: "clamp(40px, 5vw, 64px) 0", display: "grid", gap: 20 }}
        >
          <h2
            style={{
              fontSize: "clamp(18px, 2vw, 22px)",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            شركاء معتمدون
          </h2>
          <div className="partner-row">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  background: "var(--bg)",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    flex: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    role="img"
                    aria-label={p.name}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      background: "center/contain no-repeat",
                      backgroundImage: `url("${p.src}")`,
                    }}
                  />
                </div>
                <div style={{ display: "grid", lineHeight: 1.4 }}>
                  <strong style={{ fontSize: 15 }}>{p.name}</strong>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{p.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ----------------------------------------------- 10 CTA ---- */}
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
