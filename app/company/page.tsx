import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaSection } from "@/components/CtaSection";
import { NumbersPanel } from "@/components/home/NumbersPanel";

export const metadata: Metadata = {
  title: "الشركة · كامبين",
  description:
    "بدأت كامبين رسميًا في 2021، لكن رحلتنا الحقيقية بدأت قبلها بثلاث سنوات في 2018، بمتجر Vroots.",
};

const GAINS = [
  "تحقيق نمو أسرع لعلامتنا التجارية",
  "بناء إستراتيجيات تسويق فعّالة بأقل تكلفة",
  "ابتكار حلول عملية لمشكلات التشغيل والإدارة",
];

const TIMELINE = [
  {
    year: "2018",
    name: "Vroots",
    logo: "/assets/logo-vroots.png",
    text: "متجر متخصص في بيع الخضروات والفواكه الطازجة — خضنا فيه كل تحديات التجارة الإلكترونية الناشئة.",
  },
  {
    year: "يناير 2020",
    name: "دولاب",
    logo: "/assets/logo-doolab.png",
    text: "أول علامة تجارية نقدّم لها خدماتنا كعمل مستقل.",
  },
  {
    year: "2020",
    name: "سكاي نت ← OQ",
    logo: "/assets/logo-skynet.png",
    text: "كررنا التجربة وحققنا نتائج واعدة للمرة الثانية.",
  },
  {
    year: "2021",
    name: "تأسيس كامبين",
    logo: null,
    text: "أغلقنا Vroots وركّزنا كامل جهودنا على وكالة متخصصة في النمو الربحي المستدام.",
  },
];

const FOUNDATIONS = [
  {
    n: "01",
    t: "الإبداع والتطوّر",
    d: "نضع الإبداع في قلب كل ما نقوم به، ونسعى لتجاوز الحلول التقليدية بتقديم أفكار مبتكرة تحمل بصمة فريق كامبين. ونستثمر دومًا في تطوير مهارات فريقنا لمواكبة تغيرات السوق.",
  },
  {
    n: "02",
    t: "القيم الأخلاقية",
    d: "نعتز بهويتنا العربية الإسلامية، ونحرص على اتساق جميع أعمالنا وخدماتنا مع قيمنا وثقافة مجتمعنا، ونلتزم باختيار شركاء عمل يؤمنون بالمبادئ ذاتها.",
  },
  {
    n: "03",
    t: "المعايير الشرعية",
    d: "نعتمد الضوابط الشرعية وفقه التجارة كمرجعية أساسية لقراراتنا، بدءًا من اختيار المنتج وحتى طريقة تسويقه وعرضه. نلتزم بالصدق والأمانة ونتجنب المحاذير الشرعية.",
  },
];

const TEAM = [
  {
    name: "عبدالرحمن شطا",
    role: "المؤسس والمدير التنفيذي",
    rgb: "140,140,140",
    photo:
      "https://assets.lightfunnels.com/account-7766/images_library/ccfc296e-dd5f-4abb-a9f8-1210b6f424d5.ak93GsWsX1xTHlZZ5sHcY.webp",
  },
  {
    name: "محمد الجاويش",
    role: "مدير المحتوى",
    rgb: "29,180,216",
    photo:
      "https://assets.lightfunnels.com/cdn-cgi/image/width=1080,quality=80,format=auto/https://assets.lightfunnels.com/account-7766/images_library/65f8ab68-2fed-42c6-a5e0-c4594c2489e0.Gawish.png",
  },
  {
    name: "عمر حسين",
    role: "مدير فريق التصميم",
    rgb: "238,64,55",
    photo:
      "https://assets.lightfunnels.com/cdn-cgi/image/width=1080,quality=80,format=auto/https://assets.lightfunnels.com/account-7766/images_library/0e988725-52f3-4c34-82c7-8899b952e55b.Omar.png",
  },
  {
    name: "معاذ حمدي",
    role: "مدير تسويق",
    rgb: "50,172,99",
    photo: "/assets/team-moaaz.png",
  },
];

const IMPACT_HEADLINE = [
  {
    v: "+55M",
    l: "جنيه مبيعات عبر الإعلانات المدفوعة في الأربع سنوات الماضية",
    c: "#EFEDE8",
  },
  {
    v: "+160M",
    l: "جنيه مبيعات حققها عملاؤنا حتى الربع الثاني من 2025",
    c: "#FF5B4F",
  },
];

