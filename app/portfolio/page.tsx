import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaSection } from "@/components/CtaSection";
import { Accent, PageIntro } from "@/components/portfolio/PageIntro";
import { VerticalTabs } from "@/components/portfolio/VerticalTabs";
import { StudioCard } from "@/components/portfolio/StudioCard";
import { StoreCard } from "@/components/portfolio/StoreCard";
import { CaseCard } from "@/components/portfolio/CaseCard";
import { COMMERCE, DIGITAL, STUDIO, VERTICALS, type VerticalKey } from "@/lib/portfolio";

const DESCRIPTION =
  "كل أعمال كامبين في مكان واحد: هويات من كامبين استوديو، ومتاجر شوبيفاي من كامبين كومرس، وقصص تحول رقمي كاملة من كامبين ديجيتال.";

export const metadata: Metadata = {
  title: "أعمالنا · كامبين",
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio" },
  openGraph: { title: "أعمالنا · كامبين", description: DESCRIPTION, url: "/portfolio" },
};

const PREVIEW = 3;

const previews: Record<VerticalKey, React.ReactNode[]> = {
  studio: STUDIO.slice(0, PREVIEW).map((p) => <StudioCard key={p.id} project={p} />),
  commerce: COMMERCE.slice(0, PREVIEW).map((s) => <StoreCard key={s.id} store={s} />),
  digital: DIGITAL.slice(0, PREVIEW).map((c) => <CaseCard key={c.id} item={c} />),
};

export default function PortfolioPage() {
  return (
    <div className="page">
      <Header ctaHref="/contact" />

      <main id="top" className="container">
        <PageIntro
          pill="أعمالنا"
          title={
            <>
              ثلاث وحدات متخصصة، <Accent>وشريك واحد</Accent>.
            </>
          }
          text={DESCRIPTION}
        />

        <VerticalTabs current="all" />

        {VERTICALS.map((v) => (
          <section key={v.key} className="vert-section" aria-labelledby={`v-${v.key}`}>
            <div className="vert-head">
              <div style={{ display: "grid", gap: 6, maxWidth: "52ch" }}>
                <h2 id={`v-${v.key}`} className="vert-title">
                  {v.name}
                </h2>
                <p style={{ color: "var(--fg2)", lineHeight: 1.8 }}>{v.tagline}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <span className="vert-stat">
                  <bdi dir="ltr" className="num">
                    +{v.count}
                  </bdi>{" "}
                  {v.unit}
                </span>
                <Link href={v.href} className="vert-link">
                  كل أعمال {v.name} ←
                </Link>
              </div>
            </div>
            <div className="work-grid work-rail">{previews[v.key]}</div>
          </section>
        ))}

        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
