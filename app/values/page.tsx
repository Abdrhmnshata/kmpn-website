import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaSection } from "@/components/CtaSection";

export const metadata: Metadata = {
  title: "قيمنا · كامبين",
  description:
    "قيمنا ليست شعارات، بل الميزان الذي نحكم به على كل قرار، من اختيار العميل حتى آخر إعلان.",
};

type Principle = {
  n: string;
  title: string;
  points: { strong?: string; text: string }[];
};

const PRINCIPLES: Principle[] = [
  {
    n: "01",
    title: "الشفافية",
    points: [
      {
        strong: "الإبداع:",
        text: "نختار في أغلب الأوقات الإبداع عن التكرار، لنبتعد عن الحلول التقليدية ونقدم حلولًا وأفكارًا فريدة تُسجَّل باسم فريق كامبين.",
      },
      {
        strong: "التطور:",
        text: "الاستثمار في الفريق ومواكبة التطورات من أهم الأنشطة الفعلية التي نقوم بها.",
      },
    ],
  },
  {
    n: "02",
    title: "المنافسة العادلة",
    points: [
      { text: "احترام المنافسين وعدم نشر آراء أو تقييمات مغرضة أو زائفة بحقهم." },
      {
        text: "الترويج للخدمات بطرق أخلاقية تمنح جميع الأطراف بيئة تنافسية نظيفة.",
      },
    ],
  },
  {
    n: "03",
    title: "احترام المعايير الأخلاقية والمجتمعية",
    points: [
      {
        text: "تقديم محتوى ومادة تسويقية تراعي قيم وثقافة المجتمع، وتجنب الترويج بأي سلوك أو منتج ينافي الأخلاق أو الذوق العام.",
      },
      {
        text: "نلتزم بأن تمتد المعايير الأخلاقية لتشمل منظومة العمل بأكملها، فنتعامل فقط مع الشركاء ممن يشاركوننا نفس المبادئ.",
      },
    ],
  },
  {
    n: "04",
    title: "الالتزام بالفقه في التجارة",
    points: [
      {
        text: "«لا يبيعُ في سوقِنا هذا إلَّا مَن تفقَّهَ في الدِّينِ» — عمر بن الخطاب رضي الله عنه.",
      },
      {
        text: "نضع الفقه كميزان أساسي للحكم على القرارات، من نوع المنتج لطريقة عرضه وتسويقه للوعود المكتوبة والعلاقة مع العميل.",
      },
      {
        text: "عرض المنتجات والخدمات بمعلومات دقيقة وواضحة دون تضليل أو مبالغة، مع كشف الشروط والسياسات بشكل صريح.",
      },
      { text: "الامتناع عن أي ممارسات خادعة أو عناوين مضللة لجذب العملاء." },
      { text: "التعامل مع بيانات العملاء بسرية تامة، وعدم بيعها أو مشاركتها دون إذن." },
    ],
  },
  {
    n: "05",
    title: "الالتزام بالمعايير الشرعية",
    points: [
      { text: "الأمانة والصدق وعدم الخداع في البيع." },
      { text: "تقديم قيمة حقيقية في المحتوى وليس تضييعًا لوقت المشاهد." },
      {
        text: "البعد عن المحاذير الشرعية كاستخدام الموسيقى في الإعلانات أو صور نساء بغير حجاب وزي شرعي.",
      },
    ],
  },
];

const FIT = [
  "شركة عندها منتج مستثمر فيه له طلب حقيقي في السوق.",
  "المنتج يتوافق مع معايير النمو الربحي: هامش ربحي + قابلية للتوسع + عدد مرات الشراء سنويًا.",
  "هناك مسؤول أو مدير تسويق يتفهم طلباتنا ويتحرك معنا بشكل فعال.",
  "تتبنى مبدأ الاستثمار، بعقلية واضحة للنمو وليس فقط للبيع السريع.",
  "لديها استعداد للشفافية الكاملة في مشاركة البيانات التسويقية والمالية.",
  "تُقدّر الشراكات طويلة المدى، وتؤمن أن بناء علامة قوية لا يعتمد على نتائج سريعة.",
  "تسعى لتحسين منتجها وتجربته باستمرار بناءً على آراء العملاء ومراجعاتهم.",
];

export default function ValuesPage() {
  return (
    <div className="page">
      <Header />

      <main id="top" className="container">
        {/* -------------------------------------------- 01 Values ---- */}
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
            القيم
          </span>
          <h1
            style={{
              fontSize: "clamp(34px, 5.2vw, 60px)",
              lineHeight: 1.3,
              fontWeight: 700,
              textWrap: "balance",
            }}
          >
            أُسس <span style={{ color: "var(--accent)" }}>نعمل بها</span> قبل أي حملة.
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.9,
              color: "var(--fg2)",
              textWrap: "pretty",
            }}
          >
            قيمنا ليست شعارات، بل الميزان الذي نحكم به على كل قرار، من اختيار
            العميل حتى آخر إعلان.
          </p>
        </section>

        {/* ---------------------------------------- 02 Principles ---- */}
        <section
          style={{
            padding: "0 0 clamp(48px, 6vw, 80px)",
            display: "grid",
            gap: 12,
          }}
        >
          {PRINCIPLES.map((p) => (
            <article
              key={p.n}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 20,
                padding: "clamp(20px, 3vw, 28px)",
                display: "grid",
                gridTemplateColumns: "auto minmax(0, 1fr)",
                gap: "8px 20px",
                background: "var(--bg)",
              }}
            >
              <span
                className="num"
                dir="ltr"
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: "var(--accent)",
                }}
              >
                {p.n}
              </span>
              <div style={{ display: "grid", gap: 12 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5 }}>
                  {p.title}
                </h3>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "grid",
                    gap: 10,
                    color: "var(--fg2)",
                    fontSize: 14.5,
                  }}
                >
                  {p.points.map((pt) => (
                    <li
                      key={pt.text}
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
                      </span>
                      <span>
                        {pt.strong ? <strong>{pt.strong}</strong> : null}
                        {pt.strong ? " " : null}
                        {pt.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        {/* ------------------------------------------- 03 Promise ---- */}
        <section
          style={{
            borderRadius: 24,
            padding: "clamp(28px, 5vw, 56px)",
            background:
              "linear-gradient(135deg, #3A1210 0%, #1A0B0A 45%, #0B0B0B 100%)",
            color: "#FAF7F2",
            display: "grid",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              justifySelf: "start",
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(238,64,55,.16)",
              color: "#FF7266",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            الوعد · الميثاق
          </span>
          <p
            style={{
              fontSize: "clamp(20px, 2.6vw, 30px)",
              fontWeight: 700,
              lineHeight: 1.6,
              color: "#FAF7F2",
              maxWidth: "36ch",
            }}
          >
            يلتزم فريق عمل كامبين بتقديم الخدمات بكل شفافية وأمانة، ويبذل الجهد
            الكافي لعمل أثر وفارق في المتاجر الإلكترونية.
          </p>
        </section>

        {/* ----------------------------------------------- 04 Fit ---- */}
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
              الشركات المناسبة{" "}
              <span style={{ color: "var(--accent)" }}>للعمل معنا</span>
            </h2>
          </div>
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 8,
            }}
          >
            {FIT.map((text, i) => (
              <li
                key={text}
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
                  className="num"
                  dir="ltr"
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "var(--accent)",
                    minWidth: 22,
                  }}
                >
                  {"0" + (i + 1)}
                </span>
                <span style={{ fontSize: 15, lineHeight: 1.75 }}>{text}</span>
              </li>
            ))}
          </ol>
        </section>

        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
