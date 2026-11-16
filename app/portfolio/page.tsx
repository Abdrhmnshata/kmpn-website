import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaSection } from "@/components/CtaSection";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { PROJECTS, portfolioFilters } from "@/lib/portfolio";

const DESCRIPTION =
  "مختارات من مشاريع الهوية البصرية واستراتيجية العلامة التجارية التي صمّمها استوديو كامبين لعلامات تجارية في مصر والخليج.";

export const metadata: Metadata = {
  title: "أعمالنا · كامبين",
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio" },
  openGraph: { title: "أعمالنا · كامبين", description: DESCRIPTION, url: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <div className="page">
      <Header ctaHref="/contact" />

      <main id="top" className="container">
        <section
          style={{
            padding: "clamp(40px, 6vw, 80px) 0 clamp(24px, 3vw, 36px)",
            display: "grid",
            gap: 14,
            maxWidth: "64ch",
          }}
        >
          <span className="pill" style={{ justifySelf: "start" }}>
            <span className="dot" />
            استوديو كامبين
          </span>
          <h1
            style={{
              fontSize: "clamp(34px, 5vw, 60px)",
              lineHeight: 1.3,
              fontWeight: 700,
              textWrap: "balance",
            }}
          >
            هويات تُعرَف من <span style={{ color: "var(--accent)" }}>أول نظرة</span>.
          </h1>
          <p
            style={{
              fontSize: 16.5,
              lineHeight: 1.9,
              color: "var(--fg2)",
              textWrap: "pretty",
            }}
          >
            {DESCRIPTION} كل مشروع يبدأ باستراتيجية واضحة للعلامة، وينتهي بهوية
            جاهزة للظهور في كل مكان.
          </p>
        </section>

        <PortfolioGrid projects={PROJECTS} filters={portfolioFilters()} />

        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