const IMPACT_MORE = [
  { v: "+2", l: "سنة متوسط عمر الشركة مع كامبين", c: "#FF5B4F" },
  { v: "+50", l: "شريك راضٍ عن خدماتنا في الوطن العربي", c: "#FAF7F2" },
  { v: "+35", l: "متجر إلكتروني أطلقناه في الخليج ومصر", c: "#FAF7F2" },
  { v: "+14", l: "شركة ضاعفنا مبيعاتها", c: "#FAF7F2" },
  { v: "+12", l: "شركة رعينا تحوّلها الرقمي الكامل", c: "#FAF7F2" },
  { v: "+10", l: "شركات أعدنا بناء علامتها التجارية", c: "#FAF7F2" },
];

function Check() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function CompanyPage() {
  return (
    <div className="page">
      <Header />

      <main id="top" className="container">
        {/* --------------------------------------------- 01 About ---- */}
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
            عن كامبين
          </span>
          <h1
            style={{
              fontSize: "clamp(34px, 5.2vw, 60px)",
              lineHeight: 1.3,
              fontWeight: 700,
              textWrap: "balance",
            }}
          >
            رحلتنا بدأت بإطلاق متاجر حقيقية ونشرها،{" "}
            <span style={{ color: "var(--accent)" }}>ليست بداية إنشاء وكالة</span>.
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.9,
              color: "var(--fg2)",
              textWrap: "pretty",
            }}
          >
            بدأت كامبين رسميًا في 2021، لكن رحلتنا الحقيقية بدأت قبلها بثلاث
            سنوات في 2018، بمتجر Vroots. منحتنا هذه التجربة فهمًا حقيقيًا
            لتحديات التجارة الإلكترونية، وأكسبتنا خبرة عملية مكنتنا من:
          </p>
        </section>

        {/* --------------------------------------------- 02 Story ---- */}
        <section
          style={{
            padding: "0 0 clamp(48px, 6vw, 80px)",
            display: "grid",
            gap: 24,
          }}
        >
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gap: 10,
              maxWidth: 640,
            }}
          >
            {GAINS.map((g) => (
              <li
                key={g}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  lineHeight: 1.75,
                }}
              >
                <span
                  style={{
                    flex: "none",
                    width: 22,
                    height: 22,
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
                <span>{g}</span>
              </li>
            ))}
          </ul>

          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap: 12,
            }}
          >
            {TIMELINE.map((t) => (
              <li
                key={t.name}
                style={{
                  borderRadius: 20,
                  padding: 22,
                  display: "grid",
                  gap: 10,
                  alignContent: "start",
                  background: "var(--sunk)",
                  color: "var(--fg)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      width: 56,
                      height: 56,
                      flex: "none",
                      borderRadius: 14,
                      background: "#fff",
                      border: "1px solid var(--line)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {t.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.logo}
                        alt={t.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    ) : (
                      <span
                        role="img"
                        aria-label="كامبين"
                        style={{
                          display: "block",
                          width: "74%",
                          aspectRatio: "3192.5 / 1200",
                          background: "#0B0B0B",
                          WebkitMask:
                            "url(/assets/kmpn-logo-ar.svg) center/contain no-repeat",
                          mask: "url(/assets/kmpn-logo-ar.svg) center/contain no-repeat",
                        }}
                      />
                    )}
                  </span>
                  <div style={{ display: "grid", gap: 0 }}>
                    <span
                      className="num"
                      style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}
                    >
                      {t.year}
                    </span>
                    <strong style={{ fontSize: 18 }}>{t.name}</strong>
                  </div>
                </div>
                <span style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.85 }}>
                  {t.text}
                </span>
              </li>
            ))}
          </ol>

          <p style={{ maxWidth: "70ch", color: "var(--fg2)", lineHeight: 1.9 }}>
            اليوم، نعمل بفريق متكامل يجمع بين المعرفة والخبرة، لنساعد عملائنا على
            مواجهة تحديات السوق، وبناء علامات تجارية قوية، وصناعة قصص نجاح ملهمة.
          </p>
        </section>

        {/* --------------------------------------- 03 Foundations ---- */}
        <section
          className="sec-line-t"
          style={{ padding: "clamp(48px, 6vw, 80px) 0", display: "grid", gap: 28 }}
        >
          <div style={{ display: "grid", gap: 8, maxWidth: "62ch" }}>
            <h2
              style={{
                fontSize: "clamp(26px, 3.4vw, 42px)",
                lineHeight: 1.35,
                fontWeight: 700,
                textWrap: "balance",
              }}
            >
              أسُسنا
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: 12,
            }}
          >
            {FOUNDATIONS.map((f) => (
              <article
                key={f.n}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 20,
                  padding: 24,
                  display: "grid",
                  gap: 10,
                  alignContent: "start",
                  background: "var(--bg)",
                }}
              >
                <span
                  className="num"
                  dir="ltr"
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {f.n}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5 }}>
                  {f.t}
                </h3>
                <p
                  style={{
                    fontSize: 14.5,
                    color: "var(--fg2)",
                    lineHeight: 1.85,
                    textWrap: "pretty",
                  }}
                >
                  {f.d}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ------------------------------------------- 04 Mission ---- */}
        <section
          className="sec-line-t"
          style={{ padding: "clamp(48px, 6vw, 80px) 0", display: "grid", gap: 28 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 12,
            }}
          >
            <article
              style={{
                background: "var(--sunk)",
                borderRadius: 24,
                padding: "clamp(22px, 3vw, 32px)",
                display: "grid",
                gap: 10,
              }}
            >
              <span className="pill" style={{ justifySelf: "start" }}>
                <span className="dot" />
                هدفنا
              </span>
              <p
                style={{
                  fontSize: "clamp(17px, 1.8vw, 21px)",
                  fontWeight: 600,
                  lineHeight: 1.8,
                }}
              >
                تحقيق معادلة النمو الربحي المستدام لشركائنا من المتاجر الإلكترونية
                عبر استراتيجيات تسعير مدروسة، وطرق عرض فعّالة، تضمن مبيعات
                متزايدة ونموًا صحيًا.
              </p>
            </article>

            <article
              style={{
                background: "var(--fg)",
                color: "var(--bg)",
                borderRadius: 24,
                padding: "clamp(22px, 3vw, 32px)",
                display: "grid",
                gap: 10,
              }}
            >
              <span
                style={{
                  justifySelf: "start",
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                رؤيتنا
              </span>
              <p
                style={{
                  fontSize: "clamp(17px, 1.8vw, 21px)",
                  fontWeight: 600,
                  lineHeight: 1.8,
                }}
              >
                أن نكون الشريك الأكثر موثوقية والخيار الأول لأصحاب المتاجر
                الإلكترونية المؤثرة في رحلة نموهم وتوسعهم السريع.
              </p>
            </article>
          </div>
        </section>

        {/* -------------------------------------------- 05 Impact ---- */}
        <div style={{ marginBottom: 16 }}>
          <NumbersPanel
            eyebrow="أثرنا"
            headline={IMPACT_HEADLINE}
            more={IMPACT_MORE}
          />
        </div>

        {/* ---------------------------------------------- 06 Team ---- */}
        <section
          className="sec-line-t"
          style={{ padding: "clamp(48px, 6vw, 80px) 0", display: "grid", gap: 28 }}
        >
          <div style={{ display: "grid", gap: 8, maxWidth: "62ch" }}>
            <h2
              style={{
                fontSize: "clamp(26px, 3.4vw, 42px)",
                lineHeight: 1.35,
                fontWeight: 700,
              }}
            >
              فريق عمل <span style={{ color: "var(--accent)" }}>كامبين</span>
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(46%, 240px), 1fr))",
              gap: 12,
            }}
          >
            {TEAM.map((m) => (
              <article
                key={m.name}
                style={{
                  position: "relative",
                  aspectRatio: "3 / 4",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#0B0B0B",
                  border: `1.5px solid rgba(${m.rgb},.55)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.photo}
                  alt={m.name}
                  loading="lazy"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "50% 20%",
                    filter: "grayscale(1) contrast(1.05)",
                    transform: "scale(.78)",
                    transformOrigin: "50% 25%",
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(180deg, rgba(${m.rgb},.28) 0%, rgba(${m.rgb},.08) 45%, rgba(11,11,11,.85) 100%)`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    insetInline: 0,
                    bottom: 0,
                    padding: "14px 16px",
                    display: "grid",
                    gap: 2,
                    color: "#FAF7F2",
                    textAlign: "center",
                  }}
                >
                  <strong
                    style={{ fontSize: "clamp(15px, 1.8vw, 19px)", lineHeight: 1.4 }}
                  >
                    {m.name}
                  </strong>
                  <span
                    style={{ fontSize: "clamp(12px, 1.3vw, 14px)", color: "#C4BEB1" }}
                  >
                    {m.role}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
