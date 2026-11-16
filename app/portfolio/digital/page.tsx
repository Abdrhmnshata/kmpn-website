import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CtaSection } from "@/components/CtaSection";
import { Accent, PageIntro } from "@/components/portfolio/PageIntro";
import { VerticalTabs } from "@/components/portfolio/VerticalTabs";
import { FilterGrid } from "@/components/portfolio/FilterGrid";
import { CaseCard } from "@/components/portfolio/CaseCard";
import { DIGITAL, chipValues, solutionLabel } from "@/lib/portfolio";

const DESCRIPTION =
  "علامات قدنا تحولها الرقمي بالكامل: من استراتيجية العلامة والهوية، إلى المتجر، إلى الإعلانات والمحتوى. هذه أبرز النتائج التي حققناها معاً.";

export const metadata: Metadata = {
  title: "كامبين ديجيتال · أعمالنا · كامبين",
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio/digital" },
  openGraph: { title: "كامبين ديجيتال · أعمالنا", description: DESCRIPTION, url: "/portfolio/digital" },
};

export default function DigitalPage() {
  const chips = chipValues(DIGITAL, (c) => (c.solution ? [c.solution] : [])).map((s) => ({
    key: s,
    label: solutionLabel(s)!,
  }));

  return (
    <div className="page">
      <Header ctaHref="/contact" />

      <main id="top" className="container">
        <PageIntro
          pill="كامبين ديجيتال"
          title={
            <>
              تحول رقمي <Accent>بأرقام حقيقية</Accent>.
            </>
          }
          text={DESCRIPTION}
        />

        <VerticalTabs current="digital" />

        <FilterGrid
          label="تصنيف قصص التحول الرقمي"
          chips={chips}
          items={DIGITAL.map((c) => ({
            id: c.id,
            keys: c.solution ? [c.solution] : [],
            node: <CaseCard item={c} />,
          }))}
        />

        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
